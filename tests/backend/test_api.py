"""Offline API/serialization contracts; synthetic success is never a runtime mock."""

import copy
import json
import os
import socket
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.api.schemas import AnalyzeRequest, AnalyzeResponse, Citation
from backend.config import Settings
from backend.evidence import EvidenceError
from backend.main import create_app
from backend.tools.knowledge_files import KnowledgeFiles

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"
STATES = ("success", "needs_clarification", "unsupported", "error")
SECRET = "synthetic-sensitive-input-never-echo"


@pytest.fixture(autouse=True)
def isolated_environment_and_no_network(monkeypatch):
    monkeypatch.setattr(os, "environ", {})
    original_connect = socket.socket.connect

    def offline_connect(sock, address):
        if sock.family in (socket.AF_INET, socket.AF_INET6):
            raise AssertionError("API tests must not open network connections")
        return original_connect(sock, address)

    monkeypatch.setattr(socket.socket, "connect", offline_connect)


@pytest.fixture
def client(tmp_path):
    app = create_app(Settings(_env_file=None), knowledge_root=tmp_path / "absent")
    with TestClient(app) as test_client:
        yield test_client


def example(state):
    return json.loads((EXAMPLES / f"{state}.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("state", STATES)
def test_four_synthetic_response_contracts_round_trip_through_fastapi(state):
    payload = example(state)
    result = AnalyzeResponse.model_validate(payload)
    assert result.status == state
    assert any("SYNTHETIC EXAMPLE ONLY" in warning for warning in result.warnings)
    # This separate app tests FastAPI serialization, not a working analysis agent.
    fixture_app = FastAPI()

    @fixture_app.get("/synthetic-fixture", response_model=AnalyzeResponse)
    def fixture_response():
        return payload

    with TestClient(fixture_app) as fixture_client:
        response = fixture_client.get("/synthetic-fixture")
    assert response.status_code == 200
    assert response.json() == payload
    assert AnalyzeResponse.model_validate_json(response.content) == result
    for citation in result.citations:
        assert "/synthetic-examples/" in citation.path
        assert all(url.startswith("https://example.invalid/") for url in citation.source_urls)


@pytest.mark.parametrize("configured", [False, True])
@pytest.mark.parametrize("index_present", [False, True])
def test_live_is_not_readiness_even_with_complete_synthetic_config(
    tmp_path, configured, index_present
):
    root = tmp_path / "synthetic-knowledge"
    if index_present:
        root.mkdir()
        (root / "README.md").write_text("# SYNTHETIC INDEX ONLY\n", encoding="utf-8")
    settings = Settings(
        _env_file=None,
        llm_base_url="https://llm.example.invalid/v1" if configured else "",
        llm_api_key=SECRET if configured else "",
        llm_model="synthetic-model" if configured else "",
    )
    with TestClient(create_app(settings, knowledge_root=root)) as test_client:
        live = test_client.get("/health/live")
        ready = test_client.get("/health/ready")
        analysis = test_client.post("/api/v1/analyze", json={"text": "Synthetic input"})
    assert live.status_code == 200
    assert live.json() == {"status": "alive", "version": "0.1.0"}
    assert ready.status_code == 503
    assert ready.json() == {
        "status": "not_ready",
        "checks": {
            "model_configured": configured,
            "model_connectivity_verified": False,
            "knowledge_index_present": index_present,
            "knowledge_content_verified": False,
            "agent_implemented": False,
        },
    }
    assert analysis.status_code == 503
    result = AnalyzeResponse.model_validate(analysis.json())
    assert result.status == "error"
    assert result.error.code == "agent_not_implemented"
    assert result.classification is None and result.draft is None
    assert not any(
        (result.explanation, result.actions, result.required_documents, result.citations)
    )
    assert SECRET not in ready.text + analysis.text
    assert str(root) not in ready.text + analysis.text


def test_invalid_provider_configuration_does_not_break_liveness(tmp_path):
    settings = Settings(
        _env_file=None, llm_base_url="not-a-url", llm_api_key=SECRET, llm_model="synthetic"
    )
    with TestClient(create_app(settings, knowledge_root=tmp_path / "absent")) as test_client:
        assert test_client.get("/health/live").status_code == 200
        response = test_client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["checks"]["model_configured"] is False
    assert SECRET not in response.text


@pytest.mark.parametrize("language", ["en", "hi"])
def test_utf8_input_preserves_language_but_never_echoes_user_data(client, language):
    payload = {
        "text": "केवल काल्पनिक परीक्षण — " + SECRET,
        "language": language,
        "details": {"claimant_name": SECRET, "claim_id": SECRET, "claim_type": "synthetic"},
    }
    response = client.post(
        "/api/v1/analyze",
        content=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    assert response.status_code == 503
    assert response.json()["language"] == language
    assert response.json()["error"]["code"] == "agent_not_implemented"
    assert SECRET not in response.text


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"text": ""},
        {"text": " \n\t "},
        {"text": "x" * 8001},
        {"text": 123},
        {"text": None},
        {"text": "synthetic", "language": SECRET},
        {"text": "synthetic", "api_key": SECRET},
        {"text": "synthetic", "details": {"unknown_secret": SECRET}},
        {"text": "synthetic", "details": {"claimant_name": "x" * 201}},
        {"text": "synthetic", "details": {"claim_id": "x" * 101}},
        {"text": "synthetic", "details": {"claim_type": "x" * 101}},
        {"text": "synthetic", "details": None},
    ],
)
def test_validation_is_safe_and_does_not_echo_inputs(client, payload):
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "error": {"code": "invalid_request", "message": "Request does not match the API schema."}
    }
    assert SECRET not in response.text


