"""Scripted real-corpus contract checks, not live reasoning or language evaluation."""

import json
from pathlib import Path

import httpx
import pytest

from backend.agent import AnalysisError, AnalysisService
from backend.api.schemas import AnalyzeRequest
from backend.knowledge_readiness import check_corpus
from backend.llm import LLMClient, LLMConfig

ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE = ROOT / "references/knowledge/epfo"
CASES = json.loads((ROOT / "references/reviews/epfo/cases.json").read_text(encoding="utf-8"))
STYLES = ["responses", "chat_completions", "messages"]
SOURCE = "Sources and verification"
ACTION = (
    "Compare UAN name, Aadhaar name, PAN name, and bank account name letter by letter, "
    "including spaces and initials."
)


def wire(style, *, reads=(), final=None):
    calls = [
        (
            f"read-{record}-{heading.replace(' ', '-')}",
            {
                "relative_path": f"reasons/{record}.md",
                "heading": heading,
            },
        )
        for record, heading in reads
    ]
    text = json.dumps(final) if final is not None else None
    if style == "responses":
        output = (
            [
                {
                    "type": "function_call",
                    "call_id": cid,
                    "name": "read_file",
                    "arguments": json.dumps(args),
                }
                for cid, args in calls
            ]
            if calls
            else [
                {
                    "type": "message",
                    "role": "assistant",
                    "content": [{"type": "output_text", "text": text}],
                }
            ]
        )
        return {"status": "completed", "output": output, "usage": {"output_tokens": 100}}
    if style == "chat_completions":
        message = {"role": "assistant", "content": text}
        if calls:
            message["tool_calls"] = [
                {
                    "id": cid,
                    "type": "function",
                    "function": {"name": "read_file", "arguments": json.dumps(args)},
                }
                for cid, args in calls
            ]
        return {
            "choices": [{"message": message, "finish_reason": "tool_calls" if calls else "stop"}],
            "usage": {"completion_tokens": 100},
        }
    content = (
        [{"type": "tool_use", "id": cid, "name": "read_file", "input": args} for cid, args in calls]
        if calls
        else [{"type": "text", "text": text}]
    )
    return {
        "type": "message",
        "role": "assistant",
        "content": content,
        "stop_reason": "tool_use" if calls else "end_turn",
        "usage": {"output_tokens": 100},
    }


def tool_results(payload, style):
    if style == "responses":
        values = [i["output"] for i in payload["input"] if i.get("type") == "function_call_output"]
    elif style == "chat_completions":
        values = [i["content"] for i in payload["messages"] if i["role"] == "tool"]
    else:
        values = [
            block["content"]
            for message in payload["messages"]
            if isinstance(message["content"], list)
            for block in message["content"]
            if block.get("type") == "tool_result"
        ]
    return [json.loads(value) for value in values]


def model_config(style):
    # LLMConfig never loads environment variables or .env files.
    return LLMConfig(
        api_style=style,
        base_url="https://example.invalid/v1",
        api_key="synthetic-key",
        model="scripted-real-corpus-contract",
    )


def supported_final(results, *, forged_source=False):
    def eid(record, heading):
        return next(
            r["evidence_id"]
            for r in results
            if r["path"].endswith(f"/{record}.md") and r["heading"] == heading
        )

    return {
        "status": "success",
        "language": "en",
        "classification": {
            "reason_id": "epfo-rr-012",
            "category": "KYC_Identity",
            "confidence": "medium",
            "rationale": "Initial versus expanded name.",
        },
        "explanation": [
            {
                "text": "The initial in the payroll name differs from the expanded Aadhaar name.",
                "evidence_ids": [eid("epfo-rr-012", "Root cause"), eid("epfo-rr-012", SOURCE)],
            }
        ],
        "actions": [
            {
                "text": ACTION,
                "evidence_ids": [
                    eid("epfo-rr-001", "Fix"),
                    eid("epfo-rr-012" if forged_source else "epfo-rr-001", SOURCE),
                ],
            }
        ],
        "warnings": ["Current correction requirements have not been independently verified."],
    }


