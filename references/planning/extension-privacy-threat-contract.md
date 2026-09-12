# Extension Privacy Level 1 — screenshot, vault and placeholder contract

**Owner:** Ajay (`Ajay-B-Acharya`) · **Issue:** [#16](https://github.com/iotserver24/saral-sahayak/issues/16)
**Status:** proposal ready for review; not approved or implemented.
**Baseline inspected:** `a3bf062` (2026-09-12). Shared security/API reviewer: Anish (`iotserver24`). Extension UI reviewer: Avyakta (`Avyakta-dev`), [UI issue #21](https://github.com/iotserver24/saral-sahayak/issues/21). Shravya retains main web UI ownership.

This is the scoped artifact for issue #16. It changes no runtime code, permissions, endpoint, provider mode, UI, credential, uploader or storage. It does not certify the existing extension. Every numerical choice below is a **proposed ceiling requiring review**, not an observed runtime guarantee. Runtime acceptance scenarios are planned / not run. Do not close #16 or begin [#17](https://github.com/iotserver24/saral-sahayak/issues/17) until approval is evidenced.

## 1. Authority, scope and inspected baseline

The [privacy/provider guide](../extension-privacy-and-provider-guide.md) supplies these requirements; the [Markdown agent design](markdown-agent-design.md) still governs EPFO grounding. The [image guide](../ajay-image-input-guide.md) is a separate dependency, not permission to upload. [Backend contracts](../../docs/backend-contract.md), [team board](../team-issue-board.md) and [live acceptance report](../../docs/live-acceptance-status.md) distinguish implemented code from plans. Older missing-corpus paragraphs are historical: the merged corpus exists. The live acceptance report records unsuccessful supported-case attempts, not verified production analysis; this task makes no new provider calls.

### Existing behavior is not the target privacy guarantee

| Inspected implementation | Current behavior | Gap against this contract |
| --- | --- | --- |
| `extension/background.js`: state, scan and analyze handlers | Stores the state, including profile/key/file and captured screenshot/field data, in trusted `chrome.storage.session`; captures visible-tab JPEG; sends raw profile, file metadata and field metadata directly to OpenAI, optionally with a JPEG data URL. Current startup restores stored state; scan replacement has cleanup checks, but no privacy-vault TTL. | Session storage is not the proposed vault; raw values, selectors and data-image egress remain incompatible with advanced privacy. Approval alone does not sanitize them. |
| `extension/content.js`: `describe`, `scan`, `fill` | Collects eligible control labels, selectors, current values/options; excludes several sensitive types including UAN; binds targets to scan state; uses native setters and synthetic events for confirmed filling. | Exclusion patterns do not establish comprehensive privacy. Raw labels can include identifiers. Current selectors go to the model; synthetic events may trigger autosave/upload. |
| `extension/mapping.js`: `validatePlan` | Checks model values against supplied profile and captured selectors. | Literal-value grounding is not token-only privacy; raw personal values already crossed the provider boundary. |
| `extension/epfo-content.js` and `epfo-popup.js` | Detect bounded visible candidate remarks, allow local editing and explicit approval. | Identifier screening/manual editing is not complete free-text de-identification or pixel redaction. |
| `extension/epfo-background.js` | Fixed loopback capabilities/text analysis; language discovery; body limits and cancellation. Recent changes restore non-sensitive capability metadata across worker suspension. | Sends approved literal remark text; no vault/token protocol, image admission or restoration contract exists. |
| `backend/main.py`, `backend/api/schemas.py` | Text analysis and capabilities; explicit optional claimant details; host-validated citation structure. | Do not send new slot/token/image objects or private `details` under this proposal. A future adapter and capability declaration require Anish's approval. |
| `extension/tests/` and live-status documentation | Existing offline coverage and explicit browser/live gaps. | These do not prove flattened-pixel redaction, token confidentiality, vault destruction or real portal compatibility. |

**Release constraint:** the current raw-data form/screenshot path must not be relabelled “private”, reused as a fallback, or enabled as an advanced-privacy mode. A later implementation PR must gate/replace incompatible egress before claiming this contract. This document does not disable that existing path and does not claim that it is safe for real identifiers. The original Extension issues #6–#10 still need their own browser/permission/data-flow acceptance; the merged code does not retroactively complete those issues.

## 2. Assets, adversaries and boundaries

Protect: approved personal values; original screenshot pixels; sanitized-but-still-sensitive context; local target bindings; request tokens and their map; settings authentication keys; restored text; signed image URLs; user approval. Availability and semantic correctness matter too: a private but invented remedy is not acceptable.

Untrusted parties/data include the page and its scripts, embedded frames, image/canvas/shadow content, page labels/tooltips/options, user pasted text, model responses and provider error bodies. Assume a page can mutate between inspection and capture, impersonate extension prompts, expose identifiers inside otherwise innocuous text, and trigger side effects on field changes. Assume a model can echo instructions, forge tokens or select the wrong slot. Treat loopback services as separate recipients, not inherently private. A compromised browser/OS, privileged extension or malicious user debugger is outside the isolation guarantee; do not promise protection from them or zero memory copies.

### Data-flow contract

```text
Untrusted page / approved selection
    | explicit Capture; minimal eligible field reads only
    v
Isolated request controller + private in-memory vault
    | public safe-label registry + opaque tokens; no raw metadata
    | local raster decoding, complete coverage classification, flattening
    v
Trusted sanitized-preview surface
    | mandatory manual review; endpoint/mode disclosure
    | explicit Analyze bound to exact reviewed payload
    v
Approved destination adapter (no generic fetch bridge)
    | token-only slots + approved de-identified remark
    | image only after separate Image admission/uploader approval
    v
Untrusted response -> structural/token/grounding validation
    | exact allowed slots; current request still alive
    v
Local one-pass restoration -> local reviewed result
    | separate explicit Fill; exact eligible target revalidated
    v
Original page (privacy boundary is intentionally crossed here)
    | user manually decides any later submission outside extension
```

1. **Page → controller:** an isolated content adapter performs the narrow capture, never owns the full vault. Page `postMessage`, DOM attributes and window globals cannot retrieve values/tokens or select endpoints. Verify extension ID, exact trusted sender surface, tab/frame/document and operation. No externally connectable or generic execute/fetch endpoint.
2. **Controller → preview:** default shows fixed masks and safe labels. If an explicit local reveal is needed for correctness, show one allowed value in the trusted extension surface only, temporarily; never encode it in hidden DOM attributes, accessibility labels, logs or screenshots meant for export. Clear DOM/text when dismissed. The full vault/map is not passed to UI components.
3. **Preview → network:** a single immutable approved payload is sent once. Provider adapter cannot access the vault or original raster; only sanitized data plus transport-only authentication. No ambient cookies, referrer/page metadata or unapproved routes.
4. **Network → validator:** output cannot address a DOM selector, call a tool, change consent, request a secret, extend TTL or choose another provider. EPFO substantive guidance still requires the host's evidence ledger/citation validation and existing budgets.
5. **Restoration → page:** local display is not authority to fill. Releasing a value to the page releases it to that site's scripts and possible autosave. For high-impact pages, unsupported targets or ambiguous side effects, block Fill and offer local/manual assistance only.

## 3. Data classification and minimization

Unknown classification means **deny**, not generic “other”. Page names/IDs/autocomplete help local classification only; never become network labels. The safe label is selected from an extension-owned constant registry and confirmed locally; page text cannot add categories.

| Data class | Capture / local treatment | AI/backend boundary | Restoration / Fill |
| --- | --- | --- | --- |
| Ordinary applicant name, contact email, telephone, postal address | Individually selected and approved; short bounded read to vault; fixed `***` default preview. Personal/sensitive for partial-preview purposes. | Opaque token, `filled` boolean and constant safe label only. | Exact approved local template slot; ordinary eligible contact field only after separate Fill approval. |
| Missing approved value | Do not infer, inspect neighbouring records or query the page for substitutes. | Fresh placeholder with `filled:false`; no value/length/reason metadata. | Remains unresolved with local missing-field feedback; no Fill. |
| EPFO rejection wording and other free text | Read only selected bounded remark; classify all text, not just form inputs. User can remove irrelevant identifiers. If safe de-identification would erase the reason's meaning, block and request a non-identifying description. | Only approved de-identified wording. A token-bearing policy text protocol requires Anish's review; never hide a serialized slot envelope in the existing `text` field. | Do not reconstruct identifiers in policy explanation/citations. A local draft may use separately approved template slots. |
| UAN, Aadhaar, PAN, passport/government ID, claim/account/member identifiers, DOB, banking/payment/health identifiers | Prohibited from this first vault allowlist. Do not read control values or store them; mask the entire pixel region. Static text containing them must be excluded or fail closed. | None: not raw, hashed, encrypted, partially revealed, or replaced with value-derived tokens. | No restoration or automated filling. Missing identifiers remain manual. |
| Passwords, OTPs, CAPTCHA answers, authentication/session cookies/tokens, recovery codes, page API keys | Never intentionally collect as page content, vault entries, OCR output or logs. Exclude regions before eligible capture where possible; unknown coverage blocks. | None. | Never restore/fill/solve. |
| Provider key entered deliberately in trusted settings | Separate transport-only session secret; never a vault slot. No page import or shared key in Git. | Authentication header to that exact approved endpoint only, never model content/URL. Backend-mode keys remain server-side. | Never returned, revealed in diagnostics or restored. |
| Resume/ID file contents, filename/path, file input metadata | Outside #16 eligible vault/fill set. Earlier file attachment functionality is not permission to use it in privacy mode. No automatic file inspection. | None through this privacy contract. A later file-specific review is required. | No DataTransfer/file assignment in the advanced privacy mode covered here. |
| Raw DOM selectors, names/IDs, URLs, title, positions, value lengths, input options containing personal text | Keep only minimal targeting/fingerprint information in request-local controller, never in page-global state. | None. Safe label registry replaces raw labels; no URL/title/selector fingerprint in prompts. | Host resolves approved slots to local exact targets; model cannot choose targets. |
| Original screenshot and unverified pixels | Short-lived internal raster only when capture coverage is eligible; never render original in preview. | Never transmitted, persisted, uploaded, traced or converted to an outbound thumbnail. | No restoration into pixels. |
| Sanitized bitmap, safe tokens, safe labels | Still potentially identifying by context. Manual preview remains mandatory. | Only after the applicable text/image/mode gates below. | Never treat “sanitized” as a guarantee of anonymous data. |

Proposed ceilings: 20 approved private slots per request, each at most 1,000 Unicode code points; contact-name/email/phone/address limits no larger than the current profile limits (200/254/60/1,000). Oversize values are rejected, never silently truncated. Field count/class and `filled` reveal limited structure; disclose this remaining leakage. No private-value lengths, byte counts, hashes or character fragments leave the controller.

## 4. Vault lifetime and page binding — proposed decisions

**Vault means isolated memory, not `chrome.storage.session`.** No storage.local/sync/session, IndexedDB, localStorage, page globals/attributes, file, clipboard automation, telemetry, crash report or durable retry queue for its contents. Worker suspension/loss must invalidate the request; do not restore the vault from session storage. A future in-memory extension-owned context may host the vault only after Anish reviews its lifetime and access boundary; do not add an offscreen context or permissions in #16.

- **Absolute TTL: 120 seconds**, starting when the request context is created, before any capture, field read or token issuance. Every vault entry, token, consent, sanitized artifact and response inherits that deadline, even when all slots are missing or the request contains only sanitized text/image context. No sliding refresh on UI activity or network calls. Backend deadlines remain unchanged; remaining TTL must cover validation/restoration. An operation after expiry fails even if a response was already queued.
- **One active request per extension instance.** A new capture destroys the prior request, including another tab's request. No unbounded tab-indexed cache.
- Bind every slot to exact scheme/host/port origin, tab ID, frame ID, Chrome document ID, internal page generation, random request nonce, logical template slot, original element identity and expected non-value metadata. URLs/IDs/fingerprints are local only.
- Use a monotonic deadline for a live context. Process suspension, restart, document replacement, uncertain elapsed time or missing state requires recapture, not a new deadline for old values.
- Clear on TTL, Cancel, popup/preview close, pagehide/navigation, origin/frame/document change, relevant page mutation, mode/endpoint/model/key change, superseding capture, denied permission, failed validation, failed redaction, rejected response or lost worker/UI channel. Do not rely only on unload callbacks: verify every binding and deadline at each operation.
- Track a page generation for relevant DOM/attribute/text/input mutations, scroll, viewport/zoom/DPR changes and same-document navigation. Recompute eligible target fingerprints before Analyze and Fill. Mutation observers do not prove image/video/canvas/compositor stability; such regions are blocked/masked under section 6.
- A captured value must still match its approved target state before Fill. If any selected field changed, abort the entire batch before the first write; do not overwrite a user's newer edit. If page state changes after a write begins, stop remaining writes and report partial results, never auto-retry or promise rollback.
- Clear means invalidate capabilities and drop references/overwrite buffers where practical. JavaScript garbage collection cannot certify physical RAM erasure; documentation must not claim cryptographic secure deletion.

## 5. Opaque placeholders and exact restoration

### Grammar and host-owned slots

Proposed exact token grammar: `[[SSP_` + **32 uppercase hexadecimal characters** + `]]`, i.e. `^\[\[SSP_[0-9A-F]{32}\]\]$`. Tokens have a fixed length independent of value/field name. Generate 128 random bits per token using the browser CSPRNG; use a separate 128-bit request nonce internally. Reject collisions within the request and mint entirely new tokens for each new request, including unchanged values. Never hash/encode the private value or reuse tokens across providers/requests. The illustrative token strings below are public synthetic markers, not secret examples or a random generator.

Initial constant labels: `applicant name`, `contact email`, `contact phone`, `postal address`. Each maps to exactly one approved host template slot; never infer first name/surname by splitting culturally ambiguous names. A second occurrence requires a distinct host-declared slot and fresh token even if its value is the same. A model-visible `filled` flag indicates presence only, never correctness or authorization.

Proposed outbound slot fragment (not a request accepted by today's FastAPI):

```json
{
  "schema_version": "privacy-slots-1",
  "template": "contact-request-1",
  "slots": [
    {
      "label": "applicant name",
      "token": "[[SSP_A1B2C3D4E5F60718293A4B5C6D7E8F90]]",
      "filled": true
    },
    {
      "label": "contact phone",
      "token": "[[SSP_1029384756ABCDEF1029384756ABCDEF]]",
      "filled": false
    }
  ]
}
```

Model output is constrained to the same version/template plus `slots:[{label, token}]`; a filled slot may return only its exact pre-issued token, and a missing slot only `null`. The output has no free markup, selector, action, URL, field value or arbitrary template text. Host-authored template text surrounds approved slots. If the model adds no useful choice for this flow, the host should construct the same slots directly rather than spending a model request; this still requires the reviewed slot contract.

### Validation and local restoration

1. Enforce response byte/slot limits before parsing; proposed slot response ceiling 16 KiB and 20 slots. Strict schema rejects extra keys and non-string/non-null types. Anish decides the composition with existing analysis budgets; this is not an extra unlimited channel.
2. Validate template identity, exact label set, one occurrence per expected slot, permitted nulls, request membership, nonce-bound registry and deadline. Reject omissions of required slots, unknown/forged/cross-request tokens, duplicates, misplaced tokens and tokens embedded inside longer strings. A correct token in the wrong label is invalid.
3. Do not accept free model prose as a means to return a slot value. Host-validated EPFO policy blocks stay separate; policy text, citations, source URLs and diagnostic messages must contain no restorables/tokens. No redaction tokens in source citations or knowledge files.
4. Validate the complete response before resolving any value. Restoration is one lookup per structured slot, never global regex replacement over arbitrary text and never recursive. A stored literal `[[SSP_...]]` stays literal data even if it looks like another token.
5. Restore only in a trusted local reviewed result using text nodes/`textContent`; HTML-like values are inert. Never insert into `innerHTML`, links, attributes, CSS, script, tool arguments or network requests. Missing values remain visibly unresolved without a fabricated identity.
6. Reject late/invalid output and destroy that request. No partial restoration, hidden retry, cross-request reuse or restored output in follow-up prompts, provider diagnostics or exports. Any future export is a separate user-approved local release, not covered here.

### Local mask and first/last preview

Default local display is exactly `***` in a fixed-size slot, irrespective of value length. No star count, per-character box, tooltip, accessibility text or mask width derived from the value. **First/last preview stays off for all initial personal slots.** Proposed minimum for a future separately approved non-sensitive slot is **12 Unicode grapheme clusters**, explicit per-slot opt-in after local classification; show one first and one last grapheme in a fixed-size local-only container. Shorter, unknown, sensitive or unsegmentable values remain fully masked. Anish must approve the added non-sensitive label category before it exists. Preview fragments never appear in the sanitized raster, payload, logs or metadata, even when locally enabled. UI mock cases may demonstrate this disabled/conditional rule, not imply it is implemented.

## 6. Screenshot coverage and immutable approval

No image transmission is authorized by this contract or the current backend API. The following governs a future local-only preview implementation first.

- Capture only one explicit user-selected area of the active top-level page. No scrolling stitch, full-page background capture, invisible region, history or automatic rescan. Restricted pages and uninspectable roots fail closed.
- A full visible-tab screenshot may be an unavoidable browser API intermediate. Treat it as a secret-bearing original inside the sanitization component only, not an ordinary image for preview. Never intentionally collect secret control values for raster classification. If secret or unknown pixel coverage cannot be excluded before capture, block. Drop the original after producing the sanitized raster or within **5 seconds**, whichever occurs first; exceeding this proposed deadline cancels capture. Do not retain originals for retries/debugging.
- Proposed raster ceilings: one image, maximum 2,048 pixels per axis, 4,194,304 total pixels, maximum 2 MiB flattened output. Downscale only after masking at source resolution; refuse invalid/oversize input before unbounded decode. These ceilings must also be accepted by the image-host contract; they do not claim browser capture memory is bounded identically.
- Map CSS boxes to screenshot pixels using the same document generation, viewport, scroll and device-scale measurements, not guessed coordinates. Use outward-rounded full-field rectangles plus a proposed minimum **4 source-pixel safety margin**. Never size the mask to text length or glyph extents. Mask surrounding labels/tooltips or whole containers where those reveal identity; if transform/overlap/geometry cannot be proven, mask/crop the enclosing area or block.
- Maintain a local coverage ledger for every pixel of the approved crop: either classified safe content or an opaque destructive replacement. An unclassified area cannot remain as a “probably safe” gap. Cross-origin frames, all canvas/video content, images (including CSS backgrounds), inaccessible shadow roots, overlays/tooltips and unknown sources are whole-region deny-by-default. If the region's bounds/compositing cannot be established, block the crop. Same-origin does not make a frame trusted; initial release masks/crops all frames.
- Sanitizer creates a **new flattened opaque raster**. Do not overlay removable boxes on the original, blur, pixelate or merely hide DOM fields. No alpha channel exposing originals, layers, original thumbnails, metadata or embedded source data. Decode/verify only the newly encoded artifact for preview. No OCR cloud call to decide what needs redaction.
- Establish relevant page/geometry consistency immediately before and after capture and again before Analyze. A DOM generation match alone is insufficient for uncontrolled compositor regions. Unknown coverage means no image path. Keep DOM observation read-only; do not temporarily hide fields on the website to claim sanitization.
- Present only the sanitized bitmap plus safe labels and fixed masks. Manual crop/add-mask edits create a new raster and revision, clearing consent. Manual preview cannot override failed coverage, stale generation or missing uploader approval.
- Approval binds a local digest of the sanitized bytes, schema/version, safe text/slots, mode, exact destination, model/protocol and page/request generation. This digest is for local equality checks only, not exported metadata. Send precisely the reviewed immutable bytes through the eventual approved image path, not a recapture. A changed byte, field, mask, endpoint or token invalidates Analyze.
- Error/debug paths may report constant error codes and coarse supported/blocked states only. No screenshot/data URL, original dimensions revealing masked text, raw OCR, signed URL, private region coordinates or restored value in logs, traces, screenshots of settings, network archives or exception messages.

Residual risks include identifying surrounding context, classification errors, browser capture races, provider-side retention and screenshots of the trusted local UI by other software. The contract reduces data exposure; it does not establish anonymity, perfect recognition or zero retention.

## 7. Separate provider and image gates

| Proposed mode | What may cross | Keys and network boundary | Gate before enabling privacy mode |
| --- | --- | --- | --- |
| Existing EPFO backend | Approved de-identified remark through its existing text schema; future slots only after a compatible adapter is approved. Never literal private `details`. | Fixed approved backend origin/path; keys remain server-side. Capability language/readiness checks retained. | Anish approves payload/de-identification semantics and local draft-slot integration. No raw-value fallback. |
| Direct remote model | Same token/safe-label rules; generic host template only unless a separately reviewed grounding host exists. | Trusted options, approved exact HTTPS origin/port/path, key in auth header only. | Privacy Level 4 review; current direct OpenAI form mapping is not compliant. EPFO policy analysis unavailable without bounded evidence and host citations. |
| Direct loopback model | Identical redaction rules; local does not remove a recipient. | Explicit loopback-only exception to HTTPS, narrow authenticated service, no ambient credentials or automatic discovery. | Operator disclosure of forwarding/logging/bind address, protocol compatibility and grounding review. Deny LAN HTTP. |
| Optional local companion | Same sanitized contract; no arbitrary files/environment/shell. | Separate reviewed narrow authenticated service; keychain optional and not implemented. | Installation, API/authentication and retention each require separate approval. No silent installation. |

No mode changes provider on failure. No redirect following, arbitrary proxy, page-chosen destination or `<all_urls>`. Browser host permissions cannot constrain a port; transport must enforce exact origin and approved routes. Settings changes clear consent, vault, key association and results. Explicit capability/connection checks contain no private sample data. All modes retain citations, clarification/abstention and the Markdown architecture's host-enforced tool/time/output budgets. No full-corpus prompt or ungrounded policy fallback.

**Image dependency is independent:** a data/base64 URI from `captureVisibleTab` may be locally decoded only. Do not forward it to FastAPI, a direct remote model or a local model. Until Image Level 1 admission is approved and later image components plus an approved uploader/host exist, Analyze cannot attach any bitmap. Text-only mode must be explicitly selected and independently sanitized, not silently substituted.

A future uploader may receive only the exact approved flattened raster and return a privately authorized short-lived HTTPS URL. Image guide's proposed URL TTL ceiling is 300 seconds; this contract's 120-second vault/request lifetime remains the stricter restoration limit and is not extended by URL expiry. Host/operator, authenticated issuer verification, expiry/revocation, permitted origins/path/query rules, byte/pixel/type limits, no redirects/proxy, provider fetching/retention and deletion guarantees are unresolved approvals. No sample public host is an approved default. The URL-only backend must not download images or treat a signature-looking query as proof of admission. Signed links never become policy citations.

## 8. UI and approval handoff

Avyakta's #21 mocks consume these states, not raw vault objects:

| State | Required display / action | Disallowed implication |
| --- | --- | --- |
| Idle / unavailable | Explicit Capture, mode availability and no-network state. | Opening UI starts capture or tests a private request. |
| Local capture | Safe labels, `***`, missing-value flags; coverage failures explained. | Raw screenshot or hidden DOM secrets as preview data. |
| Sanitized preview | Only flattened pixels, ability to mask/crop/cancel; provider/actual destination disclosure. | Manual review certifies coverage or local service guarantees privacy. |
| Ready to Analyze | Separate approval of exact payload, destination and recipient retention uncertainty. | “Filled” flag authorizes sending or filling. |
| Pending | Cancel; deadline; no automatic provider fallback; no secret announcements. | Fake progress or retries after cancellation. |
| Validated local result | Plain-text host template with resolved eligible slots locally; unresolved fields clear. | Restored data is safe to send in a follow-up. |
| Ready to Fill | Exact eligible target/value review and explicit release-to-page/autosave warning. | Fill means submission, or isolation continues after page release. |
| Expired / stale / lost context / blocked | Clear request, recapture/manual assistance; no inherited approval. | Persist secrets or reuse old tokens to rescue the session. |

### Review checklist (unchecked until reviewer evidence exists)

- [ ] **Anish:** approve data classes, no-secret collection, exact token/slot grammar, one-pass restoration and strict validation.
- [ ] **Anish:** approve 120-second TTL, 5-second original-raster ceiling, 12-grapheme partial-preview threshold, slot/raster/response budgets, page-generation proof and fail-closed policy.
- [ ] **Anish + Ajay:** decide vault hosting/lifetime under MV3 suspension and the reliable document/preview-close invalidation channel; no session-store fallback.
- [ ] **Anish:** approve backend de-identified-text integration and future privacy-slot capability/adapter; preserve evidence validation and readiness. Current API is unchanged.
- [ ] **Avyakta:** confirm #21 control/state contract, fixed masks, local-only reveal, expiry/cancel/error accessibility and exact destination disclosure.
- [ ] **Ajay + Avyakta:** agree mutation/coverage proof sufficient for a limited supported set; no universal screenshot guarantee.
- [ ] **Image owner/operator + Anish:** separately approve controlled image issuer/host/upload path and native provider behavior. Until then images stay disabled.
- [ ] **Anish + Avyakta:** accept existing egress gaps and the later gating/migration plan; do not claim baseline code is the privacy implementation.

No reviewer approval was present on issue #16 when inspected. A PR review request, proposed decision or checkbox is not acceptance. Reviewers must record an approve/revise decision and artifact revision. Unresolved choices default to blocked, not to the existing raw-data behavior.

## 9. Synthetic acceptance scenarios — design only

All inputs below are artificial descriptions; do not create or upload real identities/screenshots/keys. **Every row: runtime execution planned / not run; observed result not available.** No new executable fixtures, test pages, tests or provider calls are part of #16.

| ID | Synthetic scenario | Required future result |
| --- | --- | --- |
| P01 | Open popup or change page selection without Capture. | No field read, screenshot, uploader or private network call. |
| P02 | Approve a fictional applicant name and leave phone empty. | Fixed masks locally; only random token/boolean/constant labels outbound; missing phone remains null/unresolved. |
| P03 | Same private value is used in two captures or two approved slots. | New nonce/tokens; disallowed duplicate occurrences rejected; no value-derived linkage. |
| P04 | Password/OTP/UAN/Aadhaar/PAN/bank/claim ID appears in control or static remark. | No vault entry; exclude/redact whole pixel region; free text sanitized or blocked; no identifier restoration. |
| P05 | Page places secrets in label, selector, option, tooltip or error paragraph. | No raw metadata egress; constant-label mapping or block; not just input masking. |
| P06 | Short, emoji-combining or unknown-sensitivity value requests first/last reveal. | Personal slots stay fully masked; future safe slots require 12 graphemes and explicit local-only opt-in. |
| P07 | A field mask is sized from its typed text or star count. | Fail review: fixed-size preview/full-field raster block must not expose value length. |
| P08 | Cross-origin iframe, video, CSS image, shadow root or canvas intersects crop. | Whole region masked/cropped or capture blocked; no uncovered pixels admitted. |
| P09 | Scroll, zoom, reflow, overlay or field text changes between capture and Analyze. | Generation/geometry/hash mismatch destroys approval; no stale transmission. |
| P10 | Original JPEG is present in error, thumbnail, upload payload or local storage. | Release blocker; only verified new raster can survive to reviewed preview; original discarded within ceiling. |
| P11 | No reviewed uploader/issuer, or signed URL is expired/tampered. | Image path unavailable/rejected before provider spend; no base64, arbitrary host or silent text fallback. |
| P12 | Model returns foreign, malformed, missing, duplicated or wrong-slot token. | Entire output rejected before any restoration; no partial success. |
| P13 | An allowed local value is literal token-like text or HTML-like text. | Exactly one lookup into text DOM; no recursive substitution or executable markup. |
| P14 | Model inserts an action/selector, ungrounded policy claim, key request or citation token. | Strict structure/grounding rejects; no code, navigation or secret access. |
| P15 | TTL expires, preview closes, worker suspends, frame changes or request is superseded. | Vault and artifact references invalid; late response cannot restore/fill; recapture required. |
| P16 | Cancel races request completion or settings/provider change. | No new send after revocation; discard late output; cannot recall already sent data and UI says so. |
| P17 | Remote HTTPS versus approved loopback receives the same sample. | Identical sanitized fields; exact-host auth only; no local-mode privacy exemption. |
| P18 | Redirect, LAN HTTP, page-supplied endpoint or unknown companion command. | Denied with constant safe error; no fallback, ambient credentials or arbitrary proxy. |
| P19 | Before Fill, selected target/value changes or page becomes a payment/security/claim workflow. | Preflight abort; no high-impact write or Submit; local/manual result only. |
| P20 | Site changes another target after a permitted write starts. | Stop remaining changes, report partial outcome; no retry/rollback guarantee or generic event executor. |
| P21 | Restored output is reused for retry, diagnostics or second provider. | Outbound gate rejects it; fresh sanitized capture/consent required. |
| P22 | UI reads a missing vault after service worker restart. | Expired/unavailable state, not restored session data or fabricated success. |
| P23 | User tries to attach a resume/ID file through privacy-mode fill. | Unsupported in this contract; no bytes/name/DataTransfer egress under privacy approval. |
| P24 | Safe capture but provider lacks host-grounded EPFO capability. | Policy analysis unavailable; no generated remedy, fake citations or completion claim. |

### Evidence record for this documentation task

- Performed: read issue #16 and collaborating #21, ownership/architecture/privacy/image references and actual current extension/backend interfaces; compared requirements with code; authored this contract and checked Markdown links/required sections and the docs-only diff.
- Existing test/live reports are source context only, not rerun or independently certified here.
- Runtime tests, redaction/OCR/vault experiments, Chrome/Brave captures, network inspection, providers, image hosting and performance/retention measurement: **not run**.
- Real claimant data, secrets, `.env`, original screenshot/image files, private originals, HARs and model traces: **not accessed or included**.
- Git/PR checks verify delivery mechanics only, not runtime security. Review approval remains pending.

## 10. Proposed file ownership and handoff

Paths below are future proposals, not files created by #16; reviewers can refine them without splitting security ownership.

| Future path / boundary | Owner and required collaborator | Track |
| --- | --- | --- |
| `extension/privacy/request-context.js`, `vault.js` | Ajay; Anish security review | #17 lifetime, binding and access boundary |
| `extension/privacy/capture.js`, `pixel-redaction.js` | Ajay; Avyakta preview surface; Image review for export | #17 local-only redacted capture |
| `extension/privacy/tokens.js`, `output-validation.js`, `restore.js` | Ajay; Anish slot/API review; Avyakta renderer | #18 strict slots and one-pass local restoration |
| Existing `extension/content.js` / future narrow field adapter | Ajay; explicit no-secrets/no-event/target-release review | #17/#18 migration from existing general form path |
| `extension/options.*`, preview/result UI boundaries | Avyakta; consume approved minimal interfaces, no duplicate vault logic | #21–#23 |
| `extension/providers/` and worker dispatch | Ajay; Anish protocol/grounding/network review; Avyakta disclosure | #19; no endpoint enabled now |
| `backend/api/`, `backend/llm/`, agent/budget/citation changes | Anish approves/owns shared seams; Ajay coordinates image work | Separate Image/backend tasks |
| Controlled uploader, issuer, storage host, companion | Unassigned until an explicit operator/security decision | Separate dependency, no implementation authorization |
| Future privacy security tests / synthetic fixtures | Ajay; UI accessibility evidence by Avyakta | Respective later level and #20; no new tests in #16 |
| `frontend/` | Shravya | Unchanged main web track |

**Handoff outcome:** contract artifact delivered for review, not vault implementation or accepted privacy level. Link the focused docs-only PR to #16 without auto-closing it. Request Anish/Avyakta review. #17 may start only after this contract's blocking decisions are approved and a new explicit implementation request is given. Image and provider levels do not advance automatically.
