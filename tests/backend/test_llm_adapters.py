import asyncio
import json
import traceback
from copy import deepcopy

import httpx
import pytest
from pydantic import ValidationError

from backend.llm import LLMClient, LLMConfig, LLMError, Message, ToolCall, ToolDefinition

STYLES = ["responses", "chat_completions", "messages"]
TOOLS = [ToolDefinition(name="read_file"), ToolDefinition(name="list_files")]
SECRET = "synthetic-private-secret"


def config(style="responses", **kwargs):
    return LLMConfig(
        api_style=style,
        base_url="https://gateway.example/custom/v1",
        api_key=SECRET,
        model="custom-model",
        **kwargs,
    )


def response_body(style, calls=True):
    if style == "responses":
        output = [
            {
                "id": "reasoning-1",
                "type": "reasoning",
                "summary": [],
                "encrypted_content": "opaque-replay",
            }
        ]
        if calls:
            output += [
                {
                    "type": "function_call",
                    "id": f"fc-{i}",
                    "call_id": f"call-{i}",
                    "name": name,
                    "arguments": '{"path":"README.md"}',
                    "status": "completed",
                }
                for i, name in enumerate(["read_file", "list_files"])
            ]
        else:
            output += [
                {
                    "id": "msg-1",
                    "type": "message",
                    "role": "assistant",
                    "status": "completed",
                    "content": [
                        {"type": "output_text", "text": "Grounded answer", "annotations": []}
                    ],
                }
            ]
        return {"status": "completed", "output": output}
    if style == "chat_completions":
        message = {"role": "assistant", "content": None if calls else "Grounded answer"}
        if calls:
            message["tool_calls"] = [
                {
                    "id": f"call-{i}",
                    "type": "function",
                    "function": {"name": name, "arguments": '{"path":"README.md"}'},
                }
                for i, name in enumerate(["read_file", "list_files"])
            ]
        return {
            "choices": [{"message": message, "finish_reason": "tool_calls" if calls else "stop"}]
        }
    content = [
        {"type": "thinking", "thinking": "opaque thought", "signature": "signed-thought"},
        {"type": "redacted_thinking", "data": "opaque-redacted"},
    ]
    if calls:
        content += [
            {"type": "tool_use", "id": f"call-{i}", "name": name, "input": {"path": "README.md"}}
            for i, name in enumerate(["read_file", "list_files"])
        ]
    else:
        content += [{"type": "text", "text": "Grounded answer"}]
    return {
        "type": "message",
        "role": "assistant",
        "stop_reason": "tool_use" if calls else "end_turn",
        "content": content,
    }


