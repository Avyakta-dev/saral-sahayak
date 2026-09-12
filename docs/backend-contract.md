# Backend agent contract

## Current status

Anish's Level 2 implementation has explicitly resumed. The FastAPI factory, configuration, schemas and single-turn LLM adapters now integrate `backend/agent/service.py`, reusing bounded Markdown tools and the request-local evidence ledger. This is not a declaration that Level 2 is complete. The production knowledge corpus is still absent; no live provider requests were made in this round, and model connectivity, policy correctness and language quality remain unverified. Changes remain local, with no push. A synthetic index or complete credentials alone must never imply readiness.

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
| `GET /health/live` | **200**, `{"status":"alive","version":"0.2.0"}`; process liveness only |
| `GET /health/ready` | **200** / `ready` or **503** / `not_ready`, with `checks`; no provider call |
| `GET /api/v1/capabilities` | **200**, enabled language metadata, availability and checks; no provider call |
| `POST /api/v1/analyze` | Valid enabled requests reach the actual service only after model-configuration and corpus-structure gates pass; missing dependencies return **503**, never mock success or fallback advice |

Checks are `model_configured`, `model_connectivity_verified`, `knowledge_index_present`, `knowledge_structure_ready`, `knowledge_content_verified` and `agent_implemented`. `agent_implemented` is true; connectivity/content verification remain false. Readiness and `analysis_available` are **only** `model_configured && knowledge_structure_ready`, not a live model probe or policy/language-quality guarantee. An analysis service must also have started to serve requests.

### Capabilities and enabled languages

Capabilities returns `schema_version: "1.0"`, `default_language: "en"`, `languages`, `analysis_available`, `checks`, `inputs: ["text"]` and `downloads_available: false`. Each language entry has `code`, `name`, `native_name`, `quality_verified: false`. Only codes enabled by `SUPPORTED_LANGUAGES` are returned, in configured order. Defaults are:

