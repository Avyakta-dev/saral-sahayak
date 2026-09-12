"""Provider-independent configuration and one-turn LLM contracts.

The application maps environment settings explicitly into LLMConfig. No environment
variables, credentials, server-side conversation state, or agent loop live here.
"""

from __future__ import annotations

import ipaddress
import json
import re
from typing import Any, Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator, model_validator

APIStyle = Literal["responses", "chat_completions", "messages"]
ENDPOINTS = {
    "responses": "/responses",
    "chat_completions": "/chat/completions",
    "messages": "/messages",
}
_NAME = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
_HEADER = re.compile(r"^[!#$%&'*+.^_`|~0-9a-zA-Z-]+$")


class LLMConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, hide_input_in_errors=True)

    api_style: APIStyle
    base_url: str
    api_key: SecretStr = Field(repr=False)
    model: str = Field(min_length=1, max_length=256)
    timeout_seconds: float = Field(default=30, gt=0, le=300, allow_inf_nan=False)
    connect_timeout_seconds: float = Field(default=5, gt=0, le=300, allow_inf_nan=False)
    max_output_tokens: int = Field(default=2048, ge=1, le=131072, strict=True)
    extra_headers: dict[str, SecretStr] = Field(default_factory=dict, repr=False)
    anthropic_version: str = "2023-06-01"
    stream: bool = Field(default=False, strict=True)

    @model_validator(mode="after")
    def supported_streaming(self) -> LLMConfig:
        if self.stream and self.api_style != "responses":
            raise ValueError("LLM_STREAM=true currently requires LLM_API_STYLE=responses")
        return self

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value: str) -> str:
        if any(c.isspace() or ord(c) < 32 for c in value) or any(c in value for c in "?#\\"):
            raise ValueError("Invalid LLM base URL")
        try:
            parsed = urlsplit(value)
            host = parsed.hostname
            port = parsed.port
        except ValueError:
            raise ValueError("Invalid LLM base URL") from None
        if not host or parsed.username is not None or parsed.password is not None:
            raise ValueError("Invalid LLM base URL")
        if port is not None and port < 1:
            raise ValueError("Invalid LLM base URL")
        local = host.lower() == "localhost"
        try:
            local = local or ipaddress.ip_address(host).is_loopback
        except ValueError:
            pass
        if parsed.scheme != "https" and not (parsed.scheme == "http" and local):
            raise ValueError("LLM base URL requires HTTPS except loopback development hosts")
        if "%" in parsed.netloc or any(part in (".", "..") for part in parsed.path.split("/")):
            raise ValueError("Invalid LLM base URL")
        return value.rstrip("/")

    @field_validator("api_key")
    @classmethod
    def validate_key(cls, value: SecretStr) -> SecretStr:
        raw = value.get_secret_value()
        if not raw.strip() or not raw.isascii() or any(ord(c) < 32 or ord(c) == 127 for c in raw):
            raise ValueError("Invalid LLM credential")
        return value

    @field_validator("model")
    @classmethod
    def validate_model(cls, value: str) -> str:
        if value != value.strip() or any(ord(c) < 32 for c in value):
            raise ValueError("Invalid model identifier")
        return value

    @field_validator("anthropic_version")
    @classmethod
    def validate_version(cls, value: str) -> str:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("Invalid Anthropic version")
        return value

    @field_validator("extra_headers")
    @classmethod
    def validate_headers(cls, value: dict[str, SecretStr]) -> dict[str, SecretStr]:
        reserved = {
            "authorization",
            "x-api-key",
            "anthropic-version",
            "content-type",
            "content-length",
            "host",
            "transfer-encoding",
            "connection",
        }
        seen: set[str] = set()
        for name, secret in value.items():
            raw = secret.get_secret_value()
            lower = name.lower()
            if not _HEADER.fullmatch(name) or lower in reserved or lower in seen:
                raise ValueError("Invalid or reserved extra header")
            if not raw.isascii() or any(ord(c) < 32 or ord(c) == 127 for c in raw):
                raise ValueError("Invalid extra header value")
            seen.add(lower)
        return value

    @property
    def endpoint_url(self) -> str:
        suffix = ENDPOINTS[self.api_style]
        return self.base_url if self.base_url.endswith(suffix) else self.base_url + suffix


class _Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, hide_input_in_errors=True)


class ToolDefinition(_Contract):
    name: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,64}$")
    description: str = Field(default="", repr=False)
    parameters: dict[str, Any] = Field(
        default_factory=lambda: {"type": "object", "properties": {}}, repr=False
    )

    @field_validator("parameters")
    @classmethod
    def object_schema(cls, value: dict[str, Any]) -> dict[str, Any]:
        if value.get("type") != "object":
            raise ValueError("Tool parameters must be an object schema")
        json.dumps(value, allow_nan=False)
        return value


