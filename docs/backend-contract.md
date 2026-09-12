# Backend foundation contract

## Current status

The FastAPI factory, configuration and JSON schemas exist. The LLM boundary provides explicit, single-turn protocol adapters; it is **not an analysis agent**. Agent orchestration is not implemented. No provider/model connectivity has been verified, and no production knowledge corpus is supplied by this foundation task. A synthetic index or complete credentials must never imply readiness. This document describes code behavior, not completion of the broader planning milestones.

The four [JSON examples](examples/) are synthetic UI/schema fixtures, never responses served by the analysis endpoint. Their warnings are intentional. The success example's `epfo-rr-001` is a format illustration, not a real classification; its `synthetic-examples/schema-only.md` citation, heading, line range and `example.invalid` URL are imaginary. No corresponding knowledge file is created or claimed to have been read. Do not present these examples as policy advice, a usable draft, source verification or a live demo.

## Run and check

From the repository root, with Python 3.12 or newer and uv installed:

```sh
uv sync --frozen
uv run uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

In another terminal:

```sh
uv run pytest
uv run ruff check backend tests/backend
```

`uv sync --frozen` installs the locked environment; it is not a provider connectivity check. Tests use in-process FastAPI TestClient, synthetic temporary files and mocked LLM transports, not real network requests. The API/config tests replace environment variables and pass `_env_file=None`; they never read an actual `.env` or production knowledge. With an already-installed environment, `uv run --no-sync pytest` avoids dependency synchronization.

## HTTP contract

| Route | Current result |
| --- | --- |
| `GET /health/live` | **200**, `{"status":"alive","version":"0.1.0"}`; process liveness only |
| `GET /health/ready` | **503**, `{"status":"not_ready","checks":{...}}`; never calls a provider |
| `POST /api/v1/analyze` | **503** with `AnalyzeResponse.status="error"` and `error.code="agent_not_implemented"` for schema-valid input; no mock success or fallback advice |

Readiness checks are `model_configured`, `model_connectivity_verified`, `knowledge_index_present`, `knowledge_content_verified` and `agent_implemented`. Only configuration validation and safe index presence can currently report true. Connectivity/content verification and agent implementation remain false. Index presence is not corpus completeness, source currency or citation verification.

### Request JSON

Send `Content-Type: application/json` with UTF-8 text:

```json
{
  "text": "SYNTHETIC EXAMPLE ONLY — sample input, not a real claim",
  "language": "en",
  "details": {"claimant_name": null, "claim_id": null, "claim_type": null}
}
```

- `text`: required string, 1–8,000 characters, whitespace-only rejected; accepted text is stripped.
- `language`: `en` (default) or `hi`. Accepting Hindi input does not claim implemented Hindi analysis.
- `details`: optional object, defaulting to all-null fields. Optional/null `claimant_name`, `claim_id`, `claim_type` have maximum lengths 200, 100, 100 respectively. No invented identifiers.
- Unknown fields are rejected at every API model level. Do not put provider credentials in requests.
- Body limit is **32,768 bytes**, inclusive, across received chunks, independently of character lengths or `Content-Length`. UTF-8 and JSON escaping affect byte length.

Failure envelopes differ in the current foundation:

| Failure | HTTP | JSON |
| --- | --- | --- |
| Invalid schema or malformed JSON | 422 | `{"error":{"code":"invalid_request","message":"Request does not match the API schema."}}` |
| Invalid UTF-8 body | 400 | Framework-generated generic `detail` parsing error; no submitted content is echoed |
| Body over 32 KiB | 413 | `{"error":{"code":"request_too_large","message":"Request exceeds 32 KiB."}}` |
| Valid input, missing agent | 503 | Full versioned analysis envelope with `agent_not_implemented` |

Validation errors do not echo submitted input, credentials or raw Pydantic errors. Clients must check HTTP status and handle the small transport/validation envelopes separately from `AnalyzeResponse`.

### Response JSON (`schema_version: "1.0"`)

| Field | Shape / meaning |
| --- | --- |
| `status` | `success`, `needs_clarification`, `unsupported`, `error` |
| `language` | `en` or `hi` |
| `classification` | Null or `{reason_id, category, confidence, rationale}`; reason ID matches `epfo-rr-NNN`, confidence is `low`/`medium`/`high`, not a probability |
| `explanation`, `actions`, `required_documents` | Arrays of `{text, citation_ids}`; every item requires at least one known citation ID |
| `draft` | Null or `{title, blocks, missing_fields}`; block is `{text, kind, citation_ids}` with kind `factual`, `template` or `user_supplied`; factual blocks require citations |
| `citations` | Array of `{id, path, record_id, heading, start_line, end_line, source_urls}` |
| `warnings`, `questions` | String arrays; clarification questions do not carry guidance |
| `error` | Null or `{code, message}` |

Citation IDs match `ev-[A-Za-z0-9-]+` and must be unique. Referenced IDs must exist. Paths must be canonical `.md` paths under `references/knowledge/epfo/`, without empty, `.` or `..` components. Record IDs are nullable for supporting documents. Heading is required; line numbers are positive and ordered. Source URLs must be HTTP(S), have a hostname and no username credentials. The schema currently permits empty source URL arrays; **schema acceptance alone does not prove evidence fidelity**, record existence or a supported claim.

State invariants:

- `success` requires classification, explanation and citations; no error or clarification questions. Actions/documents and draft may be empty/null.
- `needs_clarification` requires questions; no classification, explanation, actions, required documents, draft, citations or error.
- `unsupported` requires explanatory warnings; no guidance, questions or error.
- `error` requires error details; no guidance or questions.

The schema supports all four states for future integration. The actual analysis endpoint currently returns **only error/503**, with the submitted language and empty/null guidance fields.

## Configuration and protocol selection

Runtime `Settings()` reads repository-root `.env` and environment variables; environment variables override `.env`. Tests explicitly disable `.env`. API style is selected explicitly, never inferred from a model name, automatically probed or silently switched.

Complete illustrative environment configuration (all values are placeholders):

```dotenv
LLM_API_STYLE=responses
LLM_BASE_URL=https://llm.example.invalid/proxy/v1
LLM_API_KEY=synthetic-placeholder-replace-locally
LLM_MODEL=synthetic-model-replace-locally
LLM_TIMEOUT_SECONDS=25
LLM_CONNECT_TIMEOUT_SECONDS=5
LLM_MAX_OUTPUT_TOKENS=2000
LLM_EXTRA_HEADERS={"X-Synthetic-Token":"synthetic-secret-placeholder"}
LLM_ANTHROPIC_VERSION=2023-06-01
CORS_ORIGINS=["http://localhost:5173"]
```

Do not use these fictional endpoint/model values as a working setup. Set the protocol supported by your chosen provider/proxy and replace the endpoint, model and secrets locally. Omit extra headers or use `{}` when unnecessary. Never commit real keys. API key and extra-header values are secret wrappers; do not unwrap or log them except when constructing the outbound request.

| `LLM_API_STYLE` | Endpoint suffix | Authentication | Output limit wire field |
| --- | --- | --- | --- |
| `responses` (default) | `/responses` | `Authorization: Bearer <LLM_API_KEY>` | `max_output_tokens` |
| `chat_completions` | `/chat/completions` | `Authorization: Bearer <LLM_API_KEY>` | `max_completion_tokens` |
| `messages` | `/messages` | `x-api-key: <LLM_API_KEY>` plus `anthropic-version` | `max_tokens` |

Base URLs retain the supplied prefix. For example, `/proxy/v1` becomes `/proxy/v1/responses` in Responses mode. A trailing slash is stripped; a base URL already ending in the selected exact suffix is used unchanged. **`/v1` is not added automatically.** Supply a base prefix or the endpoint matching the selected style; do not combine a different protocol's endpoint with another style.

The LLM boundary requires HTTPS except HTTP on loopback development hosts; URL credentials, queries and fragments are rejected. Extra headers cannot override reserved authentication, version, host, content-type or transport framing headers. Settings defaults are 25 seconds total, 5 seconds connect and 2,000 output tokens; settings accept positive timeouts up to 30 seconds and output tokens up to 16,000. `LLM_ANTHROPIC_VERSION` defaults to `2023-06-01`. Missing URL, model or nonblank key leaves the model unconfigured. Legacy provider-specific environment names are not aliases for these settings.

The client performs one nonstreaming turn with bounded response size/time and explicit tool-call continuation. It does not execute tools, orchestrate an agent, retry, redirect or choose fallback protocols. Returned assistant continuation state must be preserved rather than rebuilt. Protocol serialization tests do not establish compatibility with a particular live provider/model.

## Local Markdown tools and evidence

`KnowledgeFiles` is an implemented read-only local boundary, not yet wired into analysis. Use one context and shared `Budget` per request, rooted at an explicit absolute public directory:

```python
from backend.tools.budget import Budget
from backend.tools.knowledge_files import KnowledgeFiles

