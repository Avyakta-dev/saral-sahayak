# EPFO coverage review and handoff

## Status and scope

This is Avyakta's offline Level 2/3 review package, reviewed on 2026-09-12. It is outside the runtime knowledge root. Nothing here is a retriever, production answer, model execution result, or instruction for the runtime agent.

Related work: [Level 2 issue #27](https://github.com/iotserver24/saral-sahayak/issues/27) and [Level 3 issue #28](https://github.com/iotserver24/saral-sahayak/issues/28). The current issue board requires Level 2 review before Level 3 acceptance. This combined offline package was prepared before that board was fetched; its Level 3 register/handoff is preparatory, not authorization to bypass the dependency or close either issue.

The generated corpus exists: 181 canonical reason files and five top-level Markdown documents. Older planning documents describing its absence are historical status snapshots. Existence and faithful conversion do not establish correctness of the guidance.

- **Level 1 conversion:** merged PR #4 checks structure, embedded source preservation, rendered-content fidelity and test discovery. Those tests do not prove clarification/abstention behavior. Readable prose is independently compared with the archived fields by this review suite.
- **Level 2 offline work:** a full mechanical inventory, selected semantic review findings, and nine evidence-backed review cases. A follow-on grounding/index pass adds compact claim-type navigation, offline grounding flags for agreed cases, per-URL official-vs-secondary labels from the source-link catalog, and explicit conflict caveats on selected source records (rebuilt through the generator). Actual agent responses and bounded read traces remain **not run** and require Anish's integration review. This is not blanket semantic review of all 181 records or Level 2 Done-when acceptance.
- **Level 3 offline work:** a priority verification register, known gaps, regression inputs, and refresh instructions. Authoritative sources were **not fetched** in this work; current policy remains unverified. Full Level 3 verification is **pending**.

No backend, API, retrieval, provider, CORS, or file-tool behavior is changed. No private user claim data is used. Synthetic cases avoid actual identifiers. The archived source files remain unchanged; contradictory policies have not been silently rewritten.

## Files and reproducible checks

- `inventory.json`: generated census of all 181 records, membership by category/claim type/severity/confidence/source-type summary, empty fields, duplicate list values, shared normalized aliases, index-section sizes, source URLs, and content fingerprints.
- `cases.json`: nine synthetic inputs with candidate IDs, exact evidence excerpts/headings, expected states, forbidden behaviors, and `agent_execution: not_run`.
- `verification-register.json`: high-impact assertions with existing record URLs, recorded authority basis, explicit gaps, acceptance requirements, `fetch_status: not_attempted`, and `verified_on: null`.
- [Findings](findings.md): reviewed overlaps, contradictions, qualifications and remaining risks.
- [Handoff](handoff.md): source refresh and agent-review protocol.
- [Test results](test-results.md): measured offline passes and the actual Windows readiness error.

From the repository root:

```bash
uv run python -m references.review_epfo_knowledge check
uv run pytest tests/test_epfo_knowledge_contract.py tests/test_epfo_review.py -q
uv run ruff check references/review_epfo_knowledge.py tests/test_epfo_review.py
git diff --check
```

Merged PR #4 updated default pytest discovery to include all of `tests`, including Avyakta's tests. The explicit paths above isolate this offline review suite. Backend readiness imports POSIX-only file flags and is currently not runnable on native Windows. Do not weaken the file tools to make a content test pass.

To rebuild this review inventory after reviewing source/corpus changes:

```bash
uv run python -m references.review_epfo_knowledge build
uv run python -m references.review_epfo_knowledge check
```

Inventory generation performs no network requests and does not change source records or runtime Markdown. Fingerprints normalize checkout line endings but not content. Inventory equality detects stale review artifacts; exact excerpt checks detect stale cases and source-reference drift. A case expectation passing validation does **not** mean the agent produced that outcome.

## Acceptance that remains external

Anish must review actual responses and tool traces for these cases with Avyakta. A supported result must cite only read evidence; uncertain inputs must not receive ready fixes/drafts. Both passes and failures should be recorded without altering the expectations to match output.

High-impact rules need explicit authoritative-source review, including effective dates and exceptions. A URL on an official host is only a verification candidate. A source-record `last_verified` value is inherited metadata, not this review's verification date. Likewise, the source catalog's report of HTTP 403 does not mean a request was attempted or failed in this task. No language quality or provider connectivity is verified by this package.
