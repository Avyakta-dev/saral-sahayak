"""Offline image API boundary: gates, ticket shape and shared-budget wiring.

ImagePipeline is replaced with a recording fake, so no boto3 client, credential or
socket exists in this module. The storage boundary has its own test module.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from test_level_two_api import (
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)
from test_level_two_api import model as model
from test_level_two_api import readiness_bypass as readiness_bypass
from test_level_two_api import service_factory as service_factory
from test_level_two_api import settings as settings

import backend.main as main
from backend.agent.service import AnalysisError
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse
from backend.config import Settings

ENDPOINT = "https://account.r2.cloudflarestorage.com"
KEY = "inbox/" + "a" * 32 + ".png"
UPLOAD_URL = ENDPOINT + "/synthetic-bucket/inbox/signed?X-Amz-Signature=synthetic"
SECRET = "synthetic-private-provider-value"
EXTRACTED = "Name does not match Aadhaar."
EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"


class FakePipeline:
    """Records admission and extraction; never reaches storage or a provider."""

    def __init__(self, text=EXTRACTED, failure=None):
        self.text = text
        self.failure = failure
        self.admitted = []
        self.extracted = []

    def admit(self, content_type, content_length, *, language="en"):
        if content_type not in ("image/png", "image/jpeg", "image/webp"):
            raise AnalysisError("image_not_admitted", "That image reference is not accepted.", 422)
        self.admitted.append(content_type)
        return KEY, UPLOAD_URL, 120

    async def extract(self, image_key, budget, *, language="en"):
        self.extracted.append((image_key, budget))
        if self.failure is not None:
            raise self.failure
        return self.text


@pytest.fixture
def image_settings():
    return Settings(
        _env_file=None,
        llm_base_url="https://provider.example.invalid/private-route",
        llm_api_key=SECRET,
        llm_model="synthetic-private-model",
        llm_extra_headers={"X-Private-Token": SECRET},
        image_input_enabled=True,
        image_lifecycle_configured=True,
        image_r2_endpoint=ENDPOINT,
        image_r2_bucket="synthetic-bucket",
    )


@pytest.fixture
def pipeline(monkeypatch):
    fake = FakePipeline()
    monkeypatch.setattr(main, "ImagePipeline", lambda *args, **kwargs: fake)
    return fake


def app_for(settings, model, root, **kwargs):
    return main.create_app(settings, knowledge_root=root, model_client=model, **kwargs)


def test_capabilities_omit_image_when_storage_is_unconfigured(
    tmp_path, settings, model, readiness_bypass
):
    with TestClient(app_for(settings, model, tmp_path)) as client:
        capabilities = client.get("/api/v1/capabilities").json()
    assert capabilities["inputs"] == ["text"]
    assert SECRET not in str(capabilities)


def test_capabilities_advertise_image_only_when_configured(
    tmp_path, image_settings, model, readiness_bypass, pipeline
):
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        capabilities = client.get("/api/v1/capabilities").json()
    assert capabilities["inputs"] == ["text", "image"]
    assert SECRET not in str(capabilities)
    assert ENDPOINT not in str(capabilities)  # the destination is never advertised


def test_upload_route_is_unavailable_by_default(tmp_path, settings, model, readiness_bypass):
    with TestClient(app_for(settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/images/uploads",
            json={"language": "en", "content_type": "image/png", "content_length": 2048},
        )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "image_input_unavailable"
    assert SECRET not in response.text


def test_upload_route_issues_a_bounded_ticket(
    tmp_path, image_settings, model, readiness_bypass, pipeline
):
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/images/uploads",
            json={"language": "en", "content_type": "image/png", "content_length": 2048},
        )
    assert response.status_code == 200
    body = response.json()
    assert body == {
        "object_key": KEY,
        "upload_url": UPLOAD_URL,
        "content_type": "image/png",
        "expires_in": 120,
    }
    assert pipeline.admitted == ["image/png"]


@pytest.mark.parametrize("content_type", ["image/gif", "image/svg+xml", "text/html"])
def test_upload_route_rejects_unsupported_types(
    tmp_path, image_settings, model, readiness_bypass, pipeline, content_type
):
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/images/uploads",
            json={"language": "en", "content_type": content_type, "content_length": 2048},
        )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "image_not_admitted"
    assert SECRET not in response.text


def test_upload_route_rejects_a_known_disabled_language(
    tmp_path, image_settings, model, readiness_bypass, pipeline, monkeypatch
):
    limited = image_settings.model_copy(update={"supported_languages": ["en"]})
    with TestClient(app_for(limited, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/images/uploads",
            json={"language": "hi", "content_type": "image/png", "content_length": 2048},
        )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "language_disabled"


def test_image_analysis_is_unavailable_without_storage(tmp_path, settings, model, readiness_bypass):
    with TestClient(app_for(settings, model, tmp_path)) as client:
        response = client.post("/api/v1/analyze", json={"image_key": KEY, "language": "en"})
    assert response.status_code == 503
    result = AnalyzeResponse.model_validate(response.json())
    assert result.error.code == "image_input_unavailable"


@pytest.mark.parametrize(
    "payload",
    [
        {"language": "en"},
        {"text": "remark", "image_key": KEY, "language": "en"},
        {"text": "   ", "language": "en"},
        {"image_key": "", "language": "en"},
    ],
)
def test_exactly_one_input_is_required(tmp_path, settings, model, readiness_bypass, payload):
    with TestClient(app_for(settings, model, tmp_path)) as client:
        response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "error": {"code": "invalid_request", "message": "Request does not match the API schema."}
    }
    assert KEY not in response.text


def test_text_requests_never_touch_the_image_pipeline(
    tmp_path, image_settings, model, readiness_bypass, pipeline, service_factory
):
    result = AnalyzeResponse.model_validate_json((EXAMPLES / "success.json").read_text("utf-8"))
    service_factory.return_value.analyze.return_value = result
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/analyze", json={"text": "  synthetic request  ", "language": result.language}
        )
    assert response.status_code == 200
    assert pipeline.extracted == []
    service_factory.return_value.analyze.assert_awaited_once_with(
        AnalyzeRequest(text="synthetic request", language=result.language)
    )


def test_image_analysis_shares_one_budget_and_hides_the_key(
    tmp_path, image_settings, model, readiness_bypass, pipeline, service_factory
):
    result = AnalyzeResponse.model_validate_json((EXAMPLES / "success.json").read_text("utf-8"))
    service_factory.return_value.analyze.return_value = result
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/analyze", json={"image_key": KEY, "language": result.language}
        )
    assert response.status_code == 200
    assert response.json() == result.model_dump()

    assert [key for key, _ in pipeline.extracted] == [KEY]
    args, kwargs = service_factory.return_value.analyze.await_args
    reviewed = args[0]
    assert reviewed.text == EXTRACTED  # validated transcription only
    assert reviewed.image_key is None  # the key is not carried into the agent request
    assert KEY not in reviewed.model_dump_json()
    assert kwargs["budget"] is pipeline.extracted[0][1]  # the same budget instance
    assert KEY not in response.text
    assert UPLOAD_URL not in response.text


def test_extraction_failure_stops_before_any_text_analysis(
    tmp_path, image_settings, model, readiness_bypass, service_factory, monkeypatch
):
    fake = FakePipeline(failure=AnalysisError("image_unreadable", "Unreadable.", 422))
    monkeypatch.setattr(main, "ImagePipeline", lambda *args, **kwargs: fake)
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post("/api/v1/analyze", json={"image_key": KEY, "language": "en"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "image_unreadable"
    service_factory.return_value.analyze.assert_not_awaited()
    assert fake.extracted[0][0] == KEY


def test_image_analysis_streams_through_the_same_shared_budget(
    tmp_path, image_settings, model, readiness_bypass, pipeline, service_factory
):
    result = AnalyzeResponse.model_validate_json((EXAMPLES / "success.json").read_text("utf-8"))
    service_factory.return_value.analyze.return_value = result
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post(
            "/api/v1/analyze/stream", json={"image_key": KEY, "language": result.language}
        )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "event: result" in response.text
    assert result.model_dump()["status"] in response.text
    args, kwargs = service_factory.return_value.analyze.await_args
    assert args[0].text == EXTRACTED and args[0].image_key is None
    assert kwargs["budget"] is pipeline.extracted[0][1]
    assert KEY not in response.text


@pytest.mark.parametrize("length", [None, 0, -1, True, "123", 1.5, 10 * 1024 * 1024 + 1])
def test_ticket_requires_exact_integer_byte_length(
    tmp_path,
    image_settings,
    model,
    readiness_bypass,
    pipeline,
    length,
):
    payload = {"content_type": "image/png"}
    if length is not None:
        payload["content_length"] = length
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        response = client.post("/api/v1/images/uploads", json=payload)
    assert response.status_code == 422 and pipeline.admitted == []


def test_storage_initialization_failure_preserves_text_service(
    tmp_path,
    image_settings,
    model,
    readiness_bypass,
    service_factory,
    monkeypatch,
):
    from backend.images.storage import StorageError

    def unavailable(*args, **kwargs):
        raise StorageError("synthetic-private-detail")

    monkeypatch.setattr(main, "ImagePipeline", unavailable)
    result = AnalyzeResponse.model_validate_json((EXAMPLES / "success.json").read_text("utf-8"))
    service_factory.return_value.analyze.return_value = result
    with TestClient(app_for(image_settings, model, tmp_path)) as client:
        assert client.get("/api/v1/capabilities").json()["inputs"] == ["text"]
        assert client.post("/api/v1/analyze", json={"text": "Name mismatch"}).status_code == 200
        response = client.post(
            "/api/v1/images/uploads", json={"content_type": "image/png", "content_length": 42}
        )
        assert response.status_code == 503 and "synthetic-private-detail" not in response.text


def test_lifecycle_missing_keeps_images_unavailable(
    tmp_path,
    image_settings,
    model,
    readiness_bypass,
    pipeline,
):
    disabled = image_settings.model_copy(update={"image_lifecycle_configured": False})
    with TestClient(app_for(disabled, model, tmp_path)) as client:
        assert client.get("/api/v1/capabilities").json()["inputs"] == ["text"]


def test_image_key_is_hidden_from_repr():
    assert KEY not in repr(AnalyzeRequest(image_key=KEY))
