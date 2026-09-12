# Team work levels

These levels turn the existing [ownership plan](planning/hackathon-plan.md#7-team-ownership) into an ordered handoff. They are implementation milestones, not completion claims. Each agent must inspect the current branch, code and tests before reporting progress. The repository initially contains references only.

## Shared rules

- **Level 1:** agree interfaces and build a minimal independently testable component.
- **Level 2:** integrate a working end-to-end EPFO text path.
- **Level 3:** harden accessibility, error handling and the demo; attempt stretch features only after core acceptance.
- Keep responsibilities on the assigned branch; coordinate shared API/schema changes with Anish.
- Never invent personal data, fabricate citations, or claim live EPFO access. Do not treat source confidence as guaranteed policy correctness.
- Levels may overlap between contributors, but integration depends on agreed contracts. Record real checks performed, not just that code was written.

## Anish — backend, AI and integration

**Branch:** `feature/anish-backend`

**Read first:** [implementation plan](planning/hackathon-plan.md), [PRD](text/saral-sahayak-prd.md), [dataset schema](epfo-claim-rejection-rag-dataset/README.md).

### Level 1 — API and integration foundation

- Define request/response schemas for text, language, extracted fields, matched reason, explanation, fixes, draft, citations, confidence and warnings.
- Align identifiers with the actual dataset and agree interfaces with retrieval, frontend and document owners.
- Scaffold the backend, configuration and LLM boundary; provide mock responses and a runnable health check.
- Define unknown/ambiguous rejection behavior and avoid fabricated extraction values.

**Done when:** the backend starts, its API contract is documented, a schema-valid mock response is testable, and teammates can work against it.

### Level 2 — working grounded text pipeline

- Wire extraction, classification and Avyakta's retrieval into scoped explanation, fix and draft stages.
- Coordinate independent generation steps after evidence retrieval.
- Preserve citations and uncertainty; integrate the frontend and draft service with the agreed response model.
- Test a supported rejection plus unknown, malformed and dependency-failure cases.

**Done when:** a text rejection produces a real sourced explanation, actionable checklist and usable draft without inventing facts.

### Level 3 — reliable integrated demo

- Integrate Hindi, optional image extraction and document downloads as they become ready.
- Add timeouts, input validation, safe configuration, useful error responses and integration regression tests.
- Document run/deploy steps and verify the actual deployment only when authorized.
- Freeze working contracts and rehearse the demo; defer PM-JAY and voice until EPFO is stable.

**Done when:** the integrated demo runs reproducibly, failures are understandable, and the final tested scope is documented.

## Avyakta — research, knowledge base and retrieval

**Branch:** `feature/avyakta-rag`

**Read first:** [dataset README](epfo-claim-rejection-rag-dataset/README.md), [records](epfo-claim-rejection-rag-dataset/data/rejections.json), [chunks](epfo-claim-rejection-rag-dataset/rag/chunks.jsonl), [source catalog](epfo-claim-rejection-rag-dataset/sources.md).

### Level 1 — validate and expose the knowledge base

- Validate record IDs, required fields, related IDs and source mappings.
- Agree retrieval inputs/results with Anish, keeping category, claim type, source authority and confidence available.
- Implement normalized exact-alias and lexical matching before adding embeddings.
- Prepare representative queries and unknown/ambiguous examples.

**Done when:** deterministic tests retrieve the expected records, unknown input is not forced to a confident match, and the backend can consume the agreed result.

### Level 2 — improve coverage and grounding

- Test paraphrases, similar rejection reasons and claim-type filters.
- Return relevant steps, documents, actors and source evidence without silently dropping caveats.
- Separate official sources from secondary reporting and flag contradictory or stale policy information.
- Integrate with the backend and measure results against the query set; add embeddings only if justified.

**Done when:** agreed test cases produce useful, traceable evidence and uncertain cases are explicitly handled.

### Level 3 — verification and handoff

- Recheck high-impact policy assertions against authoritative sources where accessible.
- Document source gaps, unsupported cases and refresh procedure; preserve provenance.
- Support final regression and demo inputs without hardcoding demo answers.

**Done when:** the team can explain where guidance came from, its limits, and how to update the dataset.

## Shravya — frontend and user experience

**Branch:** `feature/sharvya-ui`

**Name note:** Shravya is the confirmed spelling. The existing branch keeps the legacy `sharvya` spelling so teammates' checkouts continue to work. Prathiksha has no separate assignment in the implementation plan.

**Read first:** [PRD](text/saral-sahayak-prd.md), [frontend/API plan](planning/hackathon-plan.md), [presentation](pdfs/setu-inferentia-public.pdf).

### Level 1 — mock-driven core screens

- Agree the frontend framework and response contract with Anish.
- Build text input, language selection, processing, results and draft views using realistic synthetic mock data.
- Include citations, uncertainty, disclaimer, loading, empty and error states from the beginning.
- Make layouts responsive and controls keyboard accessible.

**Done when:** the full text-input-to-results flow works with schema-aligned mocks without pretending mock data is live output.

### Level 2 — real API integration

- Replace mocks with backend requests and render explanation, ordered actions, required documents and sources.
- Display genuine stage/status information when provided; do not fabricate live agent execution.
- Handle unknown categories, server errors and retries; connect draft download when available.

**Done when:** the UI completes the real EPFO text flow and presents failure/uncertainty states clearly.

### Level 3 — accessibility and demo polish

- Integrate Hindi and optional image input when supported by the backend.
- Validate mobile layouts, readable typography, focus states, long content and download feedback.
- Test with the shared synthetic cases and remove misleading placeholder/demo content.

**Done when:** the agreed UI flows are tested on the actual API and remain usable on mobile and with keyboard navigation.

## Ajay — OCR, documents, testing and support

**Branch:** `feature/ajay-documents-tests`

**Read first:** [extractor/draft/testing plan](planning/hackathon-plan.md), [PRD](text/saral-sahayak-prd.md), [claim types](epfo-claim-rejection-rag-dataset/docs/claim-types-overview.md), [resolution playbooks](epfo-claim-rejection-rag-dataset/docs/resolution-playbooks.md).

### Level 1 — fixtures and document contract

- Create synthetic rejection inputs for common categories, unknown input and missing/ambiguous fields.
- Agree extraction and document-generation interfaces with Anish.
- Prepare draft templates with explicit placeholders for missing personal information.
- Establish baseline tests and a reproducible demo input set.

**Done when:** fixtures contain no real personal data, templates do not invent missing details, and the interfaces are testable independently.

### Level 2 — extraction and downloads

- Add optional image/vision extraction with validation and a text-paste fallback.
- Generate downloadable drafts from structured backend content; coordinate shared extractor changes with Anish.
- Test malformed/oversized/unreadable inputs, missing personal data, document encoding and download behavior.

**Done when:** supported images extract safely, unsupported inputs fail clearly, and generated documents preserve the approved content.

### Level 3 — regression, Hindi and demo support

- Test end-to-end supported, unsupported and failure cases against the integrated system.
- Check Hindi readability and document font coverage, alongside English output.
- Verify downloadable files open correctly and contain no unintended user data.
- Support slides/demo rehearsal using verified behavior and document any remaining limitations.

**Done when:** regression results are recorded, demo assets are privacy-safe, and the team knows what is and is not supported.
