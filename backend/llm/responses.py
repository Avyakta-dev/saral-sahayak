"""Explicit Responses wire format with complete, stateless output replay."""

from copy import deepcopy
from typing import Any

from .types import LLMResult, Message, ToolCall, ToolDefinition, require, result, tool_call


def build(
    messages: list[Message], tools: list[ToolDefinition], model: str, tokens: int
) -> dict[str, Any]:
    items: list[dict[str, Any]] = []
    for message in messages:
        if message.role == "assistant" and message.provider_items:
            items.extend(deepcopy(message.provider_items))
        elif message.role == "tool":
            items.append(
                {
                    "type": "function_call_output",
                    "call_id": message.tool_call_id,
                    "output": message.content,
                }
            )
        else:
            if message.content:
                items.append({"role": message.role, "content": message.content})
            for call in message.tool_calls:
                import json

                items.append(
                    {
                        "type": "function_call",
                        "call_id": call.id,
                        "name": call.name,
                        "arguments": json.dumps(call.arguments, allow_nan=False),
                    }
                )
    return {
        "model": model,
        "input": items,
        "stream": False,
        "store": False,
        "include": ["reasoning.encrypted_content"],
        "max_output_tokens": tokens,
        "tools": [
            {
                "type": "function",
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            }
            for tool in tools
        ],
    }


def parse(body: dict[str, Any], allowed: set[str]) -> LLMResult:
    require(body.get("status") == "completed" and not body.get("error"))
    items = body.get("output")
    require(isinstance(items, list) and bool(items))
    texts: list[str] = []
    calls: list[ToolCall] = []
    for item in items:
        require(isinstance(item, dict))
        kind = item.get("type")
        if kind == "function_call":
            require(item.get("status", "completed") == "completed")
            require(isinstance(item.get("arguments"), str))
            calls.append(
                tool_call(item.get("call_id"), item.get("name"), item.get("arguments"), allowed)
            )
        elif kind == "message":
            require(
                item.get("role") == "assistant" and item.get("status", "completed") == "completed"
            )
            content = item.get("content")
            require(isinstance(content, list))
            for block in content:
                require(
                    isinstance(block, dict)
                    and block.get("type") == "output_text"
                    and isinstance(block.get("text"), str)
                )
                texts.append(block["text"])
        elif kind == "reasoning":
            require(isinstance(item.get("summary"), list))
            for summary in item["summary"]:
                require(
                    isinstance(summary, dict)
                    and summary.get("type") == "summary_text"
                    and isinstance(summary.get("text"), str)
                )
            if "encrypted_content" in item:
                require(
                    item["encrypted_content"] is None or isinstance(item["encrypted_content"], str)
                )
        else:
            require(False)
    return result(
        "responses",
        texts,
        calls,
        deepcopy(items),
        "tool_calls" if calls else "stop",
        body.get("usage"),
    )
