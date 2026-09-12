# Issue 26 — capability languages and accessibility

Scoped Shravya frontend work from `72d0116`, on `task/issue-26-capability-languages`. No backend/extension changes, live provider calls, commits or pushes.

## Behavior

- Request/response languages accept `en`, `hi`, `kn`, `ta`, `te`, `ml`; English remains the default. Live options use only validated capabilities, in server order, with native names.
- Metadata requires known unique codes, English inclusion, English default, bounded letter/mark-based names and `quality_verified: false`. Missing, malformed or unreachable discovery offers only an explicitly unverified English fallback. The existing direct English analysis attempt remains available; no synthetic guidance replaces a failed request.
- Each send/retry refreshes capabilities. A removed/unverified non-English language blocks that request rather than silently sending English. New selections fall back to English when needed; completed results retain their original language. Manual language changes cancel pending results using the existing cancellation behavior.
- Examples remain English/Hindi fixtures. Other selections open an explicitly labelled English sample without changing the live selection. Identifiers, citation metadata, placeholders and raw script content are not translated or normalized.
- The native selector has language tags, an accessible unverified-quality description and a 44px minimum height; narrow headers can wrap. Controls remain English. Live warnings use the response language rather than an English/Hindi-only heuristic.
- Optional citation-column validation already existed; acceptance/rejection regression tests were added without changing its contract.

## Local verification

- `npm --prefix /tmp/setu-issue-26/frontend run check`: passed formatting, TypeScript/Vite production build and **351 unit tests**.
- `CI=1 PLAYWRIGHT_PORT=5276 npm --prefix /tmp/setu-issue-26/frontend run test:e2e`: **154 passed**, desktop Chrome and Pixel 7 emulation, including **30 new language cases** and all existing browser cases.
- Browser APIs were route-mocked with synthetic responses. Coverage includes six scripts, native keyboard selection/focus, literal request/response text, configured subsets, malformed lists, unavailable discovery, removed-language retries, pending cancellation, preserved completed results, demo honesty, expanded citations and WCAG A/AA checks. Existing 320px/390px overflow tests also passed.
- Six mobile script-result screenshots were visually inspected; these establish display behavior, not linguistic correctness. Screenshots and the HTML report are local ignored artifacts under `frontend/test-results/` and `frontend/playwright-report/`.
- `git diff --check`: passed.

The first browser run found test setup issues (JSON import attributes and Strict Mode duplicate probes), corrected before the passing run. An unrestricted Axe scan also reported existing best-practice landmark findings for hidden file inputs; final scans use the existing suite's `wcag2a`, `wcag2aa`, `wcag21aa` scope, not a claim that every Axe rule passes.

Independent language/policy quality review, physical-device/screen-reader acceptance and actual-provider end-to-end acceptance remain unverified. No translations, OCR, downloads, keys or visual redesign were added. Main review, PR and green Actions remain the next checkpoint; this does not declare the entire Level 3 complete.
