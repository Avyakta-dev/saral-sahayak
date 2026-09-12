"""Synthetic access checks; no environment files or network providers."""

import asyncio
import os

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr, ValidationError

from backend.access import AnalysisAccessMiddleware
from backend.config import Settings
from backend.main import create_app

TOKEN = "synthetic-access-token-not-real-123456789"


@pytest.fixture(autouse=True)
def isolated_env(monkeypatch):
    monkeypatch.setattr(os, "environ", {})


@pytest.mark.parametrize("token", ["", "short", "x" * 257, "x" * 32 + "\n", "界" * 32])
def test_protected_mode_requires_valid_secret(token):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, analysis_access_mode="protected", analysis_access_token=token)


def settings(**kwargs):
    return Settings(
        _env_file=None,
        analysis_access_mode="protected",
        analysis_access_token=SecretStr(TOKEN),
        **kwargs,
    )


def test_default_local_mode_and_secret_repr():
    assert Settings(_env_file=None).analysis_access_mode == "local"
    assert TOKEN not in repr(settings())
    assert TOKEN not in repr(create_app(settings()).user_middleware)


@pytest.mark.parametrize("value", [0, -1, 601])
def test_rate_bounds(value):
    with pytest.raises(ValidationError):
        settings(analysis_requests_per_minute=value)


def test_authentication_precedes_body_read_and_is_never_echoed(tmp_path):
    with TestClient(create_app(settings(), knowledge_root=tmp_path)) as client:
        for path in (
            "/api/v1/analyze",
            "/api/v1/analyze/",
            "/api/v1/analyze/stream",
            "/api/v1/analyze/stream/",
            "/api/v1/images/uploads",
            "/api/v1/images/uploads/",
        ):
            response = client.post(
                path, content="PRIVATE" * 8000, headers={"Authorization": "wrong"}
            )
            assert response.status_code == 401
            assert "PRIVATE" not in response.text and "wrong" not in response.text
        duplicate = client.post(
            "/api/v1/analyze",
            headers=[("Authorization", "Bearer " + TOKEN), ("Authorization", "Bearer " + TOKEN)],
        )
        assert duplicate.status_code == 401
        assert client.get("/health/live").status_code == 200
        assert client.get("/health/ready").status_code == 503
        assert client.get("/api/v1/capabilities").status_code == 200
        response = client.post(
            "/api/v1/analyze",
            json={"text": "Synthetic"},
            headers={"Authorization": "Bearer " + TOKEN},
        )
        assert response.status_code == 503
        assert response.json()["error"]["code"] == "model_not_configured"
        assert TOKEN not in response.text


def test_protected_mode_does_not_enable_browser_token_cors(tmp_path):
    with TestClient(
        create_app(settings(cors_origins=["https://example.invalid"]), knowledge_root=tmp_path)
    ) as client:
        response = client.options(
            "/api/v1/analyze",
            headers={
                "Origin": "https://example.invalid",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
        assert response.status_code == 400
        assert "access-control-allow-credentials" not in response.headers
        denied = client.post("/api/v1/analyze", headers={"Origin": "https://example.invalid"})
        assert denied.status_code == 401
        assert denied.headers["access-control-allow-origin"] == "https://example.invalid"


def test_rate_admission_counts_failed_requests_without_trusting_forwarded_ip(tmp_path):
    with TestClient(
        create_app(settings(analysis_requests_per_minute=1), knowledge_root=tmp_path)
    ) as client:
        for _ in range(3):
            assert client.post("/api/v1/analyze").status_code == 401
        headers = {"Authorization": "Bearer " + TOKEN}
        assert client.post("/api/v1/analyze", content="{", headers=headers).status_code == 422
        response = client.post(
            "/api/v1/analyze",
            json={"text": "Synthetic"},
            headers={**headers, "X-Forwarded-For": "192.0.2.1"},
        )
        assert response.status_code == 429
        assert int(response.headers["retry-after"]) >= 1


@pytest.mark.parametrize(
    "path", ["/api/v1/analyze", "/api/v1/analyze/stream", "/api/v1/images/uploads"]
)
async def test_admission_before_receive_and_cancel_releases_slot(path):
    entered, release = asyncio.Event(), asyncio.Event()

    async def app(scope, receive, send):
        entered.set()
        await release.wait()
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"ok"})

    gate = AnalysisAccessMiddleware(
        app, token=SecretStr(TOKEN), requests_per_minute=10, max_concurrent=1, timeout_seconds=30
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=gate), base_url="http://test"
    ) as client:
        first = asyncio.create_task(client.post(path, headers={"Authorization": "Bearer " + TOKEN}))
        await entered.wait()
        assert (
            await client.post(path, headers={"Authorization": "Bearer " + TOKEN})
        ).status_code == 429
        first.cancel()
        with pytest.raises(asyncio.CancelledError):
            await first
        release.set()
        assert (
            await client.post(path, headers={"Authorization": "Bearer " + TOKEN})
        ).status_code == 200


async def test_slow_body_deadline_releases_slot():
    async def app(scope, receive, send):
        await asyncio.Event().wait()

    gate = AnalysisAccessMiddleware(
        app, token=SecretStr(TOKEN), requests_per_minute=10, max_concurrent=1, timeout_seconds=0.01
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=gate), base_url="http://test"
    ) as client:
        for _ in range(2):
            response = await client.post(
                "/api/v1/analyze", headers={"Authorization": "Bearer " + TOKEN}
            )
            assert response.status_code == 504
            assert response.json()["error"]["code"] == "request_timeout"


async def test_rate_window_resets_and_state_is_application_local():
    now = [0]

    async def app(scope, receive, send):
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"ok"})

    gate = AnalysisAccessMiddleware(
        app,
        token=SecretStr(TOKEN),
        requests_per_minute=1,
        max_concurrent=1,
        timeout_seconds=30,
        clock=lambda: now[0],
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=gate), base_url="http://test"
    ) as client:
        headers = {"Authorization": "Bearer " + TOKEN}
        assert (await client.post("/api/v1/analyze", headers=headers)).status_code == 200
        assert (await client.post("/api/v1/analyze", headers=headers)).status_code == 429
        now[0] = 60
        assert (await client.post("/api/v1/analyze", headers=headers)).status_code == 200
