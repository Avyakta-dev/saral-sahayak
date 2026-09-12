"""Read-only structural readiness, never policy/content verification.

Only the fixed 186 Markdown paths are inspected. No links are followed, no
content is returned, and no model, network, configuration or cache is involved.
Use local filesystems: byte bounds cannot interrupt a blocked kernel syscall.
"""

import os
import re
import stat
from dataclasses import dataclass
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from backend.evidence import read_urls
from backend.tools.budget import KnowledgeError
from backend.tools.knowledge_files import _DIR_FLAGS, _FILE_FLAGS, _fingerprint, _open_root

_FILE_BYTES = 2 * 1024 * 1024
_TOTAL_BYTES = 16 * 1024 * 1024
_DOCS = (
    "README.md",
    "sources.md",
    "glossary.md",
    "claim-types-overview.md",
    "resolution-playbooks.md",
)
_IDS = tuple(f"epfo-rr-{number:03}" for number in range(1, 182))
_EXPECTED_LINKS = frozenset(f"reasons/{record_id}.md" for record_id in _IDS)
_HEADING = re.compile(r"^ {0,3}#{1,6}[ \t]+(.+?)\s*$")
# Deliberately simple inline Markdown links, not absolute/normalized aliases.
# Bound labels and exclude nested brackets to avoid pathological backtracking.
_LINK = re.compile(r"(?<!!|\\)\[[^\[\]\n]{1,1024}\]\((reasons/epfo-rr-[0-9]{3}\.md)\)")
_RECORD_ID = re.compile(r"(?<![\w-])epfo-rr-[0-9]{3}(?![\w-])")
_URL = re.compile(r"https?://[^\s<>\"'`]+", re.IGNORECASE)


class CorpusStatus(BaseModel):
    """Counts are per required file, not per structural defect.

    An uninspectable root contributes one invalid root, with file counts unknown
    (missing_count=0). Otherwise missing_count counts absent required files;
    invalid_count counts unsafe, unreadable, malformed or budget-unchecked files.
    A malformed index counts once, irrespective of how many links it lacks.
    index_present means README was safely opened as a regular file, not valid.
    None of these fields attest to knowledge correctness or source verification.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    index_present: bool
    structure_ready: bool
    missing_count: int = Field(ge=0)
    invalid_count: int = Field(ge=0)


@dataclass
class _ScanBudget:
    remaining: int = _TOTAL_BYTES


def _read(directory: int, name: str, budget: _ScanBudget) -> tuple[bool, bool, str | None]:
    """Return (regular file opened, missing, complete bounded UTF-8 text)."""
    present = False
    try:
        fd = os.open(name, _FILE_FLAGS, dir_fd=directory)
    except FileNotFoundError:
        return False, True, None
    except OSError:
        return False, False, None
    try:
        info = os.fstat(fd)
        present = stat.S_ISREG(info.st_mode)
        if not present or not 0 < info.st_size <= min(_FILE_BYTES, budget.remaining):
            return present, False, None
        chunks = []
        remaining = info.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 64 * 1024))
            budget.remaining -= len(chunk)
            if not chunk:
                return present, False, None
            chunks.append(chunk)
            remaining -= len(chunk)
        # Read exactly the original size, then reject changed/growing files.
        # There is no extra EOF byte that could exceed the aggregate byte cap.
        if _fingerprint(os.fstat(fd)) != _fingerprint(info):
            return present, False, None
        return present, False, b"".join(chunks).decode("utf-8")
    except (OSError, UnicodeError):
        return present, False, None
    finally:
        os.close(fd)


def _markdown(text: str) -> tuple[bool, str]:
    """Find a nonblank ATX heading outside fenced examples; no heading schema."""
    lines = []
    heading = False
    fence = None
    for line in text.splitlines():
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
        if fence:
            if (
                marker
                and marker[1][0] == fence[0]
                and len(marker[1]) >= len(fence)
                and not marker[2].strip()
            ):
                fence = None
            continue
        if marker:
            fence = marker[1]
            continue
        match = _HEADING.match(line)
        if match:
            title = re.sub(r"[ \t]+#+[ \t]*$", "", match[1]).strip()
            heading |= bool(title and title.strip("#"))
        lines.append(line)
    return heading, "\n".join(lines)


def _has_source(text: str) -> bool:
    for match in _URL.finditer(text):
        # Check one candidate at a time, avoiding read_urls' all-URL dedup cost.
        # Oversized tokens are not accepted as truncated, fabricated URLs.
        if len(match[0]) <= 8192 and read_urls(match[0]):
            return True
    return False


def _valid(text: str | None, *, index: bool = False, record_id: str | None = None) -> bool:
    if text is None or "\x00" in text:
        return False
    heading, prose = _markdown(text)
    if not heading:
        return False
    if index:
        return _EXPECTED_LINKS <= {match[1] for match in _LINK.finditer(prose)}
    if record_id is not None:
        return any(match[0] == record_id for match in _RECORD_ID.finditer(prose)) and _has_source(
            prose
        )
    return True


def check_corpus(root: Path) -> CorpusStatus:
    """Probe structure before model calls; missing/unsafe input fails closed.

    Reuses the internal capability opener, not check-then-open path operations:
    every root ancestor and the reasons directory use O_NOFOLLOW. Every leaf is
    opened fd-relative with O_NOFOLLOW/O_NONBLOCK and checked with fstat.
    Expected records need a heading, their canonical ID and a literal valid
    HTTP(S) URL of at most 8192 characters. Global sources alone do not establish
    per-record provenance. No caveat, policy or particular heading is required.
    """
    try:
        # The shared opener closes descriptors on OSError, but a NUL raises
        # ValueError instead. Reject that input before acquiring any capability.
        if isinstance(root, Path) and "\x00" in str(root):
            raise ValueError("Invalid root")
        root_fd = _open_root(root)
    except (KnowledgeError, OSError, ValueError):
        # The shared opener deliberately sanitizes missing and unsafe roots alike.
        return CorpusStatus(
            index_present=False, structure_ready=False, missing_count=0, invalid_count=1
        )

    missing_count = invalid_count = 0
    index_present = False
    budget = _ScanBudget()
    try:
        for name in _DOCS:
            present, missing, text = _read(root_fd, name, budget)
            if name == "README.md":
                index_present = present
            if missing:
                missing_count += 1
            elif not _valid(text, index=name == "README.md"):
                invalid_count += 1
        try:
            reasons_fd = os.open("reasons", _DIR_FLAGS, dir_fd=root_fd)
        except FileNotFoundError:
            missing_count += len(_IDS)
        except OSError:
            invalid_count += len(_IDS)
        else:
            try:
                for record_id in _IDS:
                    _, missing, text = _read(reasons_fd, f"{record_id}.md", budget)
                    if missing:
                        missing_count += 1
                    elif not _valid(text, record_id=record_id):
                        invalid_count += 1
            finally:
                os.close(reasons_fd)
    finally:
        os.close(root_fd)
    return CorpusStatus(
        index_present=index_present,
        structure_ready=missing_count == invalid_count == 0,
        missing_count=missing_count,
        invalid_count=invalid_count,
    )
