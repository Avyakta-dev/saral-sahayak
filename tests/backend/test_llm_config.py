import json

import pytest
from pydantic import SecretStr, ValidationError

from backend.llm import LLMConfig

BASE = {
    "api_style": "responses",
    "base_url": "https://gateway.example/v1",
    "api_key": "synthetic-secret-key",
    "model": "custom-model",
}


@pytest.mark.parametrize(
    "style,suffix",
    [
        ("responses", "/responses"),
        ("chat_completions", "/chat/completions"),
        ("messages", "/messages"),
    ],
)
@pytest.mark.parametrize("ending", ["", "/", "endpoint", "endpoint/"])
def test_base_prefix_and_endpoint_appended_once(style, suffix, ending):
    base = "https://gateway.example/custom/v1"
    url = base + ending.replace("endpoint", suffix)
    cfg = LLMConfig(**{**BASE, "api_style": style, "base_url": url})
    assert cfg.endpoint_url == base + suffix


@pytest.mark.parametrize(
    "url",
    [
        "http://localhost:8000/v1",
        "http://127.0.0.1:8000/v1",
        "http://[::1]:8000/v1",
        "https://gateway.example/v1",
    ],
)
def test_safe_config_urls(url):
    assert LLMConfig(**{**BASE, "base_url": url}).base_url == url


@pytest.mark.parametrize(
    "url",
    [
        "http://gateway.example/v1",
        "http://localhost.evil.example/v1",
        "https://user:password@example.com/v1",
        "https://user@example.com/v1",
        "https://example.com/v1?api_key=secret",
        "https://example.com/v1#secret",
        "https://example.com/v1?",
        "https://example.com/v1#",
        "ftp://localhost/v1",
        "https:///v1",
        "https://example.com:bad/v1",
        "https://example.com:0/v1",
        " https://example.com/v1",
        "https://example.com/../v1",
        "https://example.com\\@evil.example/v1",
    ],
)
def test_unsafe_config_urls(url):
    with pytest.raises(ValidationError):
        LLMConfig(**{**BASE, "base_url": url})


@pytest.mark.parametrize(
    "change",
    [
        {"api_style": "auto"},
        {"api_style": "openai"},
        {"api_key": ""},
        {"api_key": "secret\nheader"},
        {"model": ""},
        {"model": " padded "},
        {"max_output_tokens": 0},
        {"max_output_tokens": -1},
        {"max_output_tokens": 1.5},
        {"max_output_tokens": True},
        {"timeout_seconds": 0},
        {"timeout_seconds": float("inf")},
        {"connect_timeout_seconds": -1},
        {"anthropic_version": "evil\nheader"},
        {"extra_headers": {"Authorization": "override"}},
        {"extra_headers": {"HOST": "evil.example"}},
        {"extra_headers": {"x-api-key": "override"}},
        {"extra_headers": {"bad\nheader": "secret"}},
        {"extra_headers": {"X-Test": "secret\nheader"}},
        {"extra_headers": {"X-Test": "secret", "x-test": "secret"}},
    ],
)
def test_invalid_config_values(change):
    with pytest.raises(ValidationError):
        LLMConfig(**{**BASE, **change})


def test_secret_fields_redacted_from_repr_and_json():
    cfg = LLMConfig(**BASE, extra_headers={"x-custom": "other-synthetic-secret"})
    assert isinstance(cfg.api_key, SecretStr)
    assert isinstance(cfg.extra_headers["x-custom"], SecretStr)
    for visible in [str(cfg), repr(cfg), str(cfg.model_dump()), cfg.model_dump_json()]:
        assert BASE["api_key"] not in visible
        assert "other-synthetic-secret" not in visible
    assert json.loads(cfg.model_dump_json())["api_key"] == "**********"


def test_explicit_environment_mapping_not_implicit(monkeypatch):
    monkeypatch.setenv("LLM_MODEL", "must-not-be-loaded-implicitly")
    monkeypatch.setenv("LLM_API_KEY", "must-not-be-loaded-implicitly")
    cfg = LLMConfig(**BASE)
    assert cfg.model == "custom-model"
    assert cfg.api_key.get_secret_value() == BASE["api_key"]
    # Main config owns prefix/alias choice, supplies already parsed field values.
    supplied = {
        "api_style": "messages",
        "base_url": "http://localhost:8000/v1",
        "api_key": SecretStr("environment-key"),
        "model": "environment-model",
        "timeout_seconds": 25,
        "connect_timeout_seconds": 4,
        "max_output_tokens": 2000,
        "extra_headers": {"x-env": SecretStr("environment-header")},
        "anthropic_version": "2024-01-01",
    }
    mapped = LLMConfig.model_validate(supplied)
    assert mapped.model == "environment-model"
    assert mapped.timeout_seconds == 25
    assert mapped.max_output_tokens == 2000
    assert mapped.extra_headers["x-env"].get_secret_value() == "environment-header"


@pytest.mark.parametrize("style", ["responses", "chat_completions", "messages"])
def test_main_settings_maps_all_environment_fields(monkeypatch, style):
    from backend.config import Settings

    values = {
        "LLM_API_STYLE": style,
        "LLM_BASE_URL": "https://gateway.example/custom/v1/",
        "LLM_API_KEY": "mapped-private-key",
        "LLM_MODEL": "mapped-model",
        "LLM_STREAM": "false",
        "LLM_TIMEOUT_SECONDS": "19",
        "LLM_CONNECT_TIMEOUT_SECONDS": "3",
        "LLM_MAX_OUTPUT_TOKENS": "1500",
        "LLM_EXTRA_HEADERS": '{"x-custom-key":"mapped-header-secret"}',
        "LLM_ANTHROPIC_VERSION": "2024-01-01",
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)
    cfg = Settings(_env_file=None).llm_config()
    assert isinstance(cfg, LLMConfig)
    assert cfg.api_style == style
    assert cfg.base_url == "https://gateway.example/custom/v1"
    assert cfg.api_key.get_secret_value() == "mapped-private-key"
    assert cfg.model == "mapped-model"
    assert cfg.timeout_seconds == 19
    assert cfg.connect_timeout_seconds == 3
    assert cfg.max_output_tokens == 1500
    assert cfg.extra_headers["x-custom-key"].get_secret_value() == "mapped-header-secret"
    assert cfg.anthropic_version == "2024-01-01"
