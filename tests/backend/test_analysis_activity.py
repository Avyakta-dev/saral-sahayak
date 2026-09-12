"""Offline real host activity/SSE tests; synthetic corpus, never live provider calls."""

import asyncio
import json
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from test_agent import (
    PATH,
    FakeClient,
    read_call,
    supported_client,
    text_result,
    tool_result,
)
from test_agent import root as root
from test_level_two_api import (
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)
from test_level_two_api import readiness_bypass as readiness_bypass
from test_level_two_api import settings as settings

import backend.main as main
from backend.agent.activity import (
    MAX_ACTIVITY_EVENTS,
    PUBLIC_PREFIX,
    AnalysisActivity,
    RequestActivity,
)
from backend.agent.service import AnalysisError, AnalysisService, dispatch_tool
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse
from backend.config import Settings
from backend.llm import ToolCall
from backend.tools.budget import BudgetLimits
from backend.tools.knowledge_files import KnowledgeFiles

REQUEST = AnalyzeRequest(text="PRIVATE-SYNTHETIC-USER-INPUT")
ABSTAIN = {"status": "unsupported", "language": "en", "warnings": ["Not enough evidence."]}


def frames(raw):
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    output = []
    for frame in raw.split("\n\n"):
        if frame:
            event, data = frame.split("\n")
            assert event.startswith("event: ") and data.startswith("data: ")
            output.append((event[7:], json.loads(data[6:])))
    return output


async def test_exact_host_activity_order_and_ledger_ranges(root):
    events, diagnostics = [], []
    client = supported_client()
    service = AnalysisService(client, root)
    response = await service.analyze(
        REQUEST, activity=events.append, diagnostics=diagnostics.append
    )
    assert response.status == "success"
    assert [e.model_dump(exclude_none=True) for e in events] == [
        {
            "phase": "reading",
            "path": PUBLIC_PREFIX + "README.md",
            "heading": "Index",
            "start_line": 1,
            "end_line": 2,
        },
        {"phase": "thinking", "turn": 1},
        {
            "phase": "reading",
            "path": PUBLIC_PREFIX + PATH,
            "heading": "Fix",
            "start_line": 2,
            "end_line": 3,
        },
        {
            "phase": "reading",
            "path": PUBLIC_PREFIX + PATH,
            "heading": "Sources",
            "start_line": 4,
            "end_line": 5,
        },
        {"phase": "thinking", "turn": 2},
        {"phase": "validating", "turn": 2},
    ]
    assert not hasattr(service, "activity")
    raw = json.dumps([e.model_dump() for e in events])
    for secret in (REQUEST.text, str(root), "example.org", "Check the name", "evidence_id"):
        assert secret not in raw
    assert "README" not in repr(diagnostics) and "reasons/" not in repr(diagnostics)
    with pytest.raises(ValidationError):
        events[0].path = "forged.md"


def test_headingless_and_cursor_read_report_result_not_requested_arguments(root):
    events = []
    activity = RequestActivity(events.append)
    with KnowledgeFiles(root) as tools:
        call = ToolCall(
            id="a",
            name="read_file",
            arguments={
                "relative_path": PATH,
                "start_line": 3,
                "max_bytes": 4,
            },
        )
        first = json.loads(dispatch_tool(tools, call, activity).content)
        second = json.loads(
            dispatch_tool(
                tools,
                ToolCall(
                    id="b",
                    name="read_file",
                    arguments={
                        "relative_path": PATH,
                        "cursor": first["next_cursor"],
                        "max_bytes": 4,
                    },
                ),
                activity,
            ).content
        )
        for event, result in zip(events, (first, second), strict=True):
            entry = tools.ledger.get(result["evidence_id"])
            assert (event.heading, event.start_line, event.end_line) == (
                entry.heading,
                entry.start_line,
                entry.end_line,
            )
            assert event.heading == "Fix"  # No heading was requested, including continuation.
            assert event.start_line == 3


