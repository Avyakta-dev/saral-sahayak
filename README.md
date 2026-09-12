# Saral Sahayak

An AI-assisted guide to understanding and resolving rejected EPFO claims, with plain-language explanations, actionable checklists, source citations, and draft resubmission or grievance letters.

## Current status

This repository contains the product plan and curated EPFO knowledge base. Application code, runtime dependencies, tests, and deployment are not implemented yet.

## Start here with your coding agent

Tell your agent: **"I am Anish [replace with your name]. Read AGENTS.md and references/README.md, then explain my responsibilities and the first unfinished work level."**

- [Shared reference library: PDFs, text, plan and dataset](references/README.md)
- [Agent starting instructions](AGENTS.md)
- [Name-based work levels](references/team-work-levels.md)
- [Team ownership and branches](CONTRIBUTING.md)
- [Implementation plan](references/planning/hackathon-plan.md)
- [EPFO dataset documentation](references/epfo-claim-rejection-rag-dataset/README.md)
- [Rejection records](references/epfo-claim-rejection-rag-dataset/data/rejections.json)
- [Retrieval-ready chunks](references/epfo-claim-rejection-rag-dataset/rag/chunks.jsonl)
- [Source catalog](references/epfo-claim-rejection-rag-dataset/sources.md)

The dataset contains 181 rejection records and 181 retrieval-ready chunks. It is educational material, not official EPFO guidance or legal advice. Source authority and currency must be checked before presenting a recommendation as authoritative.

## Initial scope

Start with text-based EPFO rejection analysis. Ground generated explanations, remedies, and drafts in the existing dataset. Add Hindi, image extraction, and document downloads incrementally. PM-JAY and voice features are not part of the first working flow.

## Local setup

There is no application to run or dependency installation step yet. After cloning, switch to your assigned feature branch as documented in CONTRIBUTING.md.

Shareable PDF copies and searchable text companions are included in `references/`. The public presentation omits the private participant-contact slide. Original PDFs and the duplicate dataset ZIP are preserved locally in ignored `private-reference-originals/`; tool metadata, credentials, uploads and generated user documents are also excluded from Git.
