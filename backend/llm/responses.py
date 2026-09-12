"""Explicit Responses wire format with complete, stateless output replay."""

from copy import deepcopy
from typing import Any

from .types import (
    LLMResult,
    Message,
    ToolCall,
    ToolDefinition,
    object_json,
    require,
    result,
    tool_call,
)


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
            if message.image_urls:
                parts: list[dict[str, Any]] = [
                    {"type": "input_image", "image_url": url} for url in message.image_urls
                ]
                if message.content:
                    parts.append({"type": "input_text", "text": message.content})
                items.append({"role": message.role, "content": parts})
            elif message.content:
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


class Stream:
    """Validate incremental output against the authoritative completed response.

    Only response.completed can produce a result. Replay uses its exact output
    items, never reconstructed reasoning, generated IDs or argument re-encoding.
    Some compatible gateways omit intermediate events; completion remains required.
    """

    def __init__(self) -> None:
        self.body: dict[str, Any] | None = None
        self.response_id: str | None = None
        self.sequence = -1
        self.items: dict[int, dict[str, Any]] = {}
        self.done: dict[int, dict[str, Any]] = {}
        self.fragments: dict[tuple[int, int | None], list[str]] = {}
        self.finished_fragments: set[tuple[int, int | None]] = set()

    def feed(self, event: str, data: str) -> None:
        require(self.body is None)
        value = object_json(data)
        kind = value.get("type")
        require(isinstance(kind, str) and (not event or event == kind))
        sequence = value.get("sequence_number")
        if sequence is not None:
            require(type(sequence) is int and sequence > self.sequence)
            self.sequence = sequence
        if kind in ("response.created", "response.in_progress", "response.queued"):
            response = value.get("response")
            require(isinstance(response, dict))
            identifier = response.get("id")
            require(isinstance(identifier, str) and bool(identifier))
            require(self.response_id in (None, identifier))
            self.response_id = identifier
        elif kind == "response.completed":
            body = value.get("response")
            require(isinstance(body, dict))
            require(self.response_id is None or body.get("id") == self.response_id)
            output = body.get("output")
            require(isinstance(output, list))
            for index, item in self.items.items():
                require(index < len(output) and isinstance(output[index], dict))
                final = output[index]
                self._identity(item, final)
                if index in self.done:
                    done = self.done[index]
                    if final.get("type") == "reasoning":
                        # Opaque encrypted reasoning may be re-encrypted at response
                        # completion. All other fields must agree; replay only the
                        # exact authoritative terminal blob, never the earlier one.
                        require(
                            {key: val for key, val in final.items() if key != "encrypted_content"}
                            == {key: val for key, val in done.items() if key != "encrypted_content"}
                        )
                    else:
                        require(final == done)
            for (index, part), fragments in self.fragments.items():
                require(index < len(output))
                require("".join(fragments) == self._text(output[index], part))
            self.body = body
        elif kind in ("response.output_item.added", "response.output_item.done"):
            index = self._index(value)
            item = value.get("item")
            require(isinstance(item, dict))
            require(isinstance(item.get("id"), str) and bool(item["id"]))
            require(item.get("type") in ("message", "function_call", "reasoning"))
            if kind.endswith(".added"):
                require(index not in self.items)
                require(all(old["id"] != item["id"] for old in self.items.values()))
                self.items[index] = item
            else:
                require(index in self.items and index not in self.done)
                self._identity(self.items[index], item)
                for (item_index, part), fragments in self.fragments.items():
                    if index == item_index:
                        require("".join(fragments) == self._text(item, part))
                self.done[index] = item
        elif kind in (
            "response.function_call_arguments.delta",
            "response.function_call_arguments.done",
            "response.output_text.delta",
            "response.output_text.done",
        ):
            index = self._index(value)
            require(index in self.items and index not in self.done)
            item = self.items[index]
            require(value.get("item_id") == item["id"])
            arguments = kind.startswith("response.function_call_arguments.")
            part = None if arguments else self._index(value, "content_index")
            require(item["type"] == ("function_call" if arguments else "message"))
            key = (index, part)
            require(key not in self.finished_fragments)
            if kind.endswith(".delta"):
                delta = value.get("delta")
                require(isinstance(delta, str))
                self.fragments.setdefault(key, []).append(delta)
            else:
                text = value.get("arguments" if arguments else "text")
                require(isinstance(text, str))
                if key in self.fragments:
                    require("".join(self.fragments[key]) == text)
                else:
                    self.fragments[key] = [text]
                self.finished_fragments.add(key)
        elif kind in (
            "response.content_part.added",
            "response.content_part.done",
            "response.reasoning_summary_part.added",
            "response.reasoning_summary_part.done",
            "response.reasoning_summary_text.delta",
            "response.reasoning_summary_text.done",
            "response.reasoning_text.delta",
            "response.reasoning_text.done",
            "response.output_text.annotation.added",
        ):
            # These are not executable or user-visible. Preserve full reasoning and
            # annotations only from the final output, through the normal parser.
            index = self._index(value)
            require(index in self.items and index not in self.done)
            require(value.get("item_id") == self.items[index]["id"])
        else:
            # Includes error, failed, incomplete, refusal and unsupported tool events.
            require(False)

    @staticmethod
    def _index(value: dict[str, Any], field: str = "output_index") -> int:
        index = value.get(field)
        require(type(index) is int and index >= 0)
        return index

    @staticmethod
    def _identity(initial: dict[str, Any], final: dict[str, Any]) -> None:
        for key in ("id", "type", "call_id", "name", "role"):
            if key in initial:
                require(initial[key] == final.get(key))

    @staticmethod
    def _text(item: dict[str, Any], part: int | None) -> str:
        if part is None:
            require(item.get("type") == "function_call")
            text = item.get("arguments")
        else:
            require(item.get("type") == "message")
            content = item.get("content")
            require(isinstance(content, list) and part < len(content))
            block = content[part]
            require(isinstance(block, dict) and block.get("type") == "output_text")
            text = block.get("text")
        require(isinstance(text, str))
        return text


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
