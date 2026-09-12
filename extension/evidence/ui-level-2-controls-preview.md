# Extension UI Level 2 — controls, preview and renderer integration (partial)

**Related to issue 22** (does not auto-close)  
**Owner track:** Avyakta (Extension UI) · **Acting assignee for this PR:** `iotserver24`  
**Guide:** [Extension UI Level 2](../../references/extension-privacy-and-provider-guide.md#extension-ui-level-2--controls-preview-and-renderer-integration)  
**Builds on:** Level 1 mocks ([`../mocks/privacy-ux-level-1/`](../mocks/privacy-ux-level-1/), issue 21 / #61)

## Slice delivered

Integrate approved Level 1 control patterns into the trusted `privacy.html` window against Ajay’s existing contracts:

| Control / panel | Behavior in this slice |
| --- | --- |
| Opaque preview | Unchanged Ajay PNG path; still fully-masked |
| Outbound envelope | Plain-text renderer: safe labels + filled + fixed `***` + schema `privacy-slots-1`; vault tokens **not** rendered; transport labelled disabled |
| Local restore banner | Explicit “local only” copy; restored values via `textContent` only |
| First/last opt-in | Present, **off**, **disabled** for personal registry labels |
| Provider / mode | Disclosure `<select>` present, **disabled**; local/loopback not labelled inherently private |
| Analyze / upload / Submit | Stay **disabled**; Analyze consent cannot stick |
| Approval invalidation | Forced mode/first-last change events clear review/Fill/Analyze consent without enabling transport |
| Level 1 mocks | Remain labelled under `extension/mocks/privacy-ux-level-1/` |

**Does not edit** `vault.js`, `controller.js`, `slots.js`, `page.js`, or `raster.js`. Does not steal Ajay open work on EPFO background (#64).

## Synthetic checks (Node 22)

```bash
node --test extension/tests/privacy-*.test.cjs
for file in extension/privacy/*.js extension/background.js; do node --check "$file" || exit 1; done
```

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Existing privacy-ui suite (37) | All pass | All pass | PASS |
| Level 2 UI additions (5) | Outbound envelope, disabled Analyze/provider/first-last, local banner, consent invalidation, cancel scrub | All pass | PASS |
| Full `privacy-*.test.cjs` | All pass (no vault/controller regressions) | 174 pass / 0 fail | PASS |
| `node --check` privacy + background | Syntax OK | OK | PASS |
| Chrome/Brave unpacked interactive walkthrough | Capture → preview → Analyze → local review → Fill | NOT RUN | NOT RUN |
| Real sanitized-bitmap certification / selective pixel redaction | Useful redaction | NOT RUN (Ajay privacy levels) | NOT RUN |
| Live Analyze / uploader / provider transport | Enabled destination | NOT RUN — correctly unavailable | BLOCKED / unavailable |
| Accessibility matrix | Keyboard/SR | NOT RUN (UI Level 3) | NOT RUN |

## Non-claims / gaps for full Level 2 acceptance

- Analyze remains disabled; destination consent is disclosure-only.
- First/last reveal is not implemented (control stays disabled).
- Provider mode cannot be selected; no exact-host transport wiring.
- Outbound panel intentionally omits vault token strings from the DOM (matches prior UI fail-closed tests).
- No claim that mocks are replaced; Level 1 HTML stays labelled.
- Issue 22 stays **open** until the full acceptance checklist (including interactive blocked-capture / stale-output browser evidence) is evidenced.

## Next checkpoint

Stop. After review: either deepen UI Level 2 (blocked-capture messaging in the live window, stale-output gallery) when Ajay contracts expose those states to the UI, or wait for an explicit UI Level 3 / Analyze-enablement request. Do not auto-advance.
