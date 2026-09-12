# Issue 17 — actual Chrome privacy-window check

Owner: Ajay. Date: 2026-09-12. Implementation checked: `d642de8` on `extension`. Related to issue 17 and PR 53. **Partial evidence only; full issue acceptance remains incomplete.**

## Environment and method

Real Google Chrome 152.0.7977.83 on Windows, installed unpacked extension, desktop accessibility/keyboard actions. Reloaded the extension through `chrome://extensions`. Served the existing `extension/tests/form.html` as an ordinary localhost source page; no new page was created. Its test buttons/fake messaging were not used. The real extension toolbar, worker and injected privacy adapter performed the operations below. No provider/backend request, original screenshot capture, file attachment or submission was requested.

Only `Synthetic Person` was entered into the source page's name field. Existing password/OTP fixture values are artificial and were not selected. The actual privacy UI was observed rather than a mocked runtime.

## Observed results

| Step | Expected | Actual | Status |
| --- | --- | --- | --- |
| Reload unpacked extension and open toolbar popup | Worker connects; local privacy entry exists | Popup displayed `Open local-only privacy capture` | PASS |
| Open local privacy window | Exact trusted extension context connects without a synthetic runtime | Separate Chrome window displayed `Local worker ready. Choose Inspect to request safe field metadata.` | PASS |
| Initial state | No selected values/capture; dangerous actions disabled | Inspect enabled, Capture disabled, Analyze/Restore/Fill disabled | PASS for observed UI state |
| Explicit Inspect | Only constant safe labels and crop metadata shown | `applicant name`, `contact email`, `contact phone`, `postal address`; viewport 1536 × 730 CSS pixels, DPR 1.25 | PASS |
| Prohibited/unsupported fields | No password/OTP/file/select candidates | Those fixture fields did not appear in candidate UI | PASS for this source page |
| Name confidentiality during inspection | Raw name not displayed in privacy UI | `Synthetic Person` was not present in the inspected privacy surface | PASS for visible UI; memory/network instrumenting NOT RUN |
| Worker disconnect | Drop UI state and require explicit restart | First attempt displayed `The local worker disconnected. All preview and field data have been cleared. No automatic restart.`; only Close remained | PASS for fail-closed UI; cause not established |
| New explicit attempt | No reuse of old context | New privacy window connected; fresh Inspect returned labels and a new countdown | PASS |
| Select applicant name | Selection is explicit | Accessibility click focused the checkbox; its checked state was not independently verified | INCONCLUSIVE |
| Capture and render opaque PNG | Actual pixel rendering and mask/filled output | Desktop helper refused Capture with `Accessibility or no-focus policy`; no completed capture observed | NOT RUN |
| Review tag, Cancel after preview, TTL expiry and navigation after capture | Full runtime lifecycle evidence | No completed capture, so not exercised | NOT RUN |
| Brave / full accessibility / pixel safety / packet trace | Independent acceptance evidence | Not exercised | NOT RUN |

An open runtime port does not guarantee MV3 worker survival. The observed disconnect was not worked around with storage, heartbeat traffic or an extended deadline. No cause is inferred solely from the disconnect. The source name is synthetic and may remain on the local source page. The first closed session's window was closed through its own Close control. The second session is subject to its existing fail-closed disconnect/expiry behavior; the refused click was not replayed.

## Interpretation

This establishes real Chrome compatibility for the new entry point, trusted preview connection, explicit inspection and safe-label presentation. It does **not** establish a real completed vault capture, useful screenshot redaction, complete data destruction, zero network exposure or passing issue 17 acceptance. Unit/VM tests remain separately labelled in `extension/privacy/README.md`; they cannot replace the missing browser checks.

The fully opaque implementation deliberately has no original pixels and no image egress. Useful selective redaction is still absent. Privacy restoration/provider work in issues 18–20 must not be claimed or enabled on the strength of this partial check. Image issues 12–15 remain gated on the approved controlled host/operator. The existing legacy raw-data form flow is not certified private.

No desktop screenshots were added to the repository because browser chrome exposes unrelated user tabs. The temporary localhost server was stopped after the check. No credentials, environment contents, real claimant documents or private source images were read or uploaded. No issue closure requested.
