# Live acceptance status and next team tasks

## Follow-up scope

The [issue #29 offline acceptance report](issue-29-offline-acceptance.md) adds actual-corpus scripted adapter/service regressions and opt-in content-free turn diagnostics. It makes no new live provider calls. Historical failed live attempts below remain part of the audit trail. Later frontend/privacy/hosting merges do not by themselves close Level 2.

## What was tested

### Historical failures (pre-#52)

On 2026-09-12, Anish's configured Responses-compatible model was called with the synthetic initials/name-mismatch case from `references/reviews/epfo/cases.json` and the actual Markdown corpus. No real claimant identity, API key or endpoint is included in this report. Raw provider traces remain outside Git.

| Attempt                              | Calls | Duration      | Result                                                                            |
| ------------------------------------ | ----- | ------------- | --------------------------------------------------------------------------------- |
| Initial supported case               | 2     | 16.21 seconds | `budget_exhausted`: explicit large file read consumed too much evidence allowance |
| Same case after initial read-cap fix | 3     | 30.02 seconds | `analysis_timeout` while awaiting final generation                                |

Total for those early attempts: **5 provider calls**. Remaining English cases and multilingual live checks were not run then.

### Post-#52 retest (2026-09-12)

Runtime synced to `main` at merge commit of [#52](https://github.com/iotserver24/saral-sahayak/pull/52) (`285d637`). Synthetic case only: `epfo-case-001-initials-paraphrase`. Operator env: Responses-style Azure endpoint, model label omitted here, `ANALYSIS_REQUEST_SECONDS=120`, `LLM_TIMEOUT_SECONDS=90`. No API keys, endpoints or claimant PII are recorded.

| Path                                                                                                                      | Calls / HTTP  | Duration      | Result                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opt-in `python -m scripts.run_agent_acceptance --allow-live --case epfo-case-001-initials-paraphrase --max-model-calls 8` | 7 model calls | ~22.8 seconds | `observed_status=success`, `contract_status_match=true`, one host validation → repair turn, then terminal `success`. Not `budget_exhausted` / `invalid_model_output`. |
| Direct `POST /api/v1/analyze` (same synthetic text, `language=en`)                                                        | HTTP **200**  | ~15.6 seconds | `status=success`, `classification.reason_id=epfo-rr-001`, **3** host citations (incl. same-file Sources), explanation/actions/draft present.                          |

**Honesty limits (do not over-claim):**

- `semantic_verified` and `language_quality_verified` remain **false** (runner contract). Status match is not policy-semantic or fluency certification.
- Offline review lists candidates `epfo-rr-012` (specific initials subtype) and `epfo-rr-001` (broader mismatch). The HTTP retest selected **`epfo-rr-001`**. That is a valid success-shaped response with real citations; it is **not** independent confirmation that the more specific subtype was chosen.
- Only **one** English synthetic case was retested live after #52. Remaining English cases, unknown/ambiguous/malformed matrix rows and all non-English live checks were **not** run.
- Issue [#29](https://github.com/iotserver24/saral-sahayak/issues/29) Level 2 **Done when** requires a sourced explanation, checklist and usable draft where supported, **and** unsupported cases that clarify or abstain — across the authorized evaluation matrix, not a single happy path.

**Conclusion:** post-#52 provenance-repair feedback unblocked a validated live **success** on the supported synthetic case. This is progress evidence for #29, **not** criteria completion. **Do not close #29** from this retest alone.

## Local fix and limits

Earlier: agent clamps even explicitly requested reads to at most 3,072 text bytes; pagination remains explicit. [#39](https://github.com/iotserver24/saral-sahayak/pull/39) added configurable `ANALYSIS_REQUEST_SECONDS` (defaults unchanged). [#50](https://github.com/iotserver24/saral-sahayak/pull/50) / [#52](https://github.com/iotserver24/saral-sahayak/pull/52) address finish-before-budget-exhaustion and concrete provenance errors in the one-shot repair turn. Those merges are necessary infrastructure; live matrix completion is still outstanding.

## Issue audit

Merged deliverables: backend foundation/agent, output-security fixes, corpus generation, offline evidence-review package and the initial extension implementation with three review fixes. Their pull requests are already closed as merged (#1–#5, #31–#33 where applicable). Later docs/frontend/hosting merges include L1 contracts and UI preview work; see the [team issue board](../references/team-issue-board.md).

**No additional level issue is marked complete by this audit beyond explicitly closed L1 contracts/UI.** The open issues include acceptance beyond those merges: browser checks, privacy guarantees, real agent outcomes or authoritative source verification. Closing them just because code was merged would hide unfinished work.

- Extension #6–#10: implementation overlaps these levels but does not prove the original permission-free/mock/browser acceptance; use the **revised evidence acceptance** on issue 6. Advanced raw-data privacy gaps also remain. Ajay should supply missing evidence or follow that revised scope, not retroactively label all levels complete.
- Image #11–#15: #11 L1 contract closed; #12+ still needs host/name agreement. Privacy #16–#20: #16 L1 approved/closed; #17+ implementation remains. Extension UI #21–#23: #21 Level 1 synthetic mocks are on `main` under `extension/mocks/privacy-ux-level-1/` (issue stays open until acceptance is evidenced). #22 has a partial controls/preview/renderer UI slice (outbound-vs-local disclosure; Analyze/provider/first-last remain disabled); issue stays open. #23 a11y not started.
- Web UI #24–#26: #24 L1 mock UI closed; #48/#51/#57 landed live analyze + status UX toward #25; bounded user-initiated retries are in this frontend change. Remaining #25 honesty: draft-download-when-available (no false ready draft). Preview merges do not by themselves close higher levels.
- Knowledge #27–#28: offline artifacts are merged; actual agent trace/outcome review and six authoritative-source verification gaps remain. Offline `not_run`/`not_attempted` markers are not completed live checks.
- Backend #29–#30: post-#52 single-case live success with real citations is recorded; broader matrix/semantic/language review and Level 3 reproducible demo acceptance (#30) remain open. A local [demo runbook](demo-runbook.md) + readiness probe advance #30 without claiming closure.

## What each person should work on next

| Person | Next issue | Concrete next deliverable |
| --- | --- | --- |
| Anish | [#30](https://github.com/iotserver24/saral-sahayak/issues/30) / [#29](https://github.com/iotserver24/saral-sahayak/issues/29) | Rehearse the local integrated demo via [demo-runbook.md](demo-runbook.md); expand the **bounded** live matrix when authorized; do not treat packaging or a single-case success as Level 3 done. |
| Ajay | [#6](https://github.com/iotserver24/saral-sahayak/issues/6) / [#17](https://github.com/iotserver24/saral-sahayak/issues/17) | Attach revised browser evidence for #6–#10 (see issue 6 comment); implement privacy #17+ against approved #16. Image #12+ needs host name before coding. |
| Avyakta | [#22](https://github.com/iotserver24/saral-sahayak/issues/22) / [#21](https://github.com/iotserver24/saral-sahayak/issues/21) | Review partial UI Level 2 disclosure/renderer wiring toward #22 (keep issue open); #21 mocks remain labelled. Continue evidence/source gaps in #27–#28 as a separate knowledge track. Not Shravya's main web UI. |
| Shravya | [#25](https://github.com/iotserver24/saral-sahayak/issues/25) / [#26](https://github.com/iotserver24/saral-sahayak/issues/26) | Live analyze + bounded retries toward #25; remaining honesty is draft download only when available, then Level 3 a11y/demo polish. Keep provider keys out of the frontend. |

Note: #16 / #11 / #24 are closed as L1 contracts/UI only; dependent higher levels stay open.

Each person should read their issue and the linked reference guide, inspect current code, work one level at a time, and submit evidence with the PR. Do not automatically advance dependent levels, publish private examples, or equate local models with private processing.

## Pitch / differentiation

For hackathon judges asking how this differs from ChatGPT, see [Why not ChatGPT?](why-not-chatgpt.md). For running the local UI→API path, see [demo-runbook.md](demo-runbook.md). Those notes do not close issue 29 or 30 by themselves.
