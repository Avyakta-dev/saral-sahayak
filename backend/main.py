import asyncio
from contextlib import asynccontextmanager, suppress
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.types import ASGIApp, Receive, Scope, Send

from backend.agent.service import AnalysisError, AnalysisService
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse, ErrorDetail
from backend.config import PUBLIC_KNOWLEDGE_ROOT, Settings
from backend.knowledge_readiness import check_corpus
from backend.languages import LANGUAGES
from backend.llm import LLMClient
from backend.tools.knowledge_files import KnowledgeError, check_knowledge_root


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
        result = AnalyzeResponse(
            status="error", language=language, error=ErrorDetail(code=code, message=message)
        )
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
            "inputs": ["text"],
            "downloads_available": False,
        }

    @app.post(
        "/api/v1/analyze",
        response_model=AnalyzeResponse,
        responses={
            503: {"model": AnalyzeResponse, "description": "Analysis dependency unavailable"}
        },
    )
    async def analyze(payload: AnalyzeRequest, request: Request):
        if payload.language not in settings.supported_languages:
            return error_response(
                "language_disabled", "The selected language is disabled.", 422, payload.language
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
        try:
            result = await _run_until_disconnect(request, service.analyze(payload))
            result = AnalyzeResponse.model_validate(result.model_dump())
            if result.language != payload.language:
                raise AnalysisError(
                    "invalid_model_output", "The model output could not be validated.", 502
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

    return app
