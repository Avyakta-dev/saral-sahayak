# Ajay — browser extension assistance, one level at a time

## Scope, ownership and current dependencies

Ajay's current priority is a **Chrome/Brave Manifest V3 (MV3) extension** using the same backend as the web UI. MV3 is the browser's extension manifest format; a popup is the small panel opened from its toolbar button. Begin with that popup. An optional service worker (background event handler) is only justified later by a specific need, not required for the shell.

“One-click assistance” means an easy user-initiated entry point, **not automatic collection or submission**. The eventual flow is: select text → click to capture → preview/edit → explicitly press **Analyze** → display the backend result. Paste remains available throughout. No extension or app code is delivered by this documentation task.

| Owner / dependency | Current boundary |
| --- | --- |
| Anish | Agent orchestration, backend/API contracts, integration and multilingual APIs. **Level 2 implementation has explicitly resumed, not been declared complete.** Do not change backend code on his behalf. |
| Existing backend | FastAPI routes, typed schemas, model adapters, bounded Markdown tools and evidence ledger now have an analysis service. Offline fake-model tests do not prove live provider compatibility or linguistic quality. |
| API readiness | `/health/live` is liveness only. The production corpus is still absent: analysis returns 503 / `knowledge_unavailable` once model configuration exists, or `model_not_configured` first if it does not. `/health/ready` and capabilities availability check only configuration and corpus structure, not model connectivity or policy correctness. An index alone is insufficient. |
| Language | Schemas accept `en`, `hi`, `kn`, `ta`, `te`, `ml`; `en` remains default. Read `GET /api/v1/capabilities` and offer **only its enabled languages**, using `name`/`native_name`; do not hardcode the six-code set as the live selector. Every `quality_verified` flag is false; API acceptance is not a translation-quality guarantee. |
| Shravya | Web UI ownership and shared consistency: terminology, language controls, response states, citations, accessibility and demo/live labels. Ajay owns the extension UI, not a web UI rewrite. |
| Ajay | Extension first, its synthetic fixtures, browser/security regression and handoff. Original OCR/image handling and document-download responsibilities are **deferred, not reassigned**. Existing backend tests stay intact. |

Levels 1–3 remain independently offline. Level 4 can verify transport, read-only capabilities discovery and honest 503 handling when authorized; real success/clarification/unsupported acceptance still needs the absent corpus and authorized model/grounding evaluation. Resumed implementation is not permission to make live requests in this round. Level 5 can report a demo-only or transport-tested handoff without claiming live analysis. No extension level is completed or advanced automatically.

## Copy-paste prompt for your coding agent

> I am Ajay. Read AGENTS.md, CONTRIBUTING.md, references/README.md, my section in references/team-work-levels.md, references/ajay-extension-guide.md, references/planning/markdown-agent-design.md and docs/backend-contract.md. Inspect the relevant current files within my task permissions and preserve existing work. Start Level 1 only: a minimal Chrome/Brave MV3 paste popup, no permissions and no network. Do not do the whole task, advance levels automatically, change the backend, or take over Anish's resumed Level 2. Explain the small steps and files before editing. Use a temporary task branch such as task/extension-shell from main only when Git operations are authorized; no permanent personal branch. Keep existing tests. Test only within authorization, report exact checks/results or not run, changed files, blockers and the next checkpoint using the per-level status format. Stop after Level 1 and wait for me to request the next level. Do not install dependencies, commit, push, publish or package a ZIP without my request.

## Working rhythm and proposed files

1. Read the current level, explain the next small change, and agree any shared contract with its owner.
2. Preserve unfinished work. When authorized, use a temporary task branch from up-to-date `main`, such as `task/extension-shell`; do not reset someone else's work or create permanent contributor branches. Follow [CONTRIBUTING](../CONTRIBUTING.md#branch-workflow), pushing only when the PR is ready and authorized, then deleting the task branch after merge.
3. Make only the current level's changes; test that slice and stop with a report. A passed level does not authorize the next one. Ask before dependencies, shared changes or additional permissions.

