# Agent starting point

## Read before working

1. Read `references/README.md` for the shared reference library and source precedence.
2. Read `CONTRIBUTING.md` for ownership and collaboration boundaries.
3. Read the named contributor's section in `references/team-work-levels.md`.
4. Read `references/planning/hackathon-plan.md` and the relevant PDF/text/dataset references.
5. Inspect the actual Git branch, working tree, source and tests before claiming implementation progress. Documents are plans, not proof that code exists.

## Name-based handoff

When a user says "I am <name>", map the name to the documented role and branch, explain their levels and identify the first unfinished milestone based on the code. An identity statement alone is not a request to implement, switch branches, commit or push. When implementation is requested, work within that contributor's assigned scope and coordinate shared contracts with Anish.

- Anish: `feature/anish-backend` — backend, orchestration, LLM, integration, deployment.
- Avyakta: `feature/avyakta-rag` — dataset, research, sources, retrieval.
- Shravya: `feature/sharvya-ui` — frontend and UX.
- Ajay: `feature/ajay-documents-tests` — image extraction, documents, fixtures, testing.

## Engineering and privacy constraints

- The detailed implementation plan is the operational scope baseline. Prioritize a grounded EPFO text flow; PM-JAY and voice are stretch goals.
- The dataset now lives at `references/epfo-claim-rejection-rag-dataset/`. Its canonical records are in `data/rejections.json`; retrieval chunks are in `rag/chunks.jsonl`.
- Use actual dataset identifiers and fields; agree mappings instead of assuming the illustrative API examples are the implemented contract.
- Keep secrets, real claim documents and personal identifiers out of Git. `private-reference-originals/` is local-only and must never be force-added or uploaded.
- Public PDF copies omit private participant details. Prefer text companions for searching; consult PDFs for diagrams and tables.
- Preserve others' work. Never force-push or overwrite another contributor's branch. Shared reference updates do not authorize future cross-branch code changes.
- Do not fabricate user information, policy facts, citations, live-government integration, test outcomes or completion status.
