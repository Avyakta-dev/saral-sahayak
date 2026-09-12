# Start here: team and agent references

This folder is the shared reference library for Saral Sahayak. Give your coding agent your name and ask it to read this file before planning or implementing your work.

## Copy-paste prompt

> I am Anish [replace with your name]. Read AGENTS.md, references/README.md, CONTRIBUTING.md, and my section of references/team-work-levels.md. Then read the linked product plan and relevant source references. Inspect the current code and Git branch. Explain my responsibilities and the first unfinished level, distinguishing implemented code from plans. Only implement work when I ask, and stay within my assigned scope.

Supported team names: **Anish, Avyakta, Shravya, Ajay**. Shravya's spelling has been confirmed and corrected in the guides and plan; her existing `feature/sharvya-ui` branch retains its original misspelling to avoid breaking checkouts. The presentation lists Prathiksha rather than Avyakta; do not infer a new assignment from that older roster. A name in a prompt is not authentication or permission to push.

## Reading order

1. [Team ownership and collaboration](../CONTRIBUTING.md).
2. [Work divided into levels](team-work-levels.md).
3. [Detailed implementation plan](planning/hackathon-plan.md): MVP scope, architecture, schemas, team ownership, integration schedule and demo.
4. [PRD text](text/saral-sahayak-prd.md) or [original-layout PRD PDF](pdfs/saral-sahayak-prd.pdf): product motivation, users and acceptance criteria.
5. [Presentation text](text/setu-inferentia-public.md) or [public presentation PDF](pdfs/setu-inferentia-public.pdf): pitch, accessibility and visual context.
6. [Dataset README](epfo-claim-rejection-rag-dataset/README.md) and [source catalog](epfo-claim-rejection-rag-dataset/sources.md).

## Folder map

```text
references/
├── README.md
├── team-work-levels.md
├── planning/hackathon-plan.md
├── pdfs/
│   ├── saral-sahayak-prd.pdf
│   └── setu-inferentia-public.pdf
├── text/
│   ├── saral-sahayak-prd.md
│   └── setu-inferentia-public.md
└── epfo-claim-rejection-rag-dataset/
    ├── README.md
    ├── sources.md
    ├── data/
    ├── docs/
    └── rag/chunks.jsonl
```

## Which sources to read for each role

- **Anish:** plan architecture/API/orchestration sections, PRD, dataset schema, team integration boundaries.
- **Avyakta:** complete dataset README, records, chunks, source catalog, claim-type overview and resolution playbooks.
- **Shravya:** PRD user flow, plan frontend screens and API examples, presentation visuals. Build against an agreed mock contract before API integration.
- **Ajay:** PRD input/download requirements, plan extraction/draft/testing sections, glossary, claim-type overview and playbooks for synthetic fixtures.

## Resolving conflicting documents

- Treat the detailed hackathon plan as the operational baseline; the PRD's 24-hour schedule and the presentation's broader voice scope are historical product context, not extra mandatory MVP work.
- Use the actual dataset schema and canonical `epfo-rr-NNN` IDs, not illustrative API category strings without a mapping.
- The five worker agents are Extractor, Classifier, Explainer, Fix Generator and Draft Agent. Retrieval is a supporting knowledge layer; the orchestrator coordinates the pipeline.
- Frontend framework and LLM provider are not locked by a working implementation. Inspect current code before choosing or changing them.
- Statistics and policy claims in the supplied documents are source assertions, not independently verified facts. Check authority and currency before using them in user-facing guidance.
- Work levels organize existing responsibilities; they do not imply completion or replace the original plan. Verify code and tests before marking a level complete.

## Privacy and preservation

The public presentation omits original slide 3, which contains private participant phone numbers, email addresses and student identifiers. Other slides retain their original layouts, including inherited rough formatting. Text companions improve agent readability; consult the PDF for visuals and table layout.

Original PDFs and the duplicate dataset ZIP are kept locally under `private-reference-originals/` at repository root and are ignored by Git. They are not distributed to teammates through the public repository. All technical reference content belongs in the public library; personal contact details are unnecessary for implementation.
