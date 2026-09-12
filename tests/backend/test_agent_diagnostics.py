"""Offline, synthetic diagnostics acceptance; no provider/source requests."""

import asyncio
import json
from dataclasses import FrozenInstanceError, asdict
from types import SimpleNamespace

import pytest
from test_agent import (
    FakeClient,
    payload,
    read_call,
    read_ids,
    supported_client,
    text_result,
    tool_result,
)
from test_agent import root as root  # Reuse the synthetic knowledge fixture.

from backend.agent import AnalysisError, AnalysisService
from backend.agent.diagnostics import AnalysisDiagnostic, AnalysisOutcome, AnalysisPhase
from backend.agent.models import TOOLS
from backend.agent.service import _prompt
from backend.api.schemas import AnalyzeRequest
from backend.llm import LLMError
from backend.tools.budget import Budget, BudgetLimits
from backend.tools.knowledge_files import KnowledgeFiles

REQUEST = AnalyzeRequest(text="PRIVATE-SYNTHETIC-REQUEST")


async def test_success_shape_immutable_accounting_and_disabled_default(root):
    events = []
    client = supported_client()
    service = AnalysisService(client, root)
    result = await service.analyze(REQUEST, diagnostics=events.append)
    assert result.status == "success"
    assert [e.phase for e in events] == [
        AnalysisPhase.START,
        AnalysisPhase.INDEX_READ,
        AnalysisPhase.MODEL_START,
        AnalysisPhase.MODEL_COMPLETE,
        AnalysisPhase.TOOL_COMPLETE,
        AnalysisPhase.TOOL_COMPLETE,
        AnalysisPhase.MODEL_START,
        AnalysisPhase.MODEL_COMPLETE,
        AnalysisPhase.VALIDATION,
        AnalysisPhase.TERMINAL,
    ]
    assert all(isinstance(e, AnalysisDiagnostic) for e in events)
    assert events[-1].outcome == AnalysisOutcome.SUCCESS
    assert all(e.outcome is None for e in events[:-1])
    assert asdict(events[0].usage) == dict.fromkeys(asdict(events[0].usage), 0)
    assert events[-1].usage.tool_calls == 3
    assert events[-1].usage.files == 2
    assert events[-1].usage.model_turns == 2
    assert events[-1].usage.model_output_tokens == 180
    assert events[-1].usage.output_tokens == events[-1].usage.output_bytes > 0
    assert events[-1].usage.retries == 0
    for previous, event in zip(events, events[1:]):
        assert event.elapsed_seconds >= previous.elapsed_seconds
        assert 0 <= event.remaining_seconds <= previous.remaining_seconds
        for name, count in asdict(previous.usage).items():
            assert getattr(event.usage, name) >= count
    starts = [e for e in events if e.phase == AnalysisPhase.MODEL_START]
    for event, (_, _, kwargs) in zip(starts, client.calls, strict=True):
        assert event.call_timeout_seconds == kwargs["timeout_seconds"]
        assert event.model_token_allowance == kwargs["max_output_tokens"]
    assert [e.reported_output_tokens for e in events if e.phase == "model_complete"] == [30, 150]
    assert set(asdict(events[0])) == {
        "phase",
        "elapsed_seconds",
        "remaining_seconds",
        "call_timeout_seconds",
        "model_token_allowance",
        "reported_output_tokens",
        "usage",
        "outcome",
    }
    assert set(asdict(events[0].usage)) == {
        "tool_calls",
        "files",
        "output_bytes",
        "output_tokens",
        "model_turns",
        "model_output_tokens",
        "retries",
    }
    serialized = json.dumps([asdict(e) for e in events])
    for private in [REQUEST.text, str(root), "reasons/", "README.md", "https://", "evidence_id"]:
        assert private not in serialized
    with pytest.raises(FrozenInstanceError):
        events[-1].outcome = AnalysisOutcome.CANCELLED
    with pytest.raises(FrozenInstanceError):
        events[-1].usage.tool_calls = 99
    assert not hasattr(events[-1], "__dict__")
    assert not hasattr(events[-1].usage, "__dict__")
    assert not hasattr(service, "diagnostics")
    baseline = await AnalysisService(supported_client(), root).analyze(REQUEST)
    # Evidence IDs are request-local; compare the public field shape, not generated IDs.
    assert set(baseline.model_dump()) == set(result.model_dump())
    assert "diagnostics" not in result.model_dump_json()


