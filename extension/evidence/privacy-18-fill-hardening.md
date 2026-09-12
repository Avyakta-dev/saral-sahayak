# Issue 18 — reviewed local Fill hardening

Related to issue 18; owner Ajay. Date: 2026-09-12. Based on Anish's merged PR 56 and his explicit issue-18 follow-on description. This is a focused correctness/security follow-up, not new provider, screenshot, image-host or submission capability. Issues 17/18 remain subject to acceptance.

## Defects addressed

- **Stale Fill response affects a newer session:** controller outcomes and errors are now scoped to the original session. A delayed resolve/reject cannot notify an old preview as successful or dispose a newly opened context.
- **Own completion invalidation races results:** while a one-shot Fill is in flight, the controller defers the page's generic invalidation notification to the outcome response. Page-side generation/field validation still controls whether writes stop. The vault has already been consumed, no new action is allowed, and cancellation/window/navigation/TTL still invalidate the controller. No retry or old approval is revived.
- **Private pending-value references survive cancel:** controller tracks the mutable outbound entry buffer and clears it immediately on disposal, including before a held message settles. Frozen vault-release references are dropped after making the narrow outbound entries. Settlement also clears entries. This is reference cleanup, not physical RAM-erasure or recall of messages already serialized to the page.
- **Consent survives changed selected fields:** individual checkbox changes and Select all revoke the previous Fill checkbox. The user must approve the new selected set and click Fill separately.
- **Page validation races, replay and handler rejection:** the adapter consumes the Fill attempt before its first await, checks generation/identity/metadata after asynchronous validation, compares the whole selected batch synchronously before any write, and checks each field again before its setter. Site changes/rejections after handlers are reflected in final outcomes rather than claimed successful.
- **Destination constraints:** bounded constraint metadata is included in bindings; approved values must satisfy native detached-control validity plus explicit length limits before the first page write. No page checkValidity/reportValidity or invalid event is invoked.

## Existing behavior intentionally preserved

The owner-approved PR 56 flow uses a host template, not a model: reviewed opaque preview → Restore locally → per-field selection → explicit Fill consent → Fill. Unresolved values stay manual. Tokens never authorize a selector chosen by a model.

Anish explicitly approved synthetic `input`/`change` in the issue-18 comment. This follow-up keeps only the exact operation-owned events exempt from the adapter's own invalidation; unrelated/nested events and actual page mutations still revoke the binding. The extension never calls submit/requestSubmit or clicks a page button. **A page event handler can itself autosave, upload or submit; the extension cannot promise to suppress all site workflows.** This remains a documented release/review concern, not silently treated as submission authorization.

Analyze, image upload, provider choices and automated Submit remain unavailable in privacy mode. The raster path is still fully opaque with zero source pixels; this work does not implement useful selective screenshot redaction. Legacy raw-data flows remain separate and are not privacy-certified.

## Verification boundaries

Tests execute the real controller/vault/slots/page/UI modules with bounded synthetic Chrome/DOM/canvas facsimiles and no provider/network. New regressions cover old-response resolve/reject after new-session creation, own invalidation/results ordering, pending buffer cleanup, exact one-shot behavior, page changes during validation, post-handler rejection, destination constraints and UI selection/consent changes. Existing tests are retained.

Final executed full suite: **292 passed, 0 failed**, including 71 privacy page tests and 37 privacy UI tests. JavaScript syntax checks and whitespace checks passed. Browser/real portal Fill, packet inspection, actual native constraint behavior across browsers, Brave, physical memory clearing and selective pixel redaction are **not run** in this follow-up. Prior Chrome evidence establishes only the limited observed steps in `privacy-17-browser.md`; it does not prove this entire sequence.

## Remaining gates

- Issue 17 still needs its full capture/pixel/browser acceptance, and issue 18 needs interactive host-restore/Fill evidence and UI review.
- Provider-mode issue 19 and cross-mode issue 20 are not advanced by these offline fixes.
- Image issues 12–15 remain blocked on explicit controlled host/operator/issuer policy agreement.
- Original extension issues 6–10 retain their separate incomplete browser/network/accessibility evidence. A passing unit suite is not completion of those issues.

No real claim data, `.env`/`env` content, API keys, signed links or original screenshots were inspected or committed. `.env` and root `env` remain ignored. Main is synced before work and before pushing; only `extension` is pushed for PR review, not `main`.
