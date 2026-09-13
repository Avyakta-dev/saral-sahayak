# Web UI integration — implementation and acceptance evidence

## Current checkpoint

Anish explicitly accepted issue [24](https://github.com/iotserver24/saral-sahayak/issues/24) through merged PR [35](https://github.com/iotserver24/saral-sahayak/pull/35). His issue comment records Level 1 acceptance and identifies real API integration as the next deliverable.

This follow-up implements issue [25](https://github.com/iotserver24/saral-sahayak/issues/25). It is ready for review, not a claim that issue [26](https://github.com/iotserver24/saral-sahayak/issues/26), production language/source quality or deployment acceptance is complete.

Work began by pulling main. While it was in progress, PR 35 merged, the repository transferred to `iotserver24/saral-sahayak`, and shared CI/Vercel/backend changes landed. The work was preserved and moved to `task/shravya-web-ui-integration` from main `4083e28`. Existing hosting/CI work is retained. The final reconciliation includes main `3afe6c2`, preserving its live-mode API facade, same-origin/server-root settings, grounded-answer disclosures, readiness helpers and three-attempt retry policy. Protected admission errors are handled without browser tokens. All feature changes in this follow-up stay under `frontend/`; non-frontend merge content matches main.

## Implemented requirements

| Requirement                  | Evidence                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real capability discovery    | Configured API mode calls the actual capabilities endpoint. Language options/default/native names come only from validated service metadata. Pending/unavailable/invalid metadata blocks analysis.                                                                                                              |
| Real text submission         | Only explicit Analyze text or Enter submits the editable text and selected language. The client validates the full serialized request. No hidden file, image, cookie, authorization or provider-key transmission.                                                                                               |
| Current response contract    | Six language codes, generated-text/link checks, nullable paired column endpoints and distinct small transport-error envelopes are supported.                                                                                                                                                                    |
| Actual result states         | Success, clarification, unsupported and error API responses render directly. Failed requests never substitute canned samples. Clarification editing retains the original text and relevant questions.                                                                                                           |
| Honest progress and recovery | Waiting/cancel states reflect actual requests. Stale results are ignored. Transient failures allow two deliberate same-message retries; metadata refreshes are bounded too. No automatic retries.                                                                                                               |
| Evidence and drafts          | Service and sample rendering are distinct. Paths, record IDs, exact headings, lines, zero-based columns and original URLs stay attached to claims. Copying retains factual draft references, warnings and placeholders.                                                                                         |
| Privacy and local inputs     | Local PNG/JPEG/WebP and UTF-8 text controls remain bounded. When image capability is enabled, an image is an alternative to text. Separate review/approval uploads the original selected file, including embedded metadata; no automatic redaction is performed. Object URLs and retained turns are cleaned up. |
| Optional services            | Image input requires explicit validated capability metadata and configured image transport. Downloads are capability-gated local draft text export, not a document service. Voice/PDF services are not invented from a boolean.                                                                                 |
| Mock regression              | Explicit preview/sample flows remain separate, support all four outcomes in six preset languages and carry unreviewed-quality notices.                                                                                                                                                                          |

## Current local validation — baseline `1fcd433`

- Standard `npm run check`: formatting and production TypeScript/Vite build passed; **916/916 unit/component tests passed across 17 files**, including 198 HTTP client tests, 55 API UI tests, 19 backend-status helper tests and 12 API answer/evidence presentation tests. The bundle-size warning remains non-blocking.
- Final frozen-source preview run: **160/160 passed** on desktop/mobile Chrome in 3.1 minutes, including the existing 36 axe scans and keyboard/overflow checks.
- Final mocked live/locale run: **62/62 passed** on desktop/mobile Chrome in 1.1 minutes, including six-language missing-readiness/capacity errors, reactive locale changes without refetching, localized gallery controls and preserved original content. Analysis/storage routes were mocked or loopback fixtures; no real model or R2 requests were made.
- Extension Node regression: **378/378 passed**, with no skipped or cancelled tests. The dedicated `test:api` real-HTTP fixture suite was not rerun in this task.
- Earlier attempts exposed stale mocks/selectors and assertion wording; interrupted runs and development-server reload contamination are excluded from these final counts. Final suites ran without runtime overrides or changes during execution.
- Browser regressions now supply the required `history_available: false` capability field and locate the current Output language control. Six-locale coverage checks translated Details/readiness controls, source hints and footer text, image-only submission with whitespace, rejection of combined text/image input, and exact original-file upload only after separate consent.
- All six catalogs have **361 matching keys** with placeholder parity. The follow-up adds 102 keys and preserves the existing 259. Live error messages use safe localized code mappings; unknown raw error codes are hidden, with sentinel regressions. No stylesheet or visual redesign changes were made.
- The follow-up localization pass replaces authored readiness/status helpers, transport failures, stored notices, refresh/retry limits, gallery labels, capability prose, answer/evidence labels and download/export framing with reactive canonical messages in all six dictionaries. Locale changes do not refetch, retry or change the selected output language. Source IDs/paths/URLs, literal user text, model explanations/questions and original sample content remain unchanged. Live error-envelope prose is suppressed in favor of safe code-based localized messages.
- Rate limiting retains existing fail-closed behavior: HTTP 429 does not create an automatic retry or a fabricated countdown. Existing manual-retry count copy uses locale-aware plural selection. Independent native-language and assistive-technology review remain required; this is implementation/test evidence, not fluency or source-quality acceptance.
- Image consent explicitly describes complete-file/embedded-metadata upload to service-controlled private storage and possible remote-model processing. The browser sends the original reviewed file, not locally sanitized/redacted pixels. Cancellation cannot recall received data. These checks do **not** satisfy the separate redacted-capture/privacy contract or certify storage ACL, deletion, provider or OCR behavior.

## Historical integration evidence — not rerun by the current validation

The following results describe the earlier integration checkpoint above; they are not current-run counts.

- Final merged preview browser regression: **160/160 passed in a complete run**, including 36 axe scans. The suite explicitly selects example-only mode; default same-origin capability discovery is independently covered by API/UI tests.
- Dedicated real HTTP browser acceptance: **20/20 passed** in a complete final run on desktop/mobile Chrome. Connected ready, success, draft, clarification and structured-error axe checks reported no violations. Enter submission, keyboard result tabs and 320/390px overflow checks passed.
- Fixture HTTP-only smoke: nine supported/clarification/unsupported/provider-failure/timeout/budget/invalid-output/body-validation cases passed, plus readiness and exact-origin CORS checks. Invalid input made zero model calls. Latest protected server-only admission checks for 401 access denial, 429 capacity and 504 outer request timeout also passed using synthetic server-side credentials; no browser token injection or gateway bypass was used.
- Occupied backend/Vite port refusal and cleanup were verified: no reuse or termination of unrelated listeners; owned Windows/Linux processes and temporary synthetic corpora cleaned up.
- Mock contract parity: all 48 original/richer six-language/four-state response variants were accepted by the backend response schema offline.
- Formatting, fixture Python Ruff checks and scoped TypeScript checks passed. Final run commands and prerequisites are documented in `README.md`.

## What is real in the API tests

The browser, fetch/CORS transport, uvicorn, FastAPI `create_app`, `AnalysisService`, readiness checks, bounded Markdown tools, evidence ledger, schema/output validation, budgets and host draft assembly are real. HTTP responses are not intercepted or fulfilled by Playwright.

Only the injected model and temporary 181-record Markdown corpus are synthetic. The fake model performs real bounded section reads through the service's tool dispatch; the host generates and validates the evidence IDs and citation locations. The fixture clears inherited settings, skips `.env`, denies external network connections and uses no production corpus or real provider credentials.

On Windows, the real POSIX-secure backend runs through WSL with isolated locked dependencies in a user-owned environment. No Windows file-security shim, firewall change, production backend modification or provider request was used.

## Review and remaining boundaries

- Issue 24: already accepted by Anish; its accepted conversational design is retained.
- Issue 25: code and reproducible acceptance evidence are submitted for review. Existing merged PRs 48, 51, 57 and 63 are preserved. The issue owner explicitly kept it open for reviewer acceptance. Current `downloads_available: false` keeps export copy-only. When that flag is true, live drafts may save a local text file; that is not a document service or claim submission.
- Issue 26: responsive/keyboard/axe, language presentation and failure-state checks are included as integration regressions. Formal Level 3 acceptance remains gated on reviewed issue 25 and independent language-quality/optional-service evidence. Automated checks do not provide those human approvals, so this task does not mark the issue complete.

No real provider/source fetching, policy correctness, fluent multilingual output, physical-camera capture, OCR, public deployment or successful government outcome is certified. Live provider/credit use and shared backend/security changes require their own authorization. No automatic issue closure or merge is implied.