@pytest.mark.parametrize(
    "failure, outcome",
    [
        (
            RuntimeError("PRIVATE-EXCEPTION https://secret.invalid/key"),
            AnalysisOutcome.ANALYSIS_FAILED,
        ),
        (LLMError("auth"), AnalysisOutcome.MODEL_UNAVAILABLE),
        (LLMError("timeout"), AnalysisOutcome.ANALYSIS_TIMEOUT),
        (TimeoutError("PRIVATE-TIMEOUT"), AnalysisOutcome.ANALYSIS_TIMEOUT),
    ],
)
async def test_failures_are_terminal_sanitized_and_not_retried(root, failure, outcome, caplog):
    events = []
    client = FakeClient(failure)
    with pytest.raises(AnalysisError) as error:
        await AnalysisService(client, root).analyze(REQUEST, diagnostics=events.append)
    assert error.value.code == outcome.value
    assert error.value.__context__ is None
    assert len(client.calls) == 1
    assert events[-1].outcome == outcome
    assert events[-1].phase == AnalysisPhase.TERMINAL
    assert sum(e.phase == AnalysisPhase.TERMINAL for e in events) == 1
    assert "PRIVATE" not in repr(events) + caplog.text
    assert "secret.invalid" not in repr(events) + caplog.text


@pytest.mark.parametrize(
    "limits, missing, outcome",
    [
        (BudgetLimits(tool_calls=1), False, AnalysisOutcome.BUDGET_EXHAUSTED),
        (None, True, AnalysisOutcome.KNOWLEDGE_UNAVAILABLE),
    ],
)
async def test_early_and_tool_budget_failure(root, limits, missing, outcome):
    events = []
    with pytest.raises(AnalysisError):
        await AnalysisService(
            supported_client(), root / "missing" if missing else root, limits
        ).analyze(REQUEST, diagnostics=events.append)
    assert events[-1].outcome == outcome
    assert events[-1].usage.model_turns == (0 if missing else 1)


async def test_repair_accounted_and_unknown_usage_stays_unknown(root):
    events = []
    no_usage = text_result({}).model_copy(update={"usage": None})
    client = FakeClient(no_usage, text_result({}))
    with pytest.raises(AnalysisError):
        await AnalysisService(client, root).analyze(REQUEST, diagnostics=events.append)
    complete = [e for e in events if e.phase == AnalysisPhase.MODEL_COMPLETE]
    assert complete[0].reported_output_tokens is None
    assert complete[0].usage.model_output_tokens == len(no_usage.message.model_dump_json().encode())
    assert events[-1].outcome == AnalysisOutcome.INVALID_MODEL_OUTPUT
    assert events[-1].usage.retries == 1
    assert sum(e.phase == AnalysisPhase.REPAIR for e in events) == 1


@pytest.mark.parametrize(
    "callback_failure", [RuntimeError("PRIVATE-OBSERVER"), asyncio.CancelledError()]
)
async def test_failing_observer_does_not_change_analysis(root, callback_failure, caplog):
    events = []

    def observer(event):
        events.append(event)
        raise callback_failure

    assert (
        await AnalysisService(supported_client(), root).analyze(REQUEST, diagnostics=observer)
    ).status == "success"
    assert events[-1].outcome == AnalysisOutcome.SUCCESS
    assert "PRIVATE-OBSERVER" not in caplog.text


async def test_accidental_async_observer_is_not_scheduled(root):
    called = []

    async def observer(event):
        called.append(event)

    assert (
        await AnalysisService(supported_client(), root).analyze(REQUEST, diagnostics=observer)
    ).status == "success"
    await asyncio.sleep(0)
    assert not called


async def test_cancellation_survives_failing_terminal_observer_and_closes_tools(root, monkeypatch):
    started = asyncio.Event()
    closed = []
    original_close = KnowledgeFiles.close
    events = []

    def close(tools):
        original_close(tools)
        closed.append(tools)

    monkeypatch.setattr(KnowledgeFiles, "close", close)

    class WaitingClient(FakeClient):
        async def complete(self, *args, **kwargs):
            started.set()
            await asyncio.Event().wait()

    def observer(event):
        events.append(event)
        raise RuntimeError("PRIVATE-OBSERVER")

    task = asyncio.create_task(
        AnalysisService(WaitingClient(), root).analyze(REQUEST, diagnostics=observer)
    )
    await started.wait()
    task.cancel("PRIVATE-CANCELLATION")
    with pytest.raises(asyncio.CancelledError):
        await task
    assert events[-1].outcome == AnalysisOutcome.CANCELLED
    assert "PRIVATE" not in repr(events)
    assert len(closed) == 1 and closed[0]._root_fd == -1
    snapshot = tuple(events)
    await asyncio.sleep(0)
    assert tuple(events) == snapshot


