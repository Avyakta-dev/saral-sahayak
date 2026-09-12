# Ajay — secure image input, one Image Level at a time

## Ownership and current status

**Ajay owns image/OCR implementation, its tests and handoff. Anish approves shared backend/API, model-protocol, security and request-budget changes.** Shravya owns web UI; Avyakta owns knowledge content. Coordinate shared files before editing them. Do not take over another person's tasks.

This is a separate image track, not a replacement for the [five extension levels](ajay-extension-guide.md). This document does not authorize implementing either track or advancing levels automatically. No image level is complete yet. Begin Image Level 1 only when requested; report and stop before the next.

The backend currently accepts **text only**. It has no image endpoint, uploader, typed image message, image configuration or vision extractor. The runtime knowledge directory `references/knowledge/epfo/` is absent. Other Markdown in `references/` is team/reference documentation, not a substitute runtime corpus. Do not change the knowledge root to bypass readiness.

## Read first

- [Team instructions](../AGENTS.md), [ownership/workflow](../CONTRIBUTING.md), [team levels](team-work-levels.md), [reference index](README.md).
- [Current agent design](planning/markdown-agent-design.md) and [backend API contract](../docs/backend-contract.md).
- [API and lifecycle](../backend/main.py): body limits, readiness, capabilities, cancellation.
- [Schemas](../backend/api/schemas.py) and [settings source](../backend/config.py). Do not read `.env` or process secrets.
- [Model types](../backend/llm/types.py), [client](../backend/llm/client.py), and native [Responses](../backend/llm/responses.py), [Chat Completions](../backend/llm/chat_completions.py), [Messages](../backend/llm/messages.py) builders.
- [Agent service](../backend/agent/service.py), [budget](../backend/tools/budget.py), [file tools](../backend/tools/knowledge_files.py), [evidence ledger](../backend/evidence.py), [corpus gate](../backend/knowledge_readiness.py).
- Existing [API tests](../tests/backend/test_api.py), [protocol tests](../tests/backend/test_agent_protocols.py), [adapter tests](../tests/backend/test_llm_adapters.py), [full analysis tests](../tests/backend/test_full_analysis.py).

## Intended user flow

1. The user obtains a short-lived link to an image on an approved controlled image host. Building that uploader/storage service is not included here.
2. The user chooses image mode, supplies the link and explicitly clicks Analyze. No automatic page scraping, screenshot upload or image preview request.
3. The backend validates the link and configuration before any paid model request.
4. A vision-capable provider reads the URL through its native image input and returns only extracted rejection wording.
5. The backend validates extraction and passes it to the existing text agent in a fresh history, sharing the request budget.
6. The text agent reads actual Markdown evidence and returns existing response states and host-built citations/draft.

This improves input convenience; it does not guarantee lower latency. OCR adds a model stage. Image input is not evidence of government policy.

## Security contract to agree before coding

- **No base64**, `data:` URLs, multipart uploads, file IDs, local file paths, PDFs or backend image downloader. The backend sends one native URL image part to the fixed model endpoint. It does **not** GET/HEAD the image, follow image redirects, resolve arbitrary URLs or decode image bytes.
- Use a user-approved, controlled HTTPS origin and segment-bounded path prefix. Default to disabled with no allowed origins. Never enable an arbitrary public-image proxy or wildcard host.
- A sensitive image should be privately stored and accessible through a short-lived, narrowly scoped signed bearer URL. Anyone with that URL can access it until expiry. Do not publish claim documents permanently or put real signed URLs in Git, screenshots, logs, analytics or examples.
- Validate the raw URL: length, HTTPS, exact hostname, approved port, path boundaries and query policy. Reject credentials, fragments, control/whitespace, backslashes, IP literals/alternative numeric addresses, localhost/internal names, lookalike/suffix hosts, trailing-dot or encoded-authority tricks, ambiguous Unicode hostnames, encoded/double-encoded traversal and separators. Do not normalize a signature into a different URL.
- Signing is not proved by the presence of `signature` or `expires`. Anish and the host operator must agree an authenticated issuer contract, expiry/TTL and tamper checks bound to the exact URL/object. If native storage signatures cannot be locally verified, agree a verifiable issuer approval envelope or another reviewed admission design. Do not invent a public signing endpoint or ship a permissive fallback while this decision is unresolved.
- The origin must enforce object authorization, expiry, permitted raster types, byte/pixel/dimension limits, and no redirects/open proxy. Agree JPEG/PNG/WebP support; reject other formats and unsafe decoding workloads at that boundary. Our URL-only backend cannot inspect those bytes and must not claim it does.
- Provider-side fetching has its own DNS, redirect, decoding and retention behavior. Backend `follow_redirects=False` controls only the provider API POST, not the provider's fetch of the image. Confirm these responsibilities before enabling the feature; allowlisting alone is not a provider-SSRF guarantee.
- Provider and signing secrets remain server-side. Signed image links and raw OCR are transient. Hide them from representations, errors, traces and returned citations/drafts. Responses `store: false` is not proof of zero provider retention.
- Images and extracted text are untrusted data. Instructions inside them cannot expand tools, budgets, file access or network permissions. Preserve safe rendering; never render model content as raw HTML.