| Code | Name | Native name |
| --- | --- | --- |
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `kn` | Kannada | ಕನ್ನಡ |
| `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు |
| `ml` | Malayalam | മലയാളം |

Clients should build live selectors from this read-only endpoint, not hardcode six enabled options or infer translation quality from API acceptance. Existing requests that omit `language` still default to English. Strict clients must expand request/response language enums and allow the optional citation column fields described below; the schema version remains `1.0`. Synthetic fixture JSON remains unchanged.

### Structural corpus gate

`check_corpus` inspects the fixed 186 required Markdown paths: `README.md`, `sources.md`, `glossary.md`, `claim-types-overview.md`, `resolution-playbooks.md`, plus `reasons/epfo-rr-001.md` through `reasons/epfo-rr-181.md`. All must be nonempty regular UTF-8 files without NULs and have a nonblank ATX heading outside fenced examples. Root ancestors, directories and leaves reject symlinks. Scans are bounded at 2 MiB/file and 16 MiB total and reject changed/unreadable files.

The index must contain inline links of the exact form `[label](reasons/epfo-rr-NNN.md)` for all 181 IDs, outside fenced examples. Each reason must contain its own canonical ID and at least one literal valid HTTP(S) URL outside fenced examples; a global source catalog alone is insufficient. Supporting files need headings, not a particular heading schema. This checks structure only: it does not validate remedy semantics, caveat preservation, source authority/currency, translations or model compatibility, and it never fetches source URLs. Generation and independent evidence review remain separate tasks.

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
- `language`: `en` (unchanged default), `hi`, `kn`, `ta`, `te` or `ml`. A known but disabled code returns 422 / `language_disabled` in a full analysis envelope; an unknown code fails schema validation. Acceptance does not verify translation quality.
- `details`: optional object, defaulting to all-null fields. Optional/null `claimant_name`, `claim_id`, `claim_type` have maximum lengths 200, 100, 100 respectively. No invented identifiers.
- Unknown fields are rejected at every API model level. Do not put provider credentials in requests.
- Body limit is **32,768 bytes**, inclusive, across received chunks, independently of character lengths or `Content-Length`. UTF-8 and JSON escaping affect byte length.

Transport/validation errors and analysis failure envelopes differ:

| Failure | HTTP | JSON |
| --- | --- | --- |
| Invalid schema or malformed JSON | 422 | `{"error":{"code":"invalid_request","message":"Request does not match the API schema."}}` |
| Invalid UTF-8 body | 400 | Framework-generated generic `detail` parsing error; no submitted content is echoed |
| Body over 32 KiB | 413 | `{"error":{"code":"request_too_large","message":"Request exceeds 32 KiB."}}` |
| Known but disabled language | 422 | Full analysis envelope with `language_disabled` |
| Missing/invalid model configuration | 503 | Full analysis envelope with `model_not_configured` |
| Missing/incomplete corpus or unavailable required knowledge | 503 | Full analysis envelope with `knowledge_unavailable` |
| Service lifecycle not started | 503 | Full analysis envelope with `service_unavailable` |
| Request budget exhausted | 503 | Full analysis envelope with `budget_exhausted` |
| Model/provider unavailable | 502 | Full analysis envelope with `model_unavailable`; sanitized, no provider body or secrets |
| Invalid final model output after bounded repair | 502 | Full analysis envelope with `invalid_model_output` |
| Analysis/model timeout | 504 | Full analysis envelope with `analysis_timeout` |
| Unexpected service / route failure | 500 / 502 | Full analysis envelope with sanitized `analysis_failed` |

Gates run in order: enabled language, model configuration, corpus structure, then service lifecycle. Thus missing model configuration takes precedence over the absent corpus. Disconnects cancel in-flight work; 499 / `client_disconnected` is an internal response path, not a response a disconnected client can rely on receiving.

Validation errors do not echo submitted input, credentials or raw Pydantic errors. Clients must check HTTP status and handle the small transport/validation envelopes separately from `AnalyzeResponse`.

### Response JSON (`schema_version: "1.0"`)

| Field | Shape / meaning |
| --- | --- |
| `status` | `success`, `needs_clarification`, `unsupported`, `error` |
| `language` | `en`, `hi`, `kn`, `ta`, `te` or `ml`; matches the request |
| `classification` | Null or `{reason_id, category, confidence, rationale}`; reason ID matches `epfo-rr-NNN`, confidence is `low`/`medium`/`high`, not a probability |
| `explanation`, `actions`, `required_documents` | Arrays of `{text, citation_ids}`; every item requires at least one known citation ID |
| `draft` | Null or `{title, blocks, missing_fields}`; block is `{text, kind, citation_ids}` with kind `factual`, `template` or `user_supplied`; factual blocks require citations |
| `citations` | Array of `{id, path, record_id, heading, start_line, end_line, source_urls}` plus optional nullable `start_column`, `end_column` |
| `warnings`, `questions` | String arrays; clarification questions do not carry guidance |
| `error` | Null or `{code, message}` |

Citation IDs match `ev-[A-Za-z0-9-]+` and must be unique. Referenced IDs must exist. Paths must be canonical `.md` paths under `references/knowledge/epfo/`, without empty, `.` or `..` components. Record IDs are nullable for supporting documents. Heading is required; line numbers are positive and ordered. Optional column offsets are zero-based, supplied together or both null/omitted, and ordered on a single line; host citations preserve exact ledger offsets. Source URLs must be HTTP(S), have a hostname and no username credentials. The schema currently permits empty source URL arrays; **schema acceptance alone does not prove evidence fidelity**, record existence or a supported claim.

State invariants:

- `success` requires classification, explanation and citations; no error or clarification questions. Actions/documents and draft may be empty/null.
- `needs_clarification` requires questions; no classification, explanation, actions, required documents, draft, citations or error.
- `unsupported` requires explanatory warnings; no guidance, questions or error.
- `error` requires error details; no guidance or questions.

The integrated API can return all four states: validated model outcomes produce `success`, `needs_clarification` or `unsupported` (HTTP 200), while host failures produce `error` with the appropriate non-2xx status and no guidance. Service-level success is stricter than schema-only acceptance: it also requires actions, an explanation citing the selected reason actually read, and source URLs read for that reason. The absent production corpus currently blocks real analysis. Offline fake-model/synthetic-corpus checks are not live provider, fluent-language or policy verification.

Drafts are assembled by the host, not freely generated by the model: a fixed localized request title/framing, literal user-supplied details (never translated identities), explicit `[claimant_name]` / `[claim_id]` / `[claim_type]` placeholders when missing, and copies of validated cited action blocks. Action prose is requested in the selected language; validation checks schema and provenance, not translation fidelity. There is no second model draft channel or model-supplied draft identity. Non-success states have no draft.

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
SUPPORTED_LANGUAGES=["en","hi","kn","ta","te","ml"]
```

