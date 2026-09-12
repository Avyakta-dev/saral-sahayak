"""Strict model-facing contracts: provenance is owned exclusively by the host."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

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
    heading: str | None = Field(default=None, min_length=1, max_length=1024)
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
    """No citations or draft metadata from the model. Drafts reuse validated actions."""

    status: Literal["success", "needs_clarification", "unsupported"]
    language: LanguageCode
    classification: Classification | None = None
    explanation: list[EvidenceText] = Field(default_factory=list, max_length=30)
    actions: list[EvidenceText] = Field(default_factory=list, max_length=30)
    required_documents: list[EvidenceText] = Field(default_factory=list, max_length=30)
    questions: list[Annotated[LinkFreeText, Field(min_length=1, max_length=1000)]] = Field(
        default_factory=list, max_length=10
    )
    warnings: list[Annotated[LinkFreeText, Field(min_length=1, max_length=1000)]] = Field(
        default_factory=list, max_length=29
    )


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
            "The host clamps every read to at most 3072 text bytes to reserve source evidence budget."
        ),
        parameters=ReadFileArgs.model_json_schema(),
    ),
)
