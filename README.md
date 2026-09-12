# Saral Sahayak

An AI-assisted guide to understanding and resolving rejected EPFO claims, with plain-language explanations, actionable checklists, source citations, and draft resubmission or grievance letters.

## Current status

This repository contains the product plan and curated EPFO knowledge base. Application code, runtime dependencies, tests, and deployment are not implemented yet.

- [Implementation plan](Saral_Sahayak_Hackathon_Plan.md)
- [Team ownership and branches](CONTRIBUTING.md)
- [EPFO dataset documentation](epfo-claim-rejection-rag-dataset/README.md)
- [Rejection records](epfo-claim-rejection-rag-dataset/data/rejections.json)
- [Retrieval-ready chunks](epfo-claim-rejection-rag-dataset/rag/chunks.jsonl)
- [Source catalog](epfo-claim-rejection-rag-dataset/sources.md)

The dataset contains 181 rejection records and 181 retrieval-ready chunks. It is educational material, not official EPFO guidance or legal advice. Source authority and currency must be checked before presenting a recommendation as authoritative.

## Initial scope

Start with text-based EPFO rejection analysis. Ground generated explanations, remedies, and drafts in the existing dataset. Add Hindi, image extraction, and document downloads incrementally. PM-JAY and voice features are not part of the first working flow.

## Local setup

There is no application to run or dependency installation step yet. After cloning, switch to your assigned feature branch as documented in CONTRIBUTING.md.

The original PDFs, duplicate dataset ZIP, local tool metadata, credentials, uploads, and generated documents are excluded from version control. The PDFs remain local pending privacy review; the presentation contains personal contact information.
