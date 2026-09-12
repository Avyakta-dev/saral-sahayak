# Extension Level 3 — real click-triggered selection capture

Owner: Ajay. Related to issue 8 under [revised acceptance](https://github.com/iotserver24/saral-sahayak/issues/6#issuecomment-5646145756). Date: 2026-09-12. Chrome 152.0.7977.83, Windows, actual unpacked extension 0.2.0. Status: partial acceptance evidence, not a universal portal/privacy claim.

## Actual procedure and observed results

Used the already existing `extension/tests/form.html` as an ordinary HTTP source page on localhost. No new page was created. Its fixture buttons, fake content messaging and form filling were **not used**. The test entered the actual installed extension via Chrome's Extensions menu and used its actual background worker/injected EPFO detector. The existing fixture's missing relative content-script asset under the narrowly served directory is irrelevant to this selection test; no fixture callback supplied capture results.

1. Selected the visible static words `Local adapter test only,` by dragging over them. This is non-policy synthetic text chosen to verify selection mechanics, not EPFO classification.
2. Opened the real toolbar popup. Before pressing Detect, it showed an empty remark, `No candidates detected`, and disabled Analyze. Popup opening did not populate the selection.
3. Pressed **Detect EPFO rejection**. The popup returned one candidate labelled `Selected text (user reviewed)` and the exact text `Local adapter test only,` in its editable preview. It showed the personal-information review warning. The fixture's own result still said `No scan yet` and submit count remained zero.
4. Replaced the preview with `Synthetic reviewed selection — edited locally.` The popup preserved the edit, reset the candidate selector and announced that approval was invalidated. No Analyze or Fill was invoked.
5. Separately, Detect on the extension's own restricted-scheme page returned `Open the EPFO claim-status page in a normal website tab first.` The editable field remained available; there was no permission broadening.

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Opening popup with existing selection | No automatic capture into preview | Empty preview until Detect | PASS for visible behavior |
| Explicit Detect | Selected text from actual active page appears | Exact selected substring and source label | PASS |
| Edit captured text | Edit preserved; old approval cleared | Edited text retained; invalidation status | PASS |
| Restricted page | Clear refusal and manual-entry fallback | Safe refusal and editable field | PASS |
| No automatic submission | No submit/fill invocation | No such action was requested; existing fixture counter remained zero | PASS for exercised sequence |
| No background collection/transmission | Needs instrumentation across lifecycle | Source is click-triggered, but no network/injection trace captured | NOT RUN as full instrumentation evidence |
| Rapid capture, navigation, empty selection and delayed completion races | No stale overwrite | Not exercised in real browser | NOT RUN |
| Brave | Same browser acceptance | Brave launch unavailable | NOT RUN |

This checks capture mechanics with the actual extension, not official EPFO site compatibility. Current detection can also inspect bounded labelled rejection text when no usable selection exists; it is broader than the original selection-only wording and is reported as shipped. It takes no screenshot on the EPFO detection path. Hostile-page/privacy redaction and every race are not certified by this single manual sequence. No model/backend request, file attachment, provider key or real claimant information was involved.
