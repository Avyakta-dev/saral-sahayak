# Web UI integration — implementation and acceptance evidence

## Current checkpoint

Anish explicitly accepted issue [24](https://github.com/iotserver24/saral-sahayak/issues/24) through merged PR [35](https://github.com/iotserver24/saral-sahayak/pull/35). His issue comment records Level 1 acceptance and identifies real API integration as the next deliverable.

This follow-up implements issue [25](https://github.com/iotserver24/saral-sahayak/issues/25). It is ready for review, not a claim that issue [26](https://github.com/iotserver24/saral-sahayak/issues/26), production language/source quality or deployment acceptance is complete.

Work began by pulling main. While it was in progress, PR 35 merged, the repository transferred to `iotserver24/saral-sahayak`, and shared CI/Vercel/backend changes landed. The work was preserved and moved to `task/shravya-web-ui-integration` from main `4083e28`. Existing hosting/CI work is retained. The final reconciliation includes main `3afe6c2`, preserving its live-mode API facade, same-origin/server-root settings, grounded-answer disclosures, readiness helpers and three-attempt retry policy. Protected admission errors are handled without browser tokens. All feature changes in this follow-up stay under `frontend/`; non-frontend merge content matches main.

## Implemented requirements

| Requirement                  | Evidence                                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real capability discovery    | Configured API mode calls the actual capabilities endpoint. Language options/default/native names come only from validated service metadata. Pending/unavailable/invalid metadata blocks analysis.                      |
| Real text submission         | Only explicit Analyze text or Enter submits the editable text and selected language. The client validates the full serialized request. No hidden file, image, cookie, authorization or provider-key transmission.       |
| Current response contract    | Six language codes, generated-text/link checks, nullable paired column endpoints and distinct small transport-error envelopes are supported.                                                                            |
| Actual result states         | Success, clarification, unsupported and error API responses render directly. Failed requests never substitute canned samples. Clarification editing retains the original text and relevant questions.                   |
| Honest progress and recovery | Waiting/cancel states reflect actual requests. Stale results are ignored. Transient failures allow two deliberate same-message retries; metadata refreshes are bounded too. No automatic retries.                       |
| Evidence and drafts          | Service and sample rendering are distinct. Paths, record IDs, exact headings, lines, zero-based columns and original URLs stay attached to claims. Copying retains factual draft references, warnings and placeholders. |
| Privacy and local inputs     | Local PNG/JPEG/WebP and UTF-8 text controls remain bounded. Image-only analysis is blocked; text plus a local image sends only text. Object URLs and retained turns are cleaned up.                                     |
| Optional services            | Current capabilities support text and report downloads unavailable. OCR, voice, PDF reading and download endpoints are not invented or enabled by a boolean alone.                                                      |
| Mock regression              | Explicit preview/sample flows remain separate, support all four outcomes in six preset languages and carry unreviewed-quality notices.                                                                                  |

## Validation results

- Production TypeScript/Vite build: passed.
- Final merged unit/component suite: **839/839 passed** across 14 files with bounded worker concurrency, including 183 HTTP client tests, 51 API UI tests and 11 API answer/evidence presentation tests. One aggregate test initially exceeded its five-second harness budget under concurrent browser load; only that test's budget was increased, assertions retained, and the complete suite reran successfully.
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
- Issue 25: code and reproducible acceptance evidence are submitted for review. Existing merged PRs 48, 51, 57 and 63 are preserved. The issue owner explicitly kept it open for reviewer acceptance and document downloads when a supported endpoint becomes available. Current `downloads_available: false` is respected; no endpoint is fabricated.
- Issue 26: responsive/keyboard/axe, language presentation and failure-state checks are included as integration regressions. Formal Level 3 acceptance remains gated on reviewed issue 25 and independent language-quality/optional-service evidence. Automated checks do not provide those human approvals, so this task does not mark the issue complete.

No real provider/source fetching, policy correctness, fluent multilingual output, physical-camera capture, OCR, public deployment or successful government outcome is certified. Live provider/credit use and shared backend/security changes require their own authorization. No automatic issue closure or merge is implied.
