from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from backend.evidence import EvidenceLedger
from backend.languages import LanguageCode
from backend.output_validation import LinkFreeText, NonBlankText


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)


class ClaimDetails(ContractModel):
    claimant_name: str | None = Field(default=None, max_length=200)
    claim_id: str | None = Field(default=None, max_length=100)
    claim_type: str | None = Field(default=None, max_length=100)


class AnalyzeRequest(ContractModel):
    text: str = Field(min_length=1, max_length=8000)
    language: LanguageCode = "en"
    details: ClaimDetails = Field(default_factory=ClaimDetails)

    @field_validator("text")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Rejection text must not be blank")
        return value.strip()


class Citation(ContractModel):
    id: str = Field(pattern=r"^ev-[A-Za-z0-9-]+$")
    path: str = Field(pattern=r"^references/knowledge/epfo/.+\.md$")
    record_id: str | None = Field(default=None, pattern=r"^epfo-rr-\d{3}$")
    heading: str = Field(min_length=1, max_length=300)
    start_line: int = Field(ge=1)
    end_line: int = Field(ge=1)
    start_column: int | None = Field(default=None, ge=0)
    end_column: int | None = Field(default=None, ge=0)
    source_urls: list[str] = Field(default_factory=list, max_length=30)

    @model_validator(mode="after")
    def validate_location(self):
        if self.end_line < self.start_line:
            raise ValueError("Citation line range is reversed")
        if (self.start_column is None) != (self.end_column is None):
            raise ValueError("Citation columns must be supplied together")
        if (
            self.start_line == self.end_line
            and self.start_column is not None
            and self.end_column < self.start_column
        ):
            raise ValueError("Citation column range is reversed")
        if any(part in {"..", ".", ""} for part in self.path.split("/")):
            raise ValueError("Citation path must be canonical")
        for url in self.source_urls:
            parsed = urlsplit(url)
            if parsed.scheme not in {"https", "http"} or not parsed.hostname or parsed.username:
                raise ValueError("Source URLs must be HTTP(S) without credentials")
        return self


class SupportedText(ContractModel):
    text: NonBlankText = Field(min_length=1, max_length=6000)
    citation_ids: list[str] = Field(min_length=1, max_length=30)


class DraftBlock(ContractModel):
    text: NonBlankText = Field(min_length=1, max_length=6000)
    kind: Literal["factual", "template", "user_supplied"]
    citation_ids: list[str] = Field(default_factory=list, max_length=30)

    @model_validator(mode="after")
    def factual_needs_evidence(self):
        if self.kind == "factual" and not self.citation_ids:
            raise ValueError("Factual draft blocks require citations")
        return self


class Draft(ContractModel):
    title: NonBlankText = Field(min_length=1, max_length=200)
    blocks: list[DraftBlock] = Field(min_length=1, max_length=50)
    missing_fields: list[str] = Field(default_factory=list, max_length=20)


class Classification(ContractModel):
    reason_id: str = Field(pattern=r"^epfo-rr-\d{3}$")
    category: LinkFreeText = Field(min_length=1, max_length=100)
    confidence: Literal["low", "medium", "high"]
    rationale: LinkFreeText = Field(min_length=1, max_length=1000)


class ErrorDetail(ContractModel):
    code: str = Field(min_length=1, max_length=100)
    message: NonBlankText = Field(min_length=1, max_length=500)


class AnalyzeResponse(ContractModel):
    schema_version: Literal["1.0"] = "1.0"
    status: Literal["success", "needs_clarification", "unsupported", "error"]
    language: LanguageCode = "en"
    classification: Classification | None = None
    explanation: list[SupportedText] = Field(default_factory=list, max_length=30)
    actions: list[SupportedText] = Field(default_factory=list, max_length=30)
    required_documents: list[SupportedText] = Field(default_factory=list, max_length=30)
    draft: Draft | None = None
    citations: list[Citation] = Field(default_factory=list, max_length=100)
    warnings: list[LinkFreeText] = Field(default_factory=list, max_length=30)
    questions: list[LinkFreeText] = Field(default_factory=list, max_length=10)
    error: ErrorDetail | None = None

    @model_validator(mode="after")
    def validate_outcome(self):
        ids = [citation.id for citation in self.citations]
        if len(ids) != len(set(ids)):
            raise ValueError("Citation IDs must be unique")
        blocks = [*self.explanation, *self.actions, *self.required_documents]
        if self.draft:
            blocks.extend(self.draft.blocks)
        if any(cid not in ids for block in blocks for cid in block.citation_ids):
            raise ValueError("Unknown citation reference")
        if self.status == "success":
            if not self.classification or not self.explanation or not self.citations:
                raise ValueError("Success requires classification, explanation and evidence")
            if self.error or self.questions:
                raise ValueError("Success cannot contain an error or clarification questions")
        else:
            if self.classification or blocks or self.draft or self.citations:
                raise ValueError("Non-success cannot provide ready-to-use guidance")
        if self.status == "needs_clarification" and not self.questions:
            raise ValueError("Clarification requires questions")
        if self.status != "needs_clarification" and self.questions:
            raise ValueError("Questions require clarification status")
        if (self.status == "error") != (self.error is not None):
            raise ValueError("Error detail must match error status")
        if self.status == "unsupported" and not self.warnings:
            raise ValueError("Unsupported results require an explanation in warnings")
        return self

    def validate_evidence(self, ledger: EvidenceLedger) -> None:
        """Validate provenance against host reads, not semantic correctness of claims."""
        for citation in self.citations:
            values = citation.model_dump()
            if citation.start_column is None:
                values.pop("start_column")
                values.pop("end_column")
            ledger.validate_citation(values)
