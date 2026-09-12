# Team work levels

These levels turn the [ownership plan](planning/hackathon-plan.md#7-team-ownership) and [current Markdown agent design](planning/markdown-agent-design.md) into an ordered handoff. They are milestones, not completion claims. Inspect actual code, generator output and tests before reporting progress; the application and runtime file tools are not implemented yet.

## Shared rules

- **Level 1:** agree interfaces and build a minimal independently testable component.
- **Level 2:** integrate a working end-to-end EPFO text path.
- **Level 3:** harden accessibility, error handling and the demo; attempt stretch features only after core acceptance.
- `main` is the shared integration baseline. Start each task locally on a temporary descriptive branch from up-to-date `main`, push only when its PR is ready, merge into `main`, then delete its local and remote task branch. This is the intended workflow, not a claim that remote cleanup is complete. Coordinate shared contracts with Anish.
- Build a tool-using agent that reads bounded Markdown evidence, not embeddings, a vector database, RAG/chunk retrieval or a deterministic alias retriever. Do not put all 181 records into the prompt.
- Cite paths, canonical record IDs/exact headings and original URLs. Never invent personal data, citations or live EPFO access; source confidence does not guarantee policy correctness. Ask for clarification or abstain for unknown/ambiguous cases.
- Levels may overlap, but integration depends on agreed contracts. Record checks actually performed, not just code written.

## Anish — backend, AI and integration

**Read first:** [current design](planning/markdown-agent-design.md), [implementation plan](planning/hackathon-plan.md), [source schema](epfo-claim-rejection-rag-dataset/README.md). The [PRD](text/saral-sahayak-prd.md) is historical context.

### Level 1 — API and file-tool foundation

- Define schemas for text, language, extracted fields, canonical reason ID, explanation, fixes, draft, claim-level citations, confidence, warnings and clarification/unsupported/error states.
- Agree generated Markdown headings and the index/record contract with Avyakta, and response interfaces with frontend/document owners.
- Scaffold backend/configuration/LLM boundary; provide schema-valid mocks and a health check.
- Implement read-only `list_files`/`read_file` rooted in `references/knowledge/epfo/`, enforcing path containment, Markdown-only access and the design's host-side budgets. Documents must never be executable instructions.
- Define missing-corpus, unknown/ambiguous rejection and missing-user-data behavior without fabricated extraction values.

**Done when:** the backend starts, contracts/mocks are testable, and file tools independently pass containment and budget checks without reading outside the public knowledge root.

### Level 2 — working grounded text pipeline

- Wire extraction, evidence-guided classification and bounded agent-selected Markdown reads into explanation, fix and draft stages. Do not introduce an alias scoring/retrieval service.
- Select relevant sections from the index and candidate files, preserve caveats and source metadata, and avoid full-corpus prompt stuffing.
- Coordinate independent generation only after evidence selection; draft from supported actions and actual user details/placeholders.
- Validate citations against the file sections and original URLs actually read; integrate UI and document service.
- Test a supported rejection plus unknown, ambiguous, malformed and dependency/tool-failure cases.

**Done when:** a text rejection yields a sourced explanation, actionable checklist and usable draft where supported, while unsupported cases explicitly clarify or abstain.

### Level 3 — reliable integrated demo

- Integrate Hindi, optional image extraction and downloads as ready.
- Harden timeouts, validation, safe configuration, citation verification, prompt-injection resistance and budget exhaustion behavior.
- Document run/deploy steps and verify deployment only when authorized.
- Freeze working contracts and rehearse the demo; defer PM-JAY and voice until EPFO is stable.

**Done when:** the integrated demo runs reproducibly, failures are understandable, and the tested scope is documented.

## Avyakta — research, Markdown knowledge and evidence verification

**Read first:** [current design](planning/markdown-agent-design.md#knowledge-layout-and-conversion-contract), [archived dataset README](epfo-claim-rejection-rag-dataset/README.md), [source records](epfo-claim-rejection-rag-dataset/data/rejections.json), [source catalog](epfo-claim-rejection-rag-dataset/sources.md).

### Level 1 — curate the Markdown knowledge contract

- Validate the 181 canonical record IDs, required fields, related IDs and original source mappings.
- Review the separate generator's one-file-per-record output under `references/knowledge/epfo/reasons/`, its `README.md` index and supporting `sources.md`, `glossary.md`, `claim-types-overview.md`, `resolution-playbooks.md`.
- Agree stable headings and compact navigation with Anish, retaining claim types, aliases, actors, remedies, authority, confidence, verification dates and caveats as readable evidence.
- Prepare representative supported, ambiguous and unknown cases, with expected evidence sections rather than retriever scores.

**Done when:** all 181 Markdown records and index links pass conversion checks and the evidence/navigation contract is usable by the file-reading agent. This does not mean runtime orchestration is complete.

### Level 2 — improve coverage and grounding

- Review paraphrases, similar rejection reasons and claim-type applicability for missing or misleading content.
- Ensure steps, documents, actors, related records and original URLs are traceable without silently dropping caveats.
- Separate official sources from secondary reporting and flag contradictory, stale or unavailable evidence.
- Work with Anish to review agent file-read traces and answers against the cases; improve knowledge content and index clarity, not a deterministic alias or vector retriever.
- Maintain source records/catalog and rebuild Markdown through the generator to avoid drift; do not make untracked corrections only to generated output.

**Done when:** agreed cases produce useful traceable evidence and uncertain cases visibly clarify or abstain rather than forcing a match.

### Level 3 — verification and handoff

- Recheck high-impact policy assertions against authoritative sources where accessible.
- Record source gaps, unsupported cases and refresh/rebuild procedure; preserve provenance and unknown verification status.
- Support regression/demo inputs without hardcoded answers or blanket claims of source verification.

**Done when:** the team can explain where guidance came from, its limits, and how source changes propagate to Markdown.

## Shravya — frontend and user experience

**Read first:** [citation/response design](planning/markdown-agent-design.md#citation-and-response-contract), [frontend/API plan](planning/hackathon-plan.md), historical [PRD](text/saral-sahayak-prd.md) and [presentation](pdfs/setu-inferentia-public.pdf).

### Level 1 — mock-driven core screens

- Agree frontend framework and response contract with Anish.
- Build text input, language selection, processing, results and draft views using synthetic mock data.
- Include claim-level citations showing Markdown path, record ID/heading and original source URLs, uncertainty, disclaimer, loading, empty, clarification/abstention and error states.
- Make layouts responsive and controls keyboard accessible.

**Done when:** the text-input-to-results flow works with schema-aligned mocks without pretending mock data is live output.

### Level 2 — real API integration

- Replace mocks with requests and render explanation, ordered actions, required documents and evidence citations.
- Display genuine status information; do not fabricate live file reads, source verification or agent execution.
- Handle clarification questions, unsupported remarks, tool/budget failures, server errors and bounded user-initiated retries; connect draft download when available.

**Done when:** the UI completes the real EPFO text flow and presents uncertainty/failures clearly, without a false ready-to-use draft for unsupported cases.

### Level 3 — accessibility and demo polish

- Integrate Hindi and optional image input when supported.
- Validate mobile layouts, readable typography, focus states, long citations/content and download feedback.
- Test shared synthetic cases and remove misleading placeholders/demo content.

**Done when:** agreed UI flows work against the actual API on mobile and with keyboard navigation.

## Ajay — OCR, documents, testing and support

**Read first:** [design acceptance cases](planning/markdown-agent-design.md#responsibilities-and-acceptance), [extractor/draft/testing plan](planning/hackathon-plan.md), source [claim types](epfo-claim-rejection-rag-dataset/docs/claim-types-overview.md) and [playbooks](epfo-claim-rejection-rag-dataset/docs/resolution-playbooks.md). Source/archive reads here are for authoring fixtures, not runtime access.

### Level 1 — fixtures and document contract

- Create synthetic inputs for common categories, unknown/ambiguous remarks and missing fields.
- Agree extraction and document-generation interfaces with Anish.
- Prepare templates with explicit placeholders for missing personal information and source references for factual assertions.
- Establish tests for citation paths/headings/URLs, missing knowledge, denied traversal/symlinks, document prompt injection and budget limits, plus reproducible demo cases.

**Done when:** fixtures contain no real personal data, templates do not invent details, and tool/document contracts are testable independently.

### Level 2 — extraction and downloads

- Add optional image/vision extraction with validation and a text-paste fallback.
- Generate downloads from approved structured backend content, preserving citations; coordinate extractor changes with Anish.
- Test malformed/oversized/unreadable input, missing data, document encoding, download behavior and unsupported-case handling.

**Done when:** supported images extract safely, unsupported inputs fail clearly, and generated documents preserve approved content and provenance.

### Level 3 — regression, Hindi and demo support

- Test end-to-end supported, unsupported, ambiguous, conflicting-source, prompt-injection, budget-exhaustion and failure cases.
- Check Hindi readability and document font coverage alongside English.
- Verify downloaded files open correctly and contain no unintended user data.
- Support run/test documentation and demo rehearsal using verified behavior; record limitations.

**Done when:** regression results are recorded, demo assets are privacy-safe, and the team knows what is and is not supported.