@pytest.mark.parametrize("style", STYLES)
async def test_multiple_tool_roundtrip_preserves_complete_replay_and_continuation(style):
    requests = []
    bodies = [response_body(style), response_body(style, False), response_body(style, False)]

    def handler(request):
        requests.append(request)
        return httpx.Response(200, json=bodies[len(requests) - 1])

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        async with LLMClient(
            config(style, extra_headers={"x-custom-auth": SECRET}, anthropic_version="2024-01-01"),
            http,
        ) as llm:
            history = [
                Message(role="system", content="Use evidence"),
                Message(role="user", content="Synthetic question"),
            ]
            first = await llm.complete(history, TOOLS, max_output_tokens=128, timeout_seconds=2)
            assert len(first.tool_calls) == 2
            assert first.tool_calls[0].arguments == {"path": "README.md"}
            history.append(first.message)
            history += [
                Message(
                    role="tool",
                    tool_call_id=call.id,
                    content=json.dumps({"text": "evidence"}),
                    is_error=(i == 1),
                )
                for i, call in enumerate(first.tool_calls)
            ]
            second = await llm.complete(history, TOOLS)
            assert second.text == "Grounded answer"
            history += [second.message, Message(role="user", content="Continue")]
            third = await llm.complete(history, TOOLS)
            assert third.text == "Grounded answer"
        assert not http.is_closed  # Injection never transfers ownership.
    first_payload, second_payload = [json.loads(request.content) for request in requests[:2]]
    assert first_payload["stream"] is False
    assert requests[0].headers["x-custom-auth"] == SECRET
    assert requests[0].extensions["timeout"] == {"connect": 2, "read": 2, "write": 2, "pool": 2}
    assert first_payload["model"] == "custom-model"
    if style == "responses":
        assert str(requests[0].url).endswith("/custom/v1/responses")
        assert first_payload["max_output_tokens"] == 128
        assert second_payload["store"] is False
        assert "previous_response_id" not in second_payload
        assert second_payload["include"] == ["reasoning.encrypted_content"]
        assert second_payload["input"][2:5] == bodies[0]["output"]
        assert [item["call_id"] for item in second_payload["input"][5:]] == ["call-0", "call-1"]
    elif style == "chat_completions":
        assert str(requests[0].url).endswith("/custom/v1/chat/completions")
        assert first_payload["max_completion_tokens"] == 128
        assert second_payload["messages"][2] == bodies[0]["choices"][0]["message"]
        assert [item["tool_call_id"] for item in second_payload["messages"][3:]] == [
            "call-0",
            "call-1",
        ]
    else:
        assert str(requests[0].url).endswith("/custom/v1/messages")
        assert requests[0].headers["x-api-key"] == SECRET
        assert requests[0].headers["anthropic-version"] == "2024-01-01"
        assert "authorization" not in requests[0].headers
        assert first_payload["system"] == "Use evidence"
        assert first_payload["max_tokens"] == 128
        assert second_payload["messages"][1]["content"] == bodies[0]["content"]
        assert second_payload["messages"][2]["role"] == "user"
        assert [item["tool_use_id"] for item in second_payload["messages"][2]["content"]] == [
            "call-0",
            "call-1",
        ]
        assert second_payload["messages"][2]["content"][1]["is_error"] is True
    if style != "messages":
        assert requests[0].headers["authorization"] == f"Bearer {SECRET}"


@pytest.mark.parametrize("style", STYLES)
async def test_zero_tools_is_explicit(style):
    def handler(request):
        assert json.loads(request.content)["tools"] == []
        return httpx.Response(200, json=response_body(style, False))

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        result = await LLMClient(config(style), http).complete(
            [Message(role="user", content="Hi")], []
        )
    assert result.text == "Grounded answer"


def corrupt(style, case):
    body = response_body(style)
    if style == "responses":
        call = body["output"][1]
        if case == "unknown_tool":
            call["name"] = "shell"
        elif case == "duplicate_id":
            body["output"][2]["call_id"] = call["call_id"]
        elif case == "unsupported":
            call["type"] = "web_search_call"
        elif case == "truncated":
            body["status"] = "incomplete"
        else:
            call["arguments"] = case
    elif style == "chat_completions":
        choice = body["choices"][0]
        call = choice["message"]["tool_calls"][0]
        if case == "unknown_tool":
            call["function"]["name"] = "shell"
        elif case == "duplicate_id":
            choice["message"]["tool_calls"][1]["id"] = call["id"]
        elif case == "unsupported":
            call["type"] = "custom"
        elif case == "truncated":
            choice["finish_reason"] = "length"
        else:
            call["function"]["arguments"] = case
    else:
        call = body["content"][2]
        if case == "unknown_tool":
            call["name"] = "shell"
        elif case == "duplicate_id":
            body["content"][3]["id"] = call["id"]
        elif case == "unsupported":
            call["type"] = "server_tool_use"
        elif case == "truncated":
            body["stop_reason"] = "max_tokens"
        else:
            call["input"] = case
    return body


@pytest.mark.parametrize("style", STYLES)
@pytest.mark.parametrize(
    "case",
    [
        "unknown_tool",
        "duplicate_id",
        "unsupported",
        "truncated",
        "[]",
        "null",
        "not-json",
        '{"x":NaN}',
        '{"x":1,"x":2}',
        SECRET,
    ],
)
async def test_malformed_tool_responses_are_safe_errors(style, case):
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=corrupt(style, case)))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(style), http).complete(
                [Message(role="user", content=SECRET)], TOOLS
            )
    assert_safe_error(error.value, "bad_response")