## Proposed API/configuration — not implemented

Preserve existing text requests. Propose exactly one of `text` or `image_url`, with the same `language` and optional explicit `details`. Neither/both inputs, unknown fields, oversized values and unsupported types must fail safely. Keep the 32,768-byte whole-body limit and 8,000-character downstream text limit. Do not infer personal draft fields from OCR.

Proposed configuration names for Anish's approval:

| Name | Proposed behavior |
| --- | --- |
| `IMAGE_INPUT_ENABLED` | Default false; explicit operator opt-in, never inferred from model name |
| `IMAGE_ALLOWED_SOURCES` | Empty by default; each entry binds exact HTTPS origin, path prefix, query/verifier policy |
| `IMAGE_URL_MAX_TTL_SECONDS` | Proposed 300-second ceiling, with agreed clock-skew/issuer rules |
| `IMAGE_URL_MAX_CHARS` | Proposed 2,048-character limit; confirm compatibility with approved signed URLs |
| `IMAGE_OCR_MAX_CHARS` | At most 8,000 characters for validated rejection wording |
| `IMAGE_OCR_MAX_OUTPUT_TOKENS` | Proposed 1,000-token stage ceiling, capped further by shared remaining allowance |

Final settings and error/status codes are a Level 1 decision, not existing configuration. Never add sample domains as trusted defaults. Missing/invalid policy leaves image mode unavailable. Capabilities must distinguish enabled input types, local analysis readiness and independently verified vision/language quality. Keep current model/corpus gates before OCR spending.

## Native protocol shapes

These future examples show user-content arrays, not currently accepted request bodies. `<approved-url>` is a placeholder.

| Protocol | Image content part |
| --- | --- |
| Responses | `{"type":"input_image","image_url":"<approved-url>"}` alongside `{"type":"input_text","text":"Extract rejection wording only."}` |
| Chat Completions | `{"type":"image_url","image_url":{"url":"<approved-url>"}}` alongside a `text` part |
| Messages | `{"type":"image","source":{"type":"url","url":"<approved-url>"}}` alongside a `text` part |

Add a narrow typed, user-only image attachment after Anish approves the shared type change. Do not use arbitrary dictionaries or `provider_items` as a bypass. Preserve all existing text and assistant/tool replay behavior. Native URL support must be verified for the actual provider/model; there is no silent fallback to another protocol or base64.

The extractor uses one bounded `complete(..., tools=())` call. Agree strict JSON such as `status: extracted|unreadable` with `text`; reject unknown fields, blank/overlong text, malformed/truncated output and unexpected tools. Unreadable output offers clearer-image/text-paste help, not guessed rejection reasons or identities.

Pass only validated extracted text and the user's intentionally supplied language/details to a **fresh text-agent history**. Never forward the signed link, image content parts, extraction reasoning/replay or link echoes into that history. Keep OCR URLs out of policy citations.

**Budget integration requires Anish's approval:** `AnalysisService._analyze` currently creates its own `Budget`. Calling it unchanged after OCR would restart time/token allowances. Introduce a shared-instance seam so extraction and analysis share the 30-second request deadline, model-turn/output limits and bounded repair allowance. No parallel budget copies, automatic OCR retries or post-cancellation calls.

## Image Level 1 — agree contracts, no implementation

**Do:** read the above files; describe current behavior; propose request/error/capability/settings contracts and exact changed-file ownership. Ask which controlled image host/operator the user approves. Agree the signing/admission contract and shared-budget seam with Anish. List unanswered decisions as blockers.

**Acceptance:** the plan distinguishes URL validation from origin/provider byte and redirect checks; covers all three native wire formats, fresh history, no base64/downloads, privacy and later tests. All tests are explicitly marked planned/not run.

