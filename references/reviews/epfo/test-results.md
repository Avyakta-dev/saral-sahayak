# Offline review test results

Run date: 2026-09-12. Native Windows, project `uv` environment. The focused suite was rerun after moving the review package onto merged `main` at `7c43fe6`: 217 tests passed. The earlier pre-integration run had 211 tests. These results apply to the local review package, not a deployment or live model run.

## Passing checks

```text
uv run python -m references.review_epfo_knowledge build
Checked 181 readable records, 9 review cases, 6 verification gaps.
No live sources or agent execution verified.

uv run python -m references.review_epfo_knowledge check
Checked 181 readable records, 9 review cases, 6 verification gaps.
No live sources or agent execution verified.

uv run pytest tests/test_epfo_knowledge_contract.py tests/test_epfo_review.py -q
217 passed
```

The tests include all 181 readable reason files; visible prose tampering while embedded JSON remains unchanged; exact regenerated-file comparison; source catalog membership/authority preservation; source caveat preservation; missing/forged excerpt rejection; uncertain-case expectation constraints; and rejection of fabricated verification dates and URLs.

The 217 count includes parameterized per-record checks, not 217 independent policy evaluations. All nine agent cases remain `not_run`. All six priority source entries remain `not_attempted` with null actual verification dates.

## Blocked check

```text
uv run pytest tests/backend/test_knowledge_readiness.py -q
ERROR during collection:
AttributeError: module 'os' has no attribute 'O_DIRECTORY'
1 error
```

The error originates in existing `backend/tools/knowledge_files.py:42` during import. No backend tests ran in that invocation. No POSIX flags, containment logic or readiness checks were mocked or weakened. Run the backend suite in a supported POSIX environment with Anish.

## Findings versus verification

- 181 canonical records, 119 distinct source URLs and catalog mappings checked mechanically.
- Four shared normalized alias phrases; duplicated claim-type values in records 007 and 009. These are curation flags, not matching rules or automatic proof of wrong content.
- The source-link JSON has authority labels for all 119 URLs; the earlier claim that they were missing was incorrect. These remain recorded labels, not independently authenticated sources.
- Selected review identified incompatible UAN activation routes and explicit caveats on reported 2026 rules. These conflicts remain in source/runtime content; the offline report does not fix or intercept runtime advice.
- No URLs fetched, provider requests sent, source records rewritten, or runtime behavior changed.
- Level 2 actual answer/trace review and Level 3 authoritative verification are pending, not passed by these tests.
