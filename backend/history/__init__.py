"""Request lifecycle tracking, per-session history and exact-match result caching.

This layer sits outside the grounded agent (backend.agent) and never changes how an
answer is produced. By default it retains only lifecycle metadata, not responses.
Opt-in reuse requires a trusted immutable dependency scope, the same session and exact
(language, text), with bounded TTL. Never a "similar" or fuzzy match, which would drift
toward the alias/vector retrieval the design rules out. See backend/history/service.py.
"""

from .models import CaseRecord, CaseStatus
from .schemas import HistoryCase, HistoryResponse
from .service import HistoryTrackingService
from .store import CaseHistoryStore

__all__ = [
    "CaseRecord",
    "CaseStatus",
    "CaseHistoryStore",
    "HistoryTrackingService",
    "HistoryCase",
    "HistoryResponse",
]