The following are **proposed future deliverables**, not existing files or instructions to create them now:

- `extension/manifest.json`, `extension/popup.html`, `extension/popup.css`, `extension/popup.js`: Level 1 shell, extended in later levels.
- `extension/fixtures/`: Level 2 synthetic response copies with visible fixture warnings retained.
- `extension/tests/`: focused renderer, transport and browser regression as levels require, using the smallest suitable setup.
- `extension/service-worker.js`: optional, only if Level 3/4 needs justify it. No persistent content script by default.

### Per-level status — use at every stop

```text
Owner: Ajay
Level: 1 / 2 / 3 / 4 / 5
Status: not started / in progress / blocked / ready for review
Mode: offline shell / synthetic demo / live transport (not necessarily live analysis)
Read: [actual paths]
Changed: [actual paths, or none]
Delivered: [small completed behavior]
Checks: [check, browser/version if applicable, expected, observed, pass/fail/not run]
Permissions/network/storage: [exact behavior and changes, or none]
Dependencies/blockers: [owner + required decision/artifact]
Not implemented: [remaining scope, including agent readiness]
Next checkpoint: [proposed next small step; awaiting explicit request]
```

No levels are marked complete by this guide. Report unperformed checks as **not run**, not assumed passing.

## Level 1 — minimal paste popup, offline

**Read:** this guide; [agent instructions](../AGENTS.md); [ownership/workflow](../CONTRIBUTING.md); [backend contract](../docs/backend-contract.md) for context only.

**Small steps / deliverables:**
1. Create the minimal MV3 manifest with a toolbar action opening the popup, and local HTML/CSS/JavaScript only.
2. Add a labelled rejection-text paste field, clear button and a visible “Offline shell — analysis not connected” notice. An Analyze control, if shown, is disabled and explained.
3. Add simple keyboard focus and empty-input feedback. Opening or typing must not read the current page.

**Acceptance:** load unpacked in Chrome and Brave when authorized; popup opens, paste/edit/clear and keyboard navigation work. Manifest has no `permissions`, `host_permissions`, content scripts or background worker. No network, backend changes, remote scripts or durable storage. Report browser checks not run if unavailable.

**Stop/report:** list the four shell files, tested browsers/checks, and confirm zero permissions/network. Stop before fixtures or selection capture; wait for Level 2.

## Level 2 — four synthetic response states

**Read:** [schema](../backend/api/schemas.py), [backend contract](../docs/backend-contract.md), and its fixtures: [success](../docs/examples/success.json), [needs clarification](../docs/examples/needs_clarification.json), [unsupported](../docs/examples/unsupported.json), [error](../docs/examples/error.json). Coordinate labels/citation layout with Shravya.

**Small steps / deliverables:**
1. Add an explicit **Synthetic demo** mode and local fixture selector; never imply fixtures came from Analyze or live government data.
2. Render `success`, `needs_clarification`, `unsupported`, `error` from the actual schema, not the old plan's illustrative JSON. Show warnings and citation path, record ID, heading, lines and original URLs for success.
3. For clarification show questions; for unsupported show limitations; for error show an understandable error. Do not leave successful guidance/drafts visible in any non-success state.
4. Use DOM text nodes / `textContent`, **never `innerHTML`** for input, fixture or response content. Render drafts as text, not downloads. Keep the imaginary fixture provenance visibly labelled; it is not policy advice or proof of evidence reads.

**Acceptance:** all four fixtures display correctly; hostile HTML is inert text; invalid/unknown response data fails safely; switching state clears prior output. No network or new permissions. English/Hindi fixtures or labels must not imply a live language capability.

**Stop/report:** report each state's check, safe-rendering check and Shravya consistency questions. Stop before reading a tab; wait for Level 3.

## Level 3 — user-click selection capture, preview and edit

