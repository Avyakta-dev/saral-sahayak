from __future__ import annotations

import asyncio
import uuid
from collections import deque
from contextlib import asynccontextmanager, suppress
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import ValidationError
from starlette.types import ASGIApp, Receive, Scope, Send

from backend.agent.activity import MAX_ACTIVITY_EVENTS, AnalysisActivity
from backend.agent.service import AnalysisError, AnalysisService
from backend.api.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ErrorDetail,
    UploadTicket,
    UploadTicketRequest,
)
from backend.config import PUBLIC_KNOWLEDGE_ROOT, Settings
from backend.history import HistoryCase, HistoryResponse, HistoryTrackingService
from backend.images.pipeline import ImagePipeline
from backend.images.storage import StorageError
from backend.knowledge_readiness import check_corpus
from backend.languages import LANGUAGES
from backend.llm import LLMClient
from backend.tools.budget import Budget, BudgetLimits
from backend.tools.knowledge_files import KnowledgeError, check_knowledge_root

_MAX_SESSION_ID_LENGTH = 128


def _session_id(request: Request) -> str:
    """A client-supplied opaque partition key, not authentication.

    There is no login system yet; this only lets one browser's own repeat questions
    share history/cache with each other. Never trust it as an identity claim.

    A missing/blank header must never collapse into one shared bucket - that would let
    every caller who omits the header read each other's case history. Mint a private,
    unguessable id instead, scoped to this one request only.
    """
    raw = request.headers.get("X-Session-Id", "").strip()
    return raw[:_MAX_SESSION_ID_LENGTH] if raw else uuid.uuid4().hex


class BodyLimitMiddleware:
    def __init__(self, app: ASGIApp, max_bytes: int = 32768):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        body = bytearray()
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            if len(body) + len(chunk) > self.max_bytes:
                response = JSONResponse(
                    status_code=413,
                    content={
                        "error": {"code": "request_too_large", "message": "Request exceeds 32 KiB."}
                    },
                )
                await response(scope, receive, send)
                return
            body.extend(chunk)
            if not message.get("more_body", False):
                break
        delivered = False

        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, replay, send)


def knowledge_present(root: Path) -> bool:
    try:
        check_knowledge_root(root)
    except KnowledgeError:
        return False
    index = root / "README.md"
    return not index.is_symlink() and index.is_file()


async def _run_until_disconnect(request: Request, operation):
    async def disconnected():
        while True:
            if (await request.receive())["type"] == "http.disconnect":
                return

    task = asyncio.create_task(operation)
    watcher = asyncio.create_task(disconnected())
    try:
        done, _ = await asyncio.wait({task, watcher}, return_when=asyncio.FIRST_COMPLETED)
        if task in done:
            return await task
        raise AnalysisError("client_disconnected", "The request was cancelled.", 499)
    finally:
        for pending in (task, watcher):
            if not pending.done():
                pending.cancel()
        for pending in (task, watcher):
            with suppress(asyncio.CancelledError, Exception):
                await pending


def _analysis_failure(code: str, message: str, language: str) -> AnalyzeResponse:
    return AnalyzeResponse(
        status="error", language=language, error=ErrorDetail(code=code, message=message)
    )


def _transport_failure(code: str, message: str, status: int) -> JSONResponse:
    """Non-analysis error envelope; never echoes inputs, keys or storage details."""
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message}})


def _validated_result(result: AnalyzeResponse, payload: AnalyzeRequest) -> AnalyzeResponse:
    result = AnalyzeResponse.model_validate(result.model_dump())
    if result.language != payload.language:
        raise AnalysisError("invalid_model_output", "The model output could not be validated.", 502)
    return result


def _sse(event: str, data: AnalysisActivity | AnalyzeResponse) -> bytes:
    # JSON serialization escapes CR/LF in strings, so data never adds SSE frames.
    return f"event: {event}\ndata: {data.model_dump_json(exclude_none=isinstance(data, AnalysisActivity))}\n\n".encode(
        "utf-8"
    )


