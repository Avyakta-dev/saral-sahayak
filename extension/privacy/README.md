# Privacy capture — local vault, restore and approved Fill

Related to [issue 17](https://github.com/iotserver24/saral-sahayak/issues/17) (vault/redacted capture) and [issue 18](https://github.com/iotserver24/saral-sahayak/issues/18) (placeholder restore + Fill). Owner: Ajay. This documents the merged #53 vault slice plus a focused follow-on for **host-local restore** and **explicit user-approved Fill**. It is **not** full Privacy Level 2/3 acceptance, screenshot certification, Analyze/upload, or EPFO portal end-to-end proof.

## Operation

1. Reload the unpacked extension and source page. From a normal HTTP(S) tab, open the toolbar popup and choose **Open local-only privacy capture**.
2. This clears the legacy form session, cancels pending analysis, and opens a separate trusted extension window. Do not open `privacy.html` directly: its worker port must match the created window and active request.
3. Click Inspect. The isolated adapter returns only constant safe labels and opaque local field IDs, not raw names/IDs/selectors/values.
4. Select fields explicitly and Capture. Capture creates a fresh vault (120s absolute TTL), reads selected values once, and shows a fully opaque PNG preview with `***` masks and filled flags only.
5. Confirm local preview review. **Analyze, image upload, provider selection and Submit remain disabled.**
6. **Restore locally** builds a host template (`privacy-slots-1`), validates echoed tokens, and shows restored values only in the trusted privacy window (one-pass). Unfilled slots stay unresolved.
7. Select fields per-item or batch, check the Fill consent, then **Fill selected fields**. The page adapter writes `.value` only, dispatches synthetic `input`/`change`, and **never** clicks Submit/`requestSubmit`/buttons. The vault is consumed before/with the write so a worker restart cannot replay fills.
8. Cancel/close, expiry, navigation/DOM changes, tab switch or worker loss invalidate the request. Recapture is required.

## Contracts honored in this slice

- Opaque tokens `[[SSP_<32 uppercase hex>]]`, filled flags and constant safe labels only cross any AI-shaped boundary. This slice uses a **host echo** (no model/Analyze).
- Fail closed on forged/cross-request/misplaced tokens, duplicate Fill selections, unresolved slots, newer conflicting edits, and unknown actions including Submit.
- Legacy OpenAI/EPFO popup flows remain separate and are **not** privacy-certified by this path.

## Files

| File | Role |
| --- | --- |
| `vault.js` | Expiring in-memory vault; `restoreLocal` / `consumeFill` after review |
| `slots.js` | Token grammar, host template, strict slot-response validation, one-pass restore |
| `page.js` | Inspect/read/check + explicit `PRIVACY_FILL` (`.value` only) |
| `controller.js` | Trusted window/port; restore + Fill; Analyze/upload/Submit rejected |
| `raster.js` | Fully opaque crop placeholder (no original pixels) |
| `privacy.html` / `privacy.js` / `privacy.css` | Developer UI including restore + per-field/batch Fill approval |

## Verification

Run from the repository root with Node.js 22:

```bash
node --test extension/tests/privacy-*.test.cjs extension/tests/background.test.cjs
node --check extension/privacy/*.js extension/background.js
```

- 31 production privacy-UI checks (`privacy-ui.test.cjs`) cover explicit capture/review, invalid previews, deadline preservation and complete DOM scrubbing on terminal states. They found misleading expiry copy that claimed the displayed deadline began at Capture; wording now describes the earlier Inspect deadline and separate vault ceiling, without changing lifecycle policy.
- Offline VM/Chrome/canvas mocks (except native crypto) do **not** prove real pixel rendering, browser memory cleanup, Chrome/Brave lifecycle, useful sanitized screenshots or provider safety.

Chrome/Brave interactive Fill on a real EPFO portal, selective pixel redaction, Analyze/upload and Avyakta UI polish remain **not run / not complete**. Keep issues 17 and 18 open until their evidence checklists are satisfied.

## Related UI mocks

Avyakta’s Extension UI Level 1 annotated mocks (issue 21) are at [`../mocks/privacy-ux-level-1/`](../mocks/privacy-ux-level-1/). Those files do not replace this developer UI or certify redaction.