async def test_concurrent_requests_do_not_share_observers_or_budgets(root):
    ready = asyncio.Event()
    count = 0

    class SharedClient(FakeClient):
        async def complete(self, *args, **kwargs):
            nonlocal count
            count += 1
            if count == 2:
                ready.set()
            await ready.wait()
            return text_result({"status": "unsupported", "language": "en", "warnings": ["Unknown"]})

    service = AnalysisService(SharedClient(), root)
    first, second = [], []
    await asyncio.gather(
        service.analyze(REQUEST, diagnostics=first.append),
        service.analyze(REQUEST, diagnostics=second.append),
    )
    assert [e.phase for e in first] == [e.phase for e in second]
    assert first[-1].usage == second[-1].usage
    assert first[-1].usage.tool_calls == 1
    assert first[-1].usage.model_turns == 1
    assert all(a is not b and a.usage is not b.usage for a, b in zip(first, second, strict=True))
    before = tuple(first + second)
    await service.analyze(REQUEST)
    assert tuple(first + second) == before


async def test_delayed_final_call_times_out_without_retry_with_shrinking_deadline(
    root, monkeypatch
):
    events = []
    now = [0.0]
    # One budget clock, shared by all turns; advance only between calls, not by sleeping.
    monkeypatch.setattr(
        "backend.agent.service.Budget", lambda limits: Budget(limits, clock=lambda: now[0])
    )
    clock = SimpleNamespace(monotonic=lambda: now[0])
    monkeypatch.setattr("backend.agent.service.time", clock)
    monkeypatch.setattr("backend.agent.diagnostics.time", clock)

    class DelayedClient(FakeClient):
        async def complete(self, messages, tools, **kwargs):
            self.calls.append((list(messages), tools, kwargs))
            if len(self.calls) == 1:
                now[0] = 0.95
                return tool_result(read_call("fix"), read_call("sources", "Sources"))
            await asyncio.Event().wait()

    client = DelayedClient()
    client.config.timeout_seconds = 0.8
    with pytest.raises(AnalysisError) as error:
        await AnalysisService(client, root, BudgetLimits(request_seconds=1)).analyze(
            REQUEST, diagnostics=events.append
        )
    assert error.value.code == "analysis_timeout"
    assert len(client.calls) == 2
    assert client.calls[0][2]["timeout_seconds"] == 0.8
    assert client.calls[1][2]["timeout_seconds"] == pytest.approx(0.05)
    assert events[-1].outcome == AnalysisOutcome.ANALYSIS_TIMEOUT
    assert events[-1].usage.retries == 0
    assert events[-1].usage.model_output_tokens == 30


async def test_expired_final_result_is_not_validated_or_retried(root, monkeypatch):
    now = [0.0]
    monkeypatch.setattr(
        "backend.agent.service.Budget", lambda limits: Budget(limits, clock=lambda: now[0])
    )
    events = []

    def final(history):
        now[0] = 31
        return text_result(payload(read_ids(history)))

    client = supported_client(final=final)
    with pytest.raises(AnalysisError) as error:
        await AnalysisService(client, root).analyze(REQUEST, diagnostics=events.append)
    assert error.value.code == "budget_exhausted"
    assert len(client.calls) == 2
    assert events[-1].usage.retries == 0
    assert not any(e.phase == AnalysisPhase.VALIDATION for e in events)


async def test_observer_cannot_start_provider_after_consuming_deadline(root, monkeypatch):
    now = [0.0]
    monkeypatch.setattr(
        "backend.agent.service.Budget", lambda limits: Budget(limits, clock=lambda: now[0])
    )
    client = supported_client()
    events = []

    def observer(event):
        events.append(event)
        if event.phase == AnalysisPhase.MODEL_START:
            now[0] = 31

    with pytest.raises(AnalysisError) as error:
        await AnalysisService(client, root).analyze(REQUEST, diagnostics=observer)
    assert error.value.code == "budget_exhausted"
    assert client.calls == []
    assert events[-1].outcome == AnalysisOutcome.BUDGET_EXHAUSTED


async def test_model_token_allowance_shrinks_across_retrieval_and_final(root):
    events = []
    client = supported_client()
    result = await AnalysisService(client, root, BudgetLimits(model_output_tokens=200)).analyze(
        REQUEST, diagnostics=events.append
    )
    assert result.status == "success"
    starts = [event for event in events if event.phase == AnalysisPhase.MODEL_START]
    assert [event.model_token_allowance for event in starts] == [200, 170]
    assert [call[2]["max_output_tokens"] for call in client.calls] == [200, 170]
    assert events[-1].usage.model_output_tokens == 180


def test_prompt_and_tool_description_match_host_clamp():
    assert "12 KiB" not in _prompt(REQUEST)
    assert "3072 UTF-8 text bytes" in _prompt(REQUEST)
    description = next(tool.description for tool in TOOLS if tool.name == "read_file")
    assert "clamps every read to at most 3072" in description
    assert "Defaults" not in description