class ToolCall(_Contract):
    id: str = Field(min_length=1, repr=False)
    name: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,64}$")
    arguments: dict[str, Any] = Field(repr=False)

    @field_validator("arguments")
    @classmethod
    def json_object(cls, value: dict[str, Any]) -> dict[str, Any]:
        json.dumps(value, allow_nan=False)
        return value


class Message(_Contract):
    role: Literal["system", "user", "assistant", "tool"]
    content: str = Field(default="", repr=False)
    # Host-admitted image URLs only. Never model-supplied, never replayed to the agent.
    image_urls: tuple[str, ...] = Field(default=(), repr=False)
    tool_calls: tuple[ToolCall, ...] = Field(default=(), repr=False)
    tool_call_id: str | None = Field(default=None, repr=False)
    is_error: bool = False
    # Adapter-owned replay payload. Preserve the returned message verbatim rather
    # than rebuilding it from text/tool calls (reasoning signatures matter).
    api_style: APIStyle | None = None
    provider_items: tuple[dict[str, Any], ...] = Field(default=(), repr=False)

    @model_validator(mode="after")
    def valid_role(self) -> Message:
        if self.role == "tool":
            if not self.tool_call_id or self.tool_calls or self.provider_items:
                raise ValueError("Tool results require a call ID and no assistant payload")
        elif self.tool_call_id is not None or self.is_error:
            raise ValueError("Only tool results can carry result metadata")
        if self.image_urls and (self.role != "user" or len(self.image_urls) > 1):
            raise ValueError("Only one image is allowed on a user message")
        if self.role != "assistant" and (self.tool_calls or self.provider_items or self.api_style):
            raise ValueError("Only assistant messages can carry continuation state")
        if self.provider_items and self.api_style is None:
            raise ValueError("Continuation state requires an explicit API style")
        return self


class Usage(_Contract):
    """Provider-reported counts only; missing fields and totals are never inferred."""

    input_tokens: int | None = Field(default=None, ge=0, strict=True)
    output_tokens: int | None = Field(default=None, ge=0, strict=True)
    total_tokens: int | None = Field(default=None, ge=0, strict=True)


class LLMResult(_Contract):
    message: Message = Field(repr=False)
    finish_reason: str
    usage: Usage | None = None

    @property
    def text(self) -> str:
        return self.message.content

    @property
    def tool_calls(self) -> tuple[ToolCall, ...]:
        return self.message.tool_calls


class LLMError(Exception):
    """Safe public error: no provider text, request, response, or exception chain."""

    def __init__(self, code: str):
        self.code = code
        super().__init__(
            {
                "auth": "LLM authentication failed",
                "rate_limit": "LLM rate limit exceeded",
                "timeout": "LLM request timed out",
                "transport": "LLM transport failed",
                "provider_error": "LLM provider failed",
                "bad_response": "LLM returned a malformed or unsupported response",
                "invalid_request": "Invalid LLM request or continuation",
            }.get(code, "LLM request failed")
        )


def require(condition: bool) -> None:
    if not condition:
        raise ValueError("Invalid protocol data")


def object_json(value: Any) -> dict[str, Any]:
    """Reject non-objects, non-standard constants and ambiguous duplicate keys."""

    def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, item in items:
            require(key not in result)
            result[key] = item
        return result

    def constant(_: str) -> None:
        raise ValueError("Invalid JSON constant")

    if isinstance(value, str):
        value = json.loads(value, object_pairs_hook=pairs, parse_constant=constant)
    require(isinstance(value, dict))
    json.dumps(value, allow_nan=False)
    return value


def tool_call(call_id: Any, name: Any, arguments: Any, allowed: set[str]) -> ToolCall:
    require(isinstance(call_id, str) and bool(call_id.strip()))
    require(isinstance(name, str) and bool(_NAME.fullmatch(name)) and name in allowed)
    return ToolCall(id=call_id, name=name, arguments=object_json(arguments))


def result(
    style: APIStyle,
    text: list[str],
    calls: list[ToolCall],
    items: list[dict[str, Any]],
    finish: str,
    usage: Any = None,
) -> LLMResult:
    normalized_usage = None
    if usage is not None:
        require(isinstance(usage, dict))
        input_key, output_key = (
            ("prompt_tokens", "completion_tokens")
            if style == "chat_completions"
            else ("input_tokens", "output_tokens")
        )
        normalized_usage = Usage(
            input_tokens=usage.get(input_key),
            output_tokens=usage.get(output_key),
            total_tokens=usage.get("total_tokens"),
        )
    require(len({call.id for call in calls}) == len(calls))
    require(bool(calls) or bool("".join(text).strip()))
    return LLMResult(
        message=Message(
            role="assistant",
            content="".join(text),
            tool_calls=tuple(calls),
            api_style=style,
            provider_items=tuple(items),
        ),
        finish_reason=finish,
        usage=normalized_usage,
    )
