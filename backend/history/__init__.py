"""Request lifecycle tracking, per-session history and exact-match result caching.

This layer sits outside the grounded agent (backend.agent) and never changes how an
answer is produced. It only ever replays an AnalyzeResponse this same process already
produced and validated against real evidence for the identical (language, text) pair -
never a "similar" or fuzzy match, which would drift toward the alias/vector retrieval
the project's design explicitly rules out. See backend/history/service.py.
"""

from .models import DEFAULT_SESSION_ID, CaseRecord, CaseStatus
from .schemas import HistoryCase, HistoryResponse
from .service import HistoryTrackingService
from .store import CaseHistoryStore, fingerprint

__all__ = [
    "DEFAULT_SESSION_ID",
    "CaseRecord",
    "CaseStatus",
    "CaseHistoryStore",
    "HistoryTrackingService",
    "HistoryCase",
    "HistoryResponse",
    "fingerprint",
]