@pytest.mark.parametrize("style", STYLES)
async def test_supported_review_case_navigation_citations_and_draft(style):
    assert check_corpus(KNOWLEDGE).structure_ready
    requests = []
    observed = []
    reads = [
        ("epfo-rr-012", "Classification"),
        ("epfo-rr-012", "Root cause"),
        ("epfo-rr-012", SOURCE),
        ("epfo-rr-001", "Fix"),
        ("epfo-rr-001", SOURCE),
    ]

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        results = tool_results(payload, style)
        assert all("error" not in r for r in results)
        if len(requests) == 1:
            assert "reasons/epfo-rr-001.md" in results[0]["text"]
            assert results[0]["truncated"]
            return httpx.Response(200, json=wire(style, reads=[("epfo-rr-001", "Related records")]))
        if len(requests) == 2:
            assert "epfo-rr-012" in results[-1]["text"]
            return httpx.Response(200, json=wire(style, reads=reads))
        observed.extend(results)
        assert len(requests) == 3
        return httpx.Response(200, json=wire(style, final=supported_final(results)))

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        service = AnalysisService(LLMClient(model_config(style), http), KNOWLEDGE)
        response = await service.analyze(AnalyzeRequest(text=CASES[0]["input"]))

    assert response.status == "success"
    assert response.classification.reason_id == "epfo-rr-012"
    assert len(requests) == 3
    assert len(observed) == 7  # Bootstrap, related-record navigation, five selected sections.
    assert len({r["path"] for r in observed}) == 3
    assert all("Complete source record" not in r["text"] for r in observed)
    assert all(not r["truncated"] for r in observed[1:])
    assert all(len(r["text"].encode("utf-8")) <= 3072 for r in observed)
    by_id = {r["evidence_id"]: r for r in observed}
    for citation in response.citations:
        read = by_id[citation.id]
        for field in (
            "path",
            "heading",
            "start_line",
            "end_line",
            "start_column",
            "end_column",
            "source_urls",
        ):
            assert getattr(citation, field) == read[field]
        assert citation.record_id == Path(citation.path).stem
    fix, source = [by_id[eid] for eid in response.actions[0].citation_ids]
    assert fix["heading"] == "Fix" and fix["source_urls"] == []
    assert source["heading"] == SOURCE and source["source_urls"]
    assert fix["path"] == source["path"]
    assert ACTION in fix["text"]
    assert response.draft.missing_fields == ["claimant_name", "claim_id", "claim_type"]
    factual = [b for b in response.draft.blocks if b.kind == "factual"]
    assert len(factual) == 1
    assert factual[0].text == ACTION
    assert factual[0].citation_ids == response.actions[0].citation_ids
    assert response.required_documents == []
    assert "not been independently verified" in response.warnings[0]


@pytest.mark.parametrize("case", CASES[1:], ids=lambda case: case["id"])
async def test_review_cases_keep_scripted_clarification_or_abstention_guidance_free(case):
    reads = list(dict.fromkeys((e["record_id"], e["heading"]) for e in case["evidence"]))
    requests = []
    state = (
        "unsupported" if case["kind"] in ("unknown", "uncertain_policy") else "needs_clarification"
    )

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        if len(requests) == 1:
            return httpx.Response(200, json=wire("responses", reads=reads))
        results = tool_results(payload, "responses")
        assert len(results) == len(reads) + 1
        assert all("error" not in r and not r["truncated"] for r in results[1:])
        for evidence in case["evidence"]:
            read = next(
                r
                for r in results
                if r["path"].endswith(f"/{evidence['record_id']}.md")
                and r["heading"] == evidence["heading"]
            )
            assert evidence["excerpt"] in read["text"]
        final = {"status": state, "language": "en"}
        if state == "unsupported":
            final["warnings"] = ["The available evidence does not establish a definitive answer."]
        else:
            final["questions"] = ["What is the exact redacted remark and claim type?"]
        return httpx.Response(200, json=wire("responses", final=final))

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        response = await AnalysisService(
            LLMClient(model_config("responses"), http), KNOWLEDGE
        ).analyze(AnalyzeRequest(text=case["input"]))
    assert len(requests) == 2
    assert response.status == state and state in case["expected_states"]
    assert response.classification is None and response.draft is None
    assert (
        response.explanation
        == response.actions
        == response.required_documents
        == response.citations
        == []
    )
    assert case["agent_execution"] == "not_run"  # Scripted outcomes do not certify model reasoning.


async def test_real_corpus_rejects_borrowed_sources_after_one_repair():
    calls = 0

    def handler(request):
        nonlocal calls
        calls += 1
        if calls == 1:
            return httpx.Response(
                200,
                json=wire(
                    "responses",
                    reads=[
                        ("epfo-rr-012", "Root cause"),
                        ("epfo-rr-012", SOURCE),
                        ("epfo-rr-001", "Fix"),
                    ],
                ),
            )
        results = tool_results(json.loads(request.content), "responses")
        return httpx.Response(
            200, json=wire("responses", final=supported_final(results, forged_source=True))
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(AnalysisError) as error:
            await AnalysisService(LLMClient(model_config("responses"), http), KNOWLEDGE).analyze(
                AnalyzeRequest(text=CASES[0]["input"])
            )
    assert error.value.code == "invalid_model_output"
    assert calls == 3
