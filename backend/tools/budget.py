"""Request-local resource accounting. Terminal budget errors must stop the agent."""

import json
import time
from collections.abc import Callable
from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field


class KnowledgeError(Exception):
    """Safe to expose; never contains an operating-system path or file contents."""

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)

    def to_dict(self) -> dict[str, str]:
        return {"error": self.code, "message": self.message}


class BudgetExceeded(KnowledgeError):
    def __init__(self, resource: str):
        super().__init__("budget_exhausted", f"Request {resource} budget exhausted.")


class BudgetLimits(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    tool_calls: int = Field(default=12, gt=0)
    files: int = Field(default=8, gt=0)
    list_entries: int = Field(default=50, gt=0)
    read_lines: int = Field(default=120, gt=0)
    read_bytes: int = Field(default=12 * 1024, ge=4)
    output_bytes: int = Field(default=48 * 1024, gt=0)
    output_tokens: int = Field(default=12000, gt=0)
    request_seconds: float = Field(default=30, gt=0, allow_inf_nan=False)
    call_seconds: float = Field(default=3, gt=0, allow_inf_nan=False)
    # Local-filesystem scan bounds, including heading duplicate detection.
    file_bytes: int = Field(default=2 * 1024 * 1024, gt=0)
    directory_entries: int = Field(default=4096, gt=0)
    model_turns: int = Field(default=12, gt=0)
    model_output_tokens: int = Field(default=4096, gt=0)
    retries: int = Field(default=2, ge=0)


@dataclass(frozen=True, slots=True)
class Usage:
    tool_calls: int
    files: int
    output_bytes: int
    output_tokens: int
    model_turns: int
    model_output_tokens: int
    retries: int


class Budget:
    """One instance per request, shared by all stages, not safe for concurrent use.

    Without a tokenizer, one token per UTF-8 byte is deliberately conservative.
    Serialization includes paths, cursors, evidence metadata and error envelopes.
    Model output is separate from tool output; retries also consume a tool call
    or model turn when that operation is attempted again.
    """

    def __init__(
        self,
        limits: BudgetLimits | None = None,
        *,
        clock: Callable[[], float] = time.monotonic,
        tokenizer: Callable[[str], int] | None = None,
    ):
        self.limits = limits or BudgetLimits()
        self._clock = clock
        self._tokenizer = tokenizer
        self._deadline = clock() + self.limits.request_seconds
        self._calls = self._bytes = self._tokens = 0
        self._turns = self._model_tokens = self._retries = 0
        self._files: set[str] = set()
        self._exhausted = False

    @property
    def usage(self) -> Usage:
        return Usage(
            self._calls,
            len(self._files),
            self._bytes,
            self._tokens,
            self._turns,
            self._model_tokens,
            self._retries,
        )

    def _fail(self, resource: str) -> None:
        self._exhausted = True
        raise BudgetExceeded(resource)

    def check(self, call_deadline: float | None = None) -> None:
        if self._exhausted:
            raise BudgetExceeded("resource")
        now = self._clock()
        if now >= self._deadline:
            self._fail("wall-clock")
        if call_deadline is not None and now >= call_deadline:
            self._fail("tool time")

    def begin_tool(self) -> float:
        self._calls += 1  # Includes invalid input, failed operations and retries.
        self.check()
        if self._calls > self.limits.tool_calls:
            self._fail("tool-call")
        return min(self._deadline, self._clock() + self.limits.call_seconds)

    def read_file(self, path: str) -> None:
        self.check()
        self._files.add(path)
        if len(self._files) > self.limits.files:
            self._fail("distinct-file")

    @property
    def available_text_bytes(self) -> int:
        remaining = self.limits.output_bytes - self._bytes
        if self._tokenizer is None:
            remaining = min(remaining, self.limits.output_tokens - self._tokens)
        return max(0, remaining)

    def charge_output(self, value: BaseModel | dict) -> None:
        self.check()
        if isinstance(value, BaseModel):
            text = value.model_dump_json()
        else:
            text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        size = len(text.encode("utf-8"))
        tokens = size if self._tokenizer is None else self._tokenizer(text)
        if type(tokens) is not int or tokens < 0:
            self._fail("token-accounting")
        if self._bytes + size > self.limits.output_bytes:
            self._fail("output-byte")
        if self._tokens + tokens > self.limits.output_tokens:
            self._fail("output-token")
        self._bytes += size
        self._tokens += tokens

    def remaining_seconds(self) -> float:
        """Return the live request deadline allowance; never reset the clock."""
        self.check()
        return max(0.0, self._deadline - self._clock())

    def model_token_allowance(self, ceiling: int | None = None) -> int:
        """Remaining cumulative model output, optionally capped by the provider."""
        self.check()
        if ceiling is not None and (type(ceiling) is not int or ceiling <= 0):
            raise ValueError("ceiling must be a positive integer")
        remaining = self.limits.model_output_tokens - self._model_tokens
        if remaining <= 0:
            self._fail("model-output")
        return remaining if ceiling is None else min(remaining, ceiling)

    def begin_model_turn(self) -> None:
        self._turns += 1
        self.check()
        if self._turns > self.limits.model_turns:
            self._fail("model-turn")

    def charge_model_output(self, text: str, *, tokens: int | None = None) -> None:
        self.check()
        if tokens is not None and (type(tokens) is not int or tokens < 0):
            raise ValueError("tokens must be a nonnegative integer")
        count = len(text.encode("utf-8")) if tokens is None else tokens
        self._model_tokens += count
        if self._model_tokens > self.limits.model_output_tokens:
            self._fail("model-output")

    def retry(self) -> None:
        self._retries += 1
        self.check()
        if self._retries > self.limits.retries:
            self._fail("retry")