class _SharedBudgetService:
    """Resolve one private image, then analyze text, on a single request budget.

    Presents the same ``analyze(request, *, activity=...)`` seam as ``AnalysisService`` so
    the streaming, disconnect and overflow paths stay unchanged.
    """

    def __init__(
        self,
        service: AnalysisService,
        limits: BudgetLimits,
        pipeline: ImagePipeline | None = None,
    ):
        self.service = service
        self.limits = limits
        self.pipeline = pipeline

    async def analyze(self, request: AnalyzeRequest, *, activity=None) -> AnalyzeResponse:
        if request.image_key is None:
            return await self.service.analyze(request, activity=activity)
        if self.pipeline is None:
            raise AnalysisError("image_input_unavailable", "Image input is unavailable.", 503)
        budget = Budget(self.limits)
        text = await self.pipeline.extract(request.image_key, budget, language=request.language)
        # Fresh text-only history: the key and the image never reach the agent or ledger.
        reviewed = AnalyzeRequest(text=text, language=request.language, details=request.details)
        return await self.service.analyze(reviewed, budget=budget, activity=activity)


async def _analysis_events(service: AnalysisService, payload: AnalyzeRequest):
    """Bounded request-local buffer; the one producer is always cancelled and joined."""
    pending: deque[AnalysisActivity] = deque()
    changed = asyncio.Event()
    count = 0
    overflow = False

    def observe(event: AnalysisActivity):
        nonlocal count, overflow
        if overflow:
            return
        if count >= MAX_ACTIVITY_EVENTS:
            overflow = True
        else:
            # Detach/revalidate even a host-created event before putting it on the wire.
            pending.append(AnalysisActivity.model_validate(event.model_dump()))
            count += 1
        changed.set()

    async def run():
        try:
            return _validated_result(await service.analyze(payload, activity=observe), payload)
        except AnalysisError as exc:
            return _analysis_failure(exc.code, exc.message, payload.language)
        except Exception:
            return _analysis_failure(
                "analysis_failed", "The analysis could not be completed safely.", payload.language
            )

    task = asyncio.create_task(run())
    task.add_done_callback(lambda _: changed.set())
    try:
        while True:
            if overflow:
                task.cancel()
                with suppress(asyncio.CancelledError, Exception):
                    await task
                yield _sse(
                    "result",
                    _analysis_failure(
                        "budget_exhausted",
                        "Analysis exceeded its request budget.",
                        payload.language,
                    ),
                )
                return
            if pending:
                yield _sse("activity", pending.popleft())
                continue
            if task.done():
                yield _sse("result", await task)
                return
            changed.clear()
            await changed.wait()
    finally:
        if not task.done():
            task.cancel()
        with suppress(asyncio.CancelledError, Exception):
            await task
        pending.clear()


class AnalysisStreamingResponse(StreamingResponse):
    """Watch disconnects even on ASGI 2.4, including while no bytes are arriving.

    Explicitly close a generator suspended at yield when send fails, instead of
    relying on async-generator garbage collection to cancel provider work.
    """

    async def stream_response(self, send: Send) -> None:
        try:
            await super().stream_response(send)
        finally:
            await self.body_iterator.aclose()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        try:
            await _run_until_disconnect(Request(scope, receive), self.stream_response(send))
        except AnalysisError as exc:
            if exc.code != "client_disconnected":
                raise
        except OSError:
            pass  # Transport closed; stream_response has already joined the producer.