**Stop:** report contracts, file ownership and required approvals. Do not create code, fixtures, hosts or credentials. Image Level 2 requires a new explicit request.

## Image Level 2 — URL admission and typed image messages, offline

**Do only after request/approval:** implement agreed URL/settings validation and issuer checks; add typed user image parts and native serializers in approved shared files. Use synthetic links/test-only keys/fixed clocks. Keep image mode disabled by default.

**Test:** exact origin/path success; bad host/suffix/port; IP/local/credential/Unicode tricks; traversal/encoding/duplicate queries; tampered/expired/over-TTL signatures; missing policy; both/neither inputs; URL/body limits; each native wire format; unchanged text/replay. Reject unsafe requests before model calls. Assert no backend image GET/HEAD and no base64 payload.

**Stop:** report tests, changed files and Anish review. Mocks do not verify real host security. Do not start extraction until Image Level 3 is requested.

## Image Level 3 — tool-free extraction, offline

**Do:** build the small extractor with injected client/budget, one image user message and no tools. Validate bounded transcription and sanitize failure paths. Keep raw image URL out of subsequent conversation history.

**Test:** synthetic clear/blurred/blank/multilingual expected text; embedded instructions; signed-link echo; malformed/extra/oversized/truncated output; refusals/unexpected tools; provider errors; timeout/cancel; missing usage; shared token/time exhaustion. Use mocked transport; assert only provider POST, no retries or image fetches and no secrets in errors/repr/logs. Mocked text is not real OCR accuracy.

**Stop:** report exact cases and consumed allowances. Do not connect the API or text agent until Image Level 4 is requested.

## Image Level 4 — integrate the actual text agent, offline

**Do:** admitted link → extractor → validated text → existing agent/tools/ledger. Reuse shared budget/deadline and readiness gates; preserve text behavior and multilingual fields. No canned success replacement or broader knowledge root.

**Test:** actual adapters and service with fake provider responses and temporary synthetic corpus; all three protocols; fresh history without signed URLs; real bounded Markdown reads; host citations and literal draft details; unreadable/unknown/ambiguous cases; prompt injection; no downstream work after errors/cancel/exhaustion; missing corpus returns 503 before OCR. Distinguish fake-service API tests from actual-service integration.

**Stop:** report layers exercised and remaining real-host/model/corpus blockers. Do not claim a real EPFO demonstration or advance automatically.

## Image Level 5 — browser, security checks and handoff

**Do when requested:** test local Swagger `/docs` using normal browser interaction, DOM observations and viewed screenshots. Use isolated synthetic settings, fake provider and temporary corpus, never actual `.env` or private claim images. No web/extension UI implementation included.

**Check:** disabled capability, invalid/expired link rejection, unreadable output, genuine missing-corpus error, synthetic integrated success, unchanged text flow, safe errors and cancellation. Record browser/version, expected versus observed results and screenshots. Do not save sensitive HARs, signed URLs or model/signing keys. Confirm the browser talks only to the backend, with no automatic image preview or provider request.

**Live gate:** ask separately for the approved origin/provider/model, synthetic image, small request/credit ceiling and explicit permission. Review host expiry/no-redirect/size and retention guarantees. Evaluate actual OCR/language quality only if authorized; otherwise mark blocked/not run. Production corpus remains a separate dependency.

**Stop:** deliver updated API docs, configuration names, redacted screenshots, test results and limitations. No store publication, deployment, push, merge or automatic next task.

## Checkpoint format

At each stop report: owner; **Image Level**; status; files read/changed; deliverable; each check with expected/observed/pass/fail/not-run; synthetic versus live components; network/credit use; URL/privacy/budget behavior; Anish approval and image-host decision; blockers; next level awaiting explicit request.

## Copy-paste prompt

> I am Ajay. Read AGENTS.md, CONTRIBUTING.md, references/README.md, references/team-work-levels.md and references/ajay-image-input-guide.md. Start **Image Level 1 only: planning/contracts, no implementation**. Read the linked current backend files, explain the small steps, and ask me which controlled image host/operator is approved if undecided. I lead image/OCR; obtain Anish's approval for shared backend/API/protocol/security and budget decisions before later code changes. Keep this separate from my extension levels. Do not read .env/secrets, install, run tests/providers/Git, deploy, push or merge in this planning level. Preserve existing work. Report contracts, proposed files, decisions/blockers and planned/not-run checks, then stop until I explicitly request Image Level 2.