async def test_only_successful_tools_emit_no_failed_or_requested_paths(root):
    events = []
    client = FakeClient(
        tool_result(
            read_call("bad", "PRIVATE-REQUESTED-HEADING", "../PRIVATE-PATH.md"),
            ToolCall(id="list", name="list_files", arguments={"relative_dir": "reasons"}),
            read_call("missing", "PRIVATE-REQUESTED-HEADING"),
            read_call("good"),
        ),
        text_result(ABSTAIN),
    )
    await AnalysisService(client, root).analyze(REQUEST, activity=events.append)
    assert [event.phase for event in events] == [
        "reading",
        "thinking",
        "searching",
        "reading",
        "thinking",
        "validating",
    ]
    assert events[2].model_dump(exclude_none=True) == {"phase": "searching"}
    assert "PRIVATE" not in repr(events)


async def test_index_or_budget_failure_never_emits_unperformed_reads(root):
    events = []
    with pytest.raises(AnalysisError):
        await AnalysisService(supported_client(), root / "missing").analyze(
            REQUEST,
            activity=events.append,
        )
    assert events == []
    with pytest.raises(AnalysisError):
        await AnalysisService(supported_client(), root, BudgetLimits(tool_calls=1)).analyze(
            REQUEST,
            activity=events.append,
        )
    assert [event.phase for event in events] == ["reading", "thinking"]


@pytest.mark.parametrize("failure", [RuntimeError("PRIVATE-CALLBACK"), asyncio.CancelledError()])
async def test_observer_nonthrowing_and_never_schedules_async_callbacks(root, failure):
    def broken(event):
        raise failure

    assert (
        await AnalysisService(supported_client(), root).analyze(
            REQUEST,
            activity=broken,
        )
    ).status == "success"
    calls = []

    async def accidental(event):
        calls.append(event)

    await AnalysisService(supported_client(), root).analyze(REQUEST, activity=accidental)
    await asyncio.sleep(0)
    assert calls == []


@pytest.mark.parametrize(
    "path",
    [
        "/etc/secret.md",
        "references/knowledge/epfo-other/file.md",
        PUBLIC_PREFIX + "../secret.md",
        PUBLIC_PREFIX + "a//b.md",
        PUBLIC_PREFIX + "a%20b.md",
        PUBLIC_PREFIX + "a?b.md",
        PUBLIC_PREFIX + "a#b.md",
        PUBLIC_PREFIX + ".hidden.md",
        PUBLIC_PREFIX + "a\\b.md",
        PUBLIC_PREFIX + "a\nb.md",
        PUBLIC_PREFIX + "a\u202eb.md",
        PUBLIC_PREFIX + "a.txt",
    ],
)
def test_activity_rejects_noncanonical_paths(path):
    with pytest.raises(ValidationError):
        AnalysisActivity(phase="reading", path=path, start_line=1, end_line=2)


def test_activity_shape_strict_and_unsafe_heading_omitted(root):
    for bad in (
        {"phase": "thinking", "text": "PRIVATE"},
        {"phase": "thinking", "turn": True},
        {"phase": "reading", "path": PUBLIC_PREFIX + "README.md"},
        {"phase": "searching", "path": PUBLIC_PREFIX + "README.md"},
        {"phase": "reading", "path": PUBLIC_PREFIX + "README.md", "start_line": 2, "end_line": 1},
    ):
        with pytest.raises(ValidationError):
            AnalysisActivity.model_validate(bad)
    events = []
    (root / PATH).write_text("## Unsafe\tsection\nbody\n", encoding="utf-8")
    with KnowledgeFiles(root) as tools:
        dispatch_tool(tools, read_call("a", "Unsafe\tsection"), RequestActivity(events.append))
    assert len(events) == 1 and events[0].heading is None
    assert events[0].path == PUBLIC_PREFIX + PATH
    assert "heading" not in frames(main._sse("activity", events[0]))[0][1]
    with pytest.raises(ValidationError):
        AnalysisActivity(
            phase="reading", path=PUBLIC_PREFIX + PATH, heading="क" * 400, start_line=1, end_line=2
        )


