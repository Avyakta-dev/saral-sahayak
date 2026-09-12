"""Internal lifecycle record. Never the wire contract - see schemas.py for that."""

from typing import Literal

from pydantic import BaseModel

DEFAULT_SESSION_ID = "anonymous"

CaseStatus = Literal["started", "processing", "completed", "failed"]


class CaseRecord(BaseModel):
    """One request's start -> process -> completed/failed lifecycle.

    Deliberately holds no raw claim text and no user-supplied personal details: only a
    one-way fingerprint of the (language, text) pair, and the public, knowledge-grounded
    outcome fields the response already exposes (reason_id, outcome). This is what makes
    it safe to keep as a growing dataset rather than a snapshot of one request.
    """

    case_id: str
    session_id: str
    language: str
    fingerprint: str
    status: CaseStatus
    reason_id: str | None = None
    outcome: str | None = None
    from_cache: bool = False
    created_at: float
    updated_at: float
