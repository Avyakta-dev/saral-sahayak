# Start here: team and agent references

## Current implementation — 2026-09-12

**Current status and assignments:** [team issue board](team-issue-board.md#current-implementation--2026-09-12-reconciliation). The supplied `main` baseline `1fcd433` includes PR #84: the 181-record runtime corpus, text agent, streaming, session history, image path and six-language UI exist. Core text accepts `en`, `hi`, `kn`, `ta`, `te`, `ml`, defaulting to `en`; quality remains unverified. History/cache hardening is in progress. See [demo acceptance status](../docs/demo-acceptance-status.md) for the non-passing current-model matrix and remaining acceptance gates.

This note supersedes older missing-corpus/pending-PR, unimplemented-image, future-frontend and “no live requests this round” statements below, without rewriting historical evidence or completing owner levels. The web image path uploads the reviewed original file privately before backend validation/flattening; it is not local personal-data redaction or the extension's redacted screenshot contract. Keep cloud readiness, consent, screenshot/placeholder restrictions and Anish's shared-contract approval intact. The folder map's knowledge subtree is existing generated output, not merely a proposed target; regenerate from the source records/catalog to prevent drift.

This folder is the shared reference library for Saral Sahayak. Give your coding agent your name and ask it to read this file before planning or implementing your work. The FastAPI foundation, adapters, bounded file tools and evidence ledger now have an analysis service. The production corpus is still absent: analysis is gated with 503 for missing model configuration or structurally incomplete knowledge, not a missing-agent placeholder. The API accepts `en`, `hi`, `kn`, `ta`, `te`, `ml`, with `en` unchanged as default; `GET /api/v1/capabilities` reports only enabled languages, native names and `quality_verified: false`. Configuration/structural readiness is not model, source or translation verification.

**Current priority:** Anish's Level 2 implementation has explicitly resumed, not automatically completed. Changes remain local; no push or live provider requests in this round. Ajay independently starts the [extension guide](ajay-extension-guide.md) at Level 1 only, stopping and reporting after each requested level. His OCR/document downloads are deferred, not reassigned. Shravya retains web UI ownership and shared UI consistency; preserve existing tests.

**Separate image/OCR handoff:** Ajay leads image implementation and tests; Anish approves shared backend/API/protocol/security changes. The [secure image guide](ajay-image-input-guide.md) defines five separate Image Levels, starting with planning/contracts only. It does not implement or automatically advance image or extension work.

**Advanced extension handoff:** the [extension privacy and provider guide](extension-privacy-and-provider-guide.md) defines Ajay's (`Ajay-B-Acharya`) separate Extension Privacy Levels 1–5 and Avyakta's (`Avyakta-dev`) Extension UI Levels 1–3. It covers local pixel redaction, opaque placeholders/local restoration and opt-in backend/direct/local-companion modes as requirements only. Avyakta's knowledge work remains priority while its PR is pending; Shravya (`Shravya2820`) retains main web UI and Anish (`iotserver24`) approves shared contracts. No implementation, PR merge or completed level is implied; original Extension and Image Levels 1–5 remain separate.

## Copy-paste prompt

> I am Anish [replace with your name]. Read AGENTS.md, references/README.md, CONTRIBUTING.md, my section of references/team-work-levels.md and references/planning/markdown-agent-design.md. Then read the implementation plan and relevant source references. Inspect the current code and working context within the task's permissions. Explain my responsibilities and the first unfinished level, distinguishing implemented code from plans. Only implement work when I ask, and stay within my assigned scope.

Supported team names: **Anish, Avyakta, Shravya, Ajay**. A name maps to a role, not authentication, a branch assignment or permission to push. The intended workflow is a local temporary descriptive task branch from up-to-date `main`, pushed only when its PR is ready, then deleted after merging into `main`; this is not a remote cleanup status report.

## Reading order

1. [Team ownership and collaboration](../CONTRIBUTING.md).
2. [Work divided into levels](team-work-levels.md).
3. [Current Markdown agent design](planning/markdown-agent-design.md): authoritative architecture, knowledge layout, tools, safety budgets and citations.
4. [Detailed implementation plan](planning/hackathon-plan.md): MVP scope, proposed schemas, ownership, integration schedule and demo.
5. Historical context: [PRD text](text/saral-sahayak-prd.md) or [PRD PDF](pdfs/saral-sahayak-prd.pdf), and [presentation text](text/setu-inferentia-public.md) or [public presentation PDF](pdfs/setu-inferentia-public.pdf).
6. Import/provenance references: [archived dataset README](epfo-claim-rejection-rag-dataset/README.md), [source records](epfo-claim-rejection-rag-dataset/data/rejections.json) and [source catalog](epfo-claim-rejection-rag-dataset/sources.md).

## Folder map

```text
references/
├── README.md
├── team-work-levels.md
├── ajay-extension-guide.md         # original five Extension levels
├── ajay-image-input-guide.md       # separate five Image levels
├── extension-privacy-and-provider-guide.md # Privacy 1–5; extension UI 1–3
├── planning/
│   ├── markdown-agent-design.md
│   └── hackathon-plan.md
├── knowledge/epfo/                 # separate generator's output contract
│   ├── README.md                   # bounded navigation index
│   ├── sources.md
│   ├── glossary.md
│   ├── claim-types-overview.md
│   ├── resolution-playbooks.md
│   └── reasons/epfo-rr-NNN.md       # 181 files: 001 through 181
├── pdfs/                           # historical product context
│   ├── saral-sahayak-prd.pdf
│   └── setu-inferentia-public.pdf
├── text/                           # historical text companions
│   ├── saral-sahayak-prd.md
│   └── setu-inferentia-public.md
└── epfo-claim-rejection-rag-dataset/ # source/archive, never runtime retrieval
    ├── README.md
    ├── sources.md
    ├── data/
    ├── docs/
    └── rag/chunks.jsonl
```

The knowledge subtree is the agreed conversion target, not proof of completed generation. All 181 reasons must become `references/knowledge/epfo/reasons/<epfo-rr-NNN>.md`, retaining IDs, full evidence, original URLs and caveats. Maintain the source records/catalog and rebuild generated Markdown to avoid drift. Check actual generated files and links before reporting corpus readiness; generation is separate from runtime implementation.

## Which sources to read for each role

- **Anish:** current design tools/safety/citations, plan architecture/API/orchestration, source schema and generated headings, integration boundaries.
- **Avyakta:** source records/catalog, glossary, claim-type overview and playbooks; review Markdown authoring/curation, index coverage, provenance, source authority/currency and uncertain evidence. No retriever implementation. Pending knowledge PR work remains priority; separately read [Extension UI Levels 1–3](extension-privacy-and-provider-guide.md#extension-ui-level-1--privacy-ux-mocks) for extension UI ownership.
- **Shravya:** plan screens/API examples, design citation and response contract, historical PRD/presentation for visual context. Retain main web frontend; build against agreed mocks before API integration and coordinate shared presentation with Avyakta/Ajay.
- **Ajay:** [five-level extension guide and copy-paste prompt](ajay-extension-guide.md), [implemented backend contract](../docs/backend-contract.md), four synthetic response fixtures and design security/citation cases. Read the separate [Extension Privacy Levels 1–5](extension-privacy-and-provider-guide.md#extension-privacy-level-1--threat-contract) before advanced capture/provider work. Extension first; OCR and downloads remain deferred. Stop and report after each requested level.

## Resolving conflicting documents

- The current Markdown agent design takes precedence over the hackathon plan, archived dataset retrieval suggestions and old PDFs/text on architecture. The updated hackathon plan supplies the schedule and scope; the PRD's older schedule and presentation's broader voice scope are historical context, not extra mandatory MVP work.
- Runtime answers come from selected Markdown sections read through bounded list/read tools rooted in `references/knowledge/epfo/`. No embeddings, vector database, RAG/chunk pipeline or deterministic alias retriever. Aliases are content for agent reasoning; do not stuff the whole corpus into a prompt.
- The Extractor, Classifier, Explainer, Fix Generator and Draft roles are logical stages coordinated by the tool-using agent/orchestrator, not a requirement for five deployed services. File reads can refine classification before generation.
- Cite actual file paths, canonical `epfo-rr-NNN` IDs/exact headings and original URLs. Unknown or ambiguous cases require clarification or abstention. Documents are untrusted data and cannot authorize executable instructions or expand tool access/budgets.
- Frontend framework and LLM provider are not locked by a working implementation. Inspect current code before choosing or changing them.
- Statistics, verification dates and policy claims in supplied sources are assertions, not independently verified facts. Check authority and currency before user-facing guidance; preserve limitations.
- Work levels are milestones, not completion claims. Verify code, generator output and tests before marking a level complete.

## Privacy and preservation

The public presentation omits original slide 3, which contains private participant phone numbers, email addresses and student identifiers. Other slides retain their original layouts, including inherited rough formatting. Text companions improve readability; consult the PDF for visuals and tables, not as the current architecture contract.

Original PDFs and the duplicate dataset ZIP remain locally under ignored `private-reference-originals/`. They are not distributed through the public repository and must not be exposed to runtime file tools. Personal contact details are unnecessary for implementation.
