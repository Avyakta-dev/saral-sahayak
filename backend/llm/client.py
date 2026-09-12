"""Single nonstreaming async turn; caller owns orchestration and turn budgets."""

from __future__ import annotations

import asyncio
import math
from collections.abc import Sequence
from typing import Any

import httpx

from . import chat_completions, responses
from . import messages as messages_api
from .types import LLMConfig, LLMError, LLMResult, Message, ToolDefinition, object_json, require

_ADAPTERS = {"responses": responses, "chat_completions": chat_completions, "messages": messages_api}
MAX_RESPONSE_BYTES = 2 * 1024 * 1024


class LLMClient:
    """An injected HTTP client remains caller-owned; otherwise use async with.

    This boundary never logs provider bodies, prompts, headers or exceptions. A
    replacement error is raised *outside* exception handlers, so even __context__
    contains no transport/JSON/Pydantic error or secret (not merely suppressed).
    """

    def __init__(self, config: LLMConfig, http_client: httpx.AsyncClient | None = None):
        self.config = config.model_copy(deep=True)
        self._owned = http_client is None
        self._http = (
            http_client
            if http_client is not None
            else httpx.AsyncClient(follow_redirects=False, trust_env=False)
        )

    async def __aenter__(self) -> LLMClient:
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        if self._owned:
            await self._http.aclose()

    async def complete(
        self,
        messages: Sequence[Message],
        tools: Sequence[ToolDefinition] = (),
        *,
        max_output_tokens: int | None = None,
        timeout_seconds: float | None = None,
    ) -> LLMResult:
        """Perform exactly one turn. Overrides can only lower configured ceilings.

        Append result.message unchanged, then one role='tool' Message per returned
        call (tool_call_id=call.id). All outstanding calls must have results before
        continuation. No autoexecution, fallback, streaming, retries or loop.
        """
        failure: str | None = None
        try:
            tokens = (
                self.config.max_output_tokens if max_output_tokens is None else max_output_tokens
            )
            seconds = self.config.timeout_seconds if timeout_seconds is None else timeout_seconds
            require(type(tokens) is int and 0 < tokens <= self.config.max_output_tokens)
            require(
                type(seconds) in (int, float)
                and math.isfinite(seconds)
                and 0 < seconds <= self.config.timeout_seconds
            )
            history = [Message.model_validate(message.model_dump()) for message in messages]
            definitions = [ToolDefinition.model_validate(tool.model_dump()) for tool in tools]
            allowed = {tool.name for tool in definitions}
            require(len(allowed) == len(definitions))
            self._validate_history(history, allowed)
            adapter = _ADAPTERS[self.config.api_style]
            payload = adapter.build(history, definitions, self.config.model, tokens)
            object_json(payload)  # Validate finite JSON before crossing HTTP boundary.
            headers = {
                name: value.get_secret_value() for name, value in self.config.extra_headers.items()
            }
            headers["Content-Type"] = "application/json"
            headers["Accept"] = "application/json"
            key = self.config.api_key.get_secret_value()
            if self.config.api_style == "messages":
                headers["x-api-key"] = key
                headers["anthropic-version"] = self.config.anthropic_version
            else:
                headers["Authorization"] = f"Bearer {key}"
        except Exception:
            failure = "invalid_request"
        if failure:
            raise LLMError(failure)

        status = 0
        body = bytearray()
        try:
            # Bound decoded bytes (including compressed responses), not just the
            # untrusted Content-Length. Error bodies are never read at all.
            async with asyncio.timeout(seconds):
                async with self._http.stream(
                    "POST",
                    self.config.endpoint_url,
                    json=payload,
                    headers=headers,
                    timeout=httpx.Timeout(
                        seconds, connect=min(seconds, self.config.connect_timeout_seconds)
                    ),
                    follow_redirects=False,
                ) as response:
                    status = response.status_code
                    if 200 <= status < 300:
                        async for chunk in response.aiter_bytes():
                            if len(body) + len(chunk) > MAX_RESPONSE_BYTES:
                                failure = "bad_response"
                                break
                            body.extend(chunk)
        except (TimeoutError, httpx.TimeoutException):
            failure = "timeout"
        except httpx.TransportError:
            failure = "transport"
        except Exception:
            failure = "transport"
        if failure:
            raise LLMError(failure)
        if status in (401, 403):
            raise LLMError("auth")
        if status == 429:
            raise LLMError("rate_limit")
        if status >= 500:
            raise LLMError("provider_error")
        if not 200 <= status < 300:
            raise LLMError("bad_response")
        try:
            parsed = adapter.parse(object_json(body.decode("utf-8")), allowed)
        except Exception:
            failure = "bad_response"
        if failure:
            raise LLMError(failure)
        return parsed

    def _validate_history(self, history: list[Message], allowed: set[str]) -> None:
        require(bool(history))
        pending: set[str] = set()
        used_ids: set[str] = set()
        for message in history:
            require(message.api_style in (None, self.config.api_style))
            if message.role == "tool":
                require(message.tool_call_id in pending)
                pending.remove(message.tool_call_id)
                continue
            require(not pending)
            calls = message.tool_calls
            require(all(call.name in allowed for call in calls))
            require(len({call.id for call in calls}) == len(calls))
            require(not any(call.id in used_ids for call in calls))
            if message.provider_items:
                # Continuation payloads are untrusted too: validate wire/normalized
                # agreement so callers cannot bypass tool validation via raw items.
                if message.api_style == "responses":
                    checked = responses.parse(
                        {"status": "completed", "output": list(message.provider_items)}, allowed
                    )
                elif message.api_style == "chat_completions":
                    require(len(message.provider_items) == 1)
                    checked = chat_completions.parse(
                        {
                            "choices": [
                                {
                                    "finish_reason": "tool_calls" if calls else "stop",
                                    "message": message.provider_items[0],
                                }
                            ]
                        },
                        allowed,
                    )
                else:
                    checked = messages_api.parse(
                        {
                            "type": "message",
                            "role": "assistant",
                            "stop_reason": "tool_use" if calls else "end_turn",
                            "content": list(message.provider_items),
                        },
                        allowed,
                    )
                require(checked.tool_calls == calls and checked.text == message.content)
            pending.update(call.id for call in calls)
            used_ids.update(pending)
        require(not pending)