def test_sse_real_loop_has_one_validated_final_and_no_partial_output(
    root, settings, readiness_bypass
):
    app = main.create_app(settings, knowledge_root=root, model_client=supported_client())
    with TestClient(app) as client:
        response = client.post("/api/v1/analyze/stream", json=REQUEST.model_dump())
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-accel-buffering"] == "no"
    events = frames(response.text)
    assert [name for name, _ in events] == ["activity"] * 6 + ["result"]
    result = AnalyzeResponse.model_validate(events[-1][1])
    assert result.status == "success"
    assert {c.path for c in result.citations} == {PUBLIC_PREFIX + PATH}
    assert all(value is not None for _, event in events[:-1] for value in event.values())
    assert "Check the name" not in json.dumps(events[:-1])


@pytest.mark.parametrize(
    "gate, status, code",
    [
        ("config", 503, "model_not_configured"),
        ("corpus", 503, "knowledge_unavailable"),
        ("language", 422, "language_disabled"),
        ("schema", 422, "invalid_request"),
        ("body", 413, "request_too_large"),
        ("service", 503, "service_unavailable"),
    ],
)
def test_stream_reuses_normal_preflight_gates(root, settings, gate, status, code):
    client_model = FakeClient()
    if gate == "config":
        settings = Settings(_env_file=None)
    if gate == "language":
        settings.supported_languages = ["en"]
    app = main.create_app(settings, knowledge_root=root, model_client=client_model)
    request = {"text": REQUEST.text}
    if gate == "language":
        request["language"] = "hi"
    if gate == "schema":
        request["unknown"] = REQUEST.text
    if gate == "body":
        request["text"] = "x" * 33000
    if gate == "service":
        # Service gate is after real corpus gate, so explicitly mark structural readiness only.
        from unittest.mock import patch

        import backend.knowledge_readiness as readiness

        with patch.object(
            main,
            "check_corpus",
            return_value=readiness.CorpusStatus(
                index_present=True,
                structure_ready=True,
                missing_count=0,
                invalid_count=0,
            ),
        ):
            with TestClient(app) as client:
                app.state.analysis_service = None
                response = client.post("/api/v1/analyze/stream", json=request)
    else:
        with TestClient(app) as client:
            response = client.post("/api/v1/analyze/stream", json=request)
    assert response.status_code == status
    assert response.json()["error"]["code"] == code
    assert response.headers["content-type"].startswith("application/json")
    assert REQUEST.text not in response.text
    assert client_model.calls == []


@pytest.mark.parametrize(
    "failure,code",
    [
        (RuntimeError("PRIVATE-EXCEPTION"), "analysis_failed"),
        (AnalysisError("analysis_timeout", "Analysis timed out.", 504), "analysis_timeout"),
        (
            AnalyzeResponse(status="unsupported", language="hi", warnings=["सीमित जानकारी"]),
            "invalid_model_output",
        ),
        (AnalyzeResponse.model_construct(status="success", language="en"), "analysis_failed"),
    ],
)
async def test_stream_terminal_failure_is_sanitized_and_validated(failure, code):
    class Broken:
        async def analyze(self, request, *, activity):
            activity(AnalysisActivity(phase="thinking", turn=1))
            if isinstance(failure, BaseException):
                raise failure
            return failure

    events = frames(b"".join([chunk async for chunk in main._analysis_events(Broken(), REQUEST)]))
    assert [name for name, _ in events] == ["activity", "result"]
    result = AnalyzeResponse.model_validate(events[-1][1])
    assert result.status == "error" and result.error.code == code
    assert result.language == "en"
    assert "PRIVATE" not in repr(events)


def test_sse_json_multiline_cannot_inject_frames():
    text = 'Unknown\n\nevent: activity\ndata: {"phase":"reading"}\r\n'
    response = AnalyzeResponse(
        status="error", language="en", error={"code": "analysis_failed", "message": text}
    )
    decoded = frames(main._sse("result", response))
    assert decoded == [("result", response.model_dump())]


