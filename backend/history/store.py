"""Bounded, in-process lifecycle/cache store.

One instance is created per app and shared across requests (see backend.main). It is
not a database and not shared across processes; a real deployment would back it with a
small table keyed the same way (session_id, fingerprint) without changing callers - see
HistoryTrackingService, the only thing that talks to this store.

Everything here is best-effort bookkeeping for cost/latency and a "your past cases"
view. It never participates in producing an answer's content: only an exact repeat of
a (language, text) pair that this process already analyzed and validated can ever be
replayed, and the replayed object is the same validated AnalyzeResponse, unchanged
except for a freshly rebuilt draft (see HistoryTrackingService).
"""

import hashlib
import hmac
import secrets
import threading
import time
from collections import OrderedDict
from pathlib import Path

from backend.api.schemas import AnalyzeResponse

from .models import CaseRecord

# success: grounded guidance worth replaying. unsupported: a validated abstention for
# this exact input is equally safe and useful to replay. needs_clarification/error are
# request-specific (the questions or failure may not apply to a different caller) and
# are never cached.
_CACHEABLE_STATUSES = frozenset({"success", "unsupported"})


def fingerprint(language: str, text: str, *, key: bytes | None = None) -> str:
    """Stable key for a (language, text) pair.

    The EPFO question domain is small and enumerable (~181 canonical reasons across a
    few languages), so a bare hash is dictionary-attackable by anyone who later reads a
    persisted fingerprint - it is a stable identifier, not a secrecy guarantee on its
    own. CaseHistoryStore always supplies its own per-process key so an offline reader
    of a persisted log cannot reconstruct which question was asked without also holding
    that key. ``key=None`` (bare sha256) exists only for direct callers that need a pure,
    unkeyed identifier.
    """
    normalized = " ".join(text.strip().split()).casefold()
    message = f"{language}\n{normalized}".encode("utf-8")
    if key is None:
        return hashlib.sha256(message).hexdigest()
    return hmac.new(key, message, hashlib.sha256).hexdigest()


class CaseHistoryStore:
    def __init__(
        self,
        *,
        max_records: int = 5000,
        max_per_session: int = 200,
        persist_path: Path | None = None,
    ):
        if max_records < 1 or max_per_session < 1:
            raise ValueError("Store bounds must be positive")
        self._lock = threading.Lock()
        self._records: OrderedDict[str, CaseRecord] = OrderedDict()
        self._by_session: dict[str, list[str]] = {}
        self._cache: OrderedDict[tuple[str, str], AnalyzeResponse] = OrderedDict()
        self._max_records = max_records
        self._max_per_session = max_per_session
        self._persist_path = persist_path
        self._sequence = 0
        # Never persisted or logged; process-lifetime only. Nothing reads a persisted
        # fingerprint back into the live cache, so a fresh key per process is safe and
        # additionally makes any leaked log unusable once this process has restarted.
        self._fingerprint_key = secrets.token_bytes(32)

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
                stale_id, _ = self._records.popitem(last=False)
                stale_ids = self._by_session.get(record.session_id)
                if stale_ids and stale_id in stale_ids:
                    stale_ids.remove(stale_id)
        return record

    def mark_processing(self, case_id: str) -> None:
        with self._lock:
            record = self._records.get(case_id)
            if record is not None:
                record.status = "processing"
                record.updated_at = time.time()

    def complete(
        self, case_id: str, response: AnalyzeResponse, *, from_cache: bool = False
    ) -> None:
        with self._lock:
            record = self._records.get(case_id)
            if record is None:
                return
            record.status = "failed" if response.status == "error" else "completed"
            record.outcome = response.status
            record.reason_id = (
                response.classification.reason_id if response.classification else None
            )
            record.from_cache = from_cache
            record.updated_at = time.time()
            snapshot = record.model_copy()
        if not from_cache and response.status in _CACHEABLE_STATUSES:
            self._remember(snapshot.fingerprint, response)
        self._persist(snapshot)

    def fail(self, case_id: str) -> None:
        with self._lock:
            record = self._records.get(case_id)
            if record is None:
                return
            record.status = "failed"
            record.updated_at = time.time()
            snapshot = record.model_copy()
        self._persist(snapshot)

    def find_cached(self, language: str, text: str) -> AnalyzeResponse | None:
        key = (language, fingerprint(language, text, key=self._fingerprint_key))
        with self._lock:
            cached = self._cache.get(key)
            if cached is not None:
                self._cache.move_to_end(key)
        return cached.model_copy(deep=True) if cached is not None else None

    def history(self, session_id: str, *, limit: int = 50) -> list[CaseRecord]:
        with self._lock:
            ids = list(self._by_session.get(session_id, ()))[-limit:]
            return [self._records[i].model_copy() for i in reversed(ids) if i in self._records]

    def _remember(self, fp_key: str, response: AnalyzeResponse) -> None:
        # The draft carries user-supplied text (claimant name, claim id); a replay must
        # rebuild it from the *new* caller's own details, never replay someone else's.
        cacheable = response.model_copy(update={"draft": None})
        key = (response.language, fp_key)
        with self._lock:
            self._cache[key] = cacheable
            self._cache.move_to_end(key)
            while len(self._cache) > self._max_records:
                self._cache.popitem(last=False)

    def _persist(self, record: CaseRecord) -> None:
        """Best-effort append-only log. Never raw text, never PII, never fails a request."""
        if self._persist_path is None:
            return
        try:
            with self._persist_path.open("a", encoding="utf-8") as handle:
                handle.write(record.model_dump_json() + "\n")
        except OSError:
            pass
