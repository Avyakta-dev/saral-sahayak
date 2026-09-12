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

The offline default overall deadline remains 30 seconds. For a bounded live retest only, `ANALYSIS_REQUEST_SECONDS` (and `LLM_TIMEOUT_SECONDS`, which must stay within that budget) can be raised without changing those defaults—for example `ANALYSIS_REQUEST_SECONDS=60` and `LLM_TIMEOUT_SECONDS=45`. Issue #29 stays open until a validated live success; this configurability alone is not acceptance.

## Issue audit

Merged deliverables: backend foundation/agent, output-security fixes, corpus generation, offline evidence-review package and the initial extension implementation with three review fixes. Their pull requests are already closed as merged (#1–#5, #31–#33 where applicable).

**No additional level issue is marked complete by this audit.** The open issues include acceptance beyond those merges: browser checks, privacy guarantees, real agent outcomes or authoritative source verification. Closing them just because code was merged would hide unfinished work.

- Extension #6–#10: implementation overlaps these levels but does not prove the original permission-free/mock/browser acceptance; advanced raw-data privacy gaps also remain. Ajay should supply missing evidence or propose an explicit scope adjustment, not retroactively label all levels complete.
- Image #11–#15, privacy #16–#20, extension UI #21–#23: planned work, not delivered by the initial extension PR.
- Web UI #24–#26: no reviewed merged web frontend or acceptance evidence was found in the current main baseline.
- Knowledge #27–#28: offline artifacts are merged; actual agent trace/outcome review and six authoritative-source verification gaps remain. Offline `not_run`/`not_attempted` markers are not completed live checks.
- Backend #29–#30: live acceptance currently fails; integration/demo readiness remains open.

## What each person should work on next

| Person | Next issue | Concrete next deliverable |
| --- | --- | --- |
| Anish | [#29](https://github.com/Avyakta-dev/saral-sahayak/issues/29) | Resolve the supported-case latency/budget failure and obtain a validated result before expanding the live matrix; keep provider calls explicitly bounded. |
| Ajay | [#16](https://github.com/Avyakta-dev/saral-sahayak/issues/16) | Privacy threat/data-flow contract for screenshot redaction, isolated client values and placeholders; review it with Anish before implementing #17. Also attach browser acceptance gaps to #6–#10. |
| Avyakta | [#21](https://github.com/Avyakta-dev/saral-sahayak/issues/21) | Extension privacy/settings UI mocks in parallel with Ajay's contract, not Shravya's main web UI. Continue evidence/source gaps in #27–#28 as a separate knowledge track. |
| Shravya | [#24](https://github.com/Avyakta-dev/saral-sahayak/issues/24) | Mock-driven main web input/results states using current API schemas and capability-driven languages; no provider keys in frontend. |

Each person should read their issue and the linked reference guide, inspect current code, work one level at a time, and submit evidence with the PR. Do not automatically advance dependent levels, publish private examples, or equate local models with private processing.
