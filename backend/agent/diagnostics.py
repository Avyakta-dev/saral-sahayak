"""Opt-in, request-local diagnostics. Never retain model, user or evidence data."""

import asyncio
import time
from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from inspect import iscoroutine

from backend.tools.budget import Budget, Usage


class AnalysisPhase(StrEnum):
    START = "start"
    INDEX_READ = "index_read"
    MODEL_START = "model_start"
    MODEL_COMPLETE = "model_complete"
    TOOL_COMPLETE = "tool_complete"
    VALIDATION = "validation"
    REPAIR = "repair"
    TERMINAL = "terminal"


class AnalysisOutcome(StrEnum):
    SUCCESS = "success"
    NEEDS_CLARIFICATION = "needs_clarification"
    UNSUPPORTED = "unsupported"
    BUDGET_EXHAUSTED = "budget_exhausted"
    KNOWLEDGE_UNAVAILABLE = "knowledge_unavailable"
    ANALYSIS_TIMEOUT = "analysis_timeout"
    MODEL_UNAVAILABLE = "model_unavailable"
    INVALID_MODEL_OUTPUT = "invalid_model_output"
    ANALYSIS_FAILED = "analysis_failed"
    CANCELLED = "cancelled"


@dataclass(frozen=True, slots=True)
class AnalysisDiagnostic:
    """A detached snapshot, not a replay trace or part of the public API schema.

    Usage includes cumulative model turns, tool calls, distinct file count, tool
    output bytes/tokens, model output tokens and retries, as charged by Budget.
    Uncharged/unfinished output is not estimated. No identifiers are included.
    Timing starts at request entry; remaining time is clamped to zero, even on
    failure. call_timeout_seconds is the exact allowance passed to the model on
    MODEL_START/MODEL_COMPLETE, and None for non-model phases.
    """

    phase: AnalysisPhase
    elapsed_seconds: float
    remaining_seconds: float
    call_timeout_seconds: float | None
    model_token_allowance: int | None
    reported_output_tokens: int | None
    usage: Usage
    outcome: AnalysisOutcome | None = None


DiagnosticsObserver = Callable[[AnalysisDiagnostic], None]


class RequestDiagnostics:
    """Host-only emitter; create once per analyze call and never store on service.

    Callbacks run inline and MUST be fast, synchronous and nonblocking. Their
    overhead consumes the existing request deadline; no threads, tasks, awaits
    or retries are added. Ordinary callback errors (including a callback-raised
    CancelledError) are ignored, without logging raw exceptions. Since there is
    no await here, task cancellation is delivered by the analysis loop, not by
    this callback boundary. An accidentally returned coroutine is closed, never
    awaited. Observers must not control/cancel the analysis task.
    """

    def __init__(self, observer: DiagnosticsObserver, *, started: float):
        self._observer = observer
        self._started = started

    def emit(
        self,
        budget: Budget,
        phase: AnalysisPhase,
        *,
        call_timeout_seconds: float | None = None,
        model_token_allowance: int | None = None,
        reported_output_tokens: int | None = None,
        outcome: AnalysisOutcome | None = None,
    ) -> None:
        elapsed = max(0.0, time.monotonic() - self._started)
        event = AnalysisDiagnostic(
            phase=phase,
            elapsed_seconds=elapsed,
            remaining_seconds=max(0.0, budget.limits.request_seconds - elapsed),
            call_timeout_seconds=call_timeout_seconds,
            model_token_allowance=model_token_allowance,
            reported_output_tokens=reported_output_tokens,
            usage=budget.usage,
            outcome=outcome,
        )
        try:
            result = self._observer(event)
            if iscoroutine(result):
                result.close()
        except (Exception, asyncio.CancelledError):
            pass
