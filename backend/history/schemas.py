"""Wire contract for the history endpoint. Deliberately separate from api/schemas.py:
this is read-only bookkeeping metadata, never analysis output, so it never needs to
satisfy AnalyzeResponse's evidence/citation invariants."""

from typing import Literal

from pydantic import Field

from backend.api.schemas import ContractModel
from backend.languages import LanguageCode

from .models import CaseStatus

# Mirrors AnalyzeResponse.status (backend/api/schemas.py): outcome is always assigned
# from that field, so it is exactly this closed set, never an arbitrary string.
CaseOutcome = Literal["success", "needs_clarification", "unsupported", "error"]


class HistoryCase(ContractModel):
    case_id: str = Field(max_length=64)
    status: CaseStatus
    outcome: CaseOutcome | None = None
    reason_id: str | None = Field(default=None, pattern=r"^epfo-rr-\d{3}$")
    language: LanguageCode
    from_cache: bool
    created_at: float = Field(allow_inf_nan=False)
    updated_at: float = Field(allow_inf_nan=False)


class HistoryResponse(ContractModel):
    session_id: str = Field(max_length=128)
    cases: list[HistoryCase] = Field(default_factory=list, max_length=100)