**Read:** Level 1–2 files you created, this guide's privacy rules and [current architecture trust boundary](planning/markdown-agent-design.md#proposed-file-tools-and-trust-boundary).

**Small steps / deliverables:**
1. Add an explicit “Use selected text” action. Only on this user click, use temporary `activeTab` and `scripting` permissions if needed to read the current selection. A small injected function reads selected text only, not full DOM/page text, forms or hidden content.
2. Put the captured text into an editable preview. Do not analyze, transmit or fetch anything on capture, popup open, navigation, or selection change.
3. Keep paste fallback for empty selections, denied access and restricted pages such as browser settings and extension stores. Explain the fallback; do not broaden permissions to bypass restrictions.
4. Keep **Analyze** a separate explicit user action. It still operates only in labelled synthetic demo mode until Level 4.

**Acceptance:** a normal page selection enters preview only after a click; edits are respected; empty/restricted pages allow paste; no background collection and no page URL/title captured or sent. Selection capture adds no host access or network. Verify a delayed capture cannot overwrite newly edited text or a newer capture.

**Stop/report:** show exact manifest permission changes and why each is necessary, page/fallback checks and preview-before-transmission behavior. Stop before transport; wait for Level 4.

## Level 4 — connect the existing backend honestly

**Read:** [backend contract](../docs/backend-contract.md), [routes/body limit](../backend/main.py), [schemas](../backend/api/schemas.py), [Settings/CORS validation](../backend/config.py), [API tests](../tests/backend/test_api.py), [config tests](../tests/backend/test_config.py). These are read-only dependencies for Ajay; consult Anish about blockers rather than changing them.

**Small steps / deliverables:**
1. Keep explicit **Synthetic demo** versus **Live backend** modes. In live mode read `GET /api/v1/capabilities` without user data; populate the selector only from returned `languages` (`code`, `name`, `native_name`), retaining `default_language`. Never hardcode the current six as enabled, infer quality from acceptance, or fall back to invented capabilities. A failed capabilities request must show unavailability. Send reviewed text and the selected enabled language only after Analyze; omit optional details unless intentionally collected and reviewed, and send no page metadata.
2. Add minimal `host_permissions` for the agreed backend host/scheme only (not all websites); use HTTPS except loopback development. Match patterns cannot narrow access by port, so document that limitation and enforce the exact approved origin/port and API path in transport code. Never accept a destination from page content or response data.
3. Perform requests from the **extension context** (popup or optional service worker), **not a content script**. Browser extension host permission is the intended cross-origin mechanism. Current Settings accepts HTTP(S) CORS origins only: do not add `chrome-extension://...` to `CORS_ORIGINS`, widen backend CORS, disable browser security, use `no-cors` or proxy around it. Report failures to Anish.
4. Validate nonblank text, at most **8,000 characters**, and the **whole serialized JSON body at most 32,768 UTF-8 bytes**, inclusive, before sending. Count Unicode characters compatibly with the API, not just JavaScript UTF-16 units; measure encoded JSON bytes, including escaping. If optional details are added later, respect 200/100/100-character limits and omit unknown fields. Never silently truncate.
5. Use `Content-Type: application/json`, `credentials: "omit"`, a finite timeout with abort, no automatic retries, and no redirects to unapproved destinations. Keep requests to the allowlisted analysis/health routes and read-only `GET /api/v1/capabilities`; do not offer a generic fetch bridge to pages.
6. Handle pending, cancellation, network failure, timeout, invalid/non-JSON responses and HTTP 400/413/422/503 separately from valid analysis envelopes. Show 503 / `knowledge_unavailable` or `model_not_configured` honestly, plus sanitized provider/budget/timeout errors. Handle known-but-disabled language 422 analysis envelopes separately from small schema-validation 422 envelopes; allow expanded language enums and optional citation columns. Never silently substitute demo success after a live failure; liveness alone never enables a “ready” claim.
7. Clear stale results when text/language/mode changes or a new request begins. Abort superseded work and use request identity/version checks so late completions cannot overwrite newer input/results. Popup close/reopen starts fresh; an optional worker must discard cancelled/orphaned results and validate messages from extension UI only.

