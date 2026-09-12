"""Environment mapping tests: never read the developer's environment or .env."""

import json
import os

import pytest
from pydantic import SecretStr, ValidationError

from backend.config import Settings

SYNTHETIC_KEY = "synthetic-key-not-a-real-credential"
SYNTHETIC_HEADER = "synthetic-header-not-a-real-credential"


@pytest.fixture(autouse=True)
def isolated_environment(monkeypatch):
    monkeypatch.setattr(os, "environ", {})


def test_defaults_are_unconfigured():
    settings = Settings(_env_file=None)
    assert settings.llm_config() is None
    assert settings.llm_api_style == "responses"
    assert settings.llm_stream is False
    assert settings.llm_timeout_seconds == 25
    assert settings.analysis_request_seconds == 30
    assert settings.llm_connect_timeout_seconds == 5
    assert settings.llm_max_output_tokens == 2000
    assert settings.llm_anthropic_version == "2023-06-01"
    assert settings.llm_extra_headers == {}
    assert settings.cors_origins == []
    assert settings.supported_languages == ["en", "hi", "kn", "ta", "te", "ml"]


IMAGE_ENDPOINT = "https://account.r2.cloudflarestorage.com"


def test_image_input_is_disabled_and_unconfigured_by_default():
    settings = Settings(_env_file=None)
    assert settings.image_input_enabled is False
    assert settings.image_lifecycle_configured is False
    assert settings.image_r2_endpoint == ""
    assert settings.image_r2_bucket == ""
    assert settings.image_config() is None
    assert settings.image_upload_ttl_seconds == 120
    assert settings.image_url_max_ttl_seconds == 120
    assert settings.image_max_bytes == 10 * 1024 * 1024
    assert settings.image_ocr_max_chars == 8000
    assert settings.image_ocr_max_output_tokens == 1000
    assert settings.image_content_types == ["image/png", "image/jpeg", "image/webp"]


def test_image_environment_mapping(monkeypatch):
    values = {
        "IMAGE_INPUT_ENABLED": "true",
        "IMAGE_LIFECYCLE_CONFIGURED": "true",
        "IMAGE_R2_ENDPOINT": f" {IMAGE_ENDPOINT} ",
        "IMAGE_R2_BUCKET": " synthetic-bucket ",
        "IMAGE_UPLOAD_TTL_SECONDS": "45",
        "IMAGE_URL_MAX_TTL_SECONDS": "60",
        "IMAGE_MAX_BYTES": "2048",
        "IMAGE_OCR_MAX_CHARS": "512",
        "IMAGE_OCR_MAX_OUTPUT_TOKENS": "256",
        "IMAGE_CONTENT_TYPES": '["image/png"]',
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)
    settings = Settings(_env_file=None)
    config = settings.image_config()
    assert config is not None
    assert config.endpoint == IMAGE_ENDPOINT  # whitespace stripped
    assert config.bucket == "synthetic-bucket"
    assert config.region == "auto"
    assert config.upload_ttl_seconds == 45
    assert config.url_max_ttl_seconds == 60
    assert config.max_bytes == 2048
    assert config.ocr_max_chars == 512
    assert config.ocr_max_output_tokens == 256
    assert config.content_types == ("image/png",)


def test_history_persist_path_expands_home_so_it_resolves_the_same_way_twice(
    monkeypatch, tmp_path
):
    monkeypatch.setenv("HOME", str(tmp_path))
    settings = Settings(_env_file=None, history_persist_path="~/history.jsonl")
    # history_store() does a bare Path(...) on the validated value with no further
    # expansion, so the stored string must already be the expanded form validated
    # above - otherwise "~" would resolve relative to the working directory instead.
    assert settings.history_persist_path == str(tmp_path / "history.jsonl")
    store = settings.history_store()
    assert store is not None


@pytest.mark.parametrize(
    ("enabled", "endpoint", "bucket"),
    [
        (False, IMAGE_ENDPOINT, "synthetic-bucket"),  # explicit opt-in is required
        (True, "", "synthetic-bucket"),  # no destination
        (True, IMAGE_ENDPOINT, ""),  # no bucket
        (True, "   ", "synthetic-bucket"),
    ],
)
def test_image_config_fails_closed_when_incomplete(enabled, endpoint, bucket):
    settings = Settings(
        _env_file=None,
        image_input_enabled=enabled,
        image_r2_endpoint=endpoint,
        image_r2_bucket=bucket,
    )
    assert settings.image_config() is None


