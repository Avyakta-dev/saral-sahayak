"""Optional server-to-server admission gate; not browser authentication or billing."""

import asyncio
import hmac
import math
import threading
import time

from pydantic import SecretStr
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


class AnalysisAccessMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        *,
        token: SecretStr,
        requests_per_minute: int,
        max_concurrent: int,
        timeout_seconds: float,
        clock=time.monotonic,
    ):
        self.app = app
        self._token = token.get_secret_value().encode("ascii")
        self._rate = requests_per_minute
        self._max_concurrent = max_concurrent
        self._timeout = timeout_seconds
        self._clock = clock
        self._lock = threading.Lock()
        self._window = clock()
        self._count = 0
        self._active = 0

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if (
            scope["type"] != "http"
            or scope["method"] != "POST"
            or scope["path"].rstrip("/")
            not in {"/api/v1/analyze", "/api/v1/analyze/stream", "/api/v1/images/uploads"}
        ):
            await self.app(scope, receive, send)
            return
        authorization = [v for k, v in scope["headers"] if k.lower() == b"authorization"]
        if len(authorization) != 1 or not hmac.compare_digest(
            authorization[0], b"Bearer " + self._token
        ):
            await self._error(scope, receive, send, 401, "access_denied", "Analysis access denied.")
            return
        with self._lock:
            now = self._clock()
            if now - self._window >= 60:
                self._window, self._count = now, 0
            retry_after = max(1, math.ceil(60 - (now - self._window)))
            if self._count >= self._rate:
                denied = True
            elif self._active >= self._max_concurrent:
                denied, retry_after = True, 1
            else:
                denied = False
                self._count += 1
                self._active += 1
        if denied:
            await self._error(
                scope,
                receive,
                send,
                429,
                "analysis_capacity",
                "Analysis capacity is limited.",
                {"Retry-After": str(retry_after)},
            )
            return
        response_started = False

        async def tracked_send(message):
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            async with asyncio.timeout(self._timeout):
                await self.app(scope, receive, tracked_send)
        except TimeoutError:
            if response_started:
                raise
            await self._error(
                scope, receive, send, 504, "request_timeout", "Analysis request timed out."
            )
        finally:
            with self._lock:
                self._active -= 1

    @staticmethod
    async def _error(scope, receive, send, status, code, message, headers=None):
        response = JSONResponse(
            {"error": {"code": code, "message": message}}, status_code=status, headers=headers
        )
        await response(scope, receive, send)
