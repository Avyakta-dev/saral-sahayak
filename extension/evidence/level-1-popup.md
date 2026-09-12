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

## Brave individual focus stops and worker-network observation — 2026-09-13

Follow-up baseline: `2a33a84`, after PR #79 merged. The loaded popup, styles, popup scripts, background worker and EPFO bridge have no file differences between the earlier loaded `c0452dc` revision and this baseline. No runtime files, browser permissions or tests were changed for this run.

### Keyboard results

Used the actual Brave toolbar popup with a fresh, unconnected session. Each forward Tab below was followed by its own accessibility observation; this is no longer inferred from a repeated nine-Tab command. The ordered observed focus stops were:

1. Open local-only privacy capture.
2. Detect EPFO rejection.
3. Rejection remark.
4. Connect backend.
5. Full name.
6. Email address.
7. Phone number.
8. Address.
9. One less thing to upload / native file control (not activated).
10. AI setup disclosure.
11. OpenAI API key, after Enter expanded AI setup (left empty).
12. Model (unchanged `gpt-4o-mini`).
13. Save profile & settings (not activated).
14. Save & scan page (not activated).
15. Clear session.

**PASS: individual forward focus stops for the initial profile view with AI setup expanded.** Disabled candidate/language/consent/Analyze/Cancel controls were skipped. This does not cover enabled analysis controls, later workflow views, or the complete reverse sequence. Enter expanded AI setup without saving settings. The synthetic remark `Synthetic Level 1 keyboard check.` remained in its field during navigation. Enter on Clear emptied the remark, collapsed AI setup and displayed both clear statuses. Shift+Tab from Clear reached Save & scan page. Escape dismissed the popup; reopening displayed the initial empty/ready state.

An initial key call explicitly scoped to the main browser window dismissed the old popup and moved focus on the extensions page. It is excluded from the passing traversal above. Subsequent keys used the browser's current popup focus, and every reported destination was independently observed.

### Visual observation limitation

App-window screenshots omitted the popup even while the accessibility tree contained it. A full-display screenshot did show it. After Clear, the footer control was partly clipped at the lower edge; Ctrl+End scrolled the complete Clear label and its focus outline into view. **PASS only for keyboard scrolling to the visible footer; automatic focus visibility is not established.** This observation needs a repeatable visual check before attributing it to a CSS defect. No unrelated browser screenshots were committed. Zoom, contrast, complete reverse traversal and spoken screen-reader announcements remain **NOT RUN**; accessibility names/states are not evidence of spoken output.

### Worker Network panel

Opened the extension card's service-worker inspector and selected Network before reopening the toolbar popup. The inspected context was `background.js`. Recording was enabled, All request types selected, the filter empty, no throttling applied, and no log-clear action was taken during the observation interval.

Reopened the actual popup, entered `Synthetic network observation: name mismatch.`, replaced it with `Synthetic network observation: edited.` using Ctrl+A and text entry, and activated Clear. The exact text changes and subsequent empty remark/both clear statuses were verified. The worker Network panel remained an empty request table with `Currently recording network activity`; its final state was verified visually as well as through accessibility.

**PASS for no recorded worker requests during this specific open/entry/edit/Clear interval.** This is a bounded DevTools observation, not packet capture, not a cold-worker lifecycle test (the inspector can keep it alive), and not coverage of the popup's separate network target. Native clipboard paste was not repeated during this recording. No backend connection, Detect, scan, Analyze, Fill, provider credential, or private data was used. No HTTP 503, Analyze payload, live provider result, or extension-wide zero-egress certification is claimed. Full popup-plus-worker network coverage remains outstanding.

The worker inspector was left open on Network. Extension data used in this run were cleared. No settings were saved. **Issue 6 remains open:** Chrome individual focus-stop coverage, full assistive/visual checks and complete network coverage still need acceptance evidence; this report does not substitute mocks or source inspection for them.

## Chrome focus visibility regression and fix — 2026-09-13

Baseline `8efee93`, actual installed Chrome toolbar popup, same extension ID and version as above. Initial checks used the existing popup code; final checks used the `popup.js`/`popup.css` changes in this PR. No new HTML harness, fake backend or test files were added.

### Individual forward controls

All 15 destinations listed in the Brave sequence were observed individually in Chrome as well. The first two were verified through accessibility; Rejection remark through Clear were verified with full-display screenshots showing their focus outlines. Space expanded AI setup; its API key stayed empty and Model unchanged. Disabled EPFO controls were skipped. This was split across two popup openings: one traversal lost popup focus after Connect, so it is **not** claimed as an uninterrupted end-to-end keyboard run. The second opening used five Tabs to return to Full name, then individually observed each remaining stop through Clear. A later unexpected dismissal after Enter was excluded from reset acceptance rather than assumed successful.

