# Extension Level 1 — as-shipped popup evidence

Owner: Ajay. Related to issue 6. Date: 2026-09-12. Source baseline: `e2e89aa` plus documentation-only evidence changes. Status: partial browser acceptance, ready for review; not blanket completion.

Acceptance follows [Anish's revised criteria](https://github.com/iotserver24/saral-sahayak/issues/6#issuecomment-5646145756), not the obsolete permission-free shell definition. No worker/permissions/features were removed to recreate an earlier milestone.

## Environment and actual installation

- Windows, real installed Google Chrome **152.0.7977.83**, product version read from the running browser executable.
- Used desktop accessibility/keyboard actions, not a browser-mocked HTML page.
- Enabled Developer mode and loaded this repository's `extension` directory with **Load unpacked**.
- Chrome displayed **Saral Sahayak — Form Assistant 0.2.0**, **Unpacked extension**, enabled, with its service worker. No extension-load error was displayed.
- Opened the actual toolbar action through Chrome's Extensions menu. Worker restoration completed and the popup reported `Ready when you are. Nothing is captured until you scan.` General profile fields were enabled.
- A diagnostic navigation to the extension's `popup.html` as a normal tab was rejected by the exact-popup sender boundary (`sender.tab`). That tab is not acceptance evidence for the toolbar popup. The actual toolbar action worked without changing the security gate.

## Results

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Chrome unpacked load | Chrome accepts manifest/assets and runs worker | Enabled unpacked 0.2.0 card and worker displayed | PASS |
| Toolbar popup | Real extension UI connects to worker | Ready state; editable controls | PASS |
| Rejection text entry | Editable multiline field preserves text | Accessibility text entry retained `Synthetic rejection: name mismatch. नाम मेल नहीं खाता.` | PASS for text entry; native clipboard paste NOT RUN |
| Edit existing remark | New text replaces old text and invalidates approval | `Synthetic rejection: bank name mismatch (edited).`; UI announced remark change | PASS |
| Keyboard navigation | Tab moves from remark to next available control | Keyboard Tab moved focus to Connect backend | PASS for this transition; full keyboard traversal NOT RUN |
| Clear session | Preview disappears, consent/results reset | Empty remark, disabled Analyze, `Session cleared` and EPFO-clear status | PASS for visible state |
| Empty/unconnected Analyze | No request without remark/language/approval | Analyze and consent stayed disabled | PASS |
| Brave unpack/load/paste/edit/clear/keyboard | Same behavior in Brave | Launch attempt returned `could not launch "Brave"`; no Brave run | NOT RUN |
| Native Ctrl+V clipboard paste | Browser paste works normally | Clipboard was not read or replaced during this run | NOT RUN |
| Popup close/reopen, zoom and screen reader | Consistent lifecycle and accessibility | Not exercised in this level | NOT RUN |
| Network absence while editing | No private request on open/edit | UI checks and source behavior only; no network trace captured | NOT RUN as network evidence |

No real claimant data, provider key or file was entered. Only synthetic remark strings were used and then cleared. No Analyze, Fill, model request, form submission or general screenshot scan was performed. Desktop observation screenshots were not added to Git because the browser chrome contains unrelated tabs.

## Native paste and keyboard-clear follow-up

A later actual-toolbar-popup run on the same Chrome version completed the previously missing native paste step. This section supersedes the earlier NOT RUN entry for Chrome Ctrl+V, not for Brave.

- Put only `Synthetic rejection: name mismatch — paste acceptance.` on the OS clipboard. No previous clipboard contents were read or saved.
- The first focus attempt lost the popup and pasted into the browser address bar instead. It was not submitted as a search and is not counted as extension evidence; the address entry was restored.
- Reopened the actual toolbar popup, focused its Rejection remark entry, and pressed **Ctrl+V**. Accessibility observation verified the exact synthetic text inside the popup's Rejection remark field and its invalidation status. **PASS: native clipboard paste.**
- Used Tab navigation from the remark through enabled controls. Focus was verified at Save & scan page (without activating it), then at Clear session on the next Tab. Intermediate individual controls were not independently observed. **PASS for traversing to Clear; not full accessibility certification.**
- Pressed **Enter** while Clear session was focused. Verified the remark was empty, Analyze remained disabled, and both general/EPFO clear messages appeared. **PASS: keyboard Clear activation and visible reset.**
- No Analyze, general screenshot scan, Fill, source-page capture or provider request was invoked. The clipboard remains set to the non-private synthetic sample; no clipboard-read permission was added to the extension.

Brave, screen reader, full focus-order/zoom testing and network instrumentation remain NOT RUN. Popup interactions used the installed extension, not a synthetic runtime. This is additional acceptance evidence for the reviewer, not automatic closure.

## Brave unpacked acceptance — 2026-09-13

Actual installed **Brave 153.1.95.101**, Windows. Tested repository revision `c0452dc` (local integration branch), extension version 0.2.0. The browser product version was read from the running executable. This section supersedes the earlier unavailable-Brave observations; those are retained as historical results, not current blockers.

Windows package manager reported Brave already installed; no install/upgrade was performed. After the user opened Brave, enabled Developer mode and selected the repository's `extension` directory via Load unpacked. Brave showed the enabled **Unpacked extension**, its version and service worker. Opened the actual toolbar popup through Brave's Extensions menu, not a normal tab or mocked HTML/runtime.

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Unpacked load | Browser accepts manifest and local assets | Enabled Saral Sahayak 0.2.0 card and service worker, no load error displayed | PASS |
| Toolbar popup / worker | Editable UI connects to the worker | `Ready when you are. Nothing is captured until you scan.` and enabled profile/text fields | PASS |
| Native clipboard paste | Ctrl+V inserts text into Rejection remark | Pasted synthetic English/Hindi sample; field displayed the sample and remark-change status | PASS for native paste; full multilingual glyph fidelity not separately verified |
| Keyboard edit | Ctrl+A and typing replace the current remark | Field displayed exactly `Synthetic Brave edited remark.` | PASS |
| Keyboard path to Clear | Tab can reach Clear without invoking intervening actions | Nine Tab presses from remark ended with Clear session focused | PASS for this path; intermediate focus stops not individually recorded |
| Keyboard Clear activation | Enter invokes Clear and resets visible state | Empty remark; disabled consent/Analyze; both session-clear statuses | PASS |
| No automatic Analyze on paste/edit | Approval/language gates stay closed | Analyze remained disabled; no Analyze action invoked | PASS for visible controls, not network instrumentation |
| Full screen-reader, every focus stop, zoom and network trace | Separate comprehensive evidence | Not performed in this run | NOT RUN |

Synthetic input was `Synthetic Brave acceptance: name mismatch. नाम मेल नहीं खाता.`. The first caret setup used accessibility value-setting only to focus/empty the field; the tested paste used the real Ctrl+V chord. Keyboard edit used Ctrl+A followed by text entry. No previous clipboard contents were read, saved or restored; the clipboard remains the synthetic sample. No file, claimant identity, backend/provider key or credential was entered. No Detect, Connect backend, Analyze, general scan, Capture, Fill, submit or external request action was invoked during these checks. No claim of packet-level absence is made.

Brave's Developer mode and unpacked extension remain enabled for review. Existing unrelated tabs/extensions were not altered. No desktop screenshots were committed because browser chrome includes unrelated tabs. The observed popup behavior closes the formerly untested Brave basic-load/paste/edit/keyboard-clear gap; comprehensive assistive/network acceptance and reviewer sign-off remain outstanding.

## Manifest beyond original Level 1

Current `manifest.json` is MV3 with `background.js`, `activeTab`, `scripting`, `storage`, OpenAI host permission and loopback host permission. There is no manifest-declared persistent content script. The popup includes a general form assistant and a separate EPFO path. It is **not** a zero-permission/offline-only extension. Keys/profile/file state currently use trusted extension session storage; this is not the approved future isolated privacy vault.

The legacy general form path can send raw profile/field data and an original screenshot after consent. Those advanced privacy gaps remain outside this level and are not certified here. No provider mode was enabled/configured during this run.

## Reproduction and remaining acceptance

Use Chrome Extensions → Developer mode → Load unpacked → select `extension` → Extensions menu → Saral Sahayak. Do not use a normal tab at `popup.html` as a replacement for its toolbar action. Enter the synthetic strings above, press Tab, and use Clear session. Native Chrome and Brave paste/edit/keyboard Clear are now evidenced above; comprehensive keyboard/assistive and network checks still require evidence. Reviewer decides issue acceptance; this report does not close the issue automatically.

Local environment change: the unpacked extension remains installed/enabled and Developer mode remains on for further checks. No browser-store publishing or package installation occurred. Existing unrelated browser extensions were not changed.
