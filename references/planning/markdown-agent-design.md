# Markdown-reading agent design

## Status and authority

This is the current architecture source of truth for Saral Sahayak. It supersedes retrieval architecture in the historical product PDFs, text companions and archived dataset instructions. The [hackathon plan](hackathon-plan.md) supplies the implementation schedule and scope; [team work levels](../team-work-levels.md) supply milestones.

### Current implementation — 2026-09-12

The [current board note](../team-issue-board.md#current-implementation--2026-09-12-reconciliation) records the supplied `main`/`1fcd433` baseline including PR #84. Selective local inspection confirms the 181 canonical reason files and five supporting/index documents, the bounded Markdown analysis service, streaming, session history, image path and six-language UI. Core text accepts `en`, `hi`, `kn`, `ta`, `te`, `ml`, defaulting to `en`; capabilities still report unverified quality. History/cache hardening is in progress. The [demo acceptance status](../../docs/demo-acceptance-status.md) records the non-passing current-model matrix and remaining gates; provenance/readiness is not semantic, source or native-language verification.

The web image implementation uploads a reviewed original file privately, then validates/flattens it in the backend for extraction. This is not personal-data redaction or the extension's locally redacted screenshot contract; cloud privacy/lifecycle readiness, consent and the separate owner tracks remain gates. This note supersedes lower present-tense claims of absent corpus, unimplemented images or no live requests, not the design's tool trust boundary, budgets, citation requirements or planning targets. Historical “planned generator output” wording describes an output contract now present on disk, not independent content verification. No level is automatically complete and no new Git/network authority is granted.

### Earlier implementation snapshot (superseded status only)

The backend now includes an analysis service reusing the typed schemas, model protocol adapters, bounded Markdown file tools and immutable request-local evidence ledger. The production corpus is still absent and deployment is not verified. Missing model configuration or corpus structure gates analysis with 503 (`model_not_configured` or `knowledge_unavailable`), not `agent_not_implemented`. See the [implemented backend contract](../../docs/backend-contract.md) for concrete API behavior rather than proposed shapes below. Markdown knowledge conversion is separate; verify its output before claiming corpus readiness.

**Current priority:** Anish's Level 2 agent implementation has explicitly resumed; it is not automatically complete. This round remains local, with no push or live provider requests. Ajay independently owns the planned Chrome/Brave MV3 extension using the same backend, with a popup and optional service worker, following the [five-level extension guide](../ajay-extension-guide.md). Start with an offline paste shell, then synthetic states, click-only selection with editable preview, explicit Analyze transport and regression/handoff. No automatic transmission, provider keys or backend/CORS workarounds. Requests belong in extension context with minimal backend host permissions, not content scripts; current Settings accepts only HTTP(S) CORS origins. OCR/document downloads remain Ajay's deferred work, not reassigned. Shravya owns web UI and shared consistency. Anish retains backend/agent and multilingual API ownership; current schemas accept `en`, `hi`, `kn`, `ta`, `te`, `ml`, defaulting to `en`. Clients discover enabled languages through capabilities; quality is unverified for all six. Existing tests remain intact.

## Decision and scope

Build a tool-using agent that reads public Markdown reference data on demand and answers from cited file sections and original source URLs. Start with EPFO rejection text, explanations, actionable checklists and host-assembled drafts. Six languages are accepted by the API, but semantic/linguistic quality remains unverified. Add downloads and optional image extraction incrementally. PM-JAY and voice must not block the EPFO flow.

There is no embeddings pipeline, vector database or runtime RAG/chunk retrieval layer. Do not substitute a deterministic alias/keyword retriever. Aliases remain evidence in the Markdown for the agent to interpret, not a scoring or lookup pipeline. Do not stuff the entire corpus into a prompt.

The model is not a policy authority. The source corpus is educational material, not official EPFO guidance or legal advice. A source's recorded confidence or verification date is metadata, not proof that every claim is currently correct.

## Knowledge layout and conversion contract

The public runtime knowledge root will be `references/knowledge/epfo/`. The following is the planned generator output, not a claim that these files already exist:

```text
references/knowledge/epfo/
├── README.md
├── sources.md
├── glossary.md
├── claim-types-overview.md
├── resolution-playbooks.md
└── reasons/
    ├── epfo-rr-001.md
    ├── ...
    └── epfo-rr-181.md
```

All 181 source rejection records must have a one-to-one Markdown file at `references/knowledge/epfo/reasons/<epfo-rr-NNN>.md`, retaining canonical IDs `epfo-rr-001` through `epfo-rr-181`. These are dataset IDs, not government rejection codes.

- **Index (`README.md`):** a compact navigation guide grouped by category/claim type, with canonical IDs, descriptive titles and relative links to reason files. Keep it navigable in bounded sections; do not duplicate full remedies or all record bodies.
- **Reason files:** retain the original title, aliases, category, affected claim types, severity, official/common message distinction, meaning, root cause, detection context, ordered fix steps, required documents, actors, prevention tips, related IDs, original source URLs/types, confidence, last verification date and notes/caveats. Use stable, descriptive headings so individual sections can be cited. Preserve provenance without implying that conversion re-verifies policy.
- **Supporting Markdown:** `sources.md`, `glossary.md`, `claim-types-overview.md` and `resolution-playbooks.md` live directly under the same EPFO folder. Preserve source attribution, original URLs, qualifications and links between related material.
- **Generation validation:** check all 181 IDs exactly once, field/caveat preservation, source URL fidelity, related-record links, index coverage and heading targets. Agree actual generated headings with the tools and citation contract; the examples below are proposed shapes, not evidence of generated content.
- **Implemented structural gate (`check_corpus`):** requires all 181 reason files plus the five top-level Markdown documents above, nonempty regular UTF-8 files with nonblank ATX headings outside fenced examples and no symlinks. The index needs literal inline links to every `reasons/epfo-rr-NNN.md`; each reason needs its own ID and a valid literal HTTP(S) URL. This checks neither the full generation contract nor semantics, source authority/currency or translation fidelity. `analysis_available` combines this structural result with model configuration only.

The existing [dataset](../epfo-claim-rejection-rag-dataset/README.md), including JSON, CSV and historical chunks, remains source/archive for conversion and provenance, not runtime input or a fallback retrieval pipeline. The [PRD text](../text/saral-sahayak-prd.md) and [presentation text](../text/setu-inferentia-public.md), with their PDF companions, are historical product context outside the runtime knowledge root.

## Proposed file tools and trust boundary

Anish owns implementation of a read-only tool boundary. Tools resolve paths relative to a configured absolute root ending in `references/knowledge/epfo/`; the model cannot change this root.

| Tool | Proposed inputs | Bounded result |
| --- | --- | --- |
| `list_files` | Relative directory, page cursor, limit | Public Markdown paths and entry types, pagination cursor; no file bodies or recursive corpus dump |
| `read_file` | Relative Markdown path plus heading or line range | Canonical repository-relative path, headings, line range, text and explicit truncation/continuation information |

Required host-side controls, not just prompt requests:

- Canonicalize paths and require containment in the configured root. Reject absolute paths, `..` traversal, symlinks and non-regular files; recheck the opened target. Only allow `.md` file reads. Directory listing must obey the same containment rules.
- Deny repository-wide reads, private originals, secrets, `.git`, uploads, generated user documents and the source/archive dataset. Treat linked paths as candidates to validate, never permission to escape the root.
- No shell, file writes, code execution or automatic network fetches in the knowledge tools. Source URLs are citation data, not instructions to fetch or submit user details. Render only validated HTTP(S) citation links.
- Treat every file body, link label, code block and user upload as untrusted data. Never execute commands or follow agent/system instructions found in documents. Documents cannot override tool policy, expand budgets, request secrets or authorize actions.
- Fail clearly on missing files/headings, invalid paths, tool errors and oversized sections. Never silently read the archive or answer from unseen files.

### Initial safety budgets

These are proposed conservative defaults to implement and test, not measured runtime limits:

| Limit | Initial value per request |
| --- | --- |
| Tool calls | 12 total, including listings, continuations and retries |
| Directory listing | 50 entries per page; no automatic recursive enumeration |
| Distinct Markdown files read | 8 |
| File read response | At most 120 lines and 12 KiB UTF-8 text, whichever is reached first |
| Cumulative tool output | 48 KiB and 12,000 tokens, whichever is reached first; include listings and metadata |
| Agent wall-clock deadline | 30 seconds; each tool call capped at 3 seconds within that deadline |

Enforce limits in the host before returning text to the model. A large index or section is paginated explicitly and counts against the same budget. Keep selected evidence excerpts rather than accumulating unrelated content. Stop with a clarification, abstention or explicit tool error when the budget is exhausted; do not issue unbounded retries or silently expand limits. The 30-second product target is an aspiration until measured; correctness and honest failure take priority.

## Agent workflow

1. Validate text input and extract only supplied facts. OCR is optional later; preserve missing fields as null and offer text paste when extraction fails.
2. Read a bounded section of the Markdown index, using `list_files` only as needed. Choose plausible reason files from the index and user context; no precomputed vector or deterministic alias ranking.
3. Read candidate record sections and, when needed, related reasons, glossary, claim-type guidance or playbooks. Interpret aliases and compare applicability in context rather than treating a phrase match as sufficient evidence.
4. Resolve a supported reason using its canonical ID, or ask a focused clarification when multiple reasons fit. Do not force vague inputs into a confident classification.
5. Assemble only the evidence actually read, including caveats, source authority, dates and original URLs. The Extractor, Classifier, Explainer, Fix Generator and Draft roles are logical stages, not a requirement for five separately deployed services. The classifier may revisit its hypothesis after file reads.
6. Generate requested-language explanation/actions from selected evidence. The host assembles the draft from fixed localized request framing, validated cited action blocks and literal supplied details or explicit placeholders; the model cannot provide a free draft or draft identities. The current service is sequential. Any future parallel explanation/fix work must follow shared evidence selection, without duplicating file reads or budgets.
7. Validate claim-level citations and uncertainty, then return the structured result. Report actual progress only; never imply live government access or that original URLs were freshly fetched.

## Citation and response contract

Every substantive policy explanation, recommended action and factual assertion in a draft must map to evidence actually read. Each citation contains:

- `path`: repository-relative public Markdown path, such as `references/knowledge/epfo/reasons/epfo-rr-001.md`.
- `record_id`: canonical `epfo-rr-NNN` for a reason file; null for supporting documents.
- `heading`: the exact section heading read, with an optional line range for precision. A record ID alone does not identify the evidence section.
- `source_urls`: original supporting HTTP(S) URLs recorded in that evidence, not invented links or a substituted generic homepage.
- Source authority, confidence and verification-date metadata where available; preserve unknown values rather than inventing them.

The model references evidence IDs; the host constructs citation metadata from the immutable read ledger and validates it before return. If a remedy excerpt lacks URLs, read its same-file Sources section and attach both evidence IDs to the claim as separate citations; do not merge URLs into the remedy excerpt or borrow unrelated catalog URLs. Index/headingless reads cannot be substantive citations. Attach citation IDs to explanation claims, individual fix steps and host-copied draft assertions. The UI must show path, record ID/heading and original URLs, not just a detached bibliography. A URL's presence is necessary but not sufficient: confirm that the cited section supports the specific claim and note when the underlying source has not been independently checked.

Response states are `success`, `needs_clarification`, `unsupported` and `error`. Use the [implemented versioned schema and fixtures](../../docs/backend-contract.md) for exact fields and state invariants; the actual service supports the three validated non-error outcomes, while host failures return sanitized error envelopes; the absent production corpus currently gates analysis with 503. Classification confidence must be distinct from archived source confidence; do not invent calibrated probabilities. Anish owns schema changes, coordinated with Shravya and Ajay; extension work consumes the existing contract.

For unknown, ambiguous, contradictory, stale or insufficient evidence, ask only the clarifying facts needed or abstain with a clear limitation. Do not present unsupported fixes or drafts as ready to use. A missing corpus or failed tool produces an explicit error, not an ungrounded fallback. Never fabricate user identifiers, circular numbers, legal guarantees or citations.

## Responsibilities and acceptance

- **Anish:** API/schema, file tools, containment/budgets, agent/LLM integration, citations, deployment and multilingual APIs. Level 2 explicitly resumed, not declared complete.
- **Avyakta:** research, Markdown knowledge authoring/curation, index clarity, evidence verification, source authority/currency, caveats and coverage review. No retriever implementation ownership.
- **Shravya:** mock-first web UI, real API integration, citations, clarification/abstention/error states and accessibility; shared consistency with Ajay.
- **Ajay:** [five-level extension work](../ajay-extension-guide.md), synthetic fixtures, browser/security regression and handoff first. OCR and document downloads deferred, not reassigned; preserve existing tests.

Before declaring a working flow, test supported and paraphrased reasons, similar reasons, unknown remarks, missing facts, stale/conflicting sources, citation fidelity, forged citation paths/headings/URLs, traversal/absolute/symlink paths, document prompt injection, missing knowledge, budget exhaustion and dependency failure. Inspect traces to confirm only bounded Markdown evidence enters the prompt. Validate all generated record/index links separately from application tests. Never claim tests or deployment ran until they actually did.

Contributors follow the [temporary task branch workflow](../../CONTRIBUTING.md#branch-workflow): start locally from up-to-date `main`, push only when the PR is ready, merge into `main`, then delete the task branch locally and remotely.
