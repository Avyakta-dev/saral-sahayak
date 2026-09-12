"""API -> readiness -> real service -> real tools -> mocked Responses protocol."""

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.config import Settings
from backend.languages import LANGUAGES
from backend.llm import LLMClient
from backend.main import create_app

TEXT = {
    "en": "Check the synthetic details.",
    "hi": "कृत्रिम विवरण जाँचें।",
    "kn": "ಕೃತಕ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "ta": "செயற்கை விவரங்களைச் சரிபார்க்கவும்.",
    "te": "కృత్రిమ వివరాలను తనిఖీ చేయండి.",
    "ml": "കൃത്രിമ വിവരങ്ങൾ പരിശോധിക്കുക.",
}


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


@pytest.mark.parametrize("language", list(LANGUAGES))
def test_full_api_service_and_protocol_without_readiness_bypass(
    complete_corpus, language, monkeypatch
):
    import os

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
        if len(calls) == 1:
            return httpx.Response(
                200,
                json={
                    "status": "completed",
                    "usage": {"output_tokens": 80},
                    "output": [
                        {
                            "type": "function_call",
                            "call_id": "read-fixture",
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
            "language": language,
            "classification": {
                "reason_id": "epfo-rr-001",
                "category": "Synthetic",
                "confidence": "medium",
                "rationale": TEXT[language],
            },
            "explanation": [{"text": TEXT[language], "evidence_ids": [eid]}],
            "actions": [{"text": TEXT[language], "evidence_ids": [eid]}],
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
    try:
        with TestClient(app) as client:
            assert client.get("/health/ready").status_code == 200
            assert client.get("/api/v1/capabilities").json()["analysis_available"] is True
            assert calls == []
            response = client.post(
                "/api/v1/analyze",
                json={
                    "text": "Synthetic test only",
                    "language": language,
                    "details": {"claimant_name": "Synthetic Person"},
                },
            )
            assert response.status_code == 200, response.json()
            data = response.json()
            assert data["status"] == "success" and data["language"] == language
            assert data["actions"][0]["text"] == TEXT[language]
            assert data["citations"][0]["record_id"] == "epfo-rr-001"
            assert data["citations"][0]["source_urls"] == ["https://example.invalid/synthetic"]
            assert data["draft"]["missing_fields"] == ["claim_id", "claim_type"]
            assert len(calls) == 2
    finally:
        import asyncio

        asyncio.run(http.aclose())
