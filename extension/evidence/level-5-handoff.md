# Extension Level 5 — security/accessibility/browser handoff

Owner: Ajay. Related to issue 10; separated evidence for revised issues 6–10 in one PR, as allowed by [Anish's decision](https://github.com/iotserver24/saral-sahayak/issues/6#issuecomment-5646145756). Date: 2026-09-12. **Status: partial evidence delivered; release acceptance incomplete.**

## Per-level artifacts

- [Level 1 popup](level-1-popup.md): actual unpacked Chrome installation and toolbar popup, text entry/edit/clear and one keyboard transition. Native clipboard paste and Brave not run.
- [Level 2 states](level-2-response-states.md): production EPFO renderer exercised through registered UI events with synthetic runtime responses; 15 passing tests. Not real backend/browser layout evidence.
- [Level 3 selection](level-3-selection.md): actual extension selected-text capture on a local source page, explicit click, editable preview and restricted-page refusal. Not official portal acceptance.
- [Level 4 backend](level-4-backend.md): actual unavailable-backend error, no invented capabilities; HTTP payload/503/supported-case evidence blocked.

## Security / accessibility / browser matrix

| Scenario | Chrome 152.0.7977.83 Windows | Brave | Other evidence and limitation |
| --- | --- | --- | --- |
| Unpacked load and real toolbar popup | PASS | NOT RUN | Brave launch unavailable. Normal-tab popup is deliberately not the toolbar sender. |
| Text input/edit and clear | PASS via accessibility entry/visible observation | NOT RUN | Native Ctrl+V not run; clear was verified earlier in the run. |
| Keyboard-only complete flow | PARTIAL: Tab from remark to Connect verified | NOT RUN | Full tab order, Enter/Space activation and assistive announcements not certified. |
| Click-gated selected text capture | PASS for exercised substring | NOT RUN | No fixture callback used as capture; actual extension worker/detector. |
| Restricted extension-scheme capture | PASS: refused with editable fallback | NOT RUN | Other restricted pages/stores/frame variants not run. |
| Edit invalidates approval | PASS visible status and retained edit | NOT RUN | Late UI completion also covered by synthetic VM tests. |
| Four analysis states | NOT RUN with real backend | NOT RUN | 15 VM tests include all four fixtures; satisfies automated logic path only. |
| Hostile HTML and unsafe source links | NOT RUN in installed browser result flow | NOT RUN | VM renderer checks pass; source text sinks/URL checks exercised, not real HTML parser/layout. |
| Backend unavailable | PASS actual Connect failure | NOT RUN | Not an HTTP 503 or successful backend pipeline. |
| No private data before explicit Analyze | NOT RUN with network trace | NOT RUN | UI/source and mock-message evidence only; no broad network-privacy certification. |
| Exact destinations/credentials/redirects | Source-reviewed only | NOT RUN | Fixed OpenAI/loopback paths, omit credentials, reject redirects; no HAR collected. |
| Cancellation, worker restart, stale request/page races | NOT RUN as full real-browser matrix | NOT RUN | Existing worker/content unit regressions pass; mocks are not browser proof. |
| Long content, zoom/contrast, screen reader and all scripts | NOT RUN | NOT RUN | Hindi text entry retained; that is not translation/a11y verification. |
| Screenshot redaction / private vault / opaque restoration | NOT IMPLEMENTED under advanced contract | NOT IMPLEMENTED | Legacy raw-data flow is not compliant privacy implementation. |
| No automatic submission | No submit/fill requested in these checks | NOT RUN | Site autosave/handler effects are not generally prevented; do not claim they are. |

## Executed automated checks

Node 22.18.0, command `node --test extension/tests/*.test.cjs`: **118 passed, 0 failed** (103 existing + 15 production EPFO UI-state checks). Only the new UI-state test file and these evidence documents were added for this round. No runtime behavior, permission, backend, provider or UI styling changed. Existing tests were preserved. Test fixtures remain explicitly synthetic, including the historical error fixture.

## Outstanding gates and environment changes

- Reviewer acceptance remains required for issues 6–10; no issue is automatically marked complete by this PR or a passing test count.
- Complete Brave/native paste/keyboard/a11y and browser network matrices in an authorized environment. Desktop control eventually returned a native-helper Accessibility/no-focus-policy refusal on the final cleanup click; that click is not counted as a verified action. No unsafe repeated click or permission bypass was used afterward.
- A synthetic selection edit may remain in the current popup after the final cleanup refusal; it contains no personal data or credential. No screenshot/selection/user text was uploaded to a provider.
- Chrome Developer mode was enabled and the real unpacked extension remains installed for user review. Existing unrelated extensions were unchanged. The local static server used only existing test files and is stopped after checking. No new synthetic page was created.
- Current raw profile/field/screenshot transmission paths remain advanced-privacy release blockers; the accepted issue 16 contract is not implemented by the current worker. Issue 17 requires Avyakta's issue 21 mocks, still open at audit time. No vault/provider/image code was added.
- Image issues 12–15 still require the approved controlled host/operator and issuer/retention policy explicitly called out in Anish's issue 11 approval. Do not choose a public host by default.
- Backend/browser success is blocked by the local runtime/deployment situation and Anish's separate live acceptance work. Protected deployments require a server-side gateway; shared server credentials must not enter browser settings.

This handoff records concrete progress and remaining gaps. It is not a broad-deployment privacy, policy, OCR, language-quality, accessibility or live-success certification. No merge, issue closure, provider activation or store publication is requested.
