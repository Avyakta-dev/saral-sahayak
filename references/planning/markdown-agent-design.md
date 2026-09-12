# Markdown-reading agent design

## Status and authority

This is the current architecture source of truth for Saral Sahayak. It supersedes retrieval architecture in the historical product PDFs, text companions and archived dataset instructions. The [hackathon plan](hackathon-plan.md) supplies the implementation schedule and scope; [team work levels](../team-work-levels.md) supply milestones.

This is a design, not an implemented application. Runtime code, file-reading tools, dependencies, tests and deployment are not implemented yet. Markdown knowledge conversion is a separate generator task, not part of this documentation update; verify its output before claiming the corpus is ready.

## Decision and scope

Build a tool-using agent that reads public Markdown reference data on demand and answers from cited file sections and original source URLs. Start with EPFO rejection text, explanations, actionable checklists and drafts. Add Hindi, downloads and optional image extraction incrementally. PM-JAY and voice must not block the EPFO flow.

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
6. Generate an explanation, supported actions and a draft using user-provided details or explicit placeholders. Independent explanation/fix work may run in parallel only after shared evidence is selected; drafting depends on approved actions. Do not duplicate file reads or budgets per stage.
7. Validate claim-level citations and uncertainty, then return the structured result. Report actual progress only; never imply live government access or that original URLs were freshly fetched.

## Citation and response contract

Every substantive policy explanation, recommended action and factual assertion in a draft must map to evidence actually read. Each citation contains:

- `path`: repository-relative public Markdown path, such as `references/knowledge/epfo/reasons/epfo-rr-001.md`.
- `record_id`: canonical `epfo-rr-NNN` for a reason file; null for supporting documents.
- `heading`: the exact section heading read, with an optional line range for precision. A record ID alone does not identify the evidence section.
- `source_urls`: original supporting HTTP(S) URLs recorded in that evidence, not invented links or a substituted generic homepage.
- Source authority, confidence and verification-date metadata where available; preserve unknown values rather than inventing them.

Assign each evidence item a citation ID and attach citation IDs to explanation claims, individual fix steps and draft assertions. The UI must show path, record ID/heading and original URLs, not just a detached bibliography. A URL's presence is necessary but not sufficient: confirm that the cited section supports the specific claim and note when the underlying source has not been independently checked.

Proposed response states are `success`, `needs_clarification`, `unsupported` and `error`. Include classification (`reason_id`, category and qualitative confidence with rationale), explanation, fixes, draft, citations, warnings and clarification questions as applicable. Classification confidence must be distinct from archived source confidence; do not invent calibrated probabilities. Anish and Shravya must agree the concrete schema before implementation.

For unknown, ambiguous, contradictory, stale or insufficient evidence, ask only the clarifying facts needed or abstain with a clear limitation. Do not present unsupported fixes or drafts as ready to use. A missing corpus or failed tool produces an explicit error, not an ungrounded fallback. Never fabricate user identifiers, circular numbers, legal guarantees or citations.

## Responsibilities and acceptance

- **Anish:** API/schema, file tools, containment and budget enforcement, tool-using agent orchestration, LLM integration, citation validation, integration and deployment.
- **Avyakta:** research, Markdown knowledge authoring/curation, index clarity, evidence verification, source authority/currency, caveats and coverage review. No retriever implementation ownership.
- **Shravya:** mock-first UI, real API integration, visible citations, clarification/abstention/error states, accessibility and downloads.
- **Ajay:** synthetic fixtures, OCR, draft templates/downloads, regression/security tests, Hindi checks, run/demo documentation and support.

Before declaring a working flow, test supported and paraphrased reasons, similar reasons, unknown remarks, missing facts, stale/conflicting sources, citation fidelity, forged citation paths/headings/URLs, traversal/absolute/symlink paths, document prompt injection, missing knowledge, budget exhaustion and dependency failure. Inspect traces to confirm only bounded Markdown evidence enters the prompt. Validate all generated record/index links separately from application tests. Never claim tests or deployment ran until they actually did.

Contributors follow the [temporary task branch workflow](../../CONTRIBUTING.md#branch-workflow): start locally from up-to-date `main`, push only when the PR is ready, merge into `main`, then delete the task branch locally and remotely.
