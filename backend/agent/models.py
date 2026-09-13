"""Strict model-facing contracts: provenance is owned exclusively by the host."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.api.schemas import Classification
from backend.languages import LanguageCode
from backend.llm import ToolDefinition
from backend.output_validation import LinkFreeText, NonBlankText


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, hide_input_in_errors=True)


class ListFilesArgs(StrictModel):
    relative_dir: str = Field(default="", max_length=1024)
    cursor: str | None = Field(default=None, max_length=128)
    limit: int | None = Field(default=None, ge=1)


class ReadFileArgs(StrictModel):
    relative_path: str = Field(min_length=1, max_length=1024)
    heading: str | None = Field(
        default=None,
        min_length=1,
        max_length=1024,
        description=(
            "One exact heading as a scalar string, not an array or combined headings. "
            "To read multiple sections in one turn, send separate read_file calls."
        ),
    )
    start_line: int = Field(default=1, ge=1)
    cursor: str | None = Field(default=None, max_length=128)
    max_lines: int | None = Field(default=None, ge=1)
    max_bytes: int | None = Field(default=None, ge=4)


class EvidenceText(StrictModel):
    text: NonBlankText = Field(min_length=1, max_length=6000)
    evidence_ids: list[Annotated[str, Field(min_length=1, max_length=128)]] = Field(
        min_length=1, max_length=30
    )


class FinalAnalysis(StrictModel):
    """Model-only output; no citation metadata or draft fields.

    Success requires classification, nonempty cited explanation and actions, and no questions.
    Both non-success states require null classification and empty explanation, actions and
    required_documents. needs_clarification requires focused questions about missing facts;
    unsupported requires a limitation in warnings and no questions. Citation completeness alone
    does not establish applicability or classification confidence.
    """

    status: Literal["success", "needs_clarification", "unsupported"]
    language: LanguageCode
    classification: Classification | None = Field(
        default=None,
        description=(
            "Success only. Rationale must connect supplied discriminator facts to evidence read, "
            "not just a phrase match or source presence. Unresolved applicability requires "
            "needs_clarification or unsupported, not success with low confidence."
        ),
    )
    explanation: list[EvidenceText] = Field(default_factory=list, max_length=30)
    actions: list[EvidenceText] = Field(default_factory=list, max_length=30)
    required_documents: list[EvidenceText] = Field(default_factory=list, max_length=30)
    questions: list[Annotated[LinkFreeText, Field(min_length=1, max_length=1000)]] = Field(
        default_factory=list, max_length=10
    )
    warnings: list[Annotated[LinkFreeText, Field(min_length=1, max_length=1000)]] = Field(
        default_factory=list, max_length=29
    )

    @model_validator(mode="after")
    def validate_outcome(self):
        """Mirror existing host state invariants before provenance resolution, not semantics."""
        if self.status == "success":
            if not self.classification or not self.explanation or not self.actions:
                raise ValueError("Success requires classification, explanation and actions.")
            if self.questions:
                raise ValueError("Success cannot contain clarification questions.")
        else:
            if self.classification or self.explanation or self.actions or self.required_documents:
                raise ValueError(
                    "Non-success cannot provide classification or ready-to-use guidance."
                )
            if self.status == "needs_clarification" and not self.questions:
                raise ValueError("Clarification requires questions about missing facts.")
            if self.status == "unsupported":
                if self.questions:
                    raise ValueError("Questions require clarification status.")
                if not self.warnings:
                    raise ValueError("Unsupported output requires a specific limitation.")
        return self


TOOLS = (
    ToolDefinition(
        name="list_files",
        description="List a bounded page of public Markdown paths. No recursive listing.",
        parameters=ListFilesArgs.model_json_schema(),
    ),
    ToolDefinition(
        name="read_file",
        description=(
            "Read a bounded public Markdown excerpt, using a root-relative path (e.g. "
            "reasons/epfo-rr-001.md), exact heading or start_line, or continuation cursor. "
            "Returns immutable evidence_id, exact heading, line/column range and literal URLs. "
            "An excerpt with heading=null is navigation only and cannot be cited. "
            "Use one scalar heading string per call; batch separate calls for multiple sections. "
            "Do not re-read the same path and heading already returned. "
            "The host clamps every read to at most 3072 text bytes to reserve source evidence budget "
            "and may refuse further reads. A read stop or source presence is not proof of "
            "applicability; clarify or abstain when discriminator facts are missing."
        ),
        parameters=ReadFileArgs.model_json_schema(),
    ),
)