def test_malformed_json_is_safe(client):
    response = client.post(
        "/api/v1/analyze",
        content='{"text":"' + SECRET,
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"
    assert SECRET not in response.text


def test_invalid_utf8_is_a_safe_client_error(client):
    response = client.post(
        "/api/v1/analyze",
        content=b'{"text":"' + SECRET.encode() + b'\xff"}',
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "There was an error parsing the body"}
    assert SECRET not in response.text
    assert "Traceback" not in response.text


@pytest.mark.parametrize(("size", "status"), [(32768, 503), (32769, 413)])
@pytest.mark.parametrize("streamed", [False, True])
def test_body_limit_counts_bytes_even_without_content_length(client, size, status, streamed):
    body = b'{"text":"synthetic"}'
    body += b" " * (size - len(body))
    content = iter([body[:16000], body[16000:]]) if streamed else body
    response = client.post(
        "/api/v1/analyze", content=content, headers={"Content-Type": "application/json"}
    )
    if streamed:
        assert "content-length" not in response.request.headers
    assert response.status_code == status
    if status == 413:
        assert response.json() == {
            "error": {"code": "request_too_large", "message": "Request exceeds 32 KiB."}
        }


def test_utf8_byte_limit_is_distinct_from_character_limit(client):
    payload = {"text": "😀" * 8000, "details": {"claimant_name": "😀" * 200}}
    AnalyzeRequest.model_validate(payload)  # Character lengths are within the schema limits.
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    assert len(body) > 32768
    response = client.post(
        "/api/v1/analyze", content=body, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "request_too_large"


def test_input_normalization_and_missing_details_are_explicit():
    request = AnalyzeRequest(text="  synthetic  ")
    assert request.text == "synthetic"
    assert request.language == "en"
    assert request.details.model_dump() == {
        "claimant_name": None,
        "claim_id": None,
        "claim_type": None,
    }


@pytest.mark.parametrize(
    ("origin", "allowed"),
    [
        ("http://localhost:5173", True),
        ("http://127.0.0.1:5173", False),
        ("http://localhost:5174", False),
        ("https://localhost:5173", False),
        ("http://localhost:5173.evil.invalid", False),
    ],
)
def test_cors_origin_is_exact_and_never_credentialed(tmp_path, origin, allowed):
    app = create_app(
        Settings(_env_file=None, cors_origins=["http://localhost:5173"]),
        knowledge_root=tmp_path / "absent",
    )
    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/analyze", json={"text": "synthetic"}, headers={"Origin": origin}
        )
        preflight = test_client.options(
            "/api/v1/analyze",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
    assert response.status_code == 503
    assert preflight.status_code == (200 if allowed else 400)
    for result in (response, preflight):
        assert result.headers.get("access-control-allow-origin") == (origin if allowed else None)
        assert "access-control-allow-credentials" not in result.headers
    assert set(preflight.headers["access-control-allow-methods"].split(", ")) == {"GET", "POST"}


def test_cors_disabled_by_default(client):
    response = client.get("/health/live", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.parametrize("field", ["classification", "explanation", "citations"])
def test_success_requires_classification_and_evidence(field):
    payload = example("success")
    payload[field] = None if field == "classification" else []
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


@pytest.mark.parametrize("state", ["needs_clarification", "unsupported", "error"])
@pytest.mark.parametrize("field", ["classification", "actions", "draft", "citations"])
def test_non_success_never_exposes_ready_to_use_guidance(state, field):
    payload = example(state)
    payload[field] = example("success")[field]
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


@pytest.mark.parametrize(
    ("state", "field", "value"),
    [
        ("needs_clarification", "questions", []),
        ("unsupported", "warnings", []),
        ("error", "error", None),
        ("success", "questions", ["synthetic?"]),
        ("success", "error", {"code": "synthetic", "message": "synthetic"}),
        ("error", "status", "unknown"),
        ("error", "schema_version", "2.0"),
    ],
)
def test_state_invariants(state, field, value):
    payload = example(state)
    payload[field] = value
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


@pytest.mark.parametrize("mutation", ["unknown", "duplicate", "factual_without_evidence"])
def test_citation_references_and_factual_draft_require_evidence(mutation):
    payload = example("success")
    if mutation == "unknown":
        payload["actions"][0]["citation_ids"] = ["ev-unknown"]
    elif mutation == "duplicate":
        payload["citations"].append(copy.deepcopy(payload["citations"][0]))
    else:
        payload["draft"]["blocks"][0]["citation_ids"] = []
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("path", "references/knowledge/epfo/../private.md"),
        ("path", "/etc/example.md"),
        ("path", "references/knowledge/epfo/example.json"),
        ("start_line", 0),
        ("end_line", 0),
        ("source_urls", ["javascript:alert(1)"]),
        ("source_urls", ["https://synthetic:secret@example.invalid/"]),
    ],
)
def test_unsafe_citation_locations_are_rejected(field, value):
    payload = example("success")
    payload["citations"][0][field] = value
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


def test_reversed_citation_range_is_rejected():
    payload = example("success")
    payload["citations"][0].update(start_line=2, end_line=1)
    with pytest.raises(ValidationError):
        AnalyzeResponse.model_validate(payload)


def test_response_evidence_matches_actual_temporary_read_and_rejects_forgery(tmp_path):
    root = tmp_path / "synthetic-knowledge"
    root.mkdir()
    (root / "schema-only.md").write_text(
        "# SYNTHETIC EXAMPLE ONLY\n"
        "A fictional label, not policy advice. https://example.invalid/synthetic-evidence\n",
        encoding="utf-8",
    )
    with KnowledgeFiles(root) as files:
        read = files.read_file("schema-only.md", heading="SYNTHETIC EXAMPLE ONLY")
        citation = Citation(
            id=read.evidence_id,
            path=read.path,
            record_id=read.record_id,
            heading=read.heading,
            start_line=read.start_line,
            end_line=read.end_line,
            source_urls=list(read.source_urls),
        )
        payload = example("success")
        payload.update(
            explanation=[{"text": "Synthetic fixture label only.", "citation_ids": [citation.id]}],
            actions=[],
            required_documents=[],
            draft=None,
            citations=[citation.model_dump()],
        )
        result = AnalyzeResponse.model_validate(payload)
        result.validate_evidence(files.ledger)
        forged = result.model_copy(
            update={"citations": [citation.model_copy(update={"heading": "Forged heading"})]}
        )
        with pytest.raises(EvidenceError):
            forged.validate_evidence(files.ledger)
        result.validate_evidence(files.ledger)  # Forgery did not mutate the host snapshot.