def create_app(
    settings: Settings | None = None,
    *,
    knowledge_root: Path | None = None,
    model_client: Any | None = None,
) -> FastAPI:
    settings = settings if settings is not None else Settings()
    root = knowledge_root if knowledge_root is not None else PUBLIC_KNOWLEDGE_ROOT
    try:
        config = settings.llm_config()
    except (ValidationError, ValueError):
        config = None
    try:
        image = settings.image_config()
    except (ValidationError, ValueError):
        image = None

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        client = model_client
        if client is None and config is not None:
            client = LLMClient(config)
        app.state.analysis_service = (
            AnalysisService(client, root, budget_limits=settings.analysis_budget_limits())
            if client is not None
            else None
        )
        # Shares the analysis client; the pipeline owns no separate provider connection.
        app.state.image_pipeline = None
        if client is not None and image is not None:
            try:
                app.state.image_pipeline = ImagePipeline(image, client)
            except StorageError:
                # Missing credentials/dependencies never take down text analysis.
                # No raw exception, bucket, key or provider detail is logged.
                pass
        app.state.history_store = settings.history_store()
        try:
            yield
        finally:
            if model_client is None and client is not None:
                await client.aclose()

    app = FastAPI(title="Saral Sahayak Markdown agent", version="0.2.0", lifespan=lifespan)
    app.add_middleware(BodyLimitMiddleware)
    if settings.analysis_access_mode == "protected":
        from backend.access import AnalysisAccessMiddleware

        app.add_middleware(
            AnalysisAccessMiddleware,
            token=settings.analysis_access_token,
            requests_per_minute=settings.analysis_requests_per_minute,
            max_concurrent=settings.analysis_max_concurrent,
            timeout_seconds=settings.analysis_request_seconds,
        )
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_methods=["GET", "POST"],
            allow_headers=["Content-Type"],
            allow_credentials=False,
        )

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "invalid_request",
                    "message": "Request does not match the API schema.",
                }
            },
        )

    async def checks() -> dict[str, Any]:
        corpus = await asyncio.to_thread(check_corpus, root)
        return {
            "model_configured": config is not None,
            "model_connectivity_verified": False,
            "knowledge_index_present": corpus.index_present,
            "knowledge_structure_ready": corpus.structure_ready,
            "knowledge_content_verified": False,
            "agent_implemented": True,
        }

    def available(state: dict[str, Any]) -> bool:
        return state["model_configured"] and state["knowledge_structure_ready"]

    def error_response(code: str, message: str, status: int, language: str):
        result = _analysis_failure(code, message, language)
        return JSONResponse(status_code=status, content=result.model_dump())

    @app.get("/health/live")
    async def live():
        return {"status": "alive", "version": "0.2.0"}

    @app.get("/health/ready", responses={503: {"description": "Analysis is not ready"}})
    async def ready():
        state = await checks()
        is_ready = available(state)
        return JSONResponse(
            status_code=200 if is_ready else 503,
            content={"status": "ready" if is_ready else "not_ready", "checks": state},
        )

    @app.get("/api/v1/capabilities")
    async def capabilities():
        state = await checks()
        return {
            "schema_version": "1.0",
            "default_language": "en",
            "languages": [
                {
                    "code": code,
                    "name": LANGUAGES[code][0],
                    "native_name": LANGUAGES[code][1],
                    "quality_verified": False,
                }
                for code in settings.supported_languages
            ],
            "analysis_available": available(state),
            "checks": state,
            "inputs": (
                ["text", "image"]
                if getattr(app.state, "image_pipeline", None) is not None
                else ["text"]
            ),
            "downloads_available": False,
            "history_available": getattr(app.state, "history_store", None) is not None,
        }

    def shared_service(payload: AnalyzeRequest) -> AnalysisService | _SharedBudgetService:
        """Text requests reach the service directly; only an image request adds the wrapper."""
        service = app.state.analysis_service
        if payload.image_key is None:
            return service
        return _SharedBudgetService(
            service,
            settings.analysis_budget_limits(),
            getattr(app.state, "image_pipeline", None),
        )

    def tracked_service(payload: AnalyzeRequest, request: Request):
        """Adds lifecycle/history/cache around shared_service when the store is enabled."""
        inner = shared_service(payload)
        store = getattr(app.state, "history_store", None)
        if store is None:
            return inner
        return HistoryTrackingService(inner, store, _session_id(request))

    async def analysis_gate(payload: AnalyzeRequest) -> JSONResponse | None:
        if payload.language not in settings.supported_languages:
            return error_response(
                "language_disabled", "The selected language is disabled.", 422, payload.language
            )
        if payload.image_key is not None and getattr(app.state, "image_pipeline", None) is None:
            return error_response(
                "image_input_unavailable", "Image input is unavailable.", 503, payload.language
            )
        state = await checks()
        if not state["model_configured"]:
            return error_response(
                "model_not_configured", "Model configuration is unavailable.", 503, payload.language
            )
        if not state["knowledge_structure_ready"]:
            return error_response(
                "knowledge_unavailable",
                "The Markdown knowledge corpus is missing or incomplete.",
                503,
                payload.language,
            )
        service = getattr(app.state, "analysis_service", None)
        if service is None:
            return error_response(
                "service_unavailable",
                "The analysis service has not started.",
                503,
                payload.language,
            )
        return None

    @app.post(
        "/api/v1/images/uploads",
        response_model=UploadTicket,
        responses={
            422: {"description": "Unsupported type or language"},
            503: {"description": "Image input unavailable"},
        },
    )
    async def images_upload(payload: UploadTicketRequest):
        """Mint one opaque key plus a short-lived upload URL for a private object."""
        if payload.language not in settings.supported_languages:
            return _transport_failure(
                "language_disabled", "The selected language is disabled.", 422
            )
        pipeline = getattr(app.state, "image_pipeline", None)
        if pipeline is None:
            return _transport_failure("image_input_unavailable", "Image input is unavailable.", 503)
        state = await checks()
        if not state["model_configured"]:
            return _transport_failure(
                "model_not_configured", "Model configuration is unavailable.", 503
            )
        if not state["knowledge_structure_ready"]:
            return _transport_failure(
                "knowledge_unavailable",
                "The Markdown knowledge corpus is missing or incomplete.",
                503,
            )
        try:
            key, url, ttl = pipeline.admit(
                payload.content_type, payload.content_length, language=payload.language
            )
        except AnalysisError as exc:
            return _transport_failure(exc.code, exc.message, exc.http_status)
        return UploadTicket(
            object_key=key, upload_url=url, content_type=payload.content_type, expires_in=ttl
        )

    @app.post(
        "/api/v1/analyze",
        response_model=AnalyzeResponse,
        responses={
            503: {"model": AnalyzeResponse, "description": "Analysis dependency unavailable"}
        },
    )
    async def analyze(payload: AnalyzeRequest, request: Request):
        error = await analysis_gate(payload)
        if error is not None:
            return error
        try:
            service = tracked_service(payload, request)
            result = _validated_result(
                await _run_until_disconnect(request, service.analyze(payload)),
                payload,
            )
        except AnalysisError as exc:
            return error_response(exc.code, exc.message, exc.http_status, payload.language)
        except Exception:
            return error_response(
                "analysis_failed",
                "The analysis could not be completed safely.",
                502,
                payload.language,
            )
        return result

    @app.post(
        "/api/v1/analyze/stream",
        response_class=StreamingResponse,
        responses={
            200: {"content": {"text/event-stream": {}}, "description": "Activity then result"},
            503: {"model": AnalyzeResponse, "description": "Analysis dependency unavailable"},
        },
    )
    async def analyze_stream(payload: AnalyzeRequest, request: Request):
        error = await analysis_gate(payload)
        if error is not None:
            return error
        return AnalysisStreamingResponse(
            _analysis_events(tracked_service(payload, request), payload),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )

    @app.get("/api/v1/history", response_model=HistoryResponse)
    async def history(request: Request, response: Response, limit: int = 20):
        # Session-scoped, session-varying data must never be cached by a shared proxy
        # or the browser's back/forward cache.
        response.headers["Cache-Control"] = "no-store"
        session_id = _session_id(request)
        store = getattr(app.state, "history_store", None)
        if store is None:
            return HistoryResponse(session_id=session_id, cases=[])
        bounded_limit = min(max(limit, 1), 100)
        cases = [
            HistoryCase(
                case_id=record.case_id,
                status=record.status,
                outcome=record.outcome,
                reason_id=record.reason_id,
                language=record.language,
                from_cache=record.from_cache,
                created_at=record.created_at,
                updated_at=record.updated_at,
            )
            for record in store.history(session_id, limit=bounded_limit)
        ]
        return HistoryResponse(session_id=session_id, cases=cases)

    return app