**PASS for individual forward reachability, not full accessibility certification.** The visible borders/labels were identifiable at the tested display configuration. The bottom outline of Save profile & settings touched the viewport edge; comprehensive focus-outline and zoom coverage remains incomplete. Full reverse traversal and spoken announcements remain NOT RUN.

### Confirmed Clear regression

A subsequent run entered `Synthetic Chrome network check.`, replaced it using Ctrl+A and typing, navigated to Clear, and pressed Enter. Accessibility verified an empty remark, disabled consent/Analyze, and both clear statuses. The before screenshot showed the complete Clear control; the after screenshot showed only the top of its focus outline at the viewport's bottom, with its label clipped. This reproduces the earlier Brave observation: longer reset messages change layout while the footer button retains focus.

The fix scrolls Clear into view after the current reset finishes **only if it still owns focus**. The existing epoch guard prevents stale operations from scrolling, and no `.focus()` call steals focus back from another control. A scoped 8px block scroll margin keeps the 3px outline plus offset away from the edge. No permissions, transport, state-clearing semantics, deadlines or provider behavior changed.

Retest: reloaded the actual unpacked extension after the script change, reopened its toolbar popup after the CSS change, navigated to Clear, then pressed Enter. Full-display observation confirmed the complete Clear label and focus outline remained visible without Ctrl+End. Repeated with AI setup expanded before Clear; it collapsed and the complete focused Clear control remained visible. **PASS: Chrome reset visibility with setup closed and expanded.** Brave post-fix, delayed/error reset and zoom-specific visual retests remain NOT RUN; existing synthetic tests do not establish these visual outcomes.

### Chrome worker-network observation

Before the fix/reload, opened this extension's `background.js` inspector, selected Network, and verified recording with All selected, empty filter and no throttling. Reopened the actual toolbar popup and performed the synthetic entry/edit/keyboard-Clear sequence above. No log clear was performed in the interval. The final worker Network panel was visually empty and displayed `Currently recording network activity`.

This supplies the same **bounded worker-only observation** as Brave, not popup-target coverage, packet capture or a cold-worker test. The edited string was typed but not separately read back before Clear; exact edit fidelity is not a claim of this recording. No Connect, Detect, scan, Analyze, Fill, file selection or provider key was used. Native Ctrl+V was not repeated in the recording. No claim of HTTP 503, successful analysis or extension-wide zero egress follows from this empty table.

### Validation and outstanding gates

- `node --check extension/popup.js`: PASS.
- `node --test extension/tests/*.test.cjs`: **374 passed, 0 failed, 0 skipped** after the script fix. The only subsequent runtime change was the scoped CSS scroll margin.
- Existing `epfo-popup.test.cjs` also reran separately: 15 passed, including the four synthetic responses and hostile-HTML handling. This is automated renderer evidence, not live/provider/browser-state acceptance.
- No keys, real claimant details, documents, original screenshots or HARs were staged. The desktop images contain unrelated browser chrome and remain outside Git. The extension was reloaded only after its synthetic data were cleared.
- Issue 6 remains OPEN. Both browsers now have individual forward-focus evidence; full reverse/zoom/assistive checks and popup-plus-worker network coverage remain outstanding. Spoken screen-reader output is not available in this tool channel and requires independently recorded assistive acceptance. No issue or later dependency is closed by this fix.

## Manifest beyond original Level 1

Current `manifest.json` is MV3 with `background.js`, `activeTab`, `scripting`, `storage`, OpenAI host permission and loopback host permission. There is no manifest-declared persistent content script. The popup includes a general form assistant and a separate EPFO path. It is **not** a zero-permission/offline-only extension. Keys/profile/file state currently use trusted extension session storage; this is not the approved future isolated privacy vault.

The legacy general form path can send raw profile/field data and an original screenshot after consent. Those advanced privacy gaps remain outside this level and are not certified here. No provider mode was enabled/configured during this run.

## Reproduction and remaining acceptance

Use Chrome Extensions → Developer mode → Load unpacked → select `extension` → Extensions menu → Saral Sahayak. Do not use a normal tab at `popup.html` as a replacement for its toolbar action. Enter the synthetic strings above, press Tab, and use Clear session. Native Chrome and Brave paste/edit/keyboard Clear are now evidenced above; comprehensive keyboard/assistive and network checks still require evidence. Reviewer decides issue acceptance; this report does not close the issue automatically.

Local environment change: the unpacked extension remains installed/enabled and Developer mode remains on for further checks. No browser-store publishing or package installation occurred. Existing unrelated browser extensions were not changed.