def assert_safe_error(error, code):
    assert error.code == code
    assert SECRET not in str(error)
    assert SECRET not in repr(error)
    assert SECRET not in "".join(traceback.format_exception(error))
    assert error.__cause__ is None
    assert error.__context__ is None
    assert not hasattr(error, "request")
    assert not hasattr(error, "response")


@pytest.mark.parametrize("style", STYLES)
@pytest.mark.parametrize(
    "body",
    [
        {},
        [],
        {"error": {"message": SECRET}},
        {"choices": []},
        {"status": "completed", "output": []},
    ],
)
async def test_invalid_response_envelopes(style, body):
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(style), http).complete([Message(role="user", content="Hi")])
    assert_safe_error(error.value, "bad_response")


@pytest.mark.parametrize(
    "status,code",
    [
        (401, "auth"),
        (403, "auth"),
        (429, "rate_limit"),
        (500, "provider_error"),
        (400, "bad_response"),
        (302, "bad_response"),
        (200, "bad_response"),
    ],
)
async def test_http_errors_never_leak_body_or_follow_redirect(status, code, caplog):
    count = 0

    def handler(_):
        nonlocal count
        count += 1
        return httpx.Response(status, text=SECRET, headers={"location": "https://other.example/"})

    async with httpx.AsyncClient(
        transport=httpx.MockTransport(handler), follow_redirects=True
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(), http).complete([Message(role="user", content=SECRET)])
    assert count == 1
    assert_safe_error(error.value, code)
    assert SECRET not in caplog.text


@pytest.mark.parametrize(
    "exception,code",
    [
        (httpx.ReadTimeout, "timeout"),
        (httpx.ConnectTimeout, "timeout"),
        (httpx.ConnectError, "transport"),
        (RuntimeError, "transport"),
    ],
)
async def test_transport_error_chain_is_removed(exception, code):
    def handler(_):
        raise exception(SECRET)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(), http).complete([Message(role="user", content=SECRET)])
    assert_safe_error(error.value, code)


async def test_total_timeout_and_external_cancellation():
    async def handler(_):
        await asyncio.sleep(10)
        return httpx.Response(200)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        llm = LLMClient(config(), http)
        with pytest.raises(LLMError) as error:
            await llm.complete([Message(role="user", content="Hi")], timeout_seconds=0.001)
        assert_safe_error(error.value, "timeout")
        task = asyncio.create_task(llm.complete([Message(role="user", content="Hi")]))
        await asyncio.sleep(0)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task


@pytest.mark.parametrize(
    "kwargs",
    [
        {"max_output_tokens": 0},
        {"max_output_tokens": 2049},
        {"max_output_tokens": True},
        {"timeout_seconds": 31},
        {"timeout_seconds": 0},
        {"timeout_seconds": float("nan")},
        {"timeout_seconds": float("inf")},
    ],
)
async def test_budget_overrides_cannot_increase_ceilings(kwargs):
    def handler(_):
        pytest.fail("Invalid request reached transport")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(), http).complete([Message(role="user", content="Hi")], **kwargs)
    assert_safe_error(error.value, "invalid_request")


@pytest.mark.parametrize(
    "case",
    [
        "missing",
        "duplicate",
        "unknown",
        "wrong_style",
        "modified_payload",
        "duplicate_definitions",
        "forbidden_history_tool",
    ],
)
async def test_invalid_continuation_never_reaches_transport(case):
    def handler(_):
        pytest.fail("Invalid continuation reached transport")

    from backend.llm.responses import parse

    first = parse(response_body("responses"), {tool.name for tool in TOOLS})
    history = [Message(role="user", content="Hi"), first.message]
    history += [
        Message(role="tool", tool_call_id=call.id, content="Result") for call in first.tool_calls
    ]
    tools = TOOLS
    if case == "missing":
        history.pop()
    elif case == "duplicate":
        history.append(history[-1])
    elif case == "unknown":
        history[-1] = Message(role="tool", tool_call_id="other", content="Result")
    elif case == "wrong_style":
        history[1] = first.message.model_copy(update={"api_style": "messages"})
    elif case == "modified_payload":
        history[1] = deepcopy(first.message)
        history[1].provider_items[1]["name"] = "shell"
    elif case == "duplicate_definitions":
        tools = TOOLS + TOOLS
    else:
        history = [
            Message(role="assistant", tool_calls=(ToolCall(id="x", name="shell", arguments={}),)),
            Message(role="tool", tool_call_id="x", content="oops"),
        ]
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(), http).complete(history, tools)
    assert_safe_error(error.value, "invalid_request")


