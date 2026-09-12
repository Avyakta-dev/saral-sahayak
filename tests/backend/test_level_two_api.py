"""Offline level-two API boundary tests, not agent end-to-end or corpus validation.

Ready-path tests explicitly bypass check_corpus with a synthetic status. The real
corpus validator and real agent/tool loop have their own test modules. No test
uses the production corpus, provider, developer environment, or .env file.
"""

import asyncio
import os
import socket
from pathlib import Path
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi.testclient import TestClient
from starlette.requests import Request

import backend.main as main
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse
from backend.config import Settings
from backend.knowledge_readiness import CorpusStatus

LANGUAGES = ("en", "hi", "kn", "ta", "te", "ml")
SECRET = "synthetic-private-provider-value"
EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"


@pytest.fixture(autouse=True)
def isolated_environment_and_no_network(monkeypatch):
    monkeypatch.setattr(os, "environ", {})
    original_connect = socket.socket.connect
    attempted = []

    def offline_connect(sock, address):
        if sock.family in (socket.AF_INET, socket.AF_INET6):
            attempted.append(address)
            raise AssertionError("API unit tests must not open network connections")
        return original_connect(sock, address)

    monkeypatch.setattr(socket.socket, "connect", offline_connect)
    yield
    assert not attempted  # Also catch attempts swallowed by application error handling.


@pytest.fixture
def settings():
    return Settings(
        _env_file=None,
        llm_base_url="https://provider.example.invalid/private-route",
        llm_api_key=SECRET,
        llm_model="synthetic-private-model",
        llm_extra_headers={"X-Private-Token": SECRET},
    )


@pytest.fixture
def model():
    return Mock(complete=AsyncMock(), aclose=AsyncMock())


@pytest.fixture
def readiness_bypass(monkeypatch):
    """API-only seam: this fixture does NOT certify a real or synthetic corpus."""
    check = Mock(
        return_value=CorpusStatus(
            index_present=True, structure_ready=True, missing_count=0, invalid_count=0
        )
    )
    monkeypatch.setattr(main, "check_corpus", check)
    return check


@pytest.fixture
def service_factory(monkeypatch):
    """A fake AnalyzeResponse service tests routing, never agent behavior."""
    factory = Mock(return_value=Mock(analyze=AsyncMock()))
    monkeypatch.setattr(main, "AnalysisService", factory)
    return factory


def assert_safe_error(response, status, code, language="en"):
    assert response.status_code == status
    result = AnalyzeResponse.model_validate(response.json())
    assert result.status == "error"
    assert result.language == language
    assert result.error.code == code
    assert result.classification is None and result.draft is None
    assert not (
        result.explanation or result.actions or result.required_documents or result.citations
    )
    assert SECRET not in response.text
    return result


@pytest.mark.parametrize("configured", [False, True])
def test_ready_and_capabilities_are_structural_not_connectivity_or_quality_claims(
    tmp_path, settings, model, readiness_bypass, configured
):
    if not configured:
        settings = Settings(_env_file=None)
    root = tmp_path / "not-a-corpus-fixture-bypass"
    with TestClient(main.create_app(settings, knowledge_root=root, model_client=model)) as client:
        ready = client.get("/health/ready")
        capabilities = client.get("/api/v1/capabilities")
    assert ready.status_code == (200 if configured else 503)
    assert ready.json()["status"] == ("ready" if configured else "not_ready")
    checks = {
        "model_configured": configured,
        "model_connectivity_verified": False,
        "knowledge_index_present": True,
        "knowledge_structure_ready": True,
        "knowledge_content_verified": False,
        "agent_implemented": True,
    }
    assert ready.json()["checks"] == checks
    assert capabilities.status_code == 200
    payload = capabilities.json()
    assert payload["checks"] == checks
    assert payload["analysis_available"] is configured
    assert payload["default_language"] == "en"
    assert payload["schema_version"] == "1.0"
    assert payload["inputs"] == ["text"]
    assert payload["downloads_available"] is False
    assert [item["code"] for item in payload["languages"]] == list(LANGUAGES)
    for item in payload["languages"]:
        assert set(item) == {"code", "name", "native_name", "quality_verified"}
        assert item["name"] and item["native_name"]
        assert item["quality_verified"] is False
    for private in (
        SECRET,
        str(root),
        "private-route",
        "synthetic-private-model",
        "X-Private-Token",
    ):
        assert private not in ready.text + capabilities.text
    assert readiness_bypass.call_count == 2
    readiness_bypass.assert_called_with(root)
    model.complete.assert_not_called()


def test_injected_model_does_not_replace_required_configuration(
    tmp_path, model, readiness_bypass, service_factory
):
    app = main.create_app(Settings(_env_file=None), knowledge_root=tmp_path, model_client=model)
    with TestClient(app) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET})
    assert_safe_error(response, 503, "model_not_configured")
    service_factory.return_value.analyze.assert_not_called()
    model.complete.assert_not_called()


def test_incomplete_actual_temporary_corpus_prevents_model_and_service_calls(
    tmp_path, settings, model, service_factory
):
    # Deliberately no readiness_bypass: an index alone is not a complete corpus.
    (tmp_path / "README.md").write_text("# SYNTHETIC INDEX ONLY\n", encoding="utf-8")
    app = main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    with TestClient(app) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET})
        capabilities = client.get("/api/v1/capabilities").json()
    assert_safe_error(response, 503, "knowledge_unavailable")
    assert capabilities["analysis_available"] is False
    assert capabilities["checks"]["knowledge_index_present"] is True
    assert capabilities["checks"]["knowledge_structure_ready"] is False
    service_factory.return_value.analyze.assert_not_called()
    model.complete.assert_not_called()


