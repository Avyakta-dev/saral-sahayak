# Saral Sahayak · Form Assistant

A Chrome Manifest V3 extension that reads ordinary form controls, asks an OpenAI model for grounded suggestions, and fills only fields you review and approve. DOM metadata is the primary signal; an optional visible-tab screenshot provides context. **It never clicks Submit.**

There are now two separate paths: **EPFO rejection assistance calls the existing Saral Sahayak FastAPI backend**, while general form suggestions still call OpenAI directly. Neither path changes the backend implementation. See [REFERENCE.md](REFERENCE.md) for scope.

## EPFO end-to-end flow

1. `manifest.json` opens `popup.html` and starts `background.js`. It permits the fixed loopback backend and OpenAI for their separate features.
2. **Detect EPFO rejection** in `epfo-popup.js` sends `SS_EPFO_DETECT` to the worker.
3. `epfo-background.js` injects `epfo-content.js` into the active HTTP(S) tab. The detector looks for visible labelled rejection remarks, adjacent table values, or a visible user-selected remark. It returns candidates, not policy advice. No screenshot or network call occurs here.
4. Review/edit the detected remark. Multiple candidates require selection. Detection is conservative, bounded and not verified against every EPFO portal layout; if no match exists, select the specific text and detect again or paste it.
5. **Connect backend** calls `GET http://127.0.0.1:8000/api/v1/capabilities`. Languages come from the actual response. No remark is sent in this request.
6. After consent, **Analyze rejection** sends only `{"text":"<reviewed remark>","language":"<enabled code>"}` to `POST /api/v1/analyze`. No profile, file, screenshot, page URL or provider key is sent. The backend owns model configuration and may send the remark to its configured provider.
7. FastAPI validates the request, checks model/corpus readiness and runs its bounded Markdown analysis service when available. The extension renders success, clarification, unsupported and error envelopes, including claim-linked Markdown/source citations. No form filling is triggered by an EPFO result.

EPFO requests use the worker, `credentials: omit`, rejected redirects, no automatic retries, a 35-second client timeout, 8,000-Unicode-character and 32,768-byte serialized-body limits. The only loopback routes allowed in code are `/api/v1/capabilities` and `/api/v1/analyze` on port 8000. Chrome host permission cannot restrict ports; code and CSP enforce the exact origin. Do not widen backend CORS or put server/provider secrets in the extension.

EPFO text/results are transient popup/request data, not saved to the form profile/session store. Validated capability metadata and connection status are kept separately in `chrome.storage.session` so analysis can continue after MV3 worker suspension; **Clear session** removes that cache. Editing the remark or language, cancelling, clearing, or beginning another request clears stale guidance. Closing the popup discards its preview, but an already-sent request may finish server-side; clearing cannot recall provider data.

### Protected-backend errors

Protected analysis requires a separately authenticated gateway; do not put its shared server-to-server token in extension settings. The EPFO worker now explains HTTP 401/403 access failures, 429 capacity limits and 504 server timeouts without echoing arbitrary server message bodies. A valid integer Retry-After (1–3,600 seconds) is displayed as advice only; no automatic retry is scheduled. Full validated analysis envelopes still show their actual dependency/analysis errors. This does not implement the missing authenticated gateway or alter CORS, permissions, credentials or the fixed backend destination. See [protected analysis](../docs/protected-analysis.md).

### Backend startup and observed blocker

From the repository root in a supported, provisioned environment:

```bash
uv sync --frozen
uv run uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

**Native Windows startup was attempted and failed** at `backend/tools/knowledge_files.py` with `AttributeError: module 'os' has no attribute 'O_DIRECTORY'`. No service was listening on port 8000. `pydantic-settings` and `uv` were also unavailable in the checked runtime. The corpus was absent at that earlier check but is now merged under `references/knowledge/epfo/`; its presence alone does not establish live analysis readiness. Use a compatible Linux/WSL environment with the declared dependencies or coordinate a reviewed Windows file-tool implementation with Anish; do not bypass containment controls. This change installs nothing, edits no backend code/CORS, and makes no live provider requests. Successful production analysis remains blocked on runtime/corpus/model readiness.

## Load unpacked

1. Use desktop Chrome 116 or newer.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension` directory (the folder containing `manifest.json`).
4. Pin **Saral Sahayak — Form Assistant** from the Extensions menu.
5. Open an ordinary HTTP(S) website containing a form, then click the extension icon.
6. After changing these files, click **Reload** on the extension's card and reload the target page to remove an older injected content script.

