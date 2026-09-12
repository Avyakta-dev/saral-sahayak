"""Protected HTTP path through the real corpus and agent with a scripted model."""

import json
import os
from pathlib import Path

import httpx
from fastapi.testclient import TestClient

from backend.config import Settings
from backend.llm import LLMClient
from backend.main import create_app


def test_protected_request_reaches_real_agent_only_after_admission(monkeypatch):
    monkeypatch.setattr(os, "environ", {})
    token = "synthetic-gateway-secret-not-real-123456789"
    settings = Settings(
        _env_file=None,
        analysis_access_mode="protected",
        analysis_access_token=token,
        analysis_requests_per_minute=1,
        llm_api_key="synthetic-provider-key",
        llm_base_url="https://example.invalid/v1",
        llm_model="scripted-model",
    )
    calls = []

    def handler(request):
        calls.append(json.loads(request.content))
        assert token not in request.content.decode()
        assert request.headers["Authorization"] == "Bearer synthetic-provider-key"
        return httpx.Response(
            200,
            json={
                "status": "completed",
                "usage": {"output_tokens": 50},
                "output": [
                    {
                        "type": "message",
                        "role": "assistant",
                        "content": [
                            {
                                "type": "output_text",
                                "text": json.dumps(
                                    {
                                        "status": "unsupported",
                                        "language": "en",
                                        "warnings": [
                                            "No evidence establishes the supplied synthetic code."
                                        ],
                                    }
                                ),
                            }
                        ],
                    }
                ],
            },
        )

    http = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    app = create_app(
        settings,
        model_client=LLMClient(settings.llm_config(), http),
        knowledge_root=Path(__file__).resolve().parents[2] / "references/knowledge/epfo",
    )
    try:
        with TestClient(app) as client:
            assert client.get("/health/ready").status_code == 200
            assert (
                client.post("/api/v1/analyze", json={"text": "Synthetic ZX-999"}).status_code == 401
            )
            assert not calls
            headers = {"Authorization": "Bearer " + token}
            response = client.post(
                "/api/v1/analyze", json={"text": "Synthetic ZX-999"}, headers=headers
            )
            assert response.status_code == 200 and response.json()["status"] == "unsupported"
            assert response.json()["draft"] is None
            assert len(calls) == 1
            assert (
                client.post(
                    "/api/v1/analyze", json={"text": "Synthetic"}, headers=headers
                ).status_code
                == 429
            )
            assert len(calls) == 1
    finally:
        import asyncio

        asyncio.run(http.aclose())
