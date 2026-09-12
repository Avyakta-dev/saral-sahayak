"""Offline SSE transport regressions; no environment, credentials or live calls."""

import asyncio
import json
from copy import deepcopy

import httpx
import pytest
from test_llm_adapters import (
    SECRET,
    TOOLS,
    assert_safe_error,
    config,
    response_body,
)

from backend.llm import LLMClient, Message, Usage


def events_for(body):
    body = {"id": "response-1", **deepcopy(body)}
    events = [{"type": "response.created", "response": {"id": body["id"]}}]
    for index, final in enumerate(body["output"]):
        initial = deepcopy(final)
        if final["type"] == "function_call":
            initial.update(arguments="", status="in_progress")
        elif final["type"] == "message":
            initial.update(content=[], status="in_progress")
        elif final["type"] == "reasoning":
            initial.pop("encrypted_content", None)
        events.append(
            {"type": "response.output_item.added", "output_index": index, "item": initial}
        )
        if final["type"] in ("function_call", "message"):
            arguments = final["type"] == "function_call"
            text = final["arguments"] if arguments else final["content"][0]["text"]
            kind = "response.function_call_arguments" if arguments else "response.output_text"
            common = {"output_index": index, "item_id": final["id"]}
            if not arguments:
                common["content_index"] = 0
            for start in range(0, len(text), 3):
                events.append({"type": kind + ".delta", **common, "delta": text[start : start + 3]})
            events.append(
                {"type": kind + ".done", **common, "arguments" if arguments else "text": text}
            )
        events.append({"type": "response.output_item.done", "output_index": index, "item": final})
    events.append({"type": "response.completed", "response": body})
    return events


def encode(events, newline="\n", *, names=True, multiline=False):
    frames = []
    for i, event in enumerate(events):
        event = {"sequence_number": i, **event}
        data = json.dumps(event, ensure_ascii=False, indent=1 if multiline else None)
        fields = ["event: " + event["type"]] if names else []
        fields += ["data: " + line for line in data.splitlines()]
        frames.append(newline.join(fields) + newline * 2)
    return "".join(frames).encode()


class Chunks(httpx.AsyncByteStream):
    def __init__(self, data, size=7, *, error=None, stall=False):
        self.data = data
        self.size = size
        self.error = error
        self.stall = stall
        self.closed = False
        self.waiting = asyncio.Event()
        self.read = 0

    async def __aiter__(self):
        for start in range(0, len(self.data), self.size):
            self.read += 1
            yield self.data[start : start + self.size]
        if self.error:
            raise self.error(SECRET)
        if self.stall:
            self.waiting.set()
            await asyncio.Event().wait()

    async def aclose(self):
        self.closed = True


async def complete(stream, *, content_type="text/event-stream", status=200, **kwargs):
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(status, stream=stream, headers={"content-type": content_type})
        )
    ) as http:
        return await LLMClient(config(stream=True), http).complete(
            [Message(role="user", content=SECRET)], TOOLS, **kwargs
        )


@pytest.mark.parametrize("newline", ["\n", "\r\n", "\r"])
@pytest.mark.parametrize("size", [1, 7, 65536])
async def test_fragmented_utf8_multiline_comments_and_terminal_close(newline, size):
    body = response_body("responses", False)
    body["output"][1]["content"][0]["text"] = "Check ಕನ್ನಡ हिन्दी 😀"
    data = b"\xef\xbb\xbf" + (": keepalive" + newline * 2).encode()
    data += encode(events_for(body), newline, multiline=True)
    stream = Chunks(data, size=size, stall=True)
    result = await complete(stream, timeout_seconds=1)
    assert result.text == "Check ಕನ್ನಡ हिन्दी 😀"
    assert result.message.provider_items == tuple(body["output"])
    assert stream.closed and not stream.waiting.is_set()


