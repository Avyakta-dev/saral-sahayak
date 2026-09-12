"""API-level proof: an identical repeat text query costs no second model call."""

import json
import os

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.config import Settings
from backend.llm import LLMClient
from backend.main import create_app


@pytest.fixture
def complete_corpus(tmp_path):
    (tmp_path / "reasons").mkdir()
    links = []
    for number in range(1, 182):
        record = f"epfo-rr-{number:03}"
        links.append(f"[{record}](reasons/{record}.md)")
        (tmp_path / "reasons" / f"{record}.md").write_text(
            f"# {record}\n## Fix\nSynthetic fixture, not policy.\n"
            "Check the synthetic details.\nhttps://example.invalid/synthetic\n",
            encoding="utf-8",
        )
    (tmp_path / "README.md").write_text("# Synthetic index\n" + "\n".join(links))
    for name in ("sources", "glossary", "claim-types-overview", "resolution-playbooks"):
        (tmp_path / f"{name}.md").write_text(f"# {name}\nSynthetic test content only.\n")
    return tmp_path


def _client(complete_corpus, monkeypatch):
    monkeypatch.setattr(os, "environ", {})
    settings = Settings(
        _env_file=None,
        llm_base_url="https://example.invalid/v1",
        llm_api_key="synthetic-key",
        llm_model="synthetic-model",
    )
    calls = []

    def handler(request):
        body = json.loads(request.content)
        calls.append(body)
        call_number = len(calls)
        if call_number % 2 == 1:
            return httpx.Response(
                200,
                json={
                    "status": "completed",
                    "usage": {"output_tokens": 80},
                    "output": [
                        {
                            "type": "function_call",
                            "call_id": f"read-fixture-{call_number}",
                            "name": "read_file",
                            "arguments": json.dumps(
                                {"relative_path": "reasons/epfo-rr-001.md", "heading": "Fix"}
                            ),
                        }
                    ],
                },
            )
        tool_output = [
            item["output"] for item in body["input"] if item.get("type") == "function_call_output"
        ][-1]
        eid = json.loads(tool_output)["evidence_id"]
        result = {
            "status": "success",
            "language": "en",
            "classification": {
                "reason_id": "epfo-rr-001",
                "category": "Synthetic",
                "confidence": "medium",
                "rationale": "Synthetic rationale.",
            },
            "explanation": [{"text": "Synthetic explanation.", "evidence_ids": [eid]}],
            "actions": [{"text": "Synthetic action.", "evidence_ids": [eid]}],
        }
        return httpx.Response(
            200,
            json={
                "status": "completed",
                "usage": {"output_tokens": 200},
                "output": [
                    {
                        "type": "message",
                        "role": "assistant",
                        "content": [
                            {"type": "output_text", "text": json.dumps(result, ensure_ascii=False)}
                        ],
                    }
                ],
            },
        )

    http = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    model = LLMClient(settings.llm_config(), http)
    app = create_app(settings, knowledge_root=complete_corpus, model_client=model)
    return app, http, calls


def test_identical_repeat_query_is_served_from_cache_without_a_second_model_call(
    complete_corpus, monkeypatch
):
    app, http, calls = _client(complete_corpus, monkeypatch)
    try:
        with TestClient(app) as client:
            assert client.get("/api/v1/capabilities").json()["history_available"] is True

            first = client.post(
                "/api/v1/analyze",
                json={"text": "Synthetic test only", "language": "en"},
                headers={"X-Session-Id": "reader-1"},
            )
            assert first.status_code == 200, first.json()
            assert first.json()["status"] == "success"
            assert len(calls) == 2  # one tool-call turn, one final turn

            second = client.post(
                "/api/v1/analyze",
                json={
                    "text": "synthetic   TEST only",  # same after normalization
                    "language": "en",
                    "details": {"claimant_name": "Second Caller"},
                },
                headers={"X-Session-Id": "reader-1"},
            )
            assert second.status_code == 200, second.json()
            assert len(calls) == 2, "identical repeat must not reach the model again"
            assert second.json()["classification"]["reason_id"] == "epfo-rr-001"
            assert second.json()["draft"]["blocks"][1]["text"] == "Second Caller"

            history = client.get("/api/v1/history", headers={"X-Session-Id": "reader-1"})
            assert history.status_code == 200
            assert history.headers["cache-control"] == "no-store"
            cases = history.json()["cases"]
            assert len(cases) == 2
            assert cases[0]["from_cache"] is True  # most recent first
            assert cases[1]["from_cache"] is False
            assert all(case["reason_id"] == "epfo-rr-001" for case in cases)

            other_session = client.get("/api/v1/history", headers={"X-Session-Id": "someone-else"})
            assert other_session.json()["cases"] == []
    finally:
        import asyncio

        asyncio.run(http.aclose())


def test_a_caller_who_knows_another_sessions_id_can_read_its_history(complete_corpus, monkeypatch):
    """X-Session-Id is a deliberately non-confidential convenience-cache partition key,
    not an authorization boundary (see _session_id's docstring in backend/main.py) -
    there is no login system for it to authenticate against. This test documents and
    proves that accepted behavior, rather than leaving it an unproven assumption: a
    caller who sends someone else's chosen session id reads exactly what that value's
    original sender would. What must never happen instead (and is covered elsewhere) is
    a caller's own submitted `details` or raw claim text ever appearing in another
    session's view - only non-identifying metadata is exposed here.
    """
    app, http, calls = _client(complete_corpus, monkeypatch)
    try:
        with TestClient(app) as client:
            victim = client.post(
                "/api/v1/analyze",
                json={"text": "Synthetic test only", "language": "en"},
                headers={"X-Session-Id": "victim-chosen-id"},
            )
            assert victim.status_code == 200, victim.json()

            spoofed = client.get("/api/v1/history", headers={"X-Session-Id": "victim-chosen-id"})
            assert spoofed.status_code == 200
            assert len(spoofed.json()["cases"]) == 1
            assert spoofed.json()["cases"][0]["reason_id"] == "epfo-rr-001"
    finally:
        import asyncio

        asyncio.run(http.aclose())


def test_callers_who_omit_the_session_header_never_share_one_bucket(complete_corpus, monkeypatch):
    """A missing X-Session-Id must never collapse every anonymous caller into one bucket."""
    app, http, calls = _client(complete_corpus, monkeypatch)
    try:
        with TestClient(app) as client:
            first = client.post(
                "/api/v1/analyze", json={"text": "Synthetic test only", "language": "en"}
            )
            assert first.status_code == 200, first.json()
            assert len(calls) == 2

            first_history = client.get("/api/v1/history")
            second_history = client.get("/api/v1/history")
            assert first_history.json()["session_id"] != second_history.json()["session_id"]
            # Neither header-less caller's own just-recorded case is visible to the other.
            assert first_history.json()["cases"] == []
            assert second_history.json()["cases"] == []
    finally:
        import asyncio

        asyncio.run(http.aclose())


def test_history_disabled_still_serves_analysis(complete_corpus, monkeypatch):
    monkeypatch.setattr(os, "environ", {})
    settings = Settings(
        _env_file=None,
        llm_base_url="https://example.invalid/v1",
        llm_api_key="synthetic-key",
        llm_model="synthetic-model",
        history_enabled=False,
    )
    app = create_app(settings, knowledge_root=complete_corpus, model_client=object())
    with TestClient(app) as client:
        assert client.get("/api/v1/capabilities").json()["history_available"] is False
        response = client.get("/api/v1/history")
        assert response.headers["cache-control"] == "no-store"
        body = response.json()
        assert body["cases"] == []
        assert isinstance(body["session_id"], str) and body["session_id"]
