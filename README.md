# Saral Sahayak

An AI-assisted guide to understanding and resolving rejected EPFO claims, with plain-language explanations, actionable checklists, source citations, and draft resubmission or grievance letters.

## Current status

Anish's Level 2 implementation has explicitly resumed. The backend now includes typed API contracts, configurable model protocol adapters, an analysis service reusing bounded Markdown tools and the evidence ledger, and six-language API support. This does not mark Level 2 complete: the production Markdown corpus is still absent; frontend, OCR, document downloads and deployment remain outside this implementation. Knowledge-file generation remains a separate task.

Liveness is not analysis readiness. Readiness requires model configuration and a structurally complete corpus; it does not verify model connectivity, policy correctness or translation quality. Missing model configuration or corpus gates analysis with 503. No live provider requests were made in this round. See the [backend contract and local setup](docs/backend-contract.md).

**Current work priority:** Anish owns the resumed agent/backend and multilingual API work; changes remain local, with no push in this round. Ajay's independent next task remains Chrome/Brave MV3 extension assistance, using the same backend and the [five-level extension guide](references/ajay-extension-guide.md): offline paste popup → synthetic states → click-only selection/preview → explicit Analyze transport → security/accessibility handoff. This is a plan, not an implemented extension. Ajay's OCR/document downloads are deferred, not reassigned; existing tests remain. Shravya owns the web UI and shared presentation consistency. The API accepts `en`, `hi`, `kn`, `ta`, `te`, `ml`, with English still the default; clients discover enabled languages through `GET /api/v1/capabilities`, not a hardcoded list. All language quality flags remain false.

The tool-using agent reads selected Markdown sections under `references/knowledge/epfo/` and bases answers on those sections and their original source URLs. It does not use embeddings, a vector database, a RAG/chunk pipeline or a deterministic alias retriever. It must not load the whole corpus into a prompt.

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

Start with text-based EPFO rejection analysis in the enabled API languages; language quality still needs independent review. Ground explanations and remedies in evidence actually read. The host assembles localized request drafts from validated cited action blocks and literal user details/placeholders, not free model-generated identities. Add optional image extraction and document downloads incrementally. PM-JAY and voice are not part of the first working flow.

## Local setup and collaboration

Run the foundation locally with:

```bash
uv sync --frozen
uv run uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

Copy `.env.example` to `.env` only when configuring your own provider; never commit the key. No live provider calls occur at startup. `SUPPORTED_LANGUAGES` is a JSON array of known, unique codes and must include `en`. `/health/live` reports liveness; `/health/ready` and capabilities report configuration/structural availability only. `/api/v1/analyze` returns 503 for missing model configuration or corpus; configured requests with complete structure reach the actual service. Interactive API documentation is at `/docs`. Offline checks are `uv run pytest` and `uv run ruff check backend tests`; fake-model tests do not verify live compatibility or fluent translations.

`main` is the shared integration baseline. Each task starts on a local temporary descriptive branch from up-to-date `main`; push that branch only when its pull request is ready, merge the reviewed PR into `main`, then delete the task branch locally and remotely. See [CONTRIBUTING.md](CONTRIBUTING.md) for the intended workflow; this is not a claim that remote settings or branch cleanup have been completed.

Shareable PDF copies and searchable text companions are included in `references/`. The public presentation omits the private participant-contact slide. Original PDFs and the duplicate dataset ZIP are preserved locally in ignored `private-reference-originals/`; tool metadata, credentials, uploads and generated user documents are also excluded from Git.