The extension itself has no package installation or build step. EPFO analysis needs the separately running FastAPI backend; the general form-assistant feature below does not.

## Configure the API key

For general form suggestions only, open **AI setup** in the popup and enter **your own OpenAI API key**. Create/manage keys through [OpenAI's API platform](https://platform.openai.com/api-keys); API billing is separate from a ChatGPT subscription. Default model: `gpt-4o-mini`. You may enter another OpenAI model ID which supports Chat Completions, image inputs and JSON-object output. Access and compatibility depend on your account; not all models support this request shape.

For general form suggestions, only `https://api.openai.com/v1/chat/completions` is used. The endpoint is fixed; page text and model responses cannot change it. The key is held in extension-only, memory-backed `chrome.storage.session` and sent only as an Authorization header to OpenAI. It is never supplied to the page, included in prompts, returned to the popup after saving, or committed to the repository. This bring-your-own-key development design is not a way to distribute a shared production secret. For public distribution, use a separately authenticated backend rather than embedding a provider key.

## Use it

1. Enter your name, email, phone and address. Leave unknown details blank.
2. Optionally choose **one file**, up to **2 MiB**: PDF, DOC/DOCX, TXT, PNG or JPEG. Use a synthetic document while testing.
3. Click **Save & scan page**. The extension reads eligible form fields and captures the visible tab locally. Nothing is sent to the model yet.
4. Review the captured labels/current values and profile. An optional screenshot preview may contain unrelated personal information: **leave screenshot sharing unchecked unless the whole visible image is safe to share**. This version does not crop or redact images.
5. Explicitly approve sending your profile and captured field metadata to OpenAI, then request suggestions. The screenshot is included only if you separately checked it. The filename/type/size may be sent for file matching; **file bytes are never sent to OpenAI**.
6. Review every proposed field. Edit values or uncheck fields. Low/medium-confidence suggestions, pre-filled controls and file attachments are unchecked by default. Confidence is a model judgement, not a probability or guarantee.
7. Approve the fill warning, then click **Fill selected fields**. Native setters and bubbling `input`/`change` events notify the page; a selected file is attached using `File` + `DataTransfer`.
8. Check the per-field results and the actual page. **Review and submit manually, if appropriate.** The extension does not click buttons or submit forms.

**Important:** websites can autosave text, upload a file immediately after attachment, or even submit in response to field-change events. Confirm filling only on a site you trust. Clear session cannot undo website writes, recall an OpenAI request, or remove a file already received by a website.

## Privacy and permissions

| Permission | Purpose |
| --- | --- |
| `activeTab` | Temporary access to the tab where you invoked the extension; visible-tab screenshot capture. |
| `scripting` | Inject the isolated DOM adapter only after Scan; verify the original document before actions. |
| `storage` | Memory-backed session state that survives worker suspension/popup closure. |
| `https://api.openai.com/*` | Allow general form suggestions through the fixed OpenAI endpoint. |
| `http://127.0.0.1/*` | Allow EPFO capabilities/analysis through the fixed FastAPI origin, port 8000; no arbitrary fetch bridge. |

No `<all_urls>`, persistent site content scripts, history, cookies, clipboard, downloads or tab-enumeration permission. No analytics, page-title transmission or automatic source fetching. The target URL/document identity is used locally to reject stale actions, not included in the model request. Field labels, names, IDs, selectors, current values and options are page data and can themselves contain private information; review them before sending.

Session state includes your key, raw profile values, raw file bytes, captured fields and a temporary raw visible-tab screenshot. It is restricted to trusted extension contexts, not content scripts. It lasts across popup closure and worker suspension, but Chrome clears session storage on browser restart, extension reload/disable/update. **Clear session** deletes the extension's current state and EPFO capability cache, invalidates the referenced content-page scan when reachable, and aborts an in-flight model request where possible. Nothing is intentionally persisted to local/sync storage or disk by the extension. This current raw profile/screenshot design is a development implementation and is not privacy-ready for broad production deployment; it has no screenshot redaction or encrypted vault. OpenAI and the target website have their own data handling policies; local clearing does not clear their copies.

## Supported controls and honest limits

- Top-level visible native text, email, telephone, URL/search inputs, textareas, single-select dropdowns, and file inputs.
- Disabled/read-only/hidden fields, passwords, OTP/CAPTCHA, sensitive payment/identity fields, checkboxes, radio buttons, submit buttons and custom widgets are excluded. The profile cannot invent identifiers or missing personal data.
- Does not read inside iframes or shadow roots. Closed/custom components, Chrome settings/store pages, PDFs and local `file://` pages are not supported.
- Up to 80 eligible fields; dropdowns with more than 100 options are skipped. Field metadata and response sizes are bounded. Model calls have a 25-second timeout and no automatic retry or redirects.
- Select option values must be grounded in your supplied data. Coded country/state options requiring inferred mappings may be omitted. Use the site's own control for unsupported fields.
- Page content and screenshots are untrusted. Prompt instructions are not a security boundary: host code validates known selectors, literal supplied values, types and confidence before review. Unknown mappings fail closed.
- Scan snapshots bind to the original tab/document, element identities and values. Navigation, framework rerenders or edits can invalidate a plan. Scan again rather than forcing old selectors.
- Generated `input`/`change` events are synthetic (`isTrusted === false`). There is no JavaScript API for turning them into trusted user input. Some sites refuse these events or file assignments; results report failure rather than silently claiming success.
- No CAPTCHA solving, credentials, payment submission, account deletion, terms acceptance, or automated government submissions. This is not universal autonomous browsing or error diagnosis. AI matching can be wrong; review is required.

## Files

- `manifest.json`: permissions, local popup/worker, restrictive content security policy.
- `background.js`: session state, capture, fixed model transport, approval gates and document checks.
- `epfo-background.js`: fixed FastAPI transport, capabilities, cancellation and response validation.
- `epfo-content.js`: bounded, click-only rejection-remark detection without screenshot capture.
- `epfo-popup.js`: editable remark review, backend languages and cited analysis results.
- `mapping.js`: profile/file validation and model-output allowlisting/grounding.
- `content.js`: DOM metadata capture and approved field/file writes.
- `popup.html`, `popup.css`, `popup.js`: profile, disclosure, screenshot preview, editable review and results.
- `privacy/`: local vault (#53) plus host-template restore and explicit per-field/batch Fill (never Submit). Analyze/upload remain disabled in privacy mode.
- `tests/`: dependency-free automated tests and synthetic browser fixtures.

## Extension UI Level 1 mocks (issue 21)

Synthetic annotated privacy-flow mocks and a state checklist live under [`mocks/privacy-ux-level-1/`](mocks/privacy-ux-level-1/). They are static HTML/SVG/docs only: no network, no vault changes, and **no claim that redaction is implemented**. Open [`mocks/privacy-ux-level-1/privacy-flow-mocks.html`](mocks/privacy-ux-level-1/privacy-flow-mocks.html) locally. Ajay’s `privacy/` runtime modules remain the fail-closed source of truth.

## Checks

Run from the repository root with Node.js 22:

```bash
node --test extension/tests/*.test.cjs
node --check extension/background.js
node --check extension/content.js
node --check extension/popup.js
```

Existing extension regressions use synthetic data and mocked model responses, never an API key; 98 existing checks passed after integrating the EPFO worker import. No new tests or synthetic pages were created for the EPFO change. Syntax checks passed for the new detection/transport/popup scripts. The real backend startup failed as recorded above, so no successful HTTP analysis or unpacked Chrome/EPFO-portal acceptance is claimed. Backend tests are untouched and were not run. Earlier synthetic form fixtures remain on disk but are not proof of actual EPFO integration.
