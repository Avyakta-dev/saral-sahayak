"""Bounded, local, read-only Markdown tools. No runtime agent integration.

Use one context-managed KnowledgeFiles per request. Directory capabilities are
opened component-by-component with O_NOFOLLOW; no resolve/check/open race.
Local filesystem syscalls use cooperative monotonic checks (not cancellation
of an uninterruptible kernel/filesystem operation). Do not use network mounts.
"""

import os
import re
import stat
from contextlib import contextmanager
from pathlib import Path
from secrets import token_hex
from typing import Literal

from pydantic import BaseModel, ConfigDict

from backend.evidence import EvidenceEntry, EvidenceLedger, read_urls
from backend.tools.budget import Budget, BudgetExceeded, KnowledgeError


class FileEntry(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")
    path: str
    relative_path: str
    type: Literal["directory", "file"]


class ListResult(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")
    path: str
    relative_dir: str
    entries: tuple[FileEntry, ...]
    truncated: bool
    next_cursor: str | None = None


class ReadResult(EvidenceEntry):
    # Tool navigation only; the immutable ledger retains the canonical citation path.
    relative_path: str
    truncated: bool
    next_cursor: str | None = None


_DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
_FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC
_HEADING = re.compile(r"^ {0,3}(#{1,6})[ \t]+(.+?)\s*$")
_RECORD = re.compile(r"epfo-rr-(?:00[1-9]|0[1-9][0-9]|1[0-7][0-9]|180|181)\.md\Z")


def _error(code: str, message: str) -> KnowledgeError:
    return KnowledgeError(code, message)


def _parts(value: str, *, empty: bool = False) -> list[str]:
    if not isinstance(value, str) or len(value.encode("utf-8", errors="replace")) > 1024:
        raise _error("invalid_path", "Invalid relative Markdown path.")
    if value == "" and empty:
        return []
    parts = value.split("/")
    if (
        not value
        or "\\" in value
        or ":" in value
        or any(ord(c) < 32 or 0xD800 <= ord(c) <= 0xDFFF for c in value)
        or any(not p or p.startswith(".") for p in parts)
    ):
        raise _error("invalid_path", "Invalid relative Markdown path.")
    return parts


def _open_root(root: Path) -> int:
    """Open an absolute root without following even an ancestor symlink."""
    if not isinstance(root, Path) or not root.is_absolute() or root == Path(root.anchor):
        raise _error("knowledge_unavailable", "Configured knowledge root is unavailable or unsafe.")
    if any(part in (".", "..") for part in root.parts[1:]):
        raise _error("knowledge_unavailable", "Configured knowledge root is unavailable or unsafe.")
    fd = os.open(root.anchor, _DIR_FLAGS)
    try:
        for part in root.parts[1:]:
            child = os.open(part, _DIR_FLAGS, dir_fd=fd)
            os.close(fd)
            fd = child
        return fd
    except OSError:
        os.close(fd)
        raise _error(
            "knowledge_unavailable", "Configured knowledge root is unavailable or unsafe."
        ) from None


def check_knowledge_root(root: Path) -> None:
    """Readiness probe: open/close root only; never enumerate or read content."""
    os.close(_open_root(root))


def _fingerprint(info: os.stat_result) -> tuple[int, ...]:
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


class KnowledgeFiles:
    def __init__(
        self,
        root: Path,
        budget: Budget | None = None,
        citation_prefix: str = "references/knowledge/epfo",
    ):
        _parts(citation_prefix)
        self.budget = budget or Budget()
        self.citation_prefix = citation_prefix
        self.ledger = EvidenceLedger()
        self._cursors: dict[str, tuple] = {}
        self._root_fd = _open_root(root)

    def close(self) -> None:
        if self._root_fd >= 0:
            os.close(self._root_fd)
            self._root_fd = -1

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    @contextmanager
    def _call(self):
        deadline = self.budget.begin_tool()
        try:
            if self._root_fd < 0:
                raise _error("closed", "Knowledge tools are closed.")
            yield deadline
            self.budget.check(deadline)
        except BudgetExceeded:
            # Terminal exceptions are host control signals, NOT model tool output.
            raise
        except (OSError, UnicodeError):
            error = _error(
                "read_denied", "Knowledge entry is unavailable, unsafe or invalid UTF-8."
            )
            self.budget.charge_output(error.to_dict())
            raise error from None
        except KnowledgeError as error:
            self.budget.charge_output(error.to_dict())
            raise

    @contextmanager
    def _directory(self, parts: list[str], deadline: float):
        fd = os.dup(self._root_fd)
        try:
            for part in parts:
                self.budget.check(deadline)
                child = os.open(part, _DIR_FLAGS, dir_fd=fd)
                os.close(fd)
                fd = child
            yield fd
        finally:
            os.close(fd)

    def _limit(self, value: int | None, maximum: int, minimum: int = 1) -> int:
        if value is None:
            return maximum
        if type(value) is not int or not minimum <= value <= maximum:
            raise _error("invalid_limit", "Requested limit is outside the permitted bounds.")
        return value

    def _cursor(self, cursor: str, kind: str, path: str) -> tuple:
        if not isinstance(cursor, str) or cursor not in self._cursors:
            raise _error("invalid_cursor", "Unknown or incompatible continuation cursor.")
        state = self._cursors[cursor]
        if state[:2] != (kind, path):
            raise _error("invalid_cursor", "Unknown or incompatible continuation cursor.")
        return state

    def list_files(
        self, relative_dir: str = "", *, cursor: str | None = None, limit: int | None = None
    ) -> ListResult:
        with self._call() as deadline:
            parts = _parts(relative_dir, empty=True)
            limit = self._limit(limit, self.budget.limits.list_entries)
            after = ""
            if cursor is not None:
                after = self._cursor(cursor, "list", relative_dir)[2]
            entries = []
            with self._directory(parts, deadline) as fd, os.scandir(fd) as listing:
                for count, entry in enumerate(listing, 1):
                    self.budget.check(deadline)
                    if count > self.budget.limits.directory_entries:
                        raise _error(
                            "directory_too_large", "Directory exceeds the safe enumeration bound."
                        )
                    try:
                        _parts(entry.name)
                    except KnowledgeError:
                        continue
                    info = entry.stat(follow_symlinks=False)
                    kind = "directory" if stat.S_ISDIR(info.st_mode) else "file"
                    if kind == "file" and not (
                        stat.S_ISREG(info.st_mode) and entry.name.endswith(".md")
                    ):
                        continue
                    if entry.name > after:
                        entries.append((entry.name, kind))
            entries.sort()
            truncated = len(entries) > limit
            page = entries[:limit]
            next_cursor = token_hex(16) if truncated else None
            path = "/".join([self.citation_prefix, *parts])
            result = ListResult(
                path=path,
                relative_dir=relative_dir,
                entries=tuple(
                    FileEntry(
                        path=f"{path}/{name}",
                        relative_path="/".join([*parts, name]),
                        type=kind,
                    )
                    for name, kind in page
                ),
                truncated=truncated,
                next_cursor=next_cursor,
            )
            self.budget.check(deadline)
            self.budget.charge_output(result)
            if next_cursor:
                self._cursors[next_cursor] = ("list", relative_dir, page[-1][0])
            return result

    def _lines(self, stream, deadline: float):
        scanned = 0
        while True:
            self.budget.check(deadline)
            # A single huge line cannot allocate beyond the configured file cap.
            raw = stream.readline(self.budget.limits.file_bytes - scanned + 1)
            if not raw:
                return
            scanned += len(raw)
            if scanned > self.budget.limits.file_bytes:
                raise _error("file_too_large", "Markdown file exceeds the safe scan bound.")
            yield raw.decode("utf-8")

    def _headings(self, stream, deadline: float) -> tuple[list[tuple[int, int, str]], int]:
        headings = []
        fence = None
        total = 0
        for total, line in enumerate(self._lines(stream, deadline), 1):
            stripped = line.lstrip(" ") if len(line) - len(line.lstrip(" ")) <= 3 else line
            fenced = re.match(r"(`{3,}|~{3,})(.*)", stripped)
            if fence:
                if (
                    fenced
                    and fenced[1][0] == fence[0]
                    and len(fenced[1]) >= len(fence)
                    and not fenced[2].strip()
                ):
                    fence = None
                continue
            if fenced:
                fence = fenced[1]
                continue
            match = _HEADING.match(line)
            if match:
                title = re.sub(r"[ \t]+#+[ \t]*$", "", match[2]).strip()
                if len(title.encode("utf-8")) > 1024 or len(headings) >= 4096:
                    raise _error("heading_too_large", "Markdown headings exceed the safe bound.")
                headings.append((total, len(match[1]), title))
        return headings, total

    def read_file(
        self,
        relative_path: str,
        *,
        start_line: int = 1,
        heading: str | None = None,
        cursor: str | None = None,
        max_lines: int | None = None,
        max_bytes: int | None = None,
    ) -> ReadResult:
        with self._call() as deadline:
            parts = _parts(relative_path)
            if not parts[-1].endswith(".md"):
                raise _error("invalid_path", "Only regular Markdown files may be read.")
            if type(start_line) is not int or start_line < 1:
                raise _error("invalid_range", "Line numbers must be positive integers.")
            if heading is not None and (
                not isinstance(heading, str) or not heading or len(heading) > 1024
            ):
                raise _error("invalid_heading", "Heading must be an exact nonempty title.")
            max_lines = self._limit(max_lines, self.budget.limits.read_lines)
            max_bytes = self._limit(max_bytes, self.budget.limits.read_bytes, 4)
            column = 0
            previous = None
            if cursor is not None:
                state = self._cursor(cursor, "read", relative_path)
                if start_line != 1 or (heading is not None and heading != state[2]):
                    raise _error(
                        "invalid_cursor", "Continuation cannot override its selected range."
                    )
                _, _, heading, start_line, column, previous = state
            elif heading is not None and start_line != 1:
                raise _error("invalid_range", "Choose a heading or a starting line, not both.")
            path = f"{self.citation_prefix}/{relative_path}"
            with self._directory(parts[:-1], deadline) as directory:
                fd = os.open(parts[-1], _FILE_FLAGS, dir_fd=directory)
            with os.fdopen(fd, "rb") as stream:
                info = os.fstat(stream.fileno())
                if not stat.S_ISREG(info.st_mode):
                    raise _error("read_denied", "Only regular Markdown files may be read.")
                if info.st_size > self.budget.limits.file_bytes:
                    raise _error("file_too_large", "Markdown file exceeds the safe scan bound.")
                fingerprint = _fingerprint(info)
                if previous is not None and previous != fingerprint:
                    raise _error("stale_cursor", "Markdown changed; restart the read.")
                self.budget.read_file(path)
                headings, total = self._headings(stream, deadline)
                end = total
                if heading is not None:
                    matches = [h for h in headings if h[2] == heading]
                    if len(matches) != 1:
                        raise _error(
                            "ambiguous_heading" if matches else "heading_not_found",
                            "Heading is duplicated." if matches else "Heading was not found.",
                        )
                    first, level, _ = matches[0]
                    end = next(
                        (n - 1 for n, depth, _ in headings if n > first and depth <= level), total
                    )
                    if cursor is None:
                        start_line = first
                if start_line > end:
                    raise _error("invalid_range", "Requested range contains no text.")
                # Leave room for the serialized envelope; final accounting is exact.
                capacity = min(max_bytes, self.budget.available_text_bytes - 1536)
                if capacity < 4:
                    raise BudgetExceeded("output")
                stream.seek(0)
                chunks = []
                size = 0
                last_line = start_line
                last_column = column
                next_position = None
                for number, line in enumerate(self._lines(stream, deadline), 1):
                    if number < start_line:
                        continue
                    if number > end:
                        break
                    offset = column if number == start_line else 0
                    if number - start_line >= max_lines or size == capacity:
                        next_position = (number, offset)
                        break
                    remaining = line[offset:]
                    encoded = remaining.encode("utf-8")
                    piece = encoded[: capacity - size].decode("utf-8", errors="ignore")
                    if not piece:
                        next_position = (number, offset)
                        break
                    chunks.append(piece)
                    size += len(piece.encode("utf-8"))
                    last_line, last_column = number, offset + len(piece)
                    if len(piece) < len(remaining):
                        next_position = (number, last_column)
                        break
                if _fingerprint(os.fstat(stream.fileno())) != fingerprint:
                    raise _error(
                        "file_changed", "Markdown changed during the read; retry explicitly."
                    )
            text = "".join(chunks)
            if not text:
                raise _error("invalid_range", "Requested range contains no text.")
            selected = tuple(title for n, _, title in headings if start_line <= n <= last_line)
            context = heading
            if context is None:
                context = next(
                    (title for n, _, title in reversed(headings) if n <= start_line), None
                )
            # A cut URL at either boundary must not become a fabricated shorter URL.
            url_text = text
            if column:
                url_text = url_text.partition("\n")[2]
            if next_position and next_position[1]:
                url_text = url_text.rpartition("\n")[0]
            next_cursor = token_hex(16) if next_position else None
            entry = EvidenceEntry(
                evidence_id=self.ledger._next_id(),
                path=path,
                record_id=parts[-1][:-3] if _RECORD.fullmatch(parts[-1]) else None,
                heading=context,
                headings=selected,
                start_line=start_line,
                end_line=last_line,
                start_column=column,
                end_column=last_column,
                text=text,
                source_urls=read_urls(url_text),
            )
            result = ReadResult(
                **entry.model_dump(),
                relative_path=relative_path,
                truncated=bool(next_position),
                next_cursor=next_cursor,
            )
            self.budget.check(deadline)
            self.budget.charge_output(result)
            self.ledger._commit_read(entry)
            if next_cursor:
                self._cursors[next_cursor] = (
                    "read",
                    relative_path,
                    heading,
                    *next_position,
                    fingerprint,
                )
            return result
