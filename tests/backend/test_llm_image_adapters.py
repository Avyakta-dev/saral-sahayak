"""Native image content parts for all three protocols. Synthetic transport only.

These assertions are the wire contract: with no image attached the emitted payload
must stay exactly as it was before image support existed.
"""

import json

import httpx
import pytest
from pydantic import ValidationError
from test_level_two_api import (  # noqa: F401  (autouse offline guard)
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.llm import LLMClient, LLMConfig, Message

STYLES = ["responses", "chat_completions", "messages"]
SECRET = "synthetic-private-secret"
URL = (
    "https://account.r2.cloudflarestorage.com/synthetic-bucket/"
    "inbox/0123456789abcdef0123456789abcdef.png?X-Amz-Signature=synthetic"
)
INSTRUCTION = "Transcribe the rejection wording."


def config(style):
    return LLMConfig(
        api_style=style,
        base_url="https://gateway.example/v1",
        api_key=SECRET,
        model="synthetic-model",
    )


def wire_response(style, text="ok"):
    if style == "responses":
        return {
            "status": "completed",
            "output": [
                {
                    "type": "message",
                    "id": "msg-1",
                    "role": "assistant",
                    "status": "completed",
                    "content": [{"type": "output_text", "text": text, "annotations": []}],
                }
            ],
            "usage": {"output_tokens": 10},
        }
    if style == "chat_completions":
        return {
            "choices": [
                {"message": {"role": "assistant", "content": text}, "finish_reason": "stop"}
            ],
            "usage": {"completion_tokens": 10},
        }
    return {
        "type": "message",
        "role": "assistant",
        "stop_reason": "end_turn",
        "content": [{"type": "text", "text": text}],
        "usage": {"output_tokens": 10},
    }


def sent(messages, style, payload):
    """Return every content part the adapter emitted for the user message."""
    if style == "responses":
        items = [item for item in payload["input"] if item.get("role") == "user"]
        assert len(items) == 1, "one user item expected"
        return items[0]["content"]
    if style == "chat_completions":
        items = [m for m in payload["messages"] if m["role"] == "user"]
        assert len(items) == 1, "one user message expected"
        return items[0]["content"]
    return [block for m in payload["messages"] if m["role"] == "user" for block in m["content"]]


@pytest.mark.parametrize("style", STYLES)
async def test_user_message_emits_exactly_one_native_image_part(style):
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(200, json=wire_response(style))

    message = Message(role="user", content=INSTRUCTION, image_urls=(URL,))
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        result = await LLMClient(config(style), http).complete([message])

    assert len(requests) == 1, "exactly one provider request"
    parts = sent([message], style, requests[0])
    assert isinstance(parts, list), "image turns must use the typed content array"
    images = [part for part in parts if "image" in json.dumps(part)]
    assert len(images) == 1, "exactly one image part"
    assert len(parts) == 2, "one image plus one instruction"

    if style == "responses":
        assert parts == [
            {"type": "input_image", "image_url": URL},
            {"type": "input_text", "text": INSTRUCTION},
        ]
    elif style == "chat_completions":
        assert parts == [
            {"type": "image_url", "image_url": {"url": URL}},
            {"type": "text", "text": INSTRUCTION},
        ]
    else:
        assert parts == [
            {"type": "image", "source": {"type": "url", "url": URL}},
            {"type": "text", "text": INSTRUCTION},
        ]

    # No protocol may fall back to base64, a data URL or an inline byte payload.
    encoded = json.dumps(requests[0])
    assert "base64" not in encoded and "data:image" not in encoded
    assert result.text == "ok"


@pytest.mark.parametrize("style", STYLES)
async def test_text_only_payload_is_byte_identical_to_no_image_support(style):
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(200, json=wire_response(style))

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        await LLMClient(config(style), http).complete([Message(role="user", content=INSTRUCTION)])

    payload = requests[0]
    assert "image" not in json.dumps(payload).replace("max_output_tokens", "")
    if style == "responses":
        assert payload["input"] == [{"role": "user", "content": INSTRUCTION}]
    elif style == "chat_completions":
        assert payload["messages"] == [{"role": "user", "content": INSTRUCTION}]
    else:
        assert payload["messages"] == [
            {"role": "user", "content": [{"type": "text", "text": INSTRUCTION}]}
        ]


@pytest.mark.parametrize("style", STYLES)
async def test_instruction_only_image_turn_still_emits_the_image_part(style):
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(200, json=wire_response(style))

    message = Message(role="user", image_urls=(URL,))
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        await LLMClient(config(style), http).complete([message])

    parts = sent([message], style, requests[0])
    assert len(parts) == 1 and URL in json.dumps(parts[0])


@pytest.mark.parametrize("role", ["system", "assistant", "tool"])
def test_image_parts_are_user_only(role):
    kwargs = {"role": role, "image_urls": (URL,)}
    if role == "tool":
        kwargs["tool_call_id"] = "call-1"
    with pytest.raises(ValidationError):
        Message(**kwargs)


def test_at_most_one_image_per_message():
    assert Message(role="user", image_urls=(URL,)).image_urls == (URL,)
    with pytest.raises(ValidationError):
        Message(role="user", image_urls=(URL, URL))


def test_image_url_is_repr_and_serialization_scoped():
    message = Message(role="user", content=INSTRUCTION, image_urls=(URL,))
    assert URL not in repr(message)
    # The URL is transport-only: it must never appear in the instruction text.
    assert URL not in message.content
