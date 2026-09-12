# Team work division

Ownership follows the [current Markdown agent design](references/planning/markdown-agent-design.md) and [hackathon implementation plan](references/planning/hackathon-plan.md#7-team-ownership).

| Owner | Responsibilities |
| --- | --- |
| Anish | Architecture, backend API and schemas, read-only Markdown file tools, safe tool budgets, agent orchestration, LLM integration, citation validation, configuration, final integration and deployment |
| Avyakta | EPFO research, Markdown knowledge authoring/curation, aliases as reference content, remedies, index clarity, source authority/currency and evidence verification |
| Shravya | Frontend, paste/upload input, language toggle, processing/results/draft screens, source citations, clarification/abstention/error states and download UI |
| Ajay | OCR/image handling, document templates and generation, fixtures, regression/security tests, Hindi checks, run/demo documentation and support |

## Branch workflow

`main` is the shared integration baseline. Ownership is name-to-role only, not a branch assignment. Every task uses its own local temporary descriptive branch created from up-to-date `main`.

For a new task, first check for unfinished work and preserve it. With a clean working tree and an available remote, for example:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c task/markdown-file-tools
```

Keep focused commits local while the task is in progress. Push the task branch **only when its pull request is ready**:

```bash
git push -u origin task/markdown-file-tools
```

Open a PR with base `main`, explicitly selecting that base rather than relying on a remote default. A PR requires a pushed source branch; it is not branchless. Review shared API/schema changes with Anish and update the task with the latest `main` before merging when necessary. Merge the reviewed PR into `main`, then delete its remote and local task branches. After refreshing local `main`, use normal branch deletion; if Git refuses after a squash merge, verify the PR and preserve any remaining work rather than blindly forcing deletion. Start the next task from freshly updated `main`, not from the previous task branch.

Do not directly push task changes to `main`, force-push over others' work or overwrite another contributor's changes. Once application code exists, each merge must keep it runnable; until then, validate the relevant documentation and knowledge artifacts.

This is the intended collaboration workflow, not a claim about completed branch deletion, the current remote default, collaborator permissions, branch protection or required reviewers. Those settings require separate authorization and verification.

## Planned file ownership

These paths describe the intended implementation; inspect the repository before claiming that a component exists.

- **Anish:** `backend/main.py`, `backend/api/`, `backend/orchestrator/`, most of `backend/agents/`, proposed `backend/tools/knowledge_files.py`, `backend/services/llm.py`, `backend/config.py`, environment examples and deployment configuration.
- **Avyakta:** knowledge content and evidence review for `references/knowledge/epfo/`; source record/catalog curation in `references/epfo-claim-rejection-rag-dataset/`, coordinated with the separate Markdown generator to avoid drift. This is not retriever ownership.
- **Shravya:** future `frontend/`.
- **Ajay:** future `documents/`, application `tests/`, synthetic demo fixtures, `backend/services/documents.py`, and image extraction coordinated with Anish on `backend/agents/extractor.py`; supporting test/run documentation.

All 181 source reasons retain their canonical `epfo-rr-NNN` IDs in `references/knowledge/epfo/reasons/<epfo-rr-NNN>.md`, with index `references/knowledge/epfo/README.md` and supporting `sources.md`, `glossary.md`, `claim-types-overview.md` and `resolution-playbooks.md`. Maintain source data/catalog and regenerate Markdown rather than making untracked edits to generated content. The archived dataset, including its historical chunks, is not runtime input.

## Agent reference handoff

Ask your coding agent to read [AGENTS.md](AGENTS.md), [references/README.md](references/README.md), the [current design](references/planning/markdown-agent-design.md) and your named section in [team work levels](references/team-work-levels.md). PDFs/text are historical context. Work levels are an ordered checklist, not evidence of completed implementation.

## First deliverables

- **Anish:** agree API and citation schemas, implement bounded public Markdown list/read tools, and connect one supported text-analysis flow with honest clarification/abstention behavior.
- **Avyakta:** review the 181-record Markdown conversion, navigation, source mappings and caveats; prepare evidence-backed supported, ambiguous and unknown cases.
- **Shravya:** build the input and result flow using agreed synthetic mock responses before connecting the API; include path/section and original-URL citations.
- **Ajay:** provide synthetic rejection fixtures and baseline tests, including tool containment, prompt injection and budget exhaustion; add extraction and document generation after the text flow is stable.

## Privacy and grounding

Never commit secrets, real claim documents, Aadhaar/PAN/bank details, or generated user documents. Use synthetic or properly redacted fixtures. Original PDFs stay in ignored `private-reference-originals/`; shareable copies in `references/pdfs/` omit private participant details.

Runtime tools may only list/read Markdown within the configured public knowledge root. They must not read private originals, execute document instructions, fetch links automatically or stuff the entire corpus into prompts. Cite evidence actually read using path, record ID/heading and original source URLs. Do not fabricate personal information in drafts, conflate source confidence with correctness, or present secondary sources as official policy. Ask for clarification or abstain when evidence does not support a recommendation.
