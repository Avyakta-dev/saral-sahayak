# Issue #29: offline real-corpus acceptance and timeout diagnostics

## Scope and authorization

This follow-up to PR #34 uses the committed 181-record Markdown corpus and synthetic review inputs from `references/reviews/epfo/cases.json`. The provider is **`httpx.MockTransport`**, the configured model label is **`scripted-real-corpus-contract`**, and the endpoint/key are synthetic. No provider or source network requests are made; no `.env` is loaded. The tests exercise the real adapters, analysis service, bounded knowledge tools, evidence validation and host draft assembly.

These are **scripted contract regressions**, not model reasoning, policy verification, independent language evaluation or measured live latency. The review manifest's `agent_execution: not_run` markers remain unchanged. Issue #29 stays open; this PR must not auto-close it.

## Expected and observed outcomes

`tests/backend/test_real_corpus_acceptance.py` passes 12 checks:

| Synthetic review case | Expected contract | Observed offline |
| --- | --- | --- |
| 001: initials versus expanded middle name | Supported comparison-only explanation/action with same-file source evidence | Pass for Responses, Chat Completions and Messages adapters |
| 002: vague KYC status | No ready guidance without clarification | Scripted clarification, no classification/actions/draft |
| 003: spouse joint account, missing form | No ready guidance without applicability facts | Scripted clarification, no classification/actions/draft |
| 004: cheque waiver ambiguity | Do not infer NPCI verification | Scripted clarification, no classification/actions/draft |
| 005: missing service/purpose facts | Do not prescribe a universal service threshold | Scripted clarification, no classification/actions/draft |
| 006: overlap applicability | Do not promise approval or assume transfer rules apply | Scripted clarification, no classification/actions/draft |
| 007: conflicting activation instructions | No definitive current workflow | Scripted abstention, no guidance/draft |
| 008: unverified 2026 limits | No definitive legal thresholds | Scripted abstention, no guidance/draft |
| 009: unknown ZX-999 remark | No invented official code meaning | Scripted abstention, no guidance/draft |
| Adversarial citation variant of 001 | Reject a remedy citing another record's sources | `invalid_model_output` after one repair; no fallback answer |

The supported script follows a link in the bounded bootstrap index to rr001's `Related records`, then reads rr012's `Classification`, `Root cause` and `Sources and verification`, plus rr001's `Fix` and its own `Sources and verification`. This requires **three mocked model turns and seven file-tool calls including bootstrap**, across only the index and two reason files, within unchanged default budgets. It neither reads the JSON appendix nor loads the full corpus into a prompt. The script demonstrates one possible bounded path, not that a real model will choose it.

Assertions check exact citation paths, headings, line/column ranges and URLs against tool results. Remedy and source excerpts remain separate citations. The host draft copies only the cited comparison action and retains placeholders for all unsupplied identity fields. The output does not prescribe a Joint Declaration document count or claim independently verified correction requirements. Every evidence excerpt named by the other eight review cases is returned by bounded reads before their scripted final state.

## Why live acceptance remains blocked

The last authorized live attempt still ended in `analysis_timeout` at 30.02 seconds while awaiting final generation. This follow-up does **not** demonstrate a latency fix. The 30-second deadline, evidence/output limits, model protocol selection and response schemas are unchanged. The prompt/tool descriptions now accurately describe the existing 3,072-byte per-read service clamp.

Independent current-policy/source-authority checks, the six source-verification gaps and output quality in English, Hindi, Kannada, Tamil, Telugu and Malayalam remain unevaluated by this work. Existing six-language fake-model tests establish contract behavior only. A future live retest requires explicit request/credit authorization and must record the actual model identifier/protocol privately where necessary, synthetic input, expected/observed outcome and bounded call count; secrets and raw traces must stay out of Git.

## Diagnostics and regression results

`AnalysisService.analyze(request, diagnostics=events.append)` opts into immutable request-local events; existing callers collect nothing. Events identify bootstrap, model start/completion, tool completion, validation/repair and terminal outcome, with elapsed/remaining seconds, actual call timeout/token allowance, nullable provider-reported output tokens and cumulative budget counters. No input, prompt, evidence body/path/ID, response prose, credentials or provider replay data is emitted. This is a Python-only local hook, not an HTTP schema change or automatic telemetry.

The 18 diagnostics checks cover success and sanitized failures, missing knowledge, resource exhaustion, one-repair accounting, unknown provider usage, immutable/private event shape, concurrent request isolation, callback failures and cancellation cleanup. A simulated slow final turn receives only the remaining shared deadline and times out without retry. Model output allowances decrease across retrieval/final turns. A callback that consumes the deadline cannot start a provider request; callbacks must still be synchronous and nonblocking because they run on the analysis task.

Verification on the locked Python 3.12 environment: **886 tests passed** (856 baseline plus 30 new checks), Ruff lint/format checks passed, generated-corpus validation and the 181-record/9-case/6-gap review inventory check passed. The existing extension suite also passed **103 tests**. Two upstream FastAPI/Starlette deprecation warnings were emitted by the Python suite. No frontend files changed; frontend browser/build checks were not run locally.

Direct local review found and repaired the callback deadline issue, with a failing-then-passing regression. No remaining actionable findings were identified in the final scoped diff. These checks do not remove the live acceptance blockers above.

## Reproduce offline

From the repository root with the locked development environment installed:

```sh
uv run --no-sync pytest tests/backend/test_real_corpus_acceptance.py -q
uv run --no-sync pytest tests/backend/test_agent_diagnostics.py -q
uv run --no-sync pytest -q
uv run --no-sync ruff check backend tests references/build_epfo_knowledge.py references/review_epfo_knowledge.py
uv run --no-sync ruff format --check backend tests/backend
uv run --no-sync python references/build_epfo_knowledge.py validate
uv run --no-sync python -m references.review_epfo_knowledge check
```
