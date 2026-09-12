"""Internal lifecycle record. Never the wire contract - see schemas.py for that."""

from typing import Literal

from pydantic import BaseModel, Field

from backend.languages import LanguageCode

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

    case_id: str = Field(min_length=1, max_length=64)
    # Matches _MAX_SESSION_ID_LENGTH in backend/main.py, the only place this is set.
    # min_length=1 so an empty id can never validate here even if a future caller
    # regresses - a shared "" bucket is exactly the cross-caller collapse this
    # module's session isolation exists to prevent.
    session_id: str = Field(min_length=1, max_length=128)
    language: LanguageCode
    fingerprint: str = Field(min_length=1, max_length=64)
    status: CaseStatus
    # Mirrors Classification.reason_id (backend/api/schemas.py); record.reason_id is
    # only ever assigned from that already-validated field, but binding it here too
    # means this model doesn't have to trust that assignment forever.
    reason_id: str | None = Field(default=None, pattern=r"^epfo-rr-\d{3}$")
    outcome: CaseOutcome | None = None
    from_cache: bool = False
    created_at: float = Field(allow_inf_nan=False)
    updated_at: float = Field(allow_inf_nan=False)
