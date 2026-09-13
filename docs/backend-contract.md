# Backend agent contract

## Current status

Anish's Level 2/3 integration work continues on `main`. The FastAPI factory, configuration, schemas and single-turn LLM adapters integrate `backend/agent/service.py`, reusing bounded Markdown tools and the request-local evidence ledger. The public 181-record Markdown corpus is present under `references/knowledge/epfo/`. This is not a declaration that Level 2 or Level 3 is complete: model connectivity verification flags stay false, and policy correctness / language quality remain unverified. Credentials alone must never imply readiness. For a local frontend→API walkthrough see [demo-runbook.md](demo-runbook.md).

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

The integrated API can return all four states: validated model outcomes produce `success`, `needs_clarification` or `unsupported` (HTTP 200), while host failures produce `error` with the appropriate non-2xx status and no guidance. Service-level success is stricter than schema-only acceptance: it also requires actions, an explanation citing the selected reason actually read, and source URLs read for that reason. Structural corpus gates still apply; missing or incomplete knowledge returns 503. Offline fake-model/synthetic-corpus checks are not live provider, fluent-language or policy verification.

Drafts are assembled by the host, not freely generated by the model: a fixed localized request title/framing, literal user-supplied details (never translated identities), explicit `[claimant_name]` / `[claim_id]` / `[claim_type]` placeholders when missing, and copies of validated cited action blocks. Action prose is requested in the selected language; validation checks schema and provenance, not translation fidelity. There is no second model draft channel or model-supplied draft identity. Non-success states have no draft.

## Configuration and protocol selection

Runtime `Settings()` reads repository-root `.env` and environment variables; environment variables override `.env`. Tests explicitly disable `.env`. API style is selected explicitly, never inferred from a model name, automatically probed or silently switched.

Complete illustrative environment configuration (all values are placeholders):

