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

## Manifest beyond original Level 1

Current `manifest.json` is MV3 with `background.js`, `activeTab`, `scripting`, `storage`, OpenAI host permission and loopback host permission. There is no manifest-declared persistent content script. The popup includes a general form assistant and a separate EPFO path. It is **not** a zero-permission/offline-only extension. Keys/profile/file state currently use trusted extension session storage; this is not the approved future isolated privacy vault.

The legacy general form path can send raw profile/field data and an original screenshot after consent. Those advanced privacy gaps remain outside this level and are not certified here. No provider mode was enabled/configured during this run.

## Reproduction and remaining acceptance

Use Chrome Extensions → Developer mode → Load unpacked → select `extension` → Extensions menu → Saral Sahayak. Do not use a normal tab at `popup.html` as a replacement for its toolbar action. Enter the synthetic strings above, press Tab, and use Clear session. Native paste, complete keyboard/assistive checks and Brave still require evidence. Reviewer decides issue acceptance; this report does not close the issue automatically.

Local environment change: the unpacked extension remains installed/enabled and Developer mode remains on for further checks. No browser-store publishing or package installation occurred. Existing unrelated browser extensions were not changed.