@pytest.mark.parametrize(
    "endpoint",
    [
        "http://account.r2.cloudflarestorage.com",  # not HTTPS
        f"{IMAGE_ENDPOINT}/path",
        f"{IMAGE_ENDPOINT}?query=1",
        f"{IMAGE_ENDPOINT}#fragment",
        "https://user:pass@account.r2.cloudflarestorage.com",
        "account.r2.cloudflarestorage.com",
        "*",
    ],
)
def test_image_endpoint_must_be_a_bare_https_origin(endpoint):
    settings = Settings(
        _env_file=None,
        image_input_enabled=True,
        image_lifecycle_configured=True,
        image_r2_endpoint=endpoint,
        image_r2_bucket="synthetic-bucket",
    )
    with pytest.raises(ValidationError):
        settings.image_config()


def test_image_credentials_are_not_settings_fields():
    # The standard boto3 chain owns credentials; the app only names the destination.
    fields = Settings.model_fields
    assert not [name for name in fields if "access_key" in name or "secret_access" in name]
    assert "AWS_ACCESS_KEY_ID" not in " ".join(fields)


@pytest.mark.parametrize("style", ["responses", "chat_completions", "messages"])
def test_explicit_environment_mapping(monkeypatch, style):
    values = {
        "LLM_API_STYLE": style,
        "LLM_BASE_URL": " https://llm.example.invalid/v1 ",
        "LLM_API_KEY": SYNTHETIC_KEY,
        "LLM_MODEL": " synthetic-model ",
        "LLM_TIMEOUT_SECONDS": "25",
        "ANALYSIS_REQUEST_SECONDS": "30",
        "LLM_CONNECT_TIMEOUT_SECONDS": "5",
        "LLM_MAX_OUTPUT_TOKENS": "2000",
        "LLM_EXTRA_HEADERS": '{"X-Synthetic-Token":"' + SYNTHETIC_HEADER + '"}',
        "LLM_ANTHROPIC_VERSION": "2023-06-01",
        "CORS_ORIGINS": '["http://localhost:5173","https://ui.example.invalid"]',
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)
    settings = Settings(_env_file=None)
    config = settings.llm_config()
    assert config is not None
    assert config.api_style == style
    assert config.base_url == "https://llm.example.invalid/v1"
    assert config.model == "synthetic-model"
    assert isinstance(settings.llm_api_key, SecretStr)
    assert config.api_key.get_secret_value() == SYNTHETIC_KEY
    assert config.timeout_seconds == 25
    assert settings.analysis_request_seconds == 30
    assert config.connect_timeout_seconds == 5
    assert config.max_output_tokens == 2000
    assert config.extra_headers["X-Synthetic-Token"].get_secret_value() == SYNTHETIC_HEADER
    assert config.anthropic_version == "2023-06-01"
    assert settings.cors_origins == ["http://localhost:5173", "https://ui.example.invalid"]
    for rendered in (repr(settings), settings.model_dump_json(), repr(config)):
        assert SYNTHETIC_KEY not in rendered
        assert SYNTHETIC_HEADER not in rendered


@pytest.mark.parametrize("missing", ["LLM_BASE_URL", "LLM_API_KEY", "LLM_MODEL"])
def test_partial_configuration_is_not_configured(monkeypatch, missing):
    for name, value in {
        "LLM_BASE_URL": "https://llm.example.invalid/v1",
        "LLM_API_KEY": SYNTHETIC_KEY,
        "LLM_MODEL": "synthetic-model",
    }.items():
        if name != missing:
            monkeypatch.setenv(name, value)
    assert Settings(_env_file=None).llm_config() is None


@pytest.mark.parametrize("languages", [["en"], ["en", "hi"], ["ml", "en", "te", "ta", "kn", "hi"]])
def test_supported_languages_json_environment_mapping(monkeypatch, languages):
    monkeypatch.setenv("SUPPORTED_LANGUAGES", json.dumps(languages))
    assert Settings(_env_file=None).supported_languages == languages


@pytest.mark.parametrize("languages", [[], ["hi"], ["en", "en"], ["en", "fr"], ["EN"]])
def test_supported_languages_must_be_unique_known_and_include_english(monkeypatch, languages):
    monkeypatch.setenv("SUPPORTED_LANGUAGES", json.dumps(languages))
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_supported_language_defaults_are_not_shared():
    first = Settings(_env_file=None)
    first.supported_languages.remove("hi")
    assert Settings(_env_file=None).supported_languages == ["en", "hi", "kn", "ta", "te", "ml"]


