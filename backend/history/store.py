"""Bounded in-process lifecycle history and opt-in exact-response cache.

History is metadata-only. Response reuse is disabled without a trusted revision scope;
when enabled it is session-separated, exact, short-lived and never loaded from disk.
This optimization is not evidence retrieval and cannot validate source/model currency.
The integration owner must bind scopes to immutable corpus/model/protocol revisions.
"""

import hashlib
import hmac
import math
import os
import re
import secrets
import stat
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path

from backend.api.schemas import AnalyzeResponse

from .models import CaseRecord

_CACHEABLE_STATUSES = frozenset({"success", "unsupported"})
_MAX_CACHE_TTL_SECONDS = 300


def validate_cache_scope(scope: str | None) -> str | None:
    """Validate only digest shape, not its currency or provenance. Never accept client input.

    The host must supply a revision digest covering its immutable public corpus, model
    configuration/version and analysis contract. No raw configuration or credentials
    belong here. None deliberately disables response caching until that wiring exists.
    """
    if scope is not None and (
        not isinstance(scope, str) or re.fullmatch(r"[0-9a-f]{64}", scope) is None
    ):
        raise ValueError("Cache scope must be a trusted SHA-256 revision digest or None")
    return scope


def fingerprint(language: str, text: str, *, key: bytes | None = None) -> str:
    """Exact (language, text) identity; case/whitespace can change the model's input.

    Store callers always use a random per-instance HMAC key, never persisted or logged.
    The optional bare SHA-256 form is for direct callers, not persisted history: this
    small question domain is enumerable and an unkeyed digest is not a privacy boundary.
    """
    message = f"{language}\n{text}".encode("utf-8")
    if key is None:
        return hashlib.sha256(message).hexdigest()
    return hmac.new(key, message, hashlib.sha256).hexdigest()


@dataclass(frozen=True)
class _CacheEntry:
    response: AnalyzeResponse
    expires_at: float


