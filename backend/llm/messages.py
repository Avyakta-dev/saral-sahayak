"""Explicit Anthropic Messages wire format, including signed thinking replay."""

from copy import deepcopy
from typing import Any

from .types import LLMResult, Message, ToolCall, ToolDefinition, require, result, tool_call


def build(
    messages: list[Message], tools: list[ToolDefinition], model: str, tokens: int
) -> dict[str, Any]:
    system: list[str] = []
    wire: list[dict[str, Any]] = []
    for message in messages:
        if message.role == "system":
            require(not wire)  # Do not silently move late system instructions.
            system.append(message.content)
            continue
        role = "user" if message.role == "tool" else message.role
        content: list[dict[str, Any]] = []
        if message.role == "tool":
            content.append(
                {
                    "type": "tool_result",
                    "tool_use_id": message.tool_call_id,
                    "content": message.content,
                    "is_error": message.is_error,
                }
            )
        elif message.provider_items:
            content.extend(deepcopy(message.provider_items))
        else:
            if message.content:
                content.append({"type": "text", "text": message.content})
            content.extend(
                {"type": "tool_use", "id": call.id, "name": call.name, "input": call.arguments}
                for call in message.tool_calls
            )
        if wire and wire[-1]["role"] == role:
            wire[-1]["content"].extend(content)
        else:
            wire.append({"role": role, "content": content})
    payload = {
        "model": model,
        "messages": wire,
        "stream": False,
        "max_tokens": tokens,
        "tools": [
            {"name": tool.name, "description": tool.description, "input_schema": tool.parameters}
            for tool in tools
        ],
    }
    if system:
        payload["system"] = "\n\n".join(system)
    return payload


def parse(body: dict[str, Any], allowed: set[str]) -> LLMResult:
    require(
        body.get("type") == "message" and body.get("role") == "assistant" and not body.get("error")
    )
    finish = body.get("stop_reason")
    require(finish in ("end_turn", "tool_use", "stop_sequence"))
    content = body.get("content")
    require(isinstance(content, list) and bool(content))
    texts: list[str] = []
    calls: list[ToolCall] = []
    for block in content:
        require(isinstance(block, dict))
        kind = block.get("type")
        if kind == "text":
            require(isinstance(block.get("text"), str))
            texts.append(block["text"])
        elif kind == "tool_use":
            require(isinstance(block.get("input"), dict))
            calls.append(tool_call(block.get("id"), block.get("name"), block.get("input"), allowed))
        elif kind == "thinking":
            require(
                isinstance(block.get("thinking"), str) and isinstance(block.get("signature"), str)
            )
        elif kind == "redacted_thinking":
            require(isinstance(block.get("data"), str))
        else:
            require(False)
    require(bool(calls) == (finish == "tool_use"))
    return result(
        "messages",
        texts,
        calls,
        deepcopy(content),
        "tool_calls" if calls else "stop",
        body.get("usage"),
    )