**Acceptance:** network inspection shows only reviewed user fields sent on Analyze to the approved backend, no credentials, and no user data in earlier read-only capabilities/health requests. Test capabilities with a reduced enabled set, unavailable capabilities, disabled-language 422, blank input, 8,000/8,001 characters, 32,768/32,769 serialized bytes, multibyte input for enabled languages, timeout/abort and out-of-order completion. With the corpus absent, display genuine 503 / `knowledge_unavailable` (or `model_not_configured` when that gate fails first). `analysis_available` is structural/configuration-only, not verified model connectivity or language quality. Demo/live switching is visible and never automatic.

**Stop/report:** record exact origin/permissions, capabilities/transport checks and actual dependency errors, or not run. Mark successful production analysis blocked on the corpus and authorized model/evidence evaluation, not complete merely because agent code exists. No live requests are authorized in this round. Stop before Level 5 or shared backend changes.

## Level 5 — security, accessibility, browser regression and handoff

**Read:** Levels 1–4 reports/files; [response/citation design](planning/markdown-agent-design.md#citation-and-response-contract); existing [backend tests](../tests/backend/) as preserved regression context; Shravya's agreed UI behavior.

**Small steps / deliverables:**
1. Review the final manifest, message boundary, destination allowlist, safe renderer, transient state, input/body limits and timeout/cancellation behavior against the rules below.
2. Check keyboard-only use, focus order/visibility, field labels, announced loading/errors, readable contrast/zoom, long content and all configured enabled language scripts; rendering checks are not fluent-translation verification.
3. Run authorized Chrome and Brave regression with synthetic data: paste, click capture, restricted-page fallback, preview/edit/Analyze, four fixture states, clear/reopen, rapid repeated actions, mode changes, malicious text/URLs, network failure and real 503.
4. Hand off exact setup/load-unpacked steps, browser versions, permission rationale, checks actually run, known limitations and ownership blockers. Preserve existing backend tests; never delete or weaken them to make extension checks pass.
5. A distributable ZIP is optional **only if explicitly requested** and must exclude secrets, personal data and build clutter. No browser-store publishing or account setup is included.

**Acceptance:** record pass/fail/not-run for each browser and scenario; no unsafe collection/transmission/storage, stale guidance or synthetic/live confusion. Fix extension-scope defects or report blockers. Do not claim live end-to-end success while corpus/model dependencies or independent evidence/language evaluation remain unverified.

**Stop/report:** provide the structured status and handoff, plus any remaining Anish/Shravya decisions. Do not start OCR, downloads, deployment, ZIP packaging or store publishing without a new request.

## Security and privacy rules across every level

- No API/provider keys in extension files, config, storage or requests. Only the backend owns provider secrets and model calls. Do not inspect or copy `.env`.
- No `<all_urls>`, wildcard-wide host access, broad scraping, cookies, history, page URLs/titles, uploads, automatic form filling or government submissions. `activeTab` is temporary, user-triggered selection access, not authority to collect the page.
- No durable sensitive storage: keep rejection text, selected text, personal details and responses in transient memory only, not localStorage, IndexedDB, `chrome.storage`, logs or analytics. Clear explicitly and start fresh on reopen; do not retain sensitive worker state.
- User and server text are untrusted. Never use `innerHTML`, evaluate returned code, load remote scripts or execute instructions embedded in content.
- Parse source links, allow **HTTP(S) only**, reject missing hosts and credentials; open only on user action with `noopener` (prefer `noreferrer` too). Reject `javascript:`, `data:`, `file:` and extension URLs. No automatic source fetching; a displayed URL is not source verification.
- Apply 8,000-character field and 32,768-byte UTF-8 serialized-body limits without truncation, finite abortable requests and fresh-state/request-version protection. No silent fallback, invented guidance, outcome guarantees or performance-gain promises.
