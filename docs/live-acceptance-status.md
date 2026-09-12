# Live acceptance status and next team tasks

## Follow-up scope

The [issue #29 offline acceptance report](issue-29-offline-acceptance.md) adds actual-corpus scripted adapter/service regressions and opt-in content-free turn diagnostics. It makes no new live provider calls and does not supersede the failed live results below. This page's team audit describes the baseline at the time of those attempts, not later frontend or privacy-contract merges.

## What was tested

On 2026-09-12, Anish's configured Responses-compatible model was called with the synthetic initials/name-mismatch case from `references/reviews/epfo/cases.json` and the actual Markdown corpus. No real claimant identity, API key or endpoint is included in this report. Raw provider traces remain outside Git.

| Attempt | Calls | Duration | Result |
| --- | --- | --- | --- |
| Initial supported case | 2 | 16.21 seconds | `budget_exhausted`: explicit large file read consumed too much evidence allowance |
| Same case after initial read-cap fix | 3 | 30.02 seconds | `analysis_timeout` while awaiting final generation |

Total: **5 provider calls**. Remaining English cases and multilingual live checks were not run. The model read appropriate name-mismatch evidence, but neither attempt returned a validated successful answer. This is not a passing acceptance report.

## Local fix and limits

The agent now clamps even explicitly requested reads to at most 3,072 text bytes (or a smaller caller/host limit), instead of applying that reservation only to omitted limits. Pagination remains explicit. The prompt recommends named sections and requesting the relevant classification/explanation/fix/source sections together. These changes have offline regression coverage; the final prompt revision has not been retested live.

The offline default overall deadline remains 30 seconds. For a bounded live retest only, `ANALYSIS_REQUEST_SECONDS` (and `LLM_TIMEOUT_SECONDS`, which must stay within that budget) can be raised without changing those defaults—for example `ANALYSIS_REQUEST_SECONDS=60` and `LLM_TIMEOUT_SECONDS=45`. [#39](https://github.com/iotserver24/saral-sahayak/pull/39) only adds this configurable deadline; it does **not** claim live acceptance. Issue #29 stays open until a validated live success; this configurability alone is not acceptance. Live acceptance remains historically failing on the supported case.

## Issue audit

Merged deliverables: backend foundation/agent, output-security fixes, corpus generation, offline evidence-review package and the initial extension implementation with three review fixes. Their pull requests are already closed as merged (#1–#5, #31–#33 where applicable). Later docs/frontend/hosting merges include L1 contracts and UI preview work; see the [team issue board](../references/team-issue-board.md).

**No additional level issue is marked complete by this audit beyond explicitly closed L1 contracts/UI.** The open issues include acceptance beyond those merges: browser checks, privacy guarantees, real agent outcomes or authoritative source verification. Closing them just because code was merged would hide unfinished work.

- Extension #6–#10: implementation overlaps these levels but does not prove the original permission-free/mock/browser acceptance; use the **revised evidence acceptance** on issue 6. Advanced raw-data privacy gaps also remain. Ajay should supply missing evidence or follow that revised scope, not retroactively label all levels complete.
- Image #11–#15: #11 L1 contract closed; #12+ still needs host/name agreement. Privacy #16–#20: #16 L1 approved/closed; #17+ implementation remains. Extension UI #21–#23: planned mocks/integration, not finished.
- Web UI #24–#26: #24 L1 mock UI closed; #25 API integration is next. Frontend preview merges do not by themselves close higher levels.
- Knowledge #27–#28: offline artifacts are merged; actual agent trace/outcome review and six authoritative-source verification gaps remain. Offline `not_run`/`not_attempted` markers are not completed live checks.
- Backend #29–#30: live acceptance currently fails; integration/demo readiness remains open.

## What each person should work on next

| Person | Next issue | Concrete next deliverable |
| --- | --- | --- |
| Anish | [#29](https://github.com/iotserver24/saral-sahayak/issues/29) | Resolve the supported-case latency/budget failure and obtain a validated result before expanding the live matrix; keep provider calls explicitly bounded. (#39 deadline config is not acceptance.) |
| Ajay | [#6](https://github.com/iotserver24/saral-sahayak/issues/6) / [#17](https://github.com/iotserver24/saral-sahayak/issues/17) | Attach revised browser evidence for #6–#10 (see issue 6 comment); implement privacy #17+ against approved #16. Image #12+ needs host name before coding. |
| Avyakta | [#21](https://github.com/iotserver24/saral-sahayak/issues/21) | Extension privacy/settings UI mocks in parallel with Ajay's privacy track, not Shravya's main web UI. Continue evidence/source gaps in #27–#28 as a separate knowledge track. |
| Shravya | [#25](https://github.com/iotserver24/saral-sahayak/issues/25) | Real API integration for the main web UI (#24 L1 mocks closed). Keep provider keys out of the frontend. |

Note: #16 / #11 / #24 are closed as L1 contracts/UI only; dependent higher levels stay open.

Each person should read their issue and the linked reference guide, inspect current code, work one level at a time, and submit evidence with the PR. Do not automatically advance dependent levels, publish private examples, or equate local models with private processing.