class CaseHistoryStore:
    """Live cache/history are memory-only; optional JSONL is write-only metadata.

    Restarting always starts cold. Per-instance HMAC keys never survive restart.
    Cache TTL uses monotonic time, is capped at five minutes and never slides on hits.
    TTL alone is NOT a source currency guarantee: leave scope unset unless the host
    guarantees immutable dependencies and changes the scope when any dependency changes.
    """

    def __init__(
        self,
        *,
        max_records: int = 5000,
        max_per_session: int = 200,
        persist_path: Path | None = None,
        cache_ttl_seconds: float = _MAX_CACHE_TTL_SECONDS,
    ):
        if max_records < 1 or max_per_session < 1:
            raise ValueError("Store bounds must be positive")
        if (
            isinstance(cache_ttl_seconds, bool)
            or not math.isfinite(cache_ttl_seconds)
            or not 0 < cache_ttl_seconds <= _MAX_CACHE_TTL_SECONDS
        ):
            raise ValueError("Cache TTL must be finite and within (0, 300] seconds")
        self._lock = threading.Lock()
        self._persist_lock = threading.Lock()
        self._records: OrderedDict[str, CaseRecord] = OrderedDict()
        self._by_session: dict[str, list[str]] = {}
        self._cache: OrderedDict[tuple[str, str, str, str], _CacheEntry] = OrderedDict()
        self._max_records = max_records
        self._max_per_session = max_per_session
        self._persist_path = persist_path
        self._cache_ttl_seconds = cache_ttl_seconds
        self._sequence = 0
        self._fingerprint_key = secrets.token_bytes(32)
        # Separate pseudonym key for caller-controlled session IDs in persisted metadata.
        # Session IDs partition memory; they are not authentication or a secrecy guarantee.
        self._session_id_key = secrets.token_bytes(32)

    def start(self, session_id: str, language: str, text: str) -> CaseRecord:
        now = time.time()
        with self._lock:
            self._sequence += 1
            case_id = f"{int(now * 1000):x}-{self._sequence:x}"
            record = CaseRecord(
                case_id=case_id,
                session_id=session_id,
                language=language,
                fingerprint=fingerprint(language, text, key=self._fingerprint_key),
                status="started",
                created_at=now,
                updated_at=now,
            )
            self._records[case_id] = record
            ids = self._by_session.setdefault(session_id, [])
            ids.append(case_id)
            while len(ids) > self._max_per_session:
                self._records.pop(ids.pop(0), None)
            while len(self._records) > self._max_records:
                stale_id, stale_record = self._records.popitem(last=False)
                stale_ids = self._by_session.get(stale_record.session_id)
                if stale_ids and stale_id in stale_ids:
                    stale_ids.remove(stale_id)
                    if not stale_ids:
                        del self._by_session[stale_record.session_id]
            # Do not expose the mutable internal record to callers.
            return record.model_copy()

    def mark_processing(self, case_id: str) -> None:
        with self._lock:
            record = self._records.get(case_id)
            if record is not None and record.status == "started":
                record.status = "processing"
                record.updated_at = time.time()

    def complete(
        self,
        case_id: str,
        response: AnalyzeResponse,
        *,
        from_cache: bool = False,
        cacheable: bool = True,
        cache_scope: str | None = None,
    ) -> None:
        scope = validate_cache_scope(cache_scope)
        with self._lock:
            record = self._records.get(case_id)
            if record is None or record.status in {"completed", "failed"}:
                return
            record.status = "failed" if response.status == "error" else "completed"
            record.outcome = response.status
            record.reason_id = (
                response.classification.reason_id if response.classification else None
            )
            record.from_cache = from_cache
            record.updated_at = time.time()
            snapshot = record.model_copy()
            if (
                scope is not None
                and not from_cache
                and cacheable
                and response.status in _CACHEABLE_STATUSES
                and response.language == record.language
            ):
                now = time.monotonic()
                self._expire_cache(now)
                key = (scope, record.session_id, record.language, record.fingerprint)
                self._cache[key] = _CacheEntry(
                    response.model_copy(update={"draft": None}, deep=True),
                    now + self._cache_ttl_seconds,
                )
                self._cache.move_to_end(key)
                while len(self._cache) > self._max_records:
                    self._cache.popitem(last=False)
        self._persist(snapshot)

    def fail(self, case_id: str) -> None:
        with self._lock:
            record = self._records.get(case_id)
            if record is None or record.status in {"completed", "failed"}:
                return
            record.status = "failed"
            record.updated_at = time.time()
            snapshot = record.model_copy()
        self._persist(snapshot)

    def find_cached(
        self,
        language: str,
        text: str,
        *,
        session_id: str | None = None,
        cache_scope: str | None = None,
    ) -> AnalyzeResponse | None:
        scope = validate_cache_scope(cache_scope)
        with self._lock:
            self._expire_cache(time.monotonic())
            if scope is None or not session_id:
                return None
            key = (
                scope,
                session_id,
                language,
                fingerprint(language, text, key=self._fingerprint_key),
            )
            cached = self._cache.get(key)
            if cached is not None:
                self._cache.move_to_end(key)
                return cached.response.model_copy(deep=True)
        return None

    def _expire_cache(self, now: float) -> None:
        # Caller holds _lock; bounded by max_records. Expiry is absolute, not LRU age.
        for key in [key for key, entry in self._cache.items() if now >= entry.expires_at]:
            del self._cache[key]

    def history(self, session_id: str, *, limit: int = 50) -> list[CaseRecord]:
        if limit <= 0:
            return []
        with self._lock:
            ids = list(self._by_session.get(session_id, ()))[-limit:]
            return [self._records[i].model_copy() for i in reversed(ids) if i in self._records]

    def _persist(self, record: CaseRecord) -> None:
        """Best-effort metadata append. No raw text/details/output, never restore cache.

        Refuse symlinks and nonregular/multiply-linked targets. Tighten permissions on
        the opened descriptor BEFORE writing, not on a potentially swapped path after.
        The parent directory remains trusted operator configuration, never client input.
        """
        if self._persist_path is None:
            return
        pseudonym = hmac.new(
            self._session_id_key, record.session_id.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        entry = record.model_copy(update={"session_id": pseudonym})
        data = (entry.model_dump_json() + "\n").encode("utf-8")
        with self._persist_lock:
            try:
                fd = os.open(
                    self._persist_path,
                    os.O_WRONLY | os.O_CREAT | os.O_APPEND | os.O_NOFOLLOW | os.O_NONBLOCK,
                    0o600,
                )
                try:
                    info = os.fstat(fd)
                    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
                        return
                    os.fchmod(fd, 0o600)
                    while data:
                        written = os.write(fd, data)
                        if written <= 0:
                            return
                        data = data[written:]
                finally:
                    os.close(fd)
            except OSError:
                pass
