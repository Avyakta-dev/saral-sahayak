"""Opt-in public progress, separate from identifier-free diagnostics.

Only the host calls this emitter after real work. No excerpts, tool arguments,
provider messages, user data, persistence or additional work are permitted.
"""

import asyncio
import unicodedata
from collections.abc import Callable
from inspect import iscoroutine
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from backend.evidence import EvidenceEntry

PUBLIC_PREFIX = "references/knowledge/epfo/"
MAX_ACTIVITY_EVENTS = 128


def _safe_text(value: str) -> bool:
    return not any(unicodedata.category(char).startswith("C") for char in value)


class AnalysisActivity(BaseModel):
    """Immutable allowlisted metadata; never a model-authored event."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    phase: Literal["thinking", "reading", "searching", "validating"]
    turn: int | None = Field(default=None, ge=1, le=1_000_000)
    path: str | None = Field(default=None, max_length=1100)
    heading: str | None = Field(default=None, max_length=1024)
    start_line: int | None = Field(default=None, ge=1)
    end_line: int | None = Field(default=None, ge=1)

    @field_validator("path")
    @classmethod
    def public_markdown(cls, value: str | None) -> str | None:
        if value is None:
            return value
        parts = value.removeprefix(PUBLIC_PREFIX).split("/")
        if (
            not value.startswith(PUBLIC_PREFIX)
            or not value.endswith(".md")
            or not _safe_text(value)
            or "\\" in value
            or any(char in value for char in ":%?#")
            or any(not part or part.startswith(".") for part in parts)
            or len(value.encode("utf-8")) > 1100
        ):
            raise ValueError("Activity requires a canonical public Markdown path.")
        return value

    @field_validator("heading")
    @classmethod
    def bounded_heading(cls, value: str | None) -> str | None:
        if value is not None and (
            not value.strip() or not _safe_text(value) or len(value.encode("utf-8")) > 1024
        ):
            raise ValueError("Activity heading is unsafe or oversized.")
        return value

    @model_validator(mode="after")
    def phase_fields(self):
        if self.phase == "reading":
            if self.path is None or self.start_line is None or self.end_line is None:
                raise ValueError("Read activity requires actual path and line range.")
            if self.end_line < self.start_line:
                raise ValueError("Invalid read range.")
        elif any(
            value is not None for value in (self.path, self.heading, self.start_line, self.end_line)
        ):
            raise ValueError("Only read activity includes evidence metadata.")
        return self


ActivityObserver = Callable[[AnalysisActivity], None]


class RequestActivity:
    """Request-local synchronous observer. Callback failure cannot affect analysis.

    Callbacks must be fast/nonblocking, never schedule work or cancel the service.
    Accidental returned coroutines are closed, not awaited or scheduled. Normal
    task cancellation is still delivered at the service's await boundaries.
    """

    def __init__(self, observer: ActivityObserver):
        self._observer = observer

    def emit(self, phase: str, *, turn: int | None = None, entry: EvidenceEntry | None = None):
        try:
            fields = {"phase": phase, "turn": turn}
            if entry is not None:
                # Metadata comes from the immutable ledger, never requested arguments.
                fields.update(
                    path=entry.path,
                    heading=entry.heading,
                    start_line=entry.start_line,
                    end_line=entry.end_line,
                )
                try:
                    AnalysisActivity.bounded_heading(entry.heading)
                except ValueError:
                    fields["heading"] = None  # Do not fabricate or truncate a section title.
            event = AnalysisActivity.model_validate(fields)
            result = self._observer(event)
            if iscoroutine(result):
                result.close()
        except (Exception, asyncio.CancelledError):
            pass