async def test_fragmented_tool_cycle_exact_reasoning_ids_and_final_text():
    requests, streams = [], []
    bodies = [response_body("responses"), response_body("responses", False)]
    bodies[0]["output"][0]["summary"] = [{"type": "summary_text", "text": "opaque summary"}]
    bodies[0]["output"][0]["encrypted_content"] = "exact-reasoning=="
    bodies[0]["output"][1]["call_id"] = "exact-call:id"
    bodies[1]["output"][1]["phase"] = "final_answer"
    bodies[1]["usage"] = {"input_tokens": 10, "output_tokens": 3, "total_tokens": 13}

    def handler(request):
        requests.append(request)
        stream = Chunks(encode(events_for(bodies[len(requests) - 1])), size=1)
        streams.append(stream)
        return httpx.Response(
            200, stream=stream, headers={"content-type": "text/event-stream; charset=utf-8"}
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        llm = LLMClient(config(stream=True), http)
        history = [Message(role="user", content="Synthetic")]
        first = await llm.complete(history, TOOLS, max_output_tokens=128, timeout_seconds=2)
        assert [call.arguments for call in first.tool_calls] == [{"path": "README.md"}] * 2
        history += [first.message] + [
            Message(role="tool", tool_call_id=call.id, content="Synthetic evidence")
            for call in first.tool_calls
        ]
        final = await llm.complete(history, TOOLS)
        assert not http.is_closed
    assert all(stream.closed for stream in streams)
    assert final.text == "Grounded answer"
    assert final.usage == Usage(input_tokens=10, output_tokens=3, total_tokens=13)
    assert final.message.provider_items == tuple(bodies[1]["output"])
    first_payload, second_payload = [json.loads(request.content) for request in requests]
    assert first_payload["stream"] is True and first_payload["store"] is False
    assert first_payload["include"] == ["reasoning.encrypted_content"]
    assert first_payload["max_output_tokens"] == 128
    assert requests[0].headers["accept"] == "text/event-stream"
    assert requests[0].extensions["timeout"] == {"connect": 2, "read": 2, "write": 2, "pool": 2}
    assert second_payload["input"][1:4] == bodies[0]["output"]
    assert second_payload["input"][4]["call_id"] == "exact-call:id"
    assert "previous_response_id" not in second_payload


@pytest.mark.parametrize("usage", [None, {}, {"input_tokens": 0}, {"output_tokens": 4}])
async def test_terminal_usage_only_no_inferred_or_accumulated_counts(usage):
    body = response_body("responses", False)
    body["usage"] = usage
    events = events_for(body)
    events[0]["response"]["usage"] = {"input_tokens": 999, "output_tokens": 99}
    result = await complete(Chunks(encode(events)))
    assert result.usage == (None if usage is None else Usage(**usage))


@pytest.mark.parametrize(
    "case",
    [
        "missing_terminal",
        "truncated_event",
        "invalid_utf8",
        "invalid_json",
        "duplicate_json_key",
        "mismatched_event",
        "failed",
        "incomplete",
        "error",
        "unknown_event",
        "wrong_sequence",
        "wrong_item_id",
        "wrong_call_id",
        "wrong_delta",
        "bad_arguments",
        "unknown_tool",
        "duplicate_call_id",
        "bad_usage",
        "changed_done_item",
        "wrong_response_id",
        "after_done_delta",
        "duplicate_item",
        "invalid_index",
        "missing_added",
        "refusal",
        "completed_incomplete",
    ],
)
async def test_malformed_stream_fails_closed_sanitized(case):
    events = events_for(response_body("responses"))
    data = None
    if case == "missing_terminal":
        events.pop()
    elif case == "truncated_event":
        data = encode(events)[:-1]
    elif case == "invalid_utf8":
        data = b"data: \xff\n\n"
    elif case == "invalid_json":
        data = b"data: synthetic-private-secret\n\n"
    elif case == "duplicate_json_key":
        data = b'data: {"type":"response.completed","type":"error"}\n\n'
    elif case == "mismatched_event":
        data = b'event: response.completed\ndata: {"type":"error"}\n\n'
    elif case in ("failed", "incomplete", "error", "unknown_event", "refusal"):
        events[-1] = {
            "type": {
                "failed": "response.failed",
                "incomplete": "response.incomplete",
                "error": "error",
                "unknown_event": "response.web_search_call.completed",
                "refusal": "response.refusal.delta",
            }[case],
            "message": SECRET,
        }
    elif case == "wrong_sequence":
        events[1]["sequence_number"] = 0
    elif case == "wrong_item_id":
        next(e for e in events if e["type"].endswith("arguments.delta"))["item_id"] = "other"
    elif case == "wrong_call_id":
        events[-1]["response"]["output"][1]["call_id"] = "other"
    elif case == "wrong_delta":
        next(e for e in events if e["type"].endswith("arguments.delta"))["delta"] = SECRET
    elif case in (
        "bad_arguments",
        "unknown_tool",
        "duplicate_call_id",
        "bad_usage",
        "completed_incomplete",
    ):
        body = response_body("responses")
        if case == "bad_arguments":
            body["output"][1]["arguments"] = '{"bad":'
        elif case == "unknown_tool":
            body["output"][1]["name"] = "shell"
        elif case == "duplicate_call_id":
            body["output"][2]["call_id"] = body["output"][1]["call_id"]
        elif case == "bad_usage":
            body["usage"] = {"output_tokens": True}
        else:
            body["status"] = "incomplete"
        events = events_for(body)
    elif case == "changed_done_item":
        events[-1]["response"]["output"][0]["summary"] = [
            {"type": "summary_text", "text": "changed"}
        ]
        # Fixture shares final objects with done frames; break that sharing first.
        events[2]["item"] = response_body("responses")["output"][0]
    elif case == "wrong_response_id":
        events[-1]["response"]["id"] = "other"
    elif case == "after_done_delta":
        delta = deepcopy(next(e for e in events if e["type"].endswith("arguments.delta")))
        events.insert(-1, delta)
    elif case == "duplicate_item":
        events.insert(2, deepcopy(events[1]))
    elif case == "invalid_index":
        events[1]["output_index"] = True
    elif case == "missing_added":
        events.pop(1)
    stream = Chunks(data if data is not None else encode(events))
    with pytest.raises(Exception) as error:
        await complete(stream)
    assert_safe_error(error.value, "bad_response")
    assert stream.closed


@pytest.mark.parametrize("mode", ["bytes", "events", "comments"])
async def test_stream_limits_close_without_consuming_rest(monkeypatch, mode):
    import backend.llm.client as client_module
    import backend.llm.streaming as streaming_module

    monkeypatch.setattr(client_module, "MAX_RESPONSE_BYTES", 1024)
    monkeypatch.setattr(streaming_module, "MAX_STREAM_EVENTS", 3)
    if mode == "bytes":
        data = b"data: " + b"x" * 4096
    elif mode == "comments":
        data = b": ping\n\n" * 10
    else:
        data = encode([{"type": "response.in_progress", "response": {"id": "x"}}] * 10)
    stream = Chunks(data, size=32)
    with pytest.raises(Exception) as error:
        await complete(stream)
    assert_safe_error(error.value, "bad_response")
    assert stream.closed and stream.read * stream.size < len(data)


@pytest.mark.parametrize(
    "exception,code",
    [
        (httpx.ReadError, "transport"),
        (httpx.RemoteProtocolError, "transport"),
        (httpx.ReadTimeout, "timeout"),
        (RuntimeError, "transport"),
    ],
)
async def test_disconnect_after_partial_output_is_not_a_result(exception, code):
    stream = Chunks(encode(events_for(response_body("responses", False))[:-1]), error=exception)
    with pytest.raises(Exception) as error:
        await complete(stream)
    assert_safe_error(error.value, code)
    assert stream.closed


async def test_idle_stream_deadline_and_external_cancellation_cleanup():
    data = encode(events_for(response_body("responses", False))[:-1])
    stream = Chunks(data, stall=True)
    with pytest.raises(Exception) as error:
        await complete(stream, timeout_seconds=0.05)
    assert_safe_error(error.value, "timeout")
    assert stream.closed
    stream = Chunks(data, stall=True)
    task = asyncio.create_task(complete(stream))
    await asyncio.wait_for(stream.waiting.wait(), timeout=1)
    assert not task.done()  # Partial text and item.done cannot complete the turn.
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert stream.closed


@pytest.mark.parametrize(
    "status,code",
    [
        (401, "auth"),
        (403, "auth"),
        (429, "rate_limit"),
        (500, "provider_error"),
        (302, "bad_response"),
    ],
)
async def test_stream_http_errors_do_not_read_body(status, code):
    stream = Chunks(SECRET.encode())
    with pytest.raises(Exception) as error:
        await complete(stream, status=status)
    assert_safe_error(error.value, code)
    assert stream.closed and stream.read == 0


async def test_non_sse_is_not_silently_accepted_as_nonstream():
    stream = Chunks(json.dumps(response_body("responses", False)).encode())
    with pytest.raises(Exception) as error:
        await complete(stream, content_type="application/json")
    assert_safe_error(error.value, "bad_response")
    assert stream.closed and stream.read == 0


async def test_terminal_reencrypted_reasoning_is_preserved_exactly_on_replay():
    first_body = response_body("responses")
    first_body["output"][0]["encrypted_content"] = "authoritative-terminal-blob=="
    events = events_for(first_body)
    events[2]["item"] = deepcopy(events[2]["item"])
    events[2]["item"]["encrypted_content"] = "earlier-item-done-blob=="
    requests = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        if len(requests) == 1:
            data = encode(events)
        else:
            assert payload["input"][1:4] == first_body["output"]
            assert "earlier-item-done-blob==" not in request.content.decode()
            data = encode(events_for(response_body("responses", False)))
        return httpx.Response(
            200, stream=Chunks(data), headers={"content-type": "text/event-stream"}
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = LLMClient(config(stream=True), http)
        history = [Message(role="user", content="Synthetic")]
        first = await client.complete(history, TOOLS)
        history += [first.message] + [
            Message(role="tool", tool_call_id=call.id, content="evidence")
            for call in first.tool_calls
        ]
        final = await client.complete(history, TOOLS)
    assert final.text == "Grounded answer"


@pytest.mark.parametrize("value", [1, [], {}])
async def test_terminal_reencrypted_reasoning_still_requires_valid_blob_type(value):
    events = events_for(response_body("responses"))
    events[-1]["response"]["output"][0]["encrypted_content"] = value
    with pytest.raises(Exception) as error:
        await complete(Chunks(encode(events)))
    assert_safe_error(error.value, "bad_response")


async def test_completion_only_gateway_without_event_field_supported():
    body = response_body("responses", False)
    result = await complete(
        Chunks(encode([{"type": "response.completed", "response": body}], names=False))
    )
    assert result.text == "Grounded answer"


@pytest.mark.parametrize("size", [1, 7, 65536])
@pytest.mark.parametrize(
    "trailing", [b"data: ignored trailing bytes", b"data: [DONE]\n\n", b": unfinished"]
)
async def test_trailing_data_after_terminal_is_not_processed_or_awaited(size, trailing):
    data = encode(events_for(response_body("responses", False))) + trailing
    result = await complete(Chunks(data, size=size, stall=True))
    assert result.text == "Grounded answer"


async def test_cpu_only_large_frame_cannot_bypass_deadline():
    data = b":" + b"x" * 1500000 + b"\n\n" + encode(events_for(response_body("responses", False)))
    stream = Chunks(data, size=len(data))
    with pytest.raises(Exception) as error:
        await complete(stream, timeout_seconds=0.001)
    assert_safe_error(error.value, "timeout")
    assert stream.closed


async def test_cpu_only_stream_honors_external_cancellation():
    data = b":" + b"x" * 1500000 + b"\n\n" + encode(events_for(response_body("responses", False)))
    stream = Chunks(data, size=len(data))
    task = asyncio.create_task(complete(stream))
    await asyncio.sleep(0)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert stream.closed


async def test_slow_terminal_validation_cannot_bypass_deadline(monkeypatch):
    import time

    from backend.llm import responses

    original = responses.parse

    def slow_parse(body, allowed):
        time.sleep(0.02)
        return original(body, allowed)

    monkeypatch.setattr(responses, "parse", slow_parse)
    stream = Chunks(encode(events_for(response_body("responses", False))), size=65536)
    with pytest.raises(Exception) as error:
        await complete(stream, timeout_seconds=0.01)
    assert_safe_error(error.value, "timeout")
    assert stream.closed