with KnowledgeFiles(public_root, budget=Budget()) as files:
    listing = files.list_files("", limit=10)
    section = files.read_file("README.md", heading="Exact existing heading")
    # After constructing and schema-validating a response from actual reads:
    response.validate_evidence(files.ledger)
```

This is an integration sketch requiring an existing trusted root, exact heading and constructed response, not a runnable production demo. `list_files(relative_dir, cursor=..., limit=...)` returns bounded entries without file bodies. `read_file(relative_path, heading=... or start_line=..., cursor=..., max_lines=..., max_bytes=...)` returns text, canonical path, evidence ID, heading context, lines/columns, literal source URLs and explicit truncation/continuation metadata. It rejects traversal, symlinks (including root ancestors), nonregular and non-Markdown reads; it never fetches URLs. Knowledge content remains untrusted data.

Default request limits: 12 tool calls, 8 distinct files, 50 listing entries/page, 120 lines and 12 KiB/read, 48 KiB and 12,000 accounted tokens across tool output. Serialized metadata and errors count. Without a tokenizer, each UTF-8 byte is conservatively counted as one token, so the token cap can bind before the byte cap. Local scan limits are 2 MiB/file and 4,096 directory entries. Budgets also expose 12 model turns, 4,096 cumulative model-output tokens and 2 retries for future orchestration to charge; these are not automatic client retries. A retry additionally consumes the attempted tool call/model turn. The shared 30-second deadline and 3-second tool deadline are cooperative monotonic checks, not hard cancellation of blocked filesystem syscalls; use local filesystems, not network mounts. Terminal `BudgetExceeded` must stop orchestration.

`AnalyzeResponse.validate_evidence(ledger)` checks each citation against the request-local immutable read snapshot, including path, record ID, heading, line range and URLs; unknown IDs or forged metadata fail. It must be called explicitly after schema validation. Reads without heading context cannot directly satisfy the API's required nonempty citation heading: select an existing section or abstain, never invent one. The ledger does not infer source authority/currency or prove that a claim is supported; semantic grounding remains separate. Synthetic documentation examples intentionally do not pass a production evidence check.

## CORS and remaining integration

CORS is off by default. `CORS_ORIGINS` is a JSON array of exact HTTP(S) origins, with no path, query, fragment or user credentials; `*` is rejected. `localhost` differs from `127.0.0.1`, and scheme/port must match. Allowed methods are GET/POST and the configured request header is Content-Type (browser-safelisted headers also apply); credentialed CORS is disabled. CORS is browser response policy, not authentication or a server-side access-control substitute.

Remaining work is to wire bounded Markdown tools and shared budgets into the agent; supply and independently verify generated production knowledge; verify citations against evidence actually read; integrate safe clarification/abstention and drafts; then perform an authorized live model compatibility check. No archive retrieval, embeddings, deterministic alias retriever or full-corpus prompting should be introduced as a shortcut.

Schema hardening to agree before integration: validate classification IDs against actual corpus records and require the existing evidence helper in the future agent response path. Consider rejecting whitespace-only response headings/questions and harmonizing the generic 400 parsing envelope. These are follow-up recommendations, not claims that the current schema already enforces them. Keep synthetic fixture validation separate from production evidence acceptance.
