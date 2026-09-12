"""Internal lifecycle record. Never the wire contract - see schemas.py for that."""

from typing import Literal

from pydantic import BaseModel, Field

from backend.languages import LanguageCode

DEFAULT_SESSION_ID = "anonymous"

CaseStatus = Literal["started", "processing", "completed", "failed"]
# Mirrors AnalyzeResponse.status (backend/api/schemas.py): outcome is always assigned
# from that field, so it is exactly this closed set, never an arbitrary string.
CaseOutcome = Literal["success", "needs_clarification", "unsupported", "error"]


class CaseRecord(BaseModel):
    """One request's start -> process -> completed/failed lifecycle.

    Deliberately holds no raw claim text and no user-supplied personal details: only a
    one-way fingerprint of the (language, text) pair, and the public, knowledge-grounded
    outcome fields the response already exposes (reason_id, outcome). This is what makes
    it safe to keep as a growing dataset rather than a snapshot of one request.
    """

    case_id: str = Field(max_length=64)
    # Matches _MAX_SESSION_ID_LENGTH in backend/main.py, the only place this is set.
    session_id: str = Field(max_length=128)
    language: LanguageCode
    fingerprint: str = Field(max_length=64)
    status: CaseStatus
    reason_id: str | None = None
    outcome: CaseOutcome | None = None
    from_cache: bool = False
    created_at: float = Field(allow_inf_nan=False)
    updated_at: float = Field(allow_inf_nan=False)