@pytest.mark.parametrize("style", STYLES)
async def test_no_tools_means_no_allowed_tool_calls(style):
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=response_body(style)))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(style), http).complete([Message(role="user", content="Hi")], [])
    assert_safe_error(error.value, "bad_response")


async def test_response_bytes_are_bounded_and_stream_closed():
    from backend.llm.client import MAX_RESPONSE_BYTES

    class Oversized(httpx.AsyncByteStream):
        closed = False
        chunks = 0

        async def __aiter__(self):
            for _ in range(10):
                self.chunks += 1
                yield b"x" * (MAX_RESPONSE_BYTES // 2)

        async def aclose(self):
            self.closed = True

    stream = Oversized()
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, stream=stream))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(), http).complete([Message(role="user", content=SECRET)])
    assert_safe_error(error.value, "bad_response")
    assert stream.chunks == 3
    assert stream.closed


@pytest.mark.parametrize("style", STYLES)
@pytest.mark.parametrize("mode", ["full", "partial", "missing", "null", "empty"])
async def test_usage_normalization_keeps_unknown_counts_unknown(style, mode):
    from backend.llm import Usage

    body = response_body(style, False)
    input_key, output_key = (
        ("prompt_tokens", "completion_tokens")
        if style == "chat_completions"
        else ("input_tokens", "output_tokens")
    )
    if mode == "full":
        body["usage"] = {
            input_key: 20,
            output_key: 5,
            "total_tokens": 25,
            "other_details": {"cached_tokens": 3},
        }
    elif mode == "partial":
        body["usage"] = {input_key: 0}
    elif mode == "null":
        body["usage"] = None
    elif mode == "empty":
        body["usage"] = {}
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))
    ) as http:
        output = await LLMClient(config(style), http).complete([Message(role="user", content="Hi")])
    if mode == "full":
        assert output.usage == Usage(input_tokens=20, output_tokens=5, total_tokens=25)
    elif mode == "partial":
        assert output.usage == Usage(input_tokens=0, output_tokens=None, total_tokens=None)
    elif mode == "empty":
        assert output.usage == Usage()
    else:
        assert output.usage is None


@pytest.mark.parametrize("style", STYLES)
@pytest.mark.parametrize("field", ["input", "output", "total"])
@pytest.mark.parametrize("value", [-1, True, 1.5, "12", SECRET, [], {}])
async def test_invalid_usage_counts_are_sanitized(style, field, value):
    keys = {
        "input": "prompt_tokens" if style == "chat_completions" else "input_tokens",
        "output": "completion_tokens" if style == "chat_completions" else "output_tokens",
        "total": "total_tokens",
    }
    body = response_body(style, False)
    body["usage"] = {keys[field]: value}
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(style), http).complete([Message(role="user", content="Hi")])
    assert_safe_error(error.value, "bad_response")


@pytest.mark.parametrize("style", STYLES)
@pytest.mark.parametrize("usage", [[], SECRET, 42])
async def test_invalid_usage_envelope(style, usage):
    body = response_body(style, False)
    body["usage"] = usage
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))
    ) as http:
        with pytest.raises(LLMError) as error:
            await LLMClient(config(style), http).complete([Message(role="user", content="Hi")])
    assert_safe_error(error.value, "bad_response")


def test_contract_validation_and_repr():
    with pytest.raises(ValidationError):
        ToolDefinition(name="not a valid name")
    with pytest.raises(ValidationError):
        ToolDefinition(name="read_file", parameters={"type": "array"})
    with pytest.raises(ValidationError):
        Message(role="user", tool_call_id="x")
    with pytest.raises(ValidationError):
        Message(role="tool")
    assert SECRET not in repr(Message(role="user", content=SECRET))
    assert SECRET not in repr(ToolCall(id=SECRET, name="read_file", arguments={"private": SECRET}))
