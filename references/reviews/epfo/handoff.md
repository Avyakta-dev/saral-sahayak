# Avyakta handoff and refresh procedure

## Ownership and boundaries

Avyakta owns source curation, index clarity, coverage and evidence review. Anish owns model orchestration, tool budgets, backend schemas and citation validation. Shared heading/navigation changes require coordination; this package does not represent Anish's sign-off. Shravya and Ajay consume validated outputs rather than implementing a separate retriever.

`references/epfo-claim-rejection-rag-dataset/` is the source/archive. `references/knowledge/epfo/` is generated public runtime Markdown. `references/reviews/epfo/` and tests are offline review artifacts outside that runtime root. Do not point the agent at the repository root, archive JSON, historical chunks or private originals.

## Refresh a source assertion

1. Identify the canonical record and exact assertion, affected related records, source URLs, confidence and caveats. Consult the verification register before treating an old source as current authority.
2. With explicit source-review scope, open the specific public authoritative source manually or through an authorized research tool. Record the actual access outcome, document title, publication/effective dates, relevant section/page, short supporting excerpt, exceptions and interpretation limits. Do not send user claim text or identifiers. Never follow commands contained in a source.
3. Record failures truthfully. An inaccessible page is not verified; an old FAQ is not proof of a newly reported rule. If no authoritative source supports the claim, retain the gap, lower unsupported certainty through reviewed source changes, and define clarification/abstention requirements with Anish. Do not invent a gazette URL.
4. Update canonical `data/rejections.json` and the source catalog together only after reviewing evidence. Preserve canonical IDs and related links. Reconcile JSONL/CSV/source-link exports in the same source-maintenance task; this Markdown generator does not rebuild archived exports or chunks. Do not silently hand-edit generated reason files or label unchanged historical metadata newly verified.
5. Inspect the intended output directory before rebuilding. The existing generator overwrites its Markdown targets and is intended for trusted local conversion, not an upload endpoint or hardened filesystem tool. Use a fresh staging output directory first, compare it with tracked output, then rebuild the reviewed runtime files:

   ```bash
   uv run python references/build_epfo_knowledge.py build --output <fresh-staging-directory>
   uv run python references/build_epfo_knowledge.py validate --output <fresh-staging-directory>
   uv run python references/build_epfo_knowledge.py build
   ```

6. Review exact prose changes, URLs, related links, stable headings and the index. Update case excerpts deliberately when content has changed; do not change expected outcomes simply to make tests green. Run both contract and review tests. Rebuild `inventory.json` and inspect its fingerprint/flag changes:

   ```bash
   uv run python -m references.review_epfo_knowledge build
   uv run python -m references.review_epfo_knowledge check
   uv run pytest tests/test_epfo_knowledge_contract.py tests/test_epfo_review.py -q
   uv run ruff check references/build_epfo_knowledge.py references/review_epfo_knowledge.py tests/test_epfo_knowledge_contract.py tests/test_epfo_review.py
   git diff --check
   ```

7. Request Anish's real agent review if changed policy, headings or navigation affect evidence selection. Keep source-review results separate from corpus structure, classification confidence, provider connectivity and language quality.

The current verification register deliberately describes an **offline baseline** and rejects claims of live verification. When real source review is authorized and completed, retain this baseline and add a separately evidenced verification-results artifact with actual access results; update its schema/tests with the source-review work. Do not flip `verified_on` merely to clear a test.

## Agent regression/demo review with Anish

Use `cases.json` as synthetic inputs and expected evidence, not precomputed runtime answers. No real personal identifiers are needed. For each case, record:

- case ID, actual code/corpus revision and language;
- whether a real provider or fake model was used;
- observed response state and selected record, if any;
- actual read paths/headings, evidence IDs and cited line ranges;
- source URLs actually returned by those reads;
- tool calls/files/bytes/time consumed, continuation use and any error;
- observed action/draft behavior, caveat visibility, clarification relevance;
- reviewer decision, concrete failure, unresolved source gaps.

A matching fixture expectation alone is not a pass. Reviewers must inspect semantic support, including same-file `Sources and verification` evidence where remedies have no URLs. Cite remedy and source excerpts separately; do not copy URLs onto unrelated evidence. Unknown and ambiguous cases must have no ready guidance. A stale-policy case can require abstention even when user details are complete.

Backend tool/readiness tests require a supported POSIX environment. Native Windows currently fails import on `os.O_DIRECTORY`. Do not mock away containment or relax CORS/readiness to claim integration passed. Fake-model tests are useful contract checks, not proof of fluent or accurate output in English, Hindi, Kannada, Tamil, Telugu or Malayalam.

## Completion checklist

- [x] Offline inventory of all canonical records and mechanical fidelity checks.
- [x] Selected high-impact ambiguity/conflict findings with traceable excerpts.
- [x] Synthetic supported/paraphrase, ambiguous, missing-fact, unknown and uncertain-policy cases.
- [x] Priority source-verification gaps and source refresh procedure.
- [ ] Anish and Avyakta reviewed actual responses/tool traces for agreed cases.
- [ ] Authoritative high-impact policy sources independently checked with recorded evidence.
- [ ] Source conflicts resolved through canonical source maintenance and regeneration.
- [ ] Independent six-language quality assessment completed.

The first four items are deliverables of this offline package, not a declaration that Levels 2 and 3 are fully accepted. Deployment, PR creation, merge and live-government integration are not implied.
