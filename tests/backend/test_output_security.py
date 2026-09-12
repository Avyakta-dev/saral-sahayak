import json
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from backend.agent import AnalysisError, AnalysisService
from backend.agent.models import EvidenceText, FinalAnalysis
from backend.api.schemas import Classification, Draft, DraftBlock, ErrorDetail, SupportedText
from backend.llm import LLMResult, Message, Usage
from backend.output_validation import evidence_links, link_free, nonblank


@pytest.mark.parametrize("value", [" ", "\n\t", "\u00a0", "\u200b\ufeff", "\u0000"])
def test_blank_prose_rejected(value):
    with pytest.raises(ValueError):
        nonblank(value)
    for model, fields in [
        (EvidenceText, {"text": value, "evidence_ids": ["ev-test"]}),
        (SupportedText, {"text": value, "citation_ids": ["ev-test"]}),
        (DraftBlock, {"text": value, "kind": "template"}),
        (ErrorDetail, {"code": "test", "message": value}),
        (Draft, {"title": value, "blocks": [{"text": "test", "kind": "template"}]}),
    ]:
        with pytest.raises(ValidationError):
            model.model_validate(fields)


@pytest.mark.parametrize(
    "value",
    [
        "https://unread.example/path",
        "http:///malformed",
        "https://user:secret@example.org/",
        "www.example.com",
        "//example.org/",
        "javascript:alert(1)",
        "data:image/png;base64,AAA",
        "file:///etc/passwd",
        "[click](/relative)",
        "[click][ref]",
        '<a href="/login">click</a>',
        "https%3A%2F%2Fexample.org",
        "https&#58;//example.org",
        "h\u200bttps://example.org",
        "https:\\example.org",
        "visit evil.com",
        "mailto:someone@example.org",
    ],
)
def test_uncited_links_rejected(value):
    with pytest.raises(ValueError):
        link_free(value)
    for status, key in [("unsupported", "warnings"), ("needs_clarification", "questions")]:
        with pytest.raises(ValidationError):
            FinalAnalysis.model_validate({"status": status, "language": "en", key: [value]})
    for field in ["category", "rationale"]:
        fields = {
            "reason_id": "epfo-rr-001",
            "category": "KYC",
            "confidence": "low",
            "rationale": "Test",
        }
        fields[field] = value
        with pytest.raises(ValidationError):
            Classification.model_validate(fields)


@pytest.mark.parametrize(
    "value",
    [
        "Check Form 19 and your UAN.",
        "नाम का विवरण जाँचें।",
        "ಹೆಸರನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "பெயரைச் சரிபார்க்கவும்.",
        "పేరును తనిఖీ చేయండి.",
        "പേര് പരിശോധിക്കുക.",
        "Use 2.5 years as the test value.",
    ],
)
def test_legitimate_prose_preserved_exactly(value):
    assert link_free(value) == value
    assert nonblank("  " + value + "  ") == "  " + value + "  "


@pytest.mark.parametrize(
    "url",
    [
        "https://example.org/source",
        "https://example.org/Rule_(2026)",
        "https://example.org/source?x=1&y=2",
    ],
)
def test_plain_evidenced_urls_preserved(url):
    evidence_links("See " + url, {url})
    evidence_links("See (" + url + ")", {url})


@pytest.mark.parametrize(
    "value",
    [
        "https://example.org/source-extra",
        "https://example.org/source?new=1",
        "https://example.org/source/other",
        "https://user:secret@example.org/",
        "http:///invalid",
        "[safe](https://example.org/source)",
        "javascript:alert(1)",
        "https%3A%2F%2Funread.example/",
        "//unread.example/",
    ],
)
def test_evidenced_blocks_reject_disguised_or_unread_links(value):
    with pytest.raises(ValueError):
        evidence_links(value, {"https://example.org/source"})


@pytest.mark.parametrize(
    "bad", ["  ", "https://unread.example/login", "https://user:secret@example.org"]
)
@pytest.mark.parametrize("repair", [False, True])
async def test_invalid_prose_enters_bounded_repair_then_error(tmp_path, bad, repair):
    (tmp_path / "README.md").write_text("# Test index\nSynthetic only.\n")

    class Client:
        config = SimpleNamespace(max_output_tokens=1000, timeout_seconds=5)
        calls = 0

        async def complete(self, messages, tools, **kwargs):
            self.calls += 1
            warning = "No supporting evidence is available." if repair and self.calls == 2 else bad
            return LLMResult(
                message=Message(
                    role="assistant",
                    content=json.dumps(
                        {"status": "unsupported", "language": "en", "warnings": [warning]}
                    ),
                ),
                finish_reason="stop",
                usage=Usage(output_tokens=50),
            )

    from backend.api.schemas import AnalyzeRequest

    client = Client()
    if repair:
        response = await AnalysisService(client, tmp_path).analyze(AnalyzeRequest(text="Synthetic"))
        assert response.status == "unsupported" and bad not in response.warnings
    else:
        with pytest.raises(AnalysisError) as error:
            await AnalysisService(client, tmp_path).analyze(AnalyzeRequest(text="Synthetic"))
        assert error.value.code == "invalid_model_output"
    assert client.calls == 2