def test_provider_specific_variables_do_not_silently_configure_model(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", SYNTHETIC_KEY)
    monkeypatch.setenv("ANTHROPIC_API_KEY", SYNTHETIC_KEY)
    monkeypatch.setenv("OPENAI_BASE_URL", "https://llm.example.invalid/v1")
    monkeypatch.setenv("OPENAI_MODEL", "synthetic-model")
    assert Settings(_env_file=None).llm_config() is None


@pytest.mark.parametrize(
    ("name", "value"),
    [
        ("LLM_API_STYLE", "auto"),
        ("LLM_TIMEOUT_SECONDS", "0"),
        ("LLM_TIMEOUT_SECONDS", "121"),
        ("ANALYSIS_REQUEST_SECONDS", "0"),
        ("ANALYSIS_REQUEST_SECONDS", "121"),
        ("LLM_CONNECT_TIMEOUT_SECONDS", "0"),
        ("LLM_CONNECT_TIMEOUT_SECONDS", "31"),
        ("LLM_MAX_OUTPUT_TOKENS", "0"),
        ("LLM_MAX_OUTPUT_TOKENS", "16001"),
    ],
)
def test_invalid_environment_settings_fail(monkeypatch, name, value):
    monkeypatch.setenv(name, value)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_validation_text_does_not_echo_secret_input(monkeypatch):
    monkeypatch.setenv("LLM_TIMEOUT_SECONDS", SYNTHETIC_KEY)
    with pytest.raises(ValidationError) as raised:
        Settings(_env_file=None)
    assert SYNTHETIC_KEY not in str(raised.value)
    assert SYNTHETIC_KEY not in repr(raised.value)


@pytest.mark.parametrize(
    "origin",
    [
        "*",
        "https://ui.example.invalid/",
        "https://ui.example.invalid/path",
        "https://ui.example.invalid?token=synthetic",
        "https://ui.example.invalid#fragment",
        "https://user:password@ui.example.invalid",
        "file://ui.example.invalid",
    ],
)
def test_cors_rejects_non_origin_values(origin):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, cors_origins=[origin])


@pytest.mark.parametrize(
    ("style", "suffix"),
    [
        ("responses", "/responses"),
        ("chat_completions", "/chat/completions"),
        ("messages", "/messages"),
    ],
)
def test_mapped_config_preserves_prefix_and_accepts_exact_endpoint(style, suffix):
    for base_url in (
        "https://llm.example.invalid/proxy/v1/",
        "https://llm.example.invalid/proxy/v1" + suffix,
    ):
        config = Settings(
            _env_file=None,
            llm_api_style=style,
            llm_base_url=base_url,
            llm_api_key=SYNTHETIC_KEY,
            llm_model="synthetic-model",
        ).llm_config()
        assert config.endpoint_url == "https://llm.example.invalid/proxy/v1" + suffix


@pytest.mark.parametrize("enabled", ["true", "false"])
def test_stream_environment_maps_without_changing_budgets(monkeypatch, enabled):
    monkeypatch.setenv("LLM_STREAM", enabled)
    settings = Settings(
        _env_file=None,
        llm_api_key=SYNTHETIC_KEY,
        llm_base_url="https://llm.example.invalid/v1",
        llm_model="synthetic-model",
    )
    assert settings.llm_config().stream is (enabled == "true")
    assert settings.llm_config().timeout_seconds == 25
    assert settings.llm_config().max_output_tokens == 2000
    assert settings.analysis_budget_limits().request_seconds == 30


@pytest.mark.parametrize("style", ["messages", "chat_completions"])
def test_stream_unsupported_protocol_is_explicit_configuration_error(style):
    settings = Settings(
        _env_file=None,
        llm_api_style=style,
        llm_stream=True,
        llm_api_key=SYNTHETIC_KEY,
        llm_base_url="https://llm.example.invalid/v1",
        llm_model="synthetic-model",
    )
    with pytest.raises(ValidationError, match="LLM_STREAM=true currently requires"):
        settings.llm_config()


def test_analysis_budget_limits_follows_setting():
    settings = Settings(_env_file=None, analysis_request_seconds=45)
    assert settings.analysis_budget_limits().request_seconds == 45
    default = Settings(_env_file=None)
    assert default.analysis_budget_limits().request_seconds == 30