```dotenv
LLM_API_STYLE=responses
LLM_BASE_URL=https://llm.example.invalid/proxy/v1
LLM_API_KEY=synthetic-placeholder-replace-locally
LLM_MODEL=synthetic-model-replace-locally
LLM_STREAM=false
LLM_TIMEOUT_SECONDS=25
LLM_CONNECT_TIMEOUT_SECONDS=5
LLM_MAX_OUTPUT_TOKENS=2000
LLM_EXTRA_HEADERS={"X-Synthetic-Token":"synthetic-secret-placeholder"}
LLM_ANTHROPIC_VERSION=2023-06-01
CORS_ORIGINS=["http://127.0.0.1:5173"]
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

The LLM boundary requires HTTPS except HTTP on loopback development hosts; URL credentials, queries and fragments are rejected. Extra headers cannot override reserved authentication, version, host, content-type or transport framing headers. Settings defaults are 25 seconds total, 5 seconds connect and 2,000 output tokens; settings accept positive model/request timeouts up to 120 seconds and output tokens up to 16,000. `LLM_ANTHROPIC_VERSION` defaults to `2023-06-01`. Missing URL, model or nonblank key leaves the model unconfigured. Legacy provider-specific environment names are not aliases for these settings.

The client performs one turn with bounded response size/time and explicit tool-call continuation. `LLM_STREAM` defaults to `false`, preserving nonstreaming compatibility for all three protocols. Set `LLM_STREAM=true` to request internal provider SSE with `responses`; streaming with `chat_completions` or `messages` is an explicit configuration error, never silent fallback. Streaming does not change the analysis response contract or expose partial model text, reasoning or arguments: the complete output still passes normal tool, schema and evidence validation.

Both modes retain the 2 MiB decoded HTTP response cap and configured call deadline. SSE adds a 16,384 event-boundary cap, fragmented UTF-8 and LF/CRLF/CR handling, and cooperative cancellation/deadline checks during parsing. A valid `response.completed` is required; premature EOF, malformed events, inconsistent accumulated arguments/text, unsupported events and provider failure/incomplete events fail closed with sanitized errors. The client closes at terminal completion without awaiting EOF or interpreting trailing frames. Final provider-reported usage is used once, with unknown counts left unknown. Exact terminal output items, including reasoning encrypted content and item/call IDs, are preserved for stateless continuation; they are not reconstructed from deltas. A reasoning item's opaque `encrypted_content` may be re-encrypted between item completion and response completion; only the authoritative terminal value is replayed, while all other completed-item fields must still agree.

The client does not execute tools, orchestrate an agent, retry, redirect or choose fallback protocols. Returned assistant continuation state must be preserved rather than rebuilt. Offline protocol tests do not establish compatibility with a particular live provider/model, performance improvement, semantic grounding or translation quality.

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

The analysis service further clamps every model-requested read to **3,072 text bytes**, including explicit larger requests, and respects smaller caller/host limits. Bootstrap is bounded to 2,048 bytes and 30 lines (or smaller host limits). Continuations are explicit and consume the same request budget.

The model supplies evidence IDs, never citation metadata. The host resolves IDs against immutable read snapshots, constructs path/record ID/heading/line-and-column/URL citations, and calls `AnalyzeResponse.validate_evidence(ledger)` before returning. Unknown IDs and forged metadata fail. Index excerpts and reads without heading context cannot be cited as substantive evidence.

If a claim's remedy excerpt contains no URL, the model must also read and cite a source-bearing section from the **same file and record**, usually its Sources section. The host returns both as separate citations: it does not copy or merge source URLs into the remedy citation. Unrelated global source URLs cannot satisfy this check. This proves read provenance only, not that the translated claim follows from the evidence, that the source is authoritative/current, or that policy assertions are correct. Synthetic documentation examples remain schema-only and intentionally do not pass a production evidence check.

## Opt-in local acceptance diagnostics

Python callers may pass a request-local synchronous callback as `await service.analyze(request, diagnostics=events.append)`. It is disabled by default and is not an HTTP request/response field, logging sink, file writer or provider option. See [issue #29's acceptance report](issue-29-offline-acceptance.md) for coverage and remaining live blockers.

Events are immutable, content-free snapshots: host-controlled phase/outcome, elapsed/remaining seconds, model call allowances and cumulative resource counts. They exclude prompts, user details, file paths/bodies, evidence identifiers, model text, endpoint/key configuration, raw exceptions and provider continuation payloads. No observer state is stored on the shared service. A callback must be fast and nonblocking; its time counts against the existing deadline. Ordinary callback exceptions are ignored, while cancellation of the analysis task still propagates. Collect only these events rather than raw request/provider traces for acceptance debugging; they do not establish semantic grounding or language quality.

## Optional protected analysis mode

`ANALYSIS_ACCESS_MODE=protected` requires a runtime-only high-entropy `ANALYSIS_ACCESS_TOKEN` for server-to-server `Authorization: Bearer ...` requests. Missing/invalid/duplicate credentials return a small 401 `access_denied` envelope before body/readiness/model work; local mode remains the default. Per-process `ANALYSIS_REQUESTS_PER_MINUTE` (default 10) and `ANALYSIS_MAX_CONCURRENT` (default 2) reject saturation with 429 `analysis_capacity` and `Retry-After`. The outer protected request deadline also covers body receipt/readiness and can return a small 504 `request_timeout` envelope. These are transport errors, not `AnalyzeResponse` objects. Health and capabilities remain public, and CORS still does not permit browser Authorization headers. See [protected-analysis deployment boundaries](protected-analysis.md): this is neither user authentication nor a distributed quota, and tokens must never enter frontend bundles.

## CORS and remaining integration

CORS is off by default. `CORS_ORIGINS` is a JSON array of exact HTTP(S) origins, with no path, query, fragment or user credentials; `*` is rejected. `localhost` differs from `127.0.0.1`, and scheme/port must match. Allowed methods are GET/POST and the configured request header is Content-Type (browser-safelisted headers also apply); credentialed CORS is disabled. CORS is browser response policy, not authentication or a server-side access-control substitute.

Remaining work includes independent semantic grounding and translation review across enabled languages, hardening the integrated demo, and live model compatibility checks only when separately authorized. Offline tests use fake models/transports and synthetic files, not proof of fluent output or production end-to-end acceptance. No archive retrieval, embeddings, deterministic alias retriever or full-corpus prompting should be introduced as a shortcut. Local demo wiring: [demo-runbook.md](demo-runbook.md).

The service already requires the selected reason to appear in cited explanation evidence and validates all emitted citation metadata against its ledger. Source correctness, claim support and translation fidelity remain independent review obligations. Whitespace-only generated prose and link syntax in uncited fields are rejected. Harmonizing the generic 400 parsing envelope remains a possible follow-up; keep schema fixture validation separate from production evidence acceptance.

## Generated-output security checks

Required generated prose must contain non-whitespace, non-control visible text; validation preserves accepted text exactly, including multilingual text and literal user details. Model warnings, clarification questions and classification prose reject URL/link syntax, including common HTML/percent encodings and malformed or credential-bearing URLs. Invalid final output follows the existing one-repair-then-error path.

Evidence-bearing prose may contain only plain exact URLs from its cited read excerpts. Model-authored HTML/Markdown links are rejected; structured citations are the navigation interface. These are conservative syntax/provenance checks, not a universal phishing detector, semantic verifier or substitute for safe frontend text rendering.

## Image input ownership

Text remains the default. The separately opt-in private-file image path adds `POST /api/v1/images/uploads` and an `image_key` analysis input; it is unavailable unless image input and private-bucket lifecycle configuration are explicitly enabled. Tickets bind declared MIME type, exact content length and language, expire, and are consumed once. The backend validates and flattens raster bytes before a separate tool-free transcription request, then analyzes the extracted text under the same request budget. The provider receives only a signed URL to the validated copy, not the inbox object or an arbitrary user URL. This is not automatic visual PII redaction and is not the extension screenshot feature. The operational safety requirements below apply to this path.

[Ajay’s secure image/OCR guide](../references/ajay-image-input-guide.md) remains the separate historical URL-only/extension handoff; enabling this private-file path does not certify that track, source accuracy or vision-model compatibility. Browser previews and explicit image-specific consent are required, and real credentials/cloud upload/provider validation remain operator-authorized work.

### Private-file image safety and deployment gate

- **Ticket contract:** send `{"content_type":"image/png","content_length":1234,"language":"en"}` to the upload route. `content_length` is a required strict integer, positive and at most 10 MiB (also bounded by `IMAGE_MAX_BYTES`). The response remains `object_key`, `upload_url`, `content_type`, `expires_in`. PUT the exact File/Blob with that Content-Type; the browser derives the signed Content-Length from the body, so do not manually set that forbidden header. Analyze using only that `image_key` and the same language, before ticket expiry. A new attempt requires a new ticket, even after failure or cancellation.
- **Admission:** 128-bit random inbox keys are bearer capabilities, not authenticated user accounts. The server records only minted keys with exact type/length/language and a monotonic expiry (120 seconds by default, maximum 900). Consumption is atomic before asynchronous work; unknown, expired, wrong-language and replayed keys fail closed. Unknown keys do not even trigger a storage read or delete. Pending admission is capped at 1,024 tickets per process; image processing is capped at two concurrent operations. This is not a distributed quota or public-service abuse defense. Preserve protected-mode upload authorization and deploy appropriate ingress/user quotas.
- **Routing:** tickets are deliberately process-local. Use one worker or sticky routing to the exact issuing worker. Restart, deployment replacement or another worker rejects old tickets rather than reconstructing authorization from storage metadata. No durable/distributed admission registry is claimed.
- **Validation:** the backend reads only the configured bucket through its SDK, with a single GET snapshot and at most declared length plus one byte. Metadata alone is not trusted. Pillow checks format/signature, full static-raster decode, exact input byte count, dimensions (maximum 8,192 on either axis), pixels (maximum 16 million), and single-frame PNG/JPEG/WebP. It rejects truncated, mismatched, animated or oversized inputs. EXIF orientation is applied, transparency is flattened onto white, and pixels are encoded into a fresh RGB PNG without EXIF/text/profile/trailing payloads; output is also capped at `IMAGE_MAX_BYTES`. Re-encoding is not visual PII redaction or proof that the source image was harmless. Users must redact visible personal data before consenting to upload and provider transcription.
- **Provider isolation:** a separate unpredictable `validated/` key is written create-only with the validated bytes, never a mutable server-side copy of `inbox/`. No PUT signature is minted for this key. Only that private, short-lived GET URL reaches the configured provider. Inbox overwrite/replayed PUT cannot replace the provider snapshot. No arbitrary image URL, original extension screenshot, base64, or automatic URL-fetch fallback is accepted. Fresh text-agent history excludes keys, URL and image parts; full signed links and substantial signature/credential/object-ID echoes are rejected, but OCR is not universal de-identification.
- **Lifecycle is mandatory:** `IMAGE_INPUT_ENABLED=false` and `IMAGE_LIFECYCLE_CONFIGURED=false` remain defaults. Set the latter only after the operator creates and verifies private-bucket expiry rules for **both `inbox/` and `validated/`**, including noncurrent versions if enabled and abandoned multipart uploads if allowed. Choose/document the shortest supported retention (for example one day where the provider only offers day-level expiry), verify actual deletion latency, and monitor content-free cleanup warnings. This flag is an operator attestation, not an API verification or automatic lifecycle provisioner. No cloud policy was configured by this change.
- **Cleanup limits:** each admitted request attempts deletion of inbox and validated objects on success, failure and cancellation. Each object has a seven-second cleanup deadline, including any retry; two objects can add up to fourteen seconds of cleanup under a cooperative event loop. Caller cancellation cannot skip the second cleanup attempt. A running SDK delete thread cannot be forcibly stopped and may finish later, but its waiter does not retain the request indefinitely. Lifecycle covers failed deletes, crashes, expired/unconsumed tickets and late PUT replay. Signed PUT URLs cannot be revoked by consuming a ticket or deleting an object: they can recreate the inbox object until signature expiry, but cannot authorize another analysis. URL expiry does **not** imply object deletion or provider cache/retention expiry. Do not promise immediate erasure.
- **Deadline limits:** extraction and text analysis share the request budget. SDK connect/read socket timeouts are three seconds with no automatic SDK retry. On cancellation, thread-backed reads/decodes/writes are joined before cleanup and capacity release, preventing a write from finishing after deletion. Socket timeouts are inactivity limits, not total deadlines; a slow trickle or decoder work can extend this join beyond the nominal request deadline. This is not a hard 30-second process-kill guarantee. Cleanup can also extend response latency.
- **Activation evidence:** local fake-storage/provider tests establish contract behavior only. Before enabling images, independently verify controlled-host signed Content-Length enforcement, private/no-redirect behavior, conditional writes, browser CORS, lifecycle expiry, selected vision protocol/model support, user disclosure and provider retention. Missing storage initialization or lifecycle configuration leaves text available and images unavailable. No live storage/model request, credentials inspection, deployment, or image-track milestone completion is implied.