def test_disabled_language_is_rejected_before_readiness_or_model_work(
    tmp_path, settings, model, readiness_bypass, service_factory
):
    settings.supported_languages = ["en", "hi"]
    app = main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    with TestClient(app) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET, "language": "kn"})
        assert_safe_error(response, 422, "language_disabled", "kn")
        readiness_bypass.assert_not_called()
        languages = client.get("/api/v1/capabilities").json()["languages"]
    assert [item["code"] for item in languages] == ["en", "hi"]
    service_factory.return_value.analyze.assert_not_called()
    model.complete.assert_not_called()


@pytest.mark.parametrize("state", ["success", "needs_clarification", "unsupported", "error"])
def test_api_serializes_service_outcomes_without_claiming_agent_e2e(
    tmp_path, settings, model, readiness_bypass, service_factory, state
):
    result = AnalyzeResponse.model_validate_json((EXAMPLES / f"{state}.json").read_text("utf-8"))
    service_factory.return_value.analyze.return_value = result
    app = main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/analyze", json={"text": "  synthetic request  ", "language": result.language}
        )
    assert response.status_code == 200
    assert response.json() == result.model_dump()
    service_factory.assert_called_once_with(model, tmp_path)
    service_factory.return_value.analyze.assert_awaited_once_with(
        AnalyzeRequest(text="synthetic request", language=result.language)
    )
    model.complete.assert_not_called()  # This deliberately exercises a fake service.


@pytest.mark.parametrize("language", LANGUAGES)
def test_api_fails_closed_on_service_output_language_mismatch(
    tmp_path, settings, model, readiness_bypass, service_factory, language
):
    wrong_language = "hi" if language == "en" else "en"
    service_factory.return_value.analyze.return_value = AnalyzeResponse(
        status="unsupported", language=wrong_language, warnings=["Synthetic fixture only."]
    )
    app = main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    with TestClient(app) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET, "language": language})
    assert_safe_error(response, 502, "invalid_model_output", language)


@pytest.mark.parametrize(
    ("code", "status"),
    [("model_unavailable", 502), ("budget_exhausted", 503), ("analysis_timeout", 504)],
)
def test_api_preserves_sanitized_service_error_status(
    tmp_path, settings, model, readiness_bypass, service_factory, code, status
):
    service_factory.return_value.analyze.side_effect = main.AnalysisError(
        code, "Synthetic safe failure.", status
    )
    with TestClient(
        main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    ) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET, "language": "hi"})
    assert_safe_error(response, status, code, "hi")


@pytest.mark.parametrize("failure", ["exception", "invalid_response"])
def test_unexpected_service_failures_never_expose_private_values(
    tmp_path, settings, model, readiness_bypass, service_factory, failure
):
    service = service_factory.return_value
    if failure == "exception":
        service.analyze.side_effect = RuntimeError(f"{SECRET} at {tmp_path}")
    else:
        service.analyze.return_value = AnalyzeResponse.model_construct(
            status="success", language="en", warnings=[SECRET]
        )
    with TestClient(
        main.create_app(settings, knowledge_root=tmp_path, model_client=model)
    ) as client:
        response = client.post("/api/v1/analyze", json={"text": SECRET})
    result = assert_safe_error(response, 502, "analysis_failed")
    assert result.error.message == "The analysis could not be completed safely."
    assert str(tmp_path) not in response.text and "Traceback" not in response.text


@pytest.mark.parametrize("injected", [False, True])
def test_lifespan_closes_only_owned_model_client(tmp_path, settings, model, monkeypatch, injected):
    constructor = Mock(return_value=model)
    monkeypatch.setattr(main, "LLMClient", constructor)
    app = main.create_app(
        settings, knowledge_root=tmp_path, model_client=model if injected else None
    )
    with TestClient(app):
        model.aclose.assert_not_called()
    if injected:
        constructor.assert_not_called()
        model.aclose.assert_not_called()
    else:
        constructor.assert_called_once_with(settings.llm_config())
        model.aclose.assert_awaited_once_with()
    model.complete.assert_not_called()


async def test_disconnect_cancels_and_awaits_inflight_operation():
    started = asyncio.Event()
    cancelled = asyncio.Event()

    async def operation():
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()

    async def receive():
        await started.wait()
        return {"type": "http.disconnect"}

    request = Request({"type": "http"}, receive=receive)
    with pytest.raises(main.AnalysisError) as raised:
        await asyncio.wait_for(main._run_until_disconnect(request, operation()), timeout=1)
    assert (raised.value.code, raised.value.http_status) == ("client_disconnected", 499)
    assert cancelled.is_set()


async def test_completed_operation_cancels_and_awaits_disconnect_watcher():
    watching = asyncio.Event()
    watcher_cancelled = asyncio.Event()

    async def receive():
        watching.set()
        try:
            await asyncio.Event().wait()
        finally:
            watcher_cancelled.set()

    async def operation():
        await watching.wait()
        return "synthetic result"

    request = Request({"type": "http"}, receive=receive)
    result = await asyncio.wait_for(main._run_until_disconnect(request, operation()), timeout=1)
    assert result == "synthetic result"
    assert watcher_cancelled.is_set()