`SUPPORTED_LANGUAGES` is a JSON array of known, unique language codes and must include `en`. It defaults to all six codes; empty lists, duplicates, unknown codes or omission of English are rejected. This controls enabled API choices, not model or linguistic verification.

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

`AnalysisService` reuses `KnowledgeFiles` and its immutable evidence ledger with one shared `Budget` per request, rooted at the public knowledge directory. It bootstraps a bounded index read through the same tool boundary, then sequentially dispatches validated model-selected list/read calls. It preserves provider continuation state and allows at most one invalid-final-output repair within the shared budget; no provider retry/fallback loop. The underlying boundary can also be used as follows:

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

Default request limits: 12 tool calls, 8 distinct files, 50 listing entries/page, 120 lines and 12 KiB/read, 48 KiB and 12,000 accounted tokens across tool output. Serialized metadata and errors count. Without a tokenizer, each UTF-8 byte is conservatively counted as one token, so the token cap can bind before the byte cap. Local scan limits are 2 MiB/file and 4,096 directory entries. The service also charges the shared limits of 12 model turns and 4,096 cumulative model-output tokens; the budget allows 2 retries, but the current service uses at most one final-output repair. These are not automatic client retries. A retry additionally consumes the attempted tool call/model turn. The shared 30-second deadline and 3-second tool deadline are cooperative monotonic checks, not hard cancellation of blocked filesystem syscalls; use local filesystems, not network mounts. Terminal `BudgetExceeded` must stop orchestration.

The model supplies evidence IDs, never citation metadata. The host resolves IDs against immutable read snapshots, constructs path/record ID/heading/line-and-column/URL citations, and calls `AnalyzeResponse.validate_evidence(ledger)` before returning. Unknown IDs and forged metadata fail. Index excerpts and reads without heading context cannot be cited as substantive evidence.

If a claim's remedy excerpt contains no URL, the model must also read and cite a source-bearing section from the **same file and record**, usually its Sources section. The host returns both as separate citations: it does not copy or merge source URLs into the remedy citation. Unrelated global source URLs cannot satisfy this check. This proves read provenance only, not that the translated claim follows from the evidence, that the source is authoritative/current, or that policy assertions are correct. Synthetic documentation examples remain schema-only and intentionally do not pass a production evidence check.

## CORS and remaining integration

CORS is off by default. `CORS_ORIGINS` is a JSON array of exact HTTP(S) origins, with no path, query, fragment or user credentials; `*` is rejected. `localhost` differs from `127.0.0.1`, and scheme/port must match. Allowed methods are GET/POST and the configured request header is Content-Type (browser-safelisted headers also apply); credentialed CORS is disabled. CORS is browser response policy, not authentication or a server-side access-control substitute.

Remaining work includes supplying and independently reviewing the generated production corpus, evaluating semantic grounding and translations in all enabled languages, integrating clients, and performing live model compatibility checks only when separately authorized. This round made no live requests. Offline tests use fake models/transports and synthetic files, not proof of fluent output or a production end-to-end flow. No archive retrieval, embeddings, deterministic alias retriever or full-corpus prompting should be introduced as a shortcut.

The service already requires the selected reason to appear in cited explanation evidence and validates all emitted citation metadata against its ledger. Source correctness, claim support and translation fidelity remain independent review obligations. Potential follow-ups include whitespace-only prose validation and harmonizing the generic 400 parsing envelope; keep schema fixture validation separate from production evidence acceptance.
