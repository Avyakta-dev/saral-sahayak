# Issue 17 — local-only privacy implementation slice

Related to [issue 17](https://github.com/iotserver24/saral-sahayak/issues/17) and the [approved privacy contract](../../references/planning/extension-privacy-threat-contract.md). Owner: Ajay. Status: implementation slice ready for review, **not full issue acceptance or screenshot certification**. Avyakta's issue 21 UI design remains separate; this is a minimal functional developer surface.

## Operation

1. Reload the unpacked extension and source page. From a normal HTTP(S) tab, open the toolbar popup and choose **Open local-only privacy capture**.
2. This clears the legacy form session, cancels pending analysis, and opens a separate trusted extension window. Do not open `privacy.html` directly: its worker port must match the created window and active request.
3. Click Inspect. The isolated adapter returns only constant safe labels and opaque local field IDs, not raw names/IDs/selectors/values. It supports a deliberately narrow set of visible enabled contact fields in the top document. Unknown/conflicting/sensitive metadata is denied.
4. Select fields explicitly (none selected initially) and specify an in-viewport crop. Capture creates a fresh vault before approved value reads and starts its absolute 120-second deadline. Limits are name 200, email 254, phone 60, address 1,000 Unicode code points, at most 20 slots. Missing values get `filled:false`.
5. The preview shows fixed `***` masks, filled flags and an **entirely opaque PNG** for the chosen crop. Confirming review binds the exact local artifact digest and request tag only. No further action is enabled.
6. Cancel/close, expiry, source navigation/field/DOM/viewport changes, tab removal/switch, a new privacy session, another legacy mode action or worker loss invalidate the request. Recapture, not persisted recovery, is required.

## Important conservative boundary

This implementation **does not call `captureVisibleTab`, decode an original screenshot, retain source pixels, or perform partial redaction/OCR**. All canvas/image/frame/shadow/unknown content is treated as unverified; the whole selected crop is replaced with an opaque color. A fresh alpha-free canvas is filled and encoded locally. The preview is an explicitly labelled fully-masked placeholder raster, not evidence that useful page content was safely retained.

This chooses the approved contract's deny/mask-all branch instead of capturing potentially secret-bearing originals. Selective useful screenshot redaction, verified pixel geometry/coverage and browser acceptance remain outstanding. Do not describe this as screenshot understanding or full privacy Level 2 completion.

## Isolation and disabled actions

- `vault.js` holds raw values in private JS memory with exact origin/tab/frame/document/page-generation binding; no storage APIs or raw-value/restore API. Opaque 128-bit CSPRNG tokens use `[[SSP_<32 uppercase hex>]]`; every request uses fresh tokens. One active context; error/clock rollback/expiry invalidates it.
- `page.js` keeps only element references, constant classifications and non-value metadata fingerprints. It reads selected values once through native getters and returns them only to the exact worker sender. No DOM writes, screenshot, network or persistent store. Observer/timer cleanup removes inspection state.
- `controller.js` owns the vault and exact trusted window/port. No private value is returned to the preview. Value response references are cleared after vault admission; JS cannot guarantee physical RAM erasure.
- `raster.js` creates a new fully opaque image without receiving source pixels. The PNG data URL is only local UI transport; it is never a model/API input.
- `privacy.js` clears its DOM/image source and disconnects on expiry/close/failure. All source values remain masked. First/last preview is not implemented for personal slots.
- **Analyze, image upload, provider selection, restoration, file attachments, Fill and Submit are absent/disabled.** Unknown operations invalidate the session. Issue 18/19 functionality is not included.
- No new manifest permissions or endpoint allowlist entries. Existing legacy OpenAI/EPFO permissions are unchanged. Other popup actions cancel privacy mode before proceeding. The privacy port cannot invoke legacy APIs.
- The separate legacy form/EPFO features retain their existing behavior and are **not made privacy-compliant by this addition**. Their raw-profile/image egress must not be labelled private; the entry UI says these are separate legacy flows.

## Lifecycle and implementation limits

Inspection is a metadata-only preflight with a separate bounded lifetime. The private request's TTL starts at explicit Capture, before any private read or raster creation; user activity never extends that request deadline. The page adapter's earlier inspection expiry can shorten the usable interval, never extend the vault. Open-but-unused windows also expire.

Mutation/scroll/resize/input/change/history hooks and operation-time revalidation invalidate page bindings. A site can silently assign `.value` without dispatching events; the adapter does not keep a raw pre-read snapshot. Capture reads the current explicitly selected value, and this level never restores/fills it. Do not claim the current mechanism detects every silent value change; the later restoration/fill level needs its own approved exact-value revalidation.

A live port is not durable memory. MV3 worker suspension/disconnect loses the vault; the window fails closed instead of using session storage as a workaround. Chrome's actual sender fields/window lifetime and pixel APIs still require unpacked-browser acceptance. No cross-origin-frame/shadow traversal or public deployment claim.

## Verification performed

- 16 vault tests: absolute TTL including empty requests, bindings, collision handling, grammar, exact slots, error destruction, Unicode limits and no raw-output API.
- 21 isolated page adapter tests: no values during inspection, selected-only native reads, prohibited metadata/controls, single-use IDs, mutation/navigation/expiry invalidation and no persistence/DOM/network behavior.
- 35 controller/raster tests: exact window/port, no stale injection after cancellation, masked-only preview messages, late response suppression, source/TTL cleanup, unsupported actions, crop bounds and full opaque canvas operations.
- Five background integration regressions cover cancellation while legacy cleanup/storage is pending, trusted window creation, no private network/capture and concurrent-action handling.
- Existing extension regression tests preserved; full run at this slice: **195 passed, 0 failed** on Node 22.18.0.
- Tests use synthetic VM/Chrome/canvas mocks except native crypto. They do **not** prove real pixel rendering, actual browser memory cleanup, Chrome/Brave lifecycle, useful sanitized screenshots or provider safety.
- No provider/backend/upload calls, credential reads, new host setup or new synthetic HTML page in this task. The local privacy page is the actual feature UI, not a test page.

Runtime browser acceptance, selective pixel redaction, Avyakta UI integration and exhaustive cross-mode privacy evidence are **not run / not complete**. Keep issue 17 open pending review of this limited slice and the remaining acceptance scope. Image transport still depends on the separately approved controlled host/operator and image implementation.
