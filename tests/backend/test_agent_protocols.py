"""Actual adapter/service integration; all HTTP responses are synthetic and local."""

import json

import httpx
import pytest

from backend.agent import AnalysisService
from backend.api.schemas import AnalyzeRequest
from backend.llm import LLMClient, LLMConfig

URL = "https://example.org/synthetic-rule"


def wire_response(style, *, text=None):
    call = {"relative_path": "reasons/epfo-rr-001.md", "heading": "Fix"}
    if style == "responses":
        output = [
            {
                "id": "reasoning-1",
                "type": "reasoning",
                "summary": [],
                "encrypted_content": "opaque-replay-marker",
            }
        ]
        output.append(
            {
                "type": "function_call",
                "id": "fc-1",
                "call_id": "read-1",
                "name": "read_file",
                "arguments": json.dumps(call),
                "status": "completed",
            }
            if text is None
            else {
                "type": "message",
                "id": "msg-1",
                "role": "assistant",
                "status": "completed",
                "content": [{"type": "output_text", "text": text, "annotations": []}],
            }
        )
        return {"status": "completed", "output": output, "usage": {"output_tokens": 100}}
    if style == "chat_completions":
        message = {"role": "assistant", "content": text}
        if text is None:
            message["tool_calls"] = [
                {
                    "id": "read-1",
                    "type": "function",
                    "function": {"name": "read_file", "arguments": json.dumps(call)},
                }
            ]
        return {
            "choices": [
                {"message": message, "finish_reason": "tool_calls" if text is None else "stop"}
            ],
            "usage": {"completion_tokens": 100},
        }
    content = [{"type": "thinking", "thinking": "opaque-replay-marker", "signature": "signed"}]
    content.append(
        {"type": "tool_use", "id": "read-1", "name": "read_file", "input": call}
        if text is None
        else {"type": "text", "text": text}
    )
    return {
        "type": "message",
        "role": "assistant",
        "stop_reason": "tool_use" if text is None else "end_turn",
        "content": content,
        "usage": {"output_tokens": 100},
    }


def evidence_id(payload, style):
    if style == "responses":
        results = [i["output"] for i in payload["input"] if i.get("type") == "function_call_output"]
    elif style == "chat_completions":
        results = [i["content"] for i in payload["messages"] if i["role"] == "tool"]
    else:
        results = [
            block["content"]
            for message in payload["messages"]
            if isinstance(message["content"], list)
            for block in message["content"]
            if block.get("type") == "tool_result"
        ]
    return json.loads(results[-1])["evidence_id"]


@pytest.mark.parametrize(
    "style,stream",
    [
        ("responses", False),
        ("chat_completions", False),
        ("messages", False),
        ("responses", True),
    ],
)
@pytest.mark.parametrize("repair", [False, True])
async def test_actual_client_tool_roundtrip_and_repair(tmp_path, style, stream, repair):
    (tmp_path / "reasons").mkdir()
    (tmp_path / "README.md").write_text("# Index\nreasons/epfo-rr-001.md\n")
    (tmp_path / "reasons/epfo-rr-001.md").write_text("## Fix\nCheck details.\n" + URL + "\n")
    requests = []

    def respond(body):
        if not stream:
            return httpx.Response(200, json=body)
        from test_llm_streaming import Chunks, encode, events_for

        return httpx.Response(
            200,
            stream=Chunks(encode(events_for(body)), size=5),
            headers={"content-type": "text/event-stream"},
        )

    def handler(request):
        value = json.loads(request.content)
        assert value["stream"] is stream
        requests.append(value)
        assert len(value["tools"]) == 2  # Repair must retain historical tool definitions.
        if len(requests) == 1:
            assert "host-index" in request.content.decode()
            return respond(wire_response(style))
        if style != "chat_completions":
            assert "opaque-replay-marker" in request.content.decode()
        if repair and len(requests) == 2:
            return respond(wire_response(style, text="not json"))
        eid = evidence_id(value, style)
        final = {
            "status": "success",
            "language": "en",
            "classification": {
                "reason_id": "epfo-rr-001",
                "category": "Synthetic",
                "confidence": "medium",
                "rationale": "Synthetic match",
            },
            "explanation": [{"text": "Check details.", "evidence_ids": [eid]}],
            "actions": [{"text": "Check details.", "evidence_ids": [eid]}],
        }
        return respond(wire_response(style, text=json.dumps(final)))

    config = LLMConfig(
        api_style=style,
        base_url="https://synthetic.example/v1",
        api_key="synthetic-key",
        model="fake-model",
        max_output_tokens=2048,
        stream=stream,
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = LLMClient(config, http)
        response = await AnalysisService(client, tmp_path).analyze(AnalyzeRequest(text="Synthetic"))
        assert not http.is_closed
    assert len(requests) == (3 if repair else 2)
    assert response.status == "success"
    assert response.citations[0].source_urls == [URL]
    assert response.citations[0].heading == "Fix"
