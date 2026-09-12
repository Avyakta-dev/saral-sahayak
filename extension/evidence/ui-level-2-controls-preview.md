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
| Fail-closed terminals (#74/#75) | Host-authored labels for **blocked** / **stale** / **unavailable** (and cancelled/expired/closed); `data-fail-closed` + chip; raw worker/private strings never echoed |
| Level 1 mocks | Remain labelled under `extension/mocks/privacy-ux-level-1/` |

**Does not edit** `vault.js`, `controller.js`, `slots.js`, `page.js`, or `raster.js` in the UI Level 2 slices. Does not steal Ajay open privacy-controller work.

## Synthetic checks (Node 22)

```bash
node --test extension/tests/privacy-*.test.cjs
for file in extension/privacy/*.js extension/background.js; do node --check "$file" || exit 1; done
```

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Privacy-ui suite including Level 2 disclosure + fail-closed terminals | All pass | All pass on current main (post-#65/#74/#75) | PASS |
| Full `privacy-*.test.cjs` | All pass (no vault/controller regressions from UI slices) | Pass on current main | PASS |
| `node --check` privacy + background | Syntax OK | OK | PASS |
| Headless Chromium Playwright (`extension/tests/browser/privacy.test.cjs`) blocked / stale / unavailable terminals | Host labels + scrub + Analyze absent | See blocked-stale browser rows below | PASS (synthetic Port only) |
| Chrome/Brave **unpacked** interactive walkthrough | Capture → preview → Analyze → local review → Fill | NOT RUN | NOT RUN |
| Real sanitized-bitmap certification / selective pixel redaction | Useful redaction | NOT RUN (Ajay privacy levels) | NOT RUN |
| Live Analyze / uploader / provider transport | Enabled destination | NOT RUN — correctly unavailable | BLOCKED / unavailable |
| Accessibility matrix | Keyboard/SR | Partial #72/#23 browser a11y; full matrix NOT RUN (UI Level 3) | NOT RUN as Level 2 closure |

## Blocked / stale / unavailable browser evidence (this slice)

Runs production `privacy.html` / `privacy.css` / `privacy.js` in Playwright Chromium with a **synthetic** `chrome.runtime` Port only (same harness as issue 23 a11y). No extension worker, vault, source tab, provider, or Fill is exercised. This is **not** unpacked Chrome/Brave toolbar evidence.

```bash
# From repository root (Playwright Chromium available via frontend node_modules)
NODE_PATH=frontend/node_modules BROWSER_EVIDENCE_DIR=/tmp/issue22-blocked-stale \
  node --test extension/tests/browser/privacy.test.cjs
```

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Blocked capture on Inspect (`denied` scenario) | `data-fail-closed=blocked`, chip “Blocked capture”, host blocked copy, no raw private value, Analyze absent | Asserted in browser suite | PASS (synthetic) |
| Stale page-change after preview (`stale` scenario) | `data-fail-closed=stale`, chip “Stale / page changed”, outbound/preview scrubbed, Analyze absent | Asserted in browser suite | PASS (synthetic) |
| Unavailable worker on Inspect (`unavailable` scenario) | `data-fail-closed=unavailable`, chip “Unavailable”, Analyze/Upload/Submit absent | Asserted in browser suite | PASS (synthetic) |
| Unpacked Chrome interactive blocked-capture on real restricted page | Same terminal honesty | NOT RUN | NOT RUN |
| Unpacked Brave interactive stale navigation | Same terminal honesty | NOT RUN | NOT RUN |

## Non-claims / gaps for full Level 2 acceptance

- Analyze remains disabled; destination consent is disclosure-only.
- First/last reveal is not implemented (control stays disabled).
- Provider mode cannot be selected; no exact-host transport wiring.
- Outbound panel intentionally omits vault token strings from the DOM (matches prior UI fail-closed tests).
- Headless Chromium + synthetic Port is **not** Chrome/Brave unpacked lifecycle evidence.
- No claim that mocks are replaced; Level 1 HTML stays labelled.
- Issue 22 stays **open** until the full acceptance checklist (including unpacked Chrome/Brave interactive blocked-capture / stale-output evidence) is evidenced.

## Next checkpoint

Stop. After review: either deepen UI Level 2 with **unpacked** Chrome/Brave interactive evidence when authorized, or wait for an explicit UI Level 3 / Analyze-enablement request. Do not auto-advance.
