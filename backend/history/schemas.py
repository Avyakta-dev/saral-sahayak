"""Wire contract for the history endpoint. Deliberately separate from api/schemas.py:
this is read-only bookkeeping metadata, never analysis output, so it never needs to
satisfy AnalyzeResponse's evidence/citation invariants."""

from pydantic import Field

from backend.api.schemas import ContractModel
from backend.languages import LanguageCode

from .models import CaseStatus


class HistoryCase(ContractModel):
    case_id: str
    status: CaseStatus
    outcome: str | None = None
    reason_id: str | None = Field(default=None, pattern=r"^epfo-rr-\d{3}$")
    language: LanguageCode
    from_cache: bool
    created_at: float
    updated_at: float


class HistoryResponse(ContractModel):
    session_id: str
    cases: list[HistoryCase] = Field(default_factory=list, max_length=100)
