# Team work division

Ownership follows the [hackathon implementation plan](Saral_Sahayak_Hackathon_Plan.md#7-team-ownership). Names and branch spellings are preserved from that plan; the presentation has a different roster and must not be used to silently change assignments.

| Owner | Branch | Responsibilities |
| --- | --- | --- |
| Anish | `feature/anish-backend` | Architecture, backend API and schemas, orchestration, LLM integration, RAG integration, configuration, final integration and deployment |
| Avyakta | `feature/avyakta-rag` | EPFO research, curated dataset, aliases, remedies, source verification, knowledge loading and retrieval |
| Sharvya | `feature/sharvya-ui` | Frontend, paste/upload input, language toggle, processing/results/draft screens, download UI and error states |
| Ajay | `feature/ajay-documents-tests` | OCR/image handling, document templates and generation, fixtures, regression tests, Hindi checks and demo support |

## Branch workflow

`main` is the shared integration baseline. All four feature branches initially contain the same project plan and dataset; branches identify ownership, not completed implementations.

After the repository is pushed and cloned, each contributor should use their assigned branch. For example, Anish:

```bash
git fetch origin
git switch feature/anish-backend
```

Commit focused changes on your feature branch and open a pull request into `main`. Review shared API changes with Anish before changing contracts consumed by the frontend or supporting services. Integrate changes through reviewed pull requests rather than directly pushing to another contributor's branch.

## Planned file ownership

These paths describe the intended implementation; most do not exist yet.

- **Anish:** `backend/main.py`, `backend/api/`, `backend/orchestrator/`, most of `backend/agents/`, `backend/services/llm.py`, `backend/config.py`, environment examples and deployment configuration.
- **Avyakta:** `epfo-claim-rejection-rag-dataset/` and future `backend/rag/`.
- **Sharvya:** future `frontend/`.
- **Ajay:** future `documents/`, `tests/`, demo fixtures, `backend/services/documents.py`, and image extraction work coordinated with Anish on `backend/agents/extractor.py`.

Keep the supplied dataset in its current location until a migration is agreed. Use its canonical `epfo-rr-NNN` identifiers or define an explicit mapping; do not silently substitute the illustrative identifiers in the plan.

## First deliverables

- **Anish:** agree the API schema and connect one complete text-analysis pipeline.
- **Avyakta:** expose deterministic alias/keyword retrieval over the curated records with sources and confidence.
- **Sharvya:** build the input and result flow using agreed mock responses before connecting the API.
- **Ajay:** provide synthetic rejection fixtures and baseline tests; add extraction and document generation once the text flow is stable.

## Privacy and grounding

Never commit secrets, real claim documents, Aadhaar/PAN/bank details, or generated user documents. Use synthetic or properly redacted fixtures. Original PDFs are excluded pending privacy review. Do not fabricate personal information in drafts, and distinguish official sources from secondary sources.

This file documents the team workflow only. It does not configure GitHub collaborators, branch protection, or mandatory reviewers; those require a selected remote repository and confirmed GitHub usernames.
