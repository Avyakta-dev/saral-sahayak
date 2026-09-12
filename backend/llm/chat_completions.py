"""Explicit Chat Completions wire format."""

import json
from copy import deepcopy
from typing import Any

from .types import LLMResult, Message, ToolCall, ToolDefinition, require, result, tool_call


def build(
    messages: list[Message], tools: list[ToolDefinition], model: str, tokens: int
) -> dict[str, Any]:
    wire: list[dict[str, Any]] = []
    for message in messages:
        if message.role == "assistant" and message.provider_items:
            wire.extend(deepcopy(message.provider_items))
            continue
        if message.image_urls:
            content: Any = [
                {"type": "image_url", "image_url": {"url": url}} for url in message.image_urls
            ]
            if message.content:
                content.append({"type": "text", "text": message.content})
        else:
            content = message.content
        item: dict[str, Any] = {"role": message.role, "content": content}
        if message.role == "tool":
            item["tool_call_id"] = message.tool_call_id
        if message.tool_calls:
            item["tool_calls"] = [
                {
                    "id": call.id,
                    "type": "function",
                    "function": {
                        "name": call.name,
                        "arguments": json.dumps(call.arguments, allow_nan=False),
                    },
                }
                for call in message.tool_calls
            ]
        wire.append(item)
    return {
        "model": model,
        "messages": wire,
        "stream": False,
        "max_completion_tokens": tokens,
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                },
            }
            for tool in tools
        ],
    }


def parse(body: dict[str, Any], allowed: set[str]) -> LLMResult:
    require(not body.get("error"))
    choices = body.get("choices")
    require(isinstance(choices, list) and len(choices) == 1)
    choice = choices[0]
    require(isinstance(choice, dict))
    finish = choice.get("finish_reason")
    require(finish in ("stop", "tool_calls"))
    message = choice.get("message")
    require(isinstance(message, dict) and message.get("role") == "assistant")
    require(
        not message.get("refusal") and not message.get("function_call") and not message.get("audio")
    )
    content = message.get("content")
    require(content is None or isinstance(content, str))
    raw_calls = message.get("tool_calls", [])
    require(isinstance(raw_calls, list))
    calls: list[ToolCall] = []
    for call in raw_calls:
        require(isinstance(call, dict) and call.get("type") == "function")
        function = call.get("function")
        require(isinstance(function, dict) and isinstance(function.get("arguments"), str))
        calls.append(
            tool_call(call.get("id"), function.get("name"), function.get("arguments"), allowed)
        )
    require(bool(calls) == (finish == "tool_calls"))
    return result(
        "chat_completions", [content or ""], calls, [deepcopy(message)], finish, body.get("usage")
    )
