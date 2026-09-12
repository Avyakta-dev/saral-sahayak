# Extension UI Level 1 — privacy UX mocks

**Owner track:** Avyakta (Extension UI) · **Acting assignee for this PR:** `iotserver24`  
**Related to issue 21** (does not auto-close)  
**Guide:** [Extension UI Level 1 — privacy UX mocks](../../../references/extension-privacy-and-provider-guide.md#extension-ui-level-1--privacy-ux-mocks)  
**Label/state contract consumed:** [threat contract §8 UI handoff](../../../references/planning/extension-privacy-threat-contract.md) and Ajay’s host registry in `extension/privacy/slots.js`

## Artifact

| Path | Role |
| --- | --- |
| [`privacy-flow-mocks.html`](privacy-flow-mocks.html) | Single self-contained, CSP-locked HTML+SVG annotated mock of the privacy flow and fail-closed states |
| This README | State checklist, boundaries, checks, blockers |

Open the HTML as a local file (double-click or `file://`). It uses **no scripts, no network, no extension APIs**. Patterned “preview” graphics are decorative placeholders.

## Non-claims (required)

- These mocks **do not implement redaction**, pixel flattening, vault TTL, or transport.
- They **must not** be cited as Privacy Level 2/3 runtime evidence.
- **Local / loopback mode is not labelled inherently private** — disclosure copy states it remains a recipient with identical token/safe-label rules.
- **First/last** preview is illustrated as **local-only**, **off by default**, and unavailable for the current personal safe-label set.
- Synthetic strings only (`Synthetic Person`, `person@example.invalid`, public token marker `[[SSP_A1B2C3D4E5F60718293A4B5C6D7E8F90]]`).
- Ajay retains vault/transport **fail-closed** ownership (`extension/privacy/*`). This Level 1 PR does **not** edit those modules.

## Shared labels (coordinated, not redefined)

Constant safe labels (must stay aligned with `slots.js` / threat contract):

- `applicant name`
- `contact email`
- `contact phone`
- `postal address`

Fixed local/default mask glyph: exactly `***` (fixed-size control; width independent of value length).

Outbound schema id (illustrative): `privacy-slots-1`.

Fill consent / Submit separation copy intentionally mirrors Ajay’s developer UI so UI Level 2 can integrate without renaming fail-closed controls.

## State checklist

Static review of `privacy-flow-mocks.html` (2026-09-12). No browser automation claimed beyond opening the file.

| State / control | Required display / action | Present in mock | Expected | Observed | Result |
| --- | --- | --- | --- | --- | --- |
| Not connected | Clear unavailable copy; Capture/Analyze/Fill disabled; opening UI does not capture or probe private network | `#s-not-connected` | Disabled actions + explicit not-connected / worker-unavailable wording | Panel shows blocked status, disabled Inspect/Capture/Analyze/Fill | PASS (static) |
| Capture | Explicit click-only capture after safe-label selection | `#s-capture` | Registry labels; empty field → filled:false narrative | Inspect→select→Capture panel with four registry labels | PASS (static) |
| Mask / crop preview | Opaque preview surface; crop affordance; cancel; review checkbox before confirm | `#s-mask-crop` | No claim of real redaction pipeline | Patterned opaque placeholder + crop outline + cancel/confirm | PASS (static) |
| Fixed-star display | Every slot shows exactly `***` | `#s-fixed-star` | Fixed mask regardless of filled/empty | Four slots with identical `***` chips | PASS (static) |
| First/last opt-in | Off by default; personal slots excluded; local-only; fragments excluded from Analyze/raster/logs | `#s-first-last` | Checkbox disabled; warning that personal labels stay full mask | Disabled opt-in + illustrative `A*********Z` marked synthetic | PASS (static) |
| Analyze | Separate approval after destination/mode disclosure; Fill/Submit not implied | `#s-analyze` | Destination shown; retention uncertainty; Analyze separate | Analyze enabled in mock narrative; Fill/Submit disabled | PASS (static) |
| Local restored-result preview | Trusted-window plain values; unresolved stays unresolved; no follow-up echo | `#s-restore` | Synthetic values only; missing phone unresolved | Restored list with unresolved phone | PASS (static) |
| Separate Fill / manual submission | Fill consent; Submit disabled; autosave warning; manual submit outside extension | `#s-fill` | Fill ≠ Submit | Fill button + disabled Submit + manual submission note | PASS (static) |
| Provider / mode disclosure | Exact destination; modes listed; local not “inherently private”; equal redaction | `#s-provider` | Loopback called a recipient | Warning copy present; mode `<select>` disabled mock | PASS (static) |
| Restricted page | Fail closed; no capture | `#s-blocked` | Coarse error only | Restricted-page status block | PASS (static) |
| Unsupported / coverage failure | Frame/canvas/unknown → deny | `#s-blocked` | No “probably safe” gap | Unsupported target status block | PASS (static) |
| Blocked Fill / expired-stale | Preflight abort; clear approvals; recapture | `#s-blocked` | No token reuse | Blocked Fill + expired/stale blocks | PASS (static) |
| Flow overview | Capture → … → Fill ≠ Submit with fail-closed note | `#flow` | Annotated SVG | SVG skeleton + fail-closed caption | PASS (static) |

### Checks explicitly not run

| Check | Status |
| --- | --- |
| Chrome/Brave unpacked integration of these mocks into `privacy.html` | NOT RUN (UI Level 2) |
| Real pixel coverage / vault TTL / provider transport | NOT RUN (Ajay privacy levels) |
| Network trace proving zero egress from this HTML | NOT RUN as instrumentation; CSP `connect-src 'none'` + no scripts is the static control |
| Accessibility matrix / screen reader | NOT RUN (UI Level 3) |
| Shravya main-web label audit beyond registry alignment note | NOT RUN (coordinate as needed; no web UI edits) |

## Boundaries / approvals / blockers

- **Does not edit** `extension/privacy/vault.js`, `controller.js`, `slots.js`, `page.js`, `raster.js`, or production `privacy.html` / `privacy.js`.
- **Does not** enable Analyze/upload on the developer privacy path.
- **Blocker for calling Privacy complete:** Ajay’s #17/#18 evidence checklists and Image admission remain separate.
- **Blocker for UI Level 2:** review of this mock set + agreement that control labels match fail-closed contracts before wiring live controls.
- **Avyakta confirmation** of #21 control/state contract remains a checklist item on the threat contract until a human reviewer marks it.

## Verification performed

```bash
# From repository root — syntax-only / presence checks for this artifact
test -f extension/mocks/privacy-ux-level-1/privacy-flow-mocks.html
test -f extension/mocks/privacy-ux-level-1/README.md
# Confirm required anchors exist
grep -E 'id="(s-not-connected|s-capture|s-mask-crop|s-fixed-star|s-first-last|s-analyze|s-restore|s-fill|s-provider|s-blocked|checklist)"' \
  extension/mocks/privacy-ux-level-1/privacy-flow-mocks.html
# Confirm non-claim language
grep -E 'not implement redaction|not labelled inherently private|local-only' \
  extension/mocks/privacy-ux-level-1/privacy-flow-mocks.html
```

Expected: files exist; all anchors match; non-claim phrases present. Observed: same (run in the Level 1 PR evidence). No extension unit tests were added or required for static mocks; existing `extension/tests/privacy-*.test.cjs` were not modified and were not re-run as certification of this docs/HTML slice.

## Next checkpoint

Stop here. After review, a **separate explicit request** may start Extension UI Level 2 (integrate approved controls with Ajay’s contracts; keep mocks labelled until replaced by integrated UI).
