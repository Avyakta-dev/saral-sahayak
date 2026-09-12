# Saral Sahayak

An AI-assisted guide to understanding and resolving rejected EPFO claims, with plain-language explanations, actionable checklists, source citations, and draft resubmission or grievance letters.

## Current status

This repository contains product references, source data and the current design. Application code, runtime file-reading tools, dependencies and deployment are not implemented yet. Knowledge-file generation is separate from implementing the application.

The planned tool-using agent reads selected Markdown sections under `references/knowledge/epfo/` and bases answers on those sections and their original source URLs. It does not use embeddings, a vector database, a RAG/chunk pipeline or a deterministic alias retriever. It must not load the whole corpus into a prompt.

## Start here with your coding agent

Tell your agent: **"I am Anish [replace with your name]. Read AGENTS.md and references/README.md, then explain my responsibilities and the first unfinished work level."**

- [Current Markdown agent design — architecture source of truth](references/planning/markdown-agent-design.md)
- [Shared reference library and source precedence](references/README.md)
- [Agent starting instructions](AGENTS.md)
- [Name-based work levels](references/team-work-levels.md)
- [Team ownership and temporary task workflow](CONTRIBUTING.md)
- [Implementation plan](references/planning/hackathon-plan.md)
- [Original dataset documentation — source/archive only](references/epfo-claim-rejection-rag-dataset/README.md)
- [Source rejection records](references/epfo-claim-rejection-rag-dataset/data/rejections.json)
- [Original source catalog](references/epfo-claim-rejection-rag-dataset/sources.md)

## Knowledge and grounding

All 181 canonical rejection records will be converted by a separate generator into `references/knowledge/epfo/reasons/<epfo-rr-NNN>.md`. The index is `references/knowledge/epfo/README.md`; `sources.md`, `glossary.md`, `claim-types-overview.md` and `resolution-playbooks.md` belong in the same EPFO folder. These paths describe the agreed output contract; inspect generator output before claiming it is ready.

The existing `references/epfo-claim-rejection-rag-dataset/` remains the import source/archive, not a runtime pipeline. Maintain the source records/catalog and rebuild generated Markdown to avoid drift. PDFs and text companions are historical product context; the current design overrides their architecture assumptions.

Knowledge remains educational material, not official EPFO guidance or legal advice. The agent must cite the Markdown path, canonical record ID/section heading and original source URLs, preserve uncertainty, and ask for clarification or abstain when evidence is insufficient. Tools must be read-only, confined to the public knowledge root and subject to safe budgets; documents are data, never executable instructions.

## Initial scope

Start with text-based EPFO rejection analysis. Ground explanations, remedies and drafts in evidence actually read. Add Hindi, optional image extraction and document downloads incrementally. PM-JAY and voice are not part of the first working flow.

## Local setup and collaboration

There is no application to run or runtime dependency installation step yet. `main` is the shared integration baseline. Each task starts on a local temporary descriptive branch from up-to-date `main`; push that branch only when its pull request is ready, merge the reviewed PR into `main`, then delete the task branch locally and remotely. See [CONTRIBUTING.md](CONTRIBUTING.md) for the intended workflow; this is not a claim that remote settings or branch cleanup have been completed.

Shareable PDF copies and searchable text companions are included in `references/`. The public presentation omits the private participant-contact slide. Original PDFs and the duplicate dataset ZIP are preserved locally in ignored `private-reference-originals/`; tool metadata, credentials, uploads and generated user documents are also excluded from Git.