async def test_maximum_host_work_and_transport_overflow_are_bounded(root):
    events = []
    calls = [read_call(str(i)) for i in range(12)]
    with pytest.raises(AnalysisError):
        await AnalysisService(FakeClient(tool_result(*calls)), root).analyze(
            REQUEST,
            activity=events.append,
        )
    assert len([event for event in events if event.phase == "reading"]) == 12
    assert len(events) <= 36
    stopped = asyncio.Event()

    class Overflow:
        async def analyze(self, request, *, activity):
            try:
                for _ in range(MAX_ACTIVITY_EVENTS + 5):
                    activity(AnalysisActivity(phase="thinking", turn=1))
                await asyncio.Event().wait()
            finally:
                stopped.set()

    chunks = await asyncio.wait_for(_collect(main._analysis_events(Overflow(), REQUEST)), 1)
    assert stopped.is_set()
    parsed = frames(b"".join(chunks))
    assert parsed[-1][0] == "result"
    assert parsed[-1][1]["error"]["code"] == "budget_exhausted"
    assert len(parsed) <= MAX_ACTIVITY_EVENTS + 1


async def _collect(iterator):
    return [chunk async for chunk in iterator]


@pytest.mark.parametrize("mode", ["disconnect", "send_failure", "task_cancel"])
@pytest.mark.parametrize("spec", ["2.0", "2.4"])
async def test_stream_cancels_provider_and_closes_tools_without_orphans(
    root, monkeypatch, mode, spec
):
    started, stopped = asyncio.Event(), asyncio.Event()
    closed = []
    original_close = KnowledgeFiles.close

    def close(tools):
        original_close(tools)
        closed.append(tools)

    monkeypatch.setattr(KnowledgeFiles, "close", close)

    class Waiting(FakeClient):
        async def complete(self, *args, **kwargs):
            started.set()
            try:
                await asyncio.Event().wait()
            finally:
                # Joining must complete async provider cleanup, not just request cancellation.
                await asyncio.sleep(0)
                stopped.set()

    service = AnalysisService(Waiting(), root)
    response = main.AnalysisStreamingResponse(main._analysis_events(service, REQUEST))
    sent = []

    async def receive():
        if mode == "disconnect":
            await started.wait()
            return {"type": "http.disconnect"}
        await asyncio.Event().wait()

    async def send(message):
        sent.append(message)
        if mode == "send_failure" and message["type"] == "http.response.body":
            await started.wait()
            raise OSError("PRIVATE-TRANSPORT")

    scope = {"type": "http", "asgi": {"spec_version": spec}}
    task = asyncio.create_task(response(scope, receive, send))
    if mode == "task_cancel":
        await started.wait()
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
    else:
        await asyncio.wait_for(task, 1)
    assert stopped.is_set()
    assert len(closed) == 1 and closed[0]._root_fd == -1
    count = len(sent)
    await asyncio.sleep(0)
    assert len(sent) == count


async def test_activity_is_streamed_before_provider_finishes(root):
    started = asyncio.Event()
    release = asyncio.Event()

    class Waiting(FakeClient):
        async def complete(self, *args, **kwargs):
            started.set()
            await release.wait()
            return text_result(ABSTAIN)

    iterator = main._analysis_events(AnalysisService(Waiting(), root), REQUEST)
    assert frames(await anext(iterator))[0][1]["phase"] == "reading"
    assert frames(await anext(iterator))[0][1]["phase"] == "thinking"
    assert started.is_set() and not release.is_set()
    release.set()
    rest = frames(b"".join(await _collect(iterator)))
    assert [event[0] for event in rest] == ["activity", "result"]


async def test_concurrent_activity_callbacks_are_request_local(root):
    a, b = [], []
    service = AnalysisService(Mock(), root)

    # A shared reusable client responds independently to either request without storing callbacks.
    class Client(FakeClient):
        async def complete(self, *args, **kwargs):
            await asyncio.sleep(0)
            return text_result(ABSTAIN)

    service.client = Client()
    await asyncio.gather(
        service.analyze(REQUEST, activity=a.append), service.analyze(REQUEST, activity=b.append)
    )
    assert [e.phase for e in a] == ["reading", "thinking", "validating"]
    assert a == b and all(x is not y for x, y in zip(a, b, strict=True))
