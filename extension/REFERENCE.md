# Form assistant — current extension reference

This user-requested specification supersedes the earlier offline-only, selected-text-only milestones **for this extension task**. It does not change backend ownership, authorize live provider tests, or alter the shared EPFO architecture.

## Current priority: actual EPFO integration

The latest user instruction pauses UI polish and new tests/synthetic pages. Add click-triggered rejection-remark detection with editable review and explicit transmission to the existing FastAPI backend, without changing backend ownership. `epfo-content.js` detects bounded visible candidate text; `epfo-popup.js` reviews it; `epfo-background.js` calls the fixed loopback capabilities/analyze routes. This EPFO path never sends profile/file/screenshot/provider keys, never fills forms, and does not route policy questions directly to OpenAI. Keep original general form functionality separate. Real runtime failures must remain visible; no fixture fallback or claimed end-to-end success without the running backend.

## Earlier requested product (preserved separately)

Build a Chrome Manifest V3 extension which reads a form in the current tab and proposes values from user-provided name, email, phone, address and one optional resume/ID file. Use DOM field metadata as the primary signal and a visible-tab screenshot as an optional vision cross-check, not pixel targeting. Provide a polished popup with editable review and explicit confirmation.

## Architecture and acceptance

- A background service worker owns session state and calls a vision-capable model.
- An explicitly injected, isolated content script scans `input`, `select` and `textarea`, recording label, type, name/id, selector, current value and select options. Unsupported/sensitive/hidden/disabled fields are excluded.
- The worker calls `chrome.tabs.captureVisibleTab` after an explicit scan. A screenshot is never sent until the user approves it in the popup.
- Send bounded field metadata and the supplied profile to a fixed OpenAI endpoint; include the screenshot only when checked. The model returns JSON selector/value/confidence suggestions. Page content is untrusted data, not instructions. Validate all selectors against the captured allowlist.
- Show each proposed field, current value, editable proposed value and confidence. No writes before explicit Fill confirmation. Existing values and uncertain suggestions are unchecked by default.
- Apply values using native setters and bubbling input/change events. Synthetic events cannot be made `isTrusted`; some custom sites may reject them.
- For an approved file input, construct `File` from session-held bytes, attach using `DataTransfer`, and dispatch events. Do not drive a native picker. Do not send file bytes to the AI.
- Never click Submit, accept terms, solve CAPTCHAs, enter passwords/OTP/payment credentials or automate account deletion. Sites may autosave on field changes or upload on file selection; warn before Fill. Submission always remains manual.
- Recheck original tab, document, URL, element identity, current values and field metadata before filling. Refuse stale plans and report partial failures without retries or success claims.
- Keep API key, profile, file, screenshot and review state in extension-only `chrome.storage.session`, not disk/local/sync storage. Provide Clear session. No analytics or logs of content.

## Deliberate compatibility boundary

This version supports ordinary visible HTML fields in the top-level document on HTTP(S) pages. Cross-origin frames, shadow roots, custom widgets, payment/credential controls, browser-internal pages and sites rejecting synthetic events are not universally supported. Do not claim "every form" works. Existing EPFO backend is unchanged and not used for general form mapping.

## Deliverables

`manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, local styles/icons, focused tests, and README with unpacked installation, OpenAI key setup, privacy disclosures and exact tested/not-tested status. No live provider requests, publishing, ZIP or dependency installation without further authorization.
