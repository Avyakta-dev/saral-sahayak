from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.types import ASGIApp, Receive, Scope, Send

from backend.api.schemas import AnalyzeRequest, AnalyzeResponse, ErrorDetail
from backend.config import PUBLIC_KNOWLEDGE_ROOT, Settings
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
            body.extend(message.get("body", b""))
            if len(body) > self.max_bytes:
                response = JSONResponse(
                    status_code=413,
                    content={
                        "error": {"code": "request_too_large", "message": "Request exceeds 32 KiB."}
                    },
                )
                await response(scope, receive, send)
                return
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


def create_app(settings: Settings | None = None, *, knowledge_root: Path | None = None) -> FastAPI:
    settings = settings if settings is not None else Settings()
    root = knowledge_root if knowledge_root is not None else PUBLIC_KNOWLEDGE_ROOT
    app = FastAPI(title="Saral Sahayak backend foundation", version="0.1.0")
    app.add_middleware(BodyLimitMiddleware)
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

    def checks() -> dict[str, Any]:
        try:
            provider = settings.llm_config() is not None
        except (ValidationError, ValueError):
            provider = False
        return {
            "model_configured": provider,
            "model_connectivity_verified": False,
            "knowledge_index_present": knowledge_present(root),
            "knowledge_content_verified": False,
            "agent_implemented": False,
        }

    @app.get("/health/live")
    async def live():
        return {"status": "alive", "version": "0.1.0"}

    @app.get("/health/ready", responses={503: {"description": "Analysis is not ready"}})
    async def ready():
        return JSONResponse(status_code=503, content={"status": "not_ready", "checks": checks()})

    @app.post(
        "/api/v1/analyze",
        response_model=AnalyzeResponse,
        responses={503: {"model": AnalyzeResponse, "description": "Agent integration pending"}},
    )
    async def analyze(payload: AnalyzeRequest):
        result = AnalyzeResponse(
            status="error",
            language=payload.language,
            error=ErrorDetail(
                code="agent_not_implemented",
                message="The backend foundation is available; analysis is not implemented yet.",
            ),
        )
        return JSONResponse(status_code=503, content=result.model_dump())

    return app
