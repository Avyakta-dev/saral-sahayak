# Issue 23 — Extension UI Level 3 handoff

Date: 2026-09-12. Base: `9dc3733`; local branch `task/issue-23-extension-accessibility`. Related to issue 23. Former Avyakta extension UI scope explicitly authorized for this task; Shravya's frontend and Ajay's controller/vault/transport are unchanged. Issue 22 / PR 65 reviewed and merged per coordinator handoff. No commit, push, provider calls, source research, deployment or issue closure.

## Narrow changes

- Keyboard focus moves from an action that becomes disabled to the host-authored status, then to the next step heading. A worker reply does not steal focus if the user moved elsewhere while waiting. Terminal Close is focused and describes the terminal status.
- Live statuses are atomic. Countdown is deliberately not live (no repeated quarter-second announcements). Restored values remain available for deliberate local reading, but no longer appear in Fill checkbox names. Nothing newly puts them into hidden attributes or automatic focus targets.
- Terminal Fill uses **counts only** (filled/failed/skipped/unknown), not arbitrary field IDs, result messages or warnings. This intentionally loses individual-field outcome details to avoid announcing page-derived private content; the user must inspect the page. It explicitly says no analysis occurred, the extension never clicks Submit, and sites may autosave.
- Worker invalidation strings are not echoed. Known worker expiry wording maps to expiry; other invalidation maps to blocked/source-changed with possible unavailable/denied access. The existing controller does not distinguish actual permission denial from other failures, so the UI does not invent that diagnosis. Cancellation/expiry during pending Fill warn about possible partial page changes.
- Long text wraps, buttons fit their containers, and keyboard/heading focus rings use a darker color. No deadline, permissions, security binding, vault, transport or API changes.

## Method and exact local results

`node --test extension/tests/*.test.cjs`: **359 passed, 0 failed** (existing offline Node/VM suite; two expected UI assertions updated for safe-label-only choices and counts-only results).

New suite: `extension/tests/browser/privacy.test.cjs`, **4 passed, 0 failed in each executable**:

- Google Chrome **150.0.7871.128**, `/usr/sbin/google-chrome`.
- Brave **152.1.94.117**, `/usr/sbin/brave-browser`.

Linux, headless, real production `privacy.html`, `privacy.css`, `privacy.js` loaded from file URLs. Both runs use **synthetic chrome.runtime Port replies**, a synthetic 1-pixel PNG, artificial hostile-looking local value, and Playwright's virtual clock for the 120-second expiry. All setup happens before navigation; interactions use keyboard/normal controls, not application state injection. A read-only mutation observer records live text. This is actual browser rendering with a **simulated extension boundary**, NOT a loaded-extension acceptance run. Real extension loading was not attempted in this narrow run; the previously documented worker-disconnect blocker is not resolved by these mocks.

No page exceptions or non-file/non-data requests were observed by the test listeners. This is scoped to these synthetic renderer cases, not proof of network/privacy properties elsewhere. No runtime/system packages were installed locally; existing Playwright from `/tmp/setu-issue-26/frontend/node_modules` was reused.

## Browser/accessibility state matrix

Unless marked otherwise, both Chrome and Brave passed the listed DOM assertions; screenshots were inspected for the named states. Screenshots are synthetic, local-only under `/tmp/issue23-chrome/` and `/tmp/issue23-brave/`, not repository artifacts.

| Check | Expected and observed | Evidence / limits |
| --- | --- | --- |
| Ready, Inspect, crop labels | Initial Inspect is keyboard reachable; actual fieldset/number labels resolve; no automatic commands before Inspect | `01-ready.png`, `02-inspected.png` |
| Keyboard flow | Tab/Space/Enter selects a field, captures, approves preview, restores, separately selects Fill/consent, then fills; headings receive focus at step transitions | `02-inspected.png`–`06-filled.png`; one-field flow only |
| Preview/review | Image must load before review; review does not restore automatically | `03-preview.png`, `04-reviewed.png`; synthetic 1-pixel PNG, not opaque-raster quality evidence |
| Local restoration | Hostile-looking value is literal text, not an image; unresolved field has no Fill choice; checkbox name is safe label only | `05-restored.png`; local result remains intentionally readable, not hidden from assistive technology |
| Completion | Three synthetic outcomes reported as 1 filled, 1 failed, 1 skipped; no analysis; never clicks Submit; data inputs/images removed and Close focused | `06-filled.png`; no actual source-page write or submission tested |
| Announcements | Recorded live text and sent command data omit the synthetic private value; malicious result detail/warnings are not echoed | DOM assertions plus `05-restored.png`, `06-filled.png`; screen-reader audio NOT RUN |
| Long labels / scripts / narrow reflow | 320 CSS-pixel viewport has no document horizontal overflow; long unbroken label wraps; English, Hindi, Kannada, Tamil, Telugu, Malayalam samples remain text; visible focus ring | `07-narrow-long-scripts.png`; glyph appearance observed only, not language/translation certification. Disabled native select truncates its option at this width; surrounding unavailable/destination disclosure remains visible. 200% browser zoom NOT RUN; narrow-viewport alternative tested |
| Denied/blocked | Synthetic worker rejection produces blocked/possible denial, not expiry, and does not echo arbitrary details | `08-denied.png`; actual browser permission prompt/denial NOT RUN |
| Pending / cancellation | Pending status has focus; Cancel remains available, clears and does not retry | `09-pending-cancel.png`, `10-cancel.png` |
| Timeout / expiry | Stalled inspection expires after virtual 120001 ms, clears and sends cancel once; no restart | `09-pending-expire.png`, `10-expire.png`; real-time worker timeout NOT RUN |
| Contrast spot check | sRGB ratios: body `#173f3b` on `#fffdf6` 11.40:1; muted `#52645e` 6.17:1; white on primary `#17685e` 6.61:1; focus `#854811` on panel 7.04:1 | Calculated from CSS, not a full contrast audit; disabled controls and OS/high-contrast modes not certified |

## Reproduce / CI

From repository root with installed frontend dependencies and version-matched Chromium:

```sh
NODE_PATH="$PWD/frontend/node_modules" node --test extension/tests/browser/*.test.cjs
```

Optional installed browser / evidence destination:

```sh
NODE_PATH=/tmp/setu-issue-26/frontend/node_modules \
BROWSER_EXECUTABLE=/usr/sbin/brave-browser \
BROWSER_EVIDENCE_DIR=/tmp/issue23-brave \
node --test /tmp/setu-issue-23/extension/tests/browser/privacy.test.cjs
```

The existing frontend-browser CI job already installs pinned frontend dependencies and version-matched Chromium. It now runs the extension suite as well, before frontend tests, storing synthetic evidence separately in `extension-browser-results/` and uploading it on job failure. No frontend source/dependency changes. CI execution is **not yet run** for this uncommitted task; coordinator handles review/PR/green checks. Local logs: `/tmp/issue23-node.log`, `/tmp/issue23-chrome.log`, `/tmp/issue23-brave.log`.

## Remaining limits and checkpoint

Not run: unpacked MV3 integration in either browser, real permission denial, actual vault/port lifecycle, source-page Fill, live provider/analysis, uploader, screen-reader speech, 200% browser zoom, full automated a11y audit, forced colors, OS font scaling, native-language review. Browser tests do not certify selective pixel redaction; actual implementation remains conservative opaque-only and Analyze/upload/provider selection stay disabled. Existing legacy raw-data paths are outside this task and not certified private. Ajay/Anish still own security and provider release blockers and review; actual extension browser evidence remains required. No blanket accessibility/privacy/language certification or level completion is claimed. Stop at this issue; await coordinator review and CI.
