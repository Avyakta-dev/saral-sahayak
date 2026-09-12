# Image Level 1 — controlled image admission and shared analysis contract

Owner: Ajay (`Ajay-B-Acharya`). Issue: [#11](https://github.com/Avyakta-dev/saral-sahayak/issues/11). Shared API, security, protocol and budget approval: Anish (`iotserver24`).

**Status: proposed, ready for review; image implementation and live checks not started.** This is the independently actionable contract artifact, not completed host approval. No runtime code, configuration, provider, uploader, fixture or test is created by this document. Do not close #11 until the decisions in section 8 are accepted. [#12](https://github.com/Avyakta-dev/saral-sahayak/issues/12) remains gated.

## 1. Sources and observed baseline

Read the [Image guide](../ajay-image-input-guide.md), [privacy threat contract](extension-privacy-threat-contract.md), [backend contract](../../docs/backend-contract.md), [Markdown design](markdown-agent-design.md), [team board](../team-issue-board.md) and [live acceptance status](../../docs/live-acceptance-status.md). Baseline: `origin/main` at `6aeb177`, including the merged #16 privacy contract. The actual merged 181-record corpus supersedes older “absent” narrative paragraphs. Corpus availability is not evidence that images, provider URL fetching, current policy or a live supported-case result work.

Inspected seams:

- `backend/api/schemas.py`: `AnalyzeRequest` accepts text, language and optional explicit `ClaimDetails`; unknown keys are forbidden. Existing `AnalyzeResponse` has success/clarification/unsupported/error states and cited supported blocks.
- `backend/main.py`: `create_app`, request body middleware, capabilities/readiness, language/model/corpus/service gates and disconnect-aware analysis. No image route/uploader/downloader exists.
- `backend/llm/types.py` and native protocol builders: current message content is text; there is no approved typed user-image input seam. Do not insert arbitrary provider dictionaries to bypass it.
- `backend/agent/service.py`: existing text-analysis orchestration owns a request budget internally. OCR followed by an unchanged text call would start another budget; that is not allowed.
- `backend/tools/budget.py`: current defaults include 30 seconds, 12 model turns, 4,096 cumulative model-output tokens, two retries, 12 knowledge calls, eight files, 48 KiB/12,000 tool-output tokens. Evidence-read reservation changes already in main remain intact.
- Existing extension direct OpenAI screenshot/data-URL behavior is separate legacy behavior, **not an approved implementation of this Image contract**. The privacy track requires local pixel sanitation and denies image egress until a host/admission path exists.

The native Windows file-tool startup failure reported earlier is a separate deployment/portability dependency, not permission to remove containment checks. This contract neither reruns nor fixes it. Existing tests and live reports are source context; no new runtime check is claimed.

## 2. Trust-separated flow

1. An approved uploader/host operator admits **only an already approved, locally sanitized raster**. Uploader implementation is outside this Image track and is not presently approved. No automatic capture/upload or sending original screenshots.
2. The issuer returns a short-lived URL and a verifiable admission proof. Possession is sensitive bearer access, not proof that issuance was authorized.
3. The user intentionally supplies the admitted link in image mode and presses Analyze. The client sends it only to the configured backend; it never previews/fetches the image automatically.
4. Before provider spending, the backend checks enabled image capability, input shape/language, model/corpus readiness, exact URL policy, issuer proof and expiry.
5. The configured native vision protocol receives one image URL and fixed extraction instructions, with **no tools**. The backend makes no GET/HEAD, DNS probe or redirect-following download of the image itself.
6. Validate extractor output as untrusted text. Unreadable or unsafe output stops here with a safe error/fallback message; no guessed rejection or fabricated personal fields.
7. Pass validated rejection text and only the user's explicitly supplied safe fields into a **fresh text-agent history**, sharing the same budget and cancellation scope. Image URLs, proof, OCR reasoning and provider replay do not enter that history.
8. Return the existing analysis states and host-built policy citations. The signed image link is never a policy source, citation, draft assertion, error detail or telemetry value.

The page, pixels, OCR and provider responses are data, not executable instructions. They cannot change endpoints, tools, budgets, knowledge roots or system messages. No automatic submission/filling is added by Image work.

## 3. Proposed API, errors and capabilities

These are review proposals, not fields accepted by today's server. Preserve every existing text request and response. No new required fields for text callers.

### Input alternatives

- Text path: existing `text`, `language`, optional `details`; **no image proof**.
- Image path: `image_url`, `image_admission`, `language`, optional explicit `details`; **no text**.
- Exactly one input path. Neither/both, wrong JSON types, unknown keys, proof on a text request or missing proof on an image request fail schema/admission validation before model calls.
- Preserve whole serialized body maximum **32,768 UTF-8 bytes**, language default `en`, enabled-language enforcement and downstream text maximum **8,000 Unicode characters**. Do not infer claimant details from OCR.
- Proposed `image_url` maximum **2,048 characters**. Raw URL is a secret type with repr/error hiding; never normalize it into a different signed resource.
- Proposed admission is a compact signed proof string no longer than **4,096 characters**, verified locally against a pinned issuer key. Treat it as a secret with repr/error hiding and no logs, traces, diagnostics, downstream history or response echoes, just like the URL. Final proof format, algorithm and trust provisioning require Anish/operator approval. Do not accept a presence-only `signature`/`expires` check.

`image_admission` is an explicit proposed extension to the guide's URL-only shape so the backend can verify issuer authority without downloading images. If Anish chooses a locally verifiable native storage signature instead, remove this field before implementation and specify that verifier. **No insecure “optional proof” compatibility fallback.**

### Response/error proposals

Keep `AnalyzeResponse` and supported states; do not attach raw OCR/image URLs to it. Do not map unsupported image input to an invented policy classification.

| Condition | Proposed HTTP / error code | Required behavior |
| --- | --- | --- |
| Invalid JSON/schema or neither/both inputs | Existing 422 `invalid_request` | Input values never echoed. |
| Received body too large | Existing 413 `request_too_large` | Enforce while receiving, independent of content length. |
| Known disabled language | Existing 422 `language_disabled` | No OCR or model spend. |
| Operator disabled image input or no approved policy | 503 `image_input_unavailable` | Text fallback offered as an explicit new request, not automatic. |
| Bad/unapproved/tampered/expired URL or issuer proof | 422 `image_not_admitted` | One generic admission error; never echo URL/proof or reveal verifier details. |
| Missing model/corpus/service | Existing 503 gates | No OCR spend; corpus gate unchanged. |
| Complete extractor response says unreadable | 422 `image_unreadable` | Suggest clearer image or reviewed text; no guessed reason. |
| Invalid/truncated/excessive extractor output or unexpected tool | 502 `invalid_image_output` | Stop; no downstream agent or automatic retry. |
| Provider unavailable | Existing sanitized `model_unavailable` | No provider-body/URL/key echo. |
| Deadline/disconnect/budget exhaustion | Existing timeout/cancellation/budget behavior | Cancel all stages; no new history/call after terminal condition. |

Order proposal: body/schema and enabled-language checks, image-enabled gate, existing model/corpus/service readiness, local image admission, budget-owned OCR, then text analysis. All gates run before OCR spending; schema errors need no remote checks. Anish approves exact status names/order before code changes.

### Capabilities/settings proposals

`GET /api/v1/capabilities` continues to list actual enabled languages and unverified quality flags. Keep `inputs:["text"]` until all image feature/configuration/protocol/admission gates are valid; then explicitly add `image_url`. Do not infer support from model name. Add proposed `image_input_available` and safe, non-secret blocked-reason codes only after API review; do not expose signed URLs, trust keys or endpoint credentials.

Proposed operator settings are server-side:

- `IMAGE_INPUT_ENABLED=false` by default.
- `IMAGE_ALLOWED_SOURCES=[]`: exact HTTPS origins, segment-bounded paths, query/proof verifier policy and issuer binding. Empty policy means unavailable.
- `IMAGE_URL_MAX_TTL_SECONDS=300`: ceiling, not a grant; both object bearer-access lifetime and proof lifetime must independently be at most 300 seconds from issuance, with proof expiry equal to or earlier than object-access expiry. The issuer attests and host enforces the object's expiry; backend rejection alone cannot revoke a still-readable object. Propose at most 15 seconds clock skew on issue time only, never extending either expiry. Recheck before provider dispatch.
- `IMAGE_URL_MAX_CHARS=2048`; `IMAGE_OCR_MAX_CHARS=8000`.
- `IMAGE_OCR_MAX_OUTPUT_TOKENS=1000`, bounded further by the single request's remaining allowance.
- Pinned issuer/algorithm/key provisioning names remain undecided; no trusted sample domain, public key, signing endpoint or secret is supplied here.

Existing configuration example files are not edited in this level. False/invalid/unknown policy must fail closed, not enable an arbitrary public image proxy.

## 4. Admission versus object/provider enforcement

### Backend local URL admission

Validate original URL bytes and parse once according to the reviewed signature format. Require exact ASCII approved HTTPS hostname, approved port, no userinfo/fragment/whitespace/control/backslash, no IP literal or alternative numeric host, no localhost/internal/LAN name, no suffix/lookalike/trailing-dot/ambiguous Unicode authority. Enforce segment-bounded paths, no encoded/double-encoded traversal or separators, strict query parameter multiplicity/allowlist and maximum sizes. Do not normalize signature parameters or accept an alternate textual URL for the same apparent host.

The proposed authenticated admission proof binds issuer ID, audience, exact raw URL digest, opaque immutable object ID, raster content digest, MIME, byte count, dimensions, issue/expiry timestamps and single object read scope. The issuer must attest these values from its own upload validation, not blindly sign client metadata. Verify a fixed approved algorithm with a pinned key; no caller-selected JWK URL, arbitrary key fetch, algorithm downgrade or unsigned token. Token parsing is bounded and proof/replay policy is explicit. The backend verifies declarations/authenticity, **not the underlying pixels**. Without a verified issuer design, no images are admitted.

### Controlled host/operator responsibility

Authenticate uploads and authorize object ownership/read access. The trusted local sanitizer decodes, masks, flattens and re-encodes the final JPEG/PNG/WebP **before user review**. The uploader sends exactly those reviewed immutable bytes and a locally bound digest; the operator validates/decodes under resource limits but stores those same bytes without transformation, binds the proof's content digest to the stored object, and rejects rather than repairing invalid content. Reject SVG/GIF/PDF/archives and format/MIME polyglots. If the host requires re-encoding, that is a different unapproved artifact/consent flow and blocks this design until reviewed. An issuer signature proves authenticated object admission, not correct redaction or user consent; the trusted sanitizer/controller-to-uploader handoff must separately enforce the privacy contract's request, generation and exact-byte approval binding. Enforce compressed byte, decoded pixel/dimension/workload ceilings, metadata stripping and expiry before read. Store approved redacted bytes privately with no permanent public link, redirects, wildcard fetch proxy, path traversal or mutable replacement under an admitted object ID. Agree deletion/retention/revocation, access logs, key rotation and who can issue links. Anyone with a signed URL may read until expiry; disclose that fact.

The backend does not GET/HEAD/resolve arbitrary image URLs to “verify” them. Host guarantees cannot be replaced by assumptions in the client or by provider `follow_redirects:false`.

### Native provider responsibility

Provider fetch may perform its own DNS resolution, redirects, decoding, caching and retention. Verify the chosen provider's URL-image behavior separately and bind it to approved immutable sources. API POST redirect policy controls the API request only, not the provider's image fetch. `store:false` where supported is not proof of zero retention. Disallow providers whose required fetch behavior contradicts host/admission policy; never fall back to base64, file IDs, multipart or backend download.

Use the smaller of Image/operator raster ceilings and privacy contract ceilings for extension-origin screenshots. Privacy's proposed 120-second request/vault expiry is not refreshed by a 300-second URL. A still-readable image URL does not revive a local restoration request.

## 5. Typed native protocol seam

Add a narrow typed **user-only** URL-image attachment in `backend/llm/types.py` after approval. Only already admitted URLs enter its constructor. No raw dictionary escape hatch, `provider_items` bypass or arbitrary model-selected image URL. Assistant/tool replay remains unchanged and cannot add image input.

These snippets are structural sketches only; `<approved-url>` is not a real hostname, default or accepted test value:

| Configured protocol | Proposed native image part |
| --- | --- |
| Responses | `{"type":"input_image","image_url":"<approved-url>"}` in user content with a fixed `input_text` instruction |
| Chat Completions | `{"type":"image_url","image_url":{"url":"<approved-url>"}}` in user content with a fixed text instruction |
| Messages | `{"type":"image","source":{"type":"url","url":"<approved-url>"}}` in user content with a fixed text instruction |

Each actual provider must support the selected native URL form. Unsupported features/protocols fail before sending, not by trying all adapters. Do not change text-only payloads or tool-call history serialization. Authentication remains the existing transport-only provider configuration; image URLs/proof never enter auth headers or diagnostics.

## 6. Extractor and single shared budget

Proposed extractor: one `complete` invocation with `tools=()`, fixed rejection-transcription instructions and one admitted image URL. Strict JSON: `{"status":"extracted","text":"..."}` or `{"status":"unreadable","text":""}`. No extra keys, rationale, identities, citations, tool calls or guessed policy. Reject non-JSON, conflicting status/text, empty extracted text, more than 8,000 Unicode characters, truncated/unsafe output and unexpected calls. Scan for signed URL/proof echoes before downstream use. No automatic OCR retry; terminal output remains terminal.

Anish-owned service seam proposal:

- Create one `Budget` and overall monotonic **30-second** cancellation/deadline scope before model work. Admission time cannot grant extra analysis time; decide exact budget construction point in API/service review.
- Pass that same instance through admission dispatch checks, extractor and an internal text-analysis entry accepting an existing budget. Do not call the existing public text method if it creates a new budget/deadline.
- Charge the single OCR turn and actual accounted output against existing 12-turn/4,096-output-token limits. The requested OCR output ceiling is the minimum of 1,000, remaining budget and client configuration. Remaining allowance is 4,096 minus actual charged usage and any earlier charges: exactly 1,000 charged leaves 3,096; fewer charged leaves more. The stage ceiling is not a fixed reservation. Without reported usage, serialized UTF-8-byte accounting may exceed the requested token ceiling; terminal exhaustion stops work, not zero-cost fallback.
- Knowledge tools retain 12-call/eight-file/48-KiB/12,000-token constraints and request/call deadlines. OCR gets no tools, so it cannot read the corpus or run a second retriever.
- Preserve the current text service's at-most-one final-output repair, charged to the shared budget's two-retry ceiling; the ceiling does not authorize two automatic retries. Do not add parallel copies, longer timeouts, hidden provider fallback or a fresh allowance after unreadable output.
- Carry disconnect/abort across stages; check budget/expiry immediately before every call and state transition. A late OCR response never starts text analysis.
- Build a fresh history with validated rejection wording and deliberately supplied request details only. Never pass OCR replay, raw image part, signed link, proof or extraction reasoning to the policy agent. Host citations still come exclusively from actually read Markdown evidence.

Adapter error seam requiring Anish's review: existing parsers may reject truncation/unexpected calls before producing `LLMResult`, normalized as `LLMError("bad_response")`. The proposed image wrapper maps that code to terminal `invalid_image_output`, while transport/authentication errors retain sanitized provider failure and timeout/cancellation retain deadline semantics. It charges the attempted turn before dispatch. If the parser rejected the response and no trustworthy output usage reaches the wrapper, fail terminally with no downstream work; do not treat missing usage as zero or restart a budget. Any usage-carrying error redesign belongs to the shared client review. These distinctions are not claimed to exist today.

Extraction privacy boundary: JSON/length checks and fresh history alone cannot establish identifier-free text. A proposed host minimization step must reject URL/proof echoes, recognizable credentials/identifiers and extraction that mixes identity fields with rejection wording; never copy OCR into `ClaimDetails`. Unknown or inseparable identity/context goes to `image_unreadable`/manual reviewed-text fallback, not automatic downstream transmission. Pattern screening is incomplete and cannot certify all names/addresses or detect fabrication. Image-mode activation therefore also requires a reviewed redacted-input provenance/minimization policy; absent that policy, keep the mode disabled. Embedded instructions remain untrusted text even when they pass structural checks. No general claim of perfect de-identification is made.

Live acceptance already has latency/budget blockers on the text path. Adding OCR cannot be represented as a performance improvement or ready production feature; text-path fixes remain Anish's #29 work.

## 7. Proposed file ownership and later acceptance

| Proposed change | Owner / review | Later level |
| --- | --- | --- |
| `backend/api/schemas.py`, capabilities/routes, settings | Anish approves shared changes; Ajay coordinates implementation | #12 / #14 |
| Proposed `backend/images/admission.py` and policy types | Ajay; Anish + operator verifier/security review | #12 |
| `backend/llm/types.py` + native Responses/Chat/Messages builders | Anish protocol approval; Ajay coordinated serializers | #12 |
| Proposed `backend/images/extractor.py` | Ajay; Anish output and budget review | #13 |
| `backend/agent/service.py` shared-budget entry, disconnect ownership | Anish; Ajay integration | #14 |
| Backend image tests/synthetic URL fixtures | Ajay, preserving existing text/adapters/tests | #12–#15 only when authorized |
| Extension redaction/vault/uploader UI | Separate Privacy and Extension UI issues | Not Image Level 1 implementation |
| Controlled issuer/uploader/storage service | Operator not chosen; requires separate authorization | External prerequisite |
| Main web UI | Shravya; no transfer | Separate UI track |

Planned acceptance (all **not run** in this contract task):

| Scenario | Expected later behavior |
| --- | --- |
| Existing text request and all native text/replay payloads | Unchanged schema, serialization, budgets and outcomes. |
| Neither/both image/text, extra key, body/URL/proof overflow | Rejected before any remote request; no input echo. |
| Invalid scheme/IP/internal/suffix/Unicode/encoded path/query trick | Rejected by bounded local admission. |
| Proof has wrong issuer/audience/object/digest/algorithm, is missing or expired | Rejected without image download or arbitrary verifier network request. |
| Valid synthetic admission plus all three protocol adapters | Exactly one intended native user URL-image part to the configured endpoint; no base64 or fallback. |
| Host redirects, mutable object, wrong format, oversize raster or invalid signature policy | Block activation or admission; distinguish operator/provider guarantees from backend checks. |
| Pixels contain tool/system instructions, URL echo or invented identities | No tool execution or inferred claimant details; reject recognized private/link echoes, and admit downstream text only under the approved minimization policy, otherwise safe failure. |
| Unreadable/blank/truncated/malformed/extra-key extractor response | Stop before policy agent; no canned explanation. |
| OCR then text analysis reaches deadline/output/retry limit | Same shared budget fails; no restart or extra call. |
| Cancellation while OCR is pending | Late result discarded; no downstream stage. |
| Supported synthetic extraction with actual text agent and temporary corpus | Fresh history, real bounded Markdown reads, host citations, no image URL leakage. |
| Missing configured model or real corpus structure | Genuine dependency error before OCR spending. |
| Capabilities says images unavailable or provider lacks URL support | UI reports unavailable; no inference from model name. |
| Signed link/raw OCR/provider error would enter logs, repr, citations or output | Sanitized error and blocked leakage, not silent echo. |
| Browser image-input flow | No automatic preview GET, no direct provider calls from UI; API destination only. |
| Live host/provider evaluation | Separate explicit synthetic asset, approved origin/model, request/credit ceiling and retention review required. |

No executable test or synthetic page is added now. The user requested actual functionality before more harness work; this level's required future scenarios are documentation, not fabricated passing results.

## 8. Decisions required before implementation

| Decision | Required approver | Current state |
| --- | --- | --- |
| Which controlled HTTPS image host/operator is approved? What exact origin/path and object ownership model? | User/operator + Anish | **Unanswered; no host approved.** No public example host substituted. |
| Native verifiable signature vs separate issuer approval envelope; exact algorithm/key provisioning/replay policy | Anish + operator | Proposed proof envelope only; approval pending. |
| URL TTL, skew, byte/pixel/type/decode ceilings, no redirects, retention/deletion and access logs | Operator + Anish | Proposed ceilings; guarantees unverified. |
| API union, proof field, error codes and capability/version compatibility | Anish | Pending; current API unchanged. |
| Single-budget constructor/entry point and cancellation ownership | Anish | Pending; never wrap OCR around a fresh text budget. |
| URL-native model/protocol support, provider DNS/redirect/retention behavior | Anish + approved provider/operator | Pending; no paid test or endpoint activation. |
| Extension redacted-image provenance and approval equality | Ajay + Anish; Avyakta UI review | Privacy #16 contract exists; later implementation gated independently. |

**Question for user/operator:** identify the controlled image storage service and responsible operator, then provide its intended HTTPS origin/path and issuer/retention policy for Anish's review. Do not share signing keys, live bearer URLs or private claim documents in the issue or PR. Until answered and approved, #12–#15 cannot be treated as ready implementation tasks.

## 9. Delivery evidence and stop condition

This artifact is a reviewable proposal for #11, not an approved API or operational image service. Performed: source/issue inspection, documentation link/structure checks and focused PR preparation. Existing test results were not rerun or inherited as Image acceptance. Runtime, browser, OCR, provider, issuer, host and network-retention checks: **planned / not run**. No `.env`, secrets, personal screenshots or real claim fixtures accessed.

Request Anish review and record the user/operator decision. Keep #11 open until acceptance; do not auto-close from a documentation merge. #12 requires both accepted decisions and an explicit implementation authorization. The user's sequential-work request authorizes preparation of eligible tasks, not guessing host approval or crossing shared security gates.
