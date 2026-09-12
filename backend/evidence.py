"""Provenance validation only: this does NOT verify that a claim is supported."""

import re
from collections.abc import Iterable, Mapping
from secrets import token_hex
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict


class EvidenceError(ValueError):
    pass


class EvidenceEntry(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    evidence_id: str
    path: str
    record_id: str | None = None
    heading: str | None = None
    headings: tuple[str, ...] = ()
    start_line: int
    end_line: int
    start_column: int = 0
    end_column: int = 0
    text: str
    source_urls: tuple[str, ...] = ()


_URL = re.compile(r"https?://[^\s<>\"'`]+", re.IGNORECASE)


def read_urls(text: str) -> tuple[str, ...]:
    """Extract literal HTTP(S) links from returned text, never fetch them.

    Reject credentials and invalid authorities. Link presence is not authority.
    An incomplete URL at a paginated boundary is excluded by the caller.
    """
    urls = []
    for match in _URL.finditer(text):
        url = match.group().rstrip(".,;:!?")
        for closing, opening in ((")", "("), ("]", "["), ("}", "{")):
            while url.endswith(closing) and url.count(closing) > url.count(opening):
                url = url[:-1]
        try:
            parts = urlsplit(url)
            host = parts.hostname
            port = parts.port
            if not host or parts.username is not None or parts.password is not None:
                continue
            if any(ord(c) < 33 or c == "\\" for c in url):
                continue
            if port is not None and not 0 < port <= 65535:
                continue
        except ValueError:
            continue
        if url not in urls:
            urls.append(url)
    return tuple(urls)


class EvidenceLedger:
    """Request-local canonical snapshots. There is deliberately no public add API.

    Frozen return objects are detached from internal serialized snapshots, so
    even Pydantic model_copy(update=...) or object.__setattr__ cannot alter the
    host's canonical evidence. This is a model-data boundary, not a Python sandbox.
    """

    def __init__(self):
        self.__entries: dict[str, str] = {}
        self.__nonce = token_hex(8)

    def _next_id(self) -> str:
        return f"ev-{self.__nonce}-{len(self.__entries) + 1}"

    def _commit_read(self, entry: EvidenceEntry) -> None:
        # Internal tool callback, never exposed as a model tool.
        if entry.evidence_id != self._next_id():
            raise EvidenceError("Invalid evidence registration.")
        self.__entries[entry.evidence_id] = entry.model_dump_json()

    def get(self, evidence_id: str) -> EvidenceEntry:
        if not isinstance(evidence_id, str) or evidence_id not in self.__entries:
            raise EvidenceError("Unknown evidence ID.")
        return EvidenceEntry.model_validate_json(self.__entries[evidence_id])

    def validate_ids(self, evidence_ids: Iterable[str]) -> tuple[EvidenceEntry, ...]:
        if isinstance(evidence_ids, (str, bytes)):
            raise EvidenceError("Evidence IDs must be a collection.")
        return tuple(self.get(item) for item in evidence_ids)

    def validate_citation(self, citation: Mapping | BaseModel) -> EvidenceEntry:
        """Require ID and compare every supplied field against the read snapshot.

        Metadata may be omitted (the host resolves it), never changed or added.
        Lists and tuples are equivalent for tuple fields; unknown keys fail closed.
        """
        values = citation.model_dump() if isinstance(citation, BaseModel) else dict(citation)
        if "id" in values:
            alias = values.pop("id")
            if "evidence_id" in values and values["evidence_id"] != alias:
                raise EvidenceError("Conflicting evidence IDs.")
            values["evidence_id"] = alias
        entry = self.get(values.get("evidence_id"))
        canonical = entry.model_dump()
        for key, value in values.items():
            if key not in canonical:
                raise EvidenceError("Unknown citation metadata.")
            expected = canonical[key]
            if isinstance(expected, tuple) and isinstance(value, list):
                value = tuple(value)
            if value != expected or (isinstance(expected, int) and type(value) is not int):
                raise EvidenceError("Citation metadata differs from evidence read.")
        return entry

    @property
    def entries(self) -> tuple[EvidenceEntry, ...]:
        return tuple(self.get(key) for key in self.__entries)
