# Team work levels

These levels turn the [ownership plan](planning/hackathon-plan.md#7-team-ownership) and [current Markdown agent design](planning/markdown-agent-design.md) into an ordered handoff. They are milestones, not completion claims. The backend analysis service now reuses the foundation's adapters, bounded file tools and evidence ledger. The production corpus is still absent, so analysis remains gated by model configuration and corpus structure. Inspect code, generator output and tests within task permissions before reporting progress.

**Current priority:** Anish's Level 2 implementation has explicitly resumed; no level is automatically complete. This round stays local with no push or live provider requests. Ajay independently follows five smaller extension levels in the [extension guide](ajay-extension-guide.md), starting at Level 1 only and stopping after each requested level. Existing tests stay. The API accepts `en`, `hi`, `kn`, `ta`, `te`, `ml`, defaults to `en`, and exposes enabled languages through capabilities; acceptance is not verified multilingual quality. Anish retains backend/language ownership.

**Additional requirements tracks:** [extension privacy/provider requirements](extension-privacy-and-provider-guide.md) add five advanced **Extension Privacy Levels** for Ajay (`Ajay-B-Acharya`) and three **Extension UI Levels** for Avyakta (`Avyakta-dev`). These do not replace the five original Extension or five Image levels. Avyakta's knowledge role remains priority while its PR is pending; no merged PR or completed level is implied. Shravya (`Shravya2820`) retains main web UI; Anish (`iotserver24`) approves shared contracts. All new levels are requirements, not implemented features.

## Shared rules

- The three broad levels below apply to Anish, Avyakta and Shravya; Ajay independently uses the five smaller extension levels in his section and guide. Resuming Anish's Level 2 does not authorize advancing Ajay's levels or declare either track complete.
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

**Resumed by explicit request:** the analysis service and six-language contract now exist, reusing the file tools and ledger; the production corpus remains absent. This is not a completed milestone. Configuration/structural checks and fake-model tests do not establish semantic correctness, live provider compatibility or fluent output. Ajay must not fill remaining dependencies by changing backend code. Preserve the foundation and tests.

- Wire extraction, evidence-guided classification and bounded agent-selected Markdown reads into explanation, fix and draft stages. Do not introduce an alias scoring/retrieval service.
- Select relevant sections from the index and candidate files, preserve caveats and source metadata, and avoid full-corpus prompt stuffing.
- Generate requested-language guidance only after evidence selection; the host assembles a localized request draft from validated action blocks and literal user details/placeholders, never free model-generated draft identities.
- Resolve model evidence IDs into host ledger citations; cite a remedy section and its same-file source section separately when URLs require another read. Provenance validation is not semantic verification. Integrate UI and, later, document service.
- Test a supported rejection plus unknown, ambiguous, malformed and dependency/tool-failure cases.

**Done when:** a text rejection yields a sourced explanation, actionable checklist and usable draft where supported, while unsupported cases explicitly clarify or abstain.

### Level 3 — reliable integrated demo

- Independently evaluate all enabled languages; integrate optional image extraction and downloads as ready.
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

### Separate extension UI track — Avyakta

Knowledge Levels 1–3 above remain unchanged and priority while their PR is pending. The following UI work needs a separate explicit request; it does not reassign Shravya's main web frontend or Ajay's security/transport logic.

| Track/level | Small deliverable and linked acceptance artifact |
| --- | --- |
| [Extension UI Level 1](extension-privacy-and-provider-guide.md#extension-ui-level-1--privacy-ux-mocks) | Synthetic privacy-flow mocks: mask/crop preview, local-only first/last opt-in, destination disclosure, separate Analyze/Fill and blocked states. |
| [Extension UI Level 2](extension-privacy-and-provider-guide.md#extension-ui-level-2--controls-preview-and-renderer-integration) | Integrate approved controls, sanitized preview, provider options and safe result renderer; record synthetic flow and stale-state checks. |
| [Extension UI Level 3](extension-privacy-and-provider-guide.md#extension-ui-level-3--accessibility-errors-and-completion) | Accessibility/error/completion matrix and extension UI handoff; distinguish analysis, restoration, Fill and manual submission. |

Stop/report after each requested level. Disabled dependencies stay visibly unavailable, not mock success presented as live behavior.

## Shravya — frontend and user experience

**Read first:** [citation/response design](planning/markdown-agent-design.md#citation-and-response-contract), [frontend/API plan](planning/hackathon-plan.md), historical [PRD](text/saral-sahayak-prd.md) and [presentation](pdfs/setu-inferentia-public.pdf). Shravya retains web UI ownership and coordinates shared labels, response states, citations and accessibility with Ajay's [extension work](ajay-extension-guide.md); this does not transfer the web UI to him.

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

- Discover enabled languages through capabilities, review their presentation/quality independently, and integrate optional image input when supported.
- Validate mobile layouts, readable typography, focus states, long citations/content and download feedback.
- Test shared synthetic cases and remove misleading placeholders/demo content.

**Done when:** agreed UI flows work against the actual API on mobile and with keyboard navigation.

## Ajay — browser extension, testing and handoff

**Read first:** [extension guide and copy-paste agent prompt](ajay-extension-guide.md), [backend contract](../docs/backend-contract.md), [design acceptance cases](planning/markdown-agent-design.md#responsibilities-and-acceptance). The guide contains the exact files to read, small deliverables, acceptance checks and structured status format for each level.

Build a Chrome/Brave MV3 popup using the same backend; a service worker is optional, not a starting requirement. “One-click assistance” is user-initiated entry/capture, never automatic submission. Preview/edit comes before a separate explicit Analyze action. Shravya owns web UI/shared consistency; Anish owns agent/backend and multilingual APIs. Ajay's OCR/image work and document downloads remain deferred, not reassigned.

| Level | Small deliverable | Acceptance and stop/report checkpoint |
| --- | --- | --- |
| 1 | Minimal paste popup | Opens unpacked; paste/edit/clear work; no permissions, network or backend changes. Report checks and stop. |
| 2 | Four labelled synthetic fixture states | Render success, clarification, unsupported and error as safe text, never `innerHTML`; clear prior results. Report all states and stop. |
| 3 | User-click selection capture | Use `activeTab`/`scripting` only if needed, preview/edit, no transmission on capture; paste fallback on restricted pages. Report permissions/fallback checks and stop. |
| 4 | Real backend transport | Minimal backend `host_permissions`; requests from extension context, not content scripts; explicit demo/live modes and genuine current 503, no silent fallback or extension-origin CORS workaround. Report transport and remaining agent dependency; stop. |
| 5 | Security/accessibility/browser regression and handoff | Check Chrome/Brave, limits, aborts, stale async completions, safe sources and transient storage. Record pass/fail/not-run; ZIP only if asked, no store publishing. Stop. |

Levels 1–3 need no live agent. Level 4's successful production analysis still depends on the absent corpus and authorized model/grounding evaluation; resumed agent implementation and honest 503 transport tests are not end-to-end success. Read capabilities and offer only enabled languages rather than hardcoding the six accepted codes; none has verified quality. Keep existing backend tests, no keys or broad data collection, and follow the guide's 8,000-character/32,768-byte UTF-8 body limits. Start **Level 1 only**, then wait for an explicit request before each next level.

### Separate advanced extension privacy track — Ajay

The [main privacy/provider guide](extension-privacy-and-provider-guide.md) supplies detailed requirements and acceptance artifacts. Ajay owns security implementation; Avyakta owns extension UI; Anish approves shared contracts. No feature or check below is claimed implemented.

| Track/level | Small deliverable and linked acceptance artifact |
| --- | --- |
| [Extension Privacy Level 1](extension-privacy-and-provider-guide.md#extension-privacy-level-1--threat-contract) | Threat/data-flow contract: prohibited secrets, vault bindings/TTL, masking, consent and mode boundaries; planning only. |
| [Extension Privacy Level 2](extension-privacy-and-provider-guide.md#extension-privacy-level-2--client-vault-and-redacted-capture) | Isolated client vault and sanitized pixel capture with crop/block fail-closed behavior; synthetic lifecycle/preview evidence. |
| [Extension Privacy Level 3](extension-privacy-and-provider-guide.md#extension-privacy-level-3--placeholder-filling-and-local-restoration) | Opaque token filling, validated one-pass local restoration and separately approved exact-field Fill; adversarial token/output checks. |
| [Extension Privacy Level 4](extension-privacy-and-provider-guide.md#extension-privacy-level-4--provider-settings-and-modes) | Trusted API-base/model/key settings and backend/direct/optional companion modes; secret/permission/grounding matrix. |
| [Extension Privacy Level 5](extension-privacy-and-provider-guide.md#extension-privacy-level-5--cross-mode-security-acceptance) | Cross-mode/browser security acceptance and handoff, limitations and blockers; no automatic submission or privacy guarantees. |

Use request-bound placeholders, filled flags and safe labels only at the AI boundary; no sensitive values, partial characters or length hints. Preview stars/optional non-sensitive first-last masks stay local. No original screenshot/base64 transmission; future redacted-image upload requires the separately approved image path. Identical redaction applies to remote and local models. Stop/report after each explicitly requested level; issue creation is the coordinator's separate task.

### Separate image/OCR track

**Separate image/OCR handoff:** Ajay leads image implementation and tests; Anish approves shared backend/API/protocol/security changes. The [secure image guide](ajay-image-input-guide.md) defines five separate Image Levels, starting with planning/contracts only. It does not implement or automatically advance image or extension work.
