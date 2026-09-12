# Handoff: lifecycle tracking, history and exact-match caching

Paste this whole file to your coding agent (Claude Code or similar) as the first message
in a new session, along with: **"I am Anish. Read AGENTS.md and references/README.md,
then read this handoff file and continue from where it leaves off."**

## What this project is

Saral Sahayak: an AI-assisted guide for resolving rejected EPFO (Employees' Provident
Fund) claims. A tool-using backend agent reads bounded Markdown sections from
`references/knowledge/epfo/` (186 files covering 181 canonical rejection reasons plus
index/glossary/playbooks) and answers grounded in only what it actually reads — no
embeddings, no vector DB, no fuzzy/alias retrieval, ever. See `AGENTS.md` and
`references/planning/markdown-agent-design.md` for the full architecture rules; they
are load-bearing constraints, not suggestions, and several tests exist specifically to
enforce them (containment, no full-corpus stuffing, citation provenance, etc).

My role (Anish): backend, AI/agent orchestration, LLM wiring, citation validation,
integration and deployment. See `references/team-work-levels.md` for the full level
breakdown across the team (Avyakta = knowledge authoring, Shravya = frontend, Ajay =
OCR/documents/testing).

## State of the backend before this session

A mature FastAPI backend already existed under `backend/`:

- `main.py` — `/api/v1/analyze` (sync), `/api/v1/analyze/stream` (SSE activity events),
  `/api/v1/images/uploads`, `/health/live`, `/health/ready`, `/api/v1/capabilities`.
  Body-size limiting, an optional protected/rate-limited access mode
  (`backend/access.py`), CORS, budget-bounded analysis.
- `agent/` — `service.py` (the actual tool-using loop: list_files/read_file, evidence
  ledger, citation validation, repair-on-invalid-output), `presentation.py` (builds the
  user-facing draft from cited actions + user-supplied details), `activity.py`
  (streamed progress events), `diagnostics.py`, `models.py`.
- `llm/` — multi-provider adapter layer (`responses`, `chat_completions`, `messages`
  API styles), streaming support.
- `tools/knowledge_files.py` — the read-only, containment-enforced Markdown
  list_files/read_file tool the agent actually calls.
- `images/pipeline.py` — optional private image upload + OCR extraction, sharing the
  same request budget as text analysis.
- `languages.py` — multi-language output (en, hi, kn, ta, te, ml).
- `output_validation.py`, `evidence.py`, `knowledge_readiness.py` — safety/provenance
  checks and corpus-readiness gating.
- 27 test files under `tests/backend/` and `tests/` covering containment, budget
  exhaustion, streaming, protected-access rate limiting, image pipeline, LLM adapters,
  and acceptance against the real 186-file knowledge corpus.

This roughly covers Level 1 + Level 2 + a good chunk of Level 3 of my track.

## The new idea (from judge feedback, handwritten note)

Paraphrased: every user question should go through a visible lifecycle —
**start → process → completed**. On completion, the case should feed back into a
growing dataset used as "memory" so the system gets more accurate and faster over
time, and a repeat of the same issue should be served from that memory (with caching)
instead of doing the full run again ("saving money", "no running [twice]").

**Important constraint I flagged and respected:** the project's design explicitly bans
embeddings/vector DBs/fuzzy alias retrieval. So "same issue → reuse" is implemented as
an **exact match** on `(language, normalized text)`, keyed by a one-way hash — never a
similarity/semantic match. This keeps the new feature inside the existing rules instead
of quietly becoming the retriever the design forbids.

## What was implemented this session

New module: `backend/history/`

- `models.py` — `CaseRecord` (case_id, session_id, language, fingerprint, status
  `started|processing|completed|failed`, reason_id, outcome, from_cache, timestamps).
  Deliberately holds no raw claim text and no user-supplied personal details.
- `store.py` — `CaseHistoryStore`: bounded in-process store.
  - `start()` / `mark_processing()` / `complete()` / `fail()` drive the lifecycle.
  - `fingerprint(language, text)` = sha256 of `language + normalized(text)`. Never
    reversible to the original text.
  - Only `success` and `unsupported` outcomes get cached (`needs_clarification` and
    `error` are request-specific and never cached).
  - The cached `AnalyzeResponse` has its `draft` stripped before storage (the draft
    carries user-supplied claimant name / claim id — must never leak to another
    caller's replay).
  - Optional append-only JSONL persistence (`history_persist_path`); rows contain only
    the hash + outcome metadata, never raw text — verified by a dedicated test.
  - Bounded by `max_records` / `max_per_session` with FIFO eviction.
- `service.py` — `HistoryTrackingService`: wraps either `AnalysisService` or the
  existing `_SharedBudgetService` (image path) behind the identical
  `analyze(request, *, activity=None)` call, so `main.py` didn't need special-casing.
  On a cache hit: skips the model and every knowledge-file read, and rebuilds the draft
  fresh from the *current* caller's own `details` (never replays someone else's name).
  Image requests (`image_key` set) are never cache-checked (no text exists yet at that
  point) but are still recorded into history.
- `schemas.py` — `HistoryCase` / `HistoryResponse`, the wire contract for the new
  `GET /api/v1/history` endpoint. Kept separate from `api/schemas.py` since this is
  bookkeeping metadata, not analysis output, and doesn't need the strict
  evidence/citation invariants `AnalyzeResponse` enforces.

Wired into `backend/main.py`:
- `app.state.history_store` created in the lifespan, from `Settings.history_store()`.
- `tracked_service(payload, request)` wraps `shared_service(payload)` with
  `HistoryTrackingService` when the store is enabled.
- Both `/api/v1/analyze` and `/api/v1/analyze/stream` now go through
  `tracked_service` instead of `shared_service` directly.
- New `GET /api/v1/history?limit=N` endpoint, session-scoped via an `X-Session-Id`
  header (explicitly **not** authentication — there is no login system yet, this is
  just an opaque per-browser partition key; see the docstring on `_session_id()`).
- `/api/v1/capabilities` now reports `history_available`.

New settings in `backend/config.py`: `history_enabled` (default `true`, in-memory
only), `history_max_records`, `history_max_per_session`, `history_persist_path`
(empty string = nothing ever touches disk).

New tests:
- `tests/backend/test_history_store.py` — fingerprinting, lifecycle transitions,
  per-session isolation, which outcomes get cached vs. never cached, bounded eviction,
  and that persisted rows never contain raw text.
- `tests/backend/test_history_service.py` — cache hit skips the inner analyzer
  entirely, draft is rebuilt per-caller on replay, different text/language never share
  a cache slot, image requests always re-run, failures are recorded and never cached,
  sessions never bleed into each other.
- `tests/backend/test_history_api.py` — full HTTP-level proof: an identical repeat
  question via `/api/v1/analyze` results in **zero** additional calls to the mocked
  model on the second request, `/api/v1/history` reflects both cases in the right
  order with the right `from_cache` flag, and a different session sees nothing.

## ✅ Verified (follow-up session, 2026-09-13)

Ran the checks the previous session couldn't:

- `uv sync` — clean.
- The 3 new history test files: all 19 tests passed on the first run.
- Full suite (`pytest -q`): initially **7 failed / 1234 passed**.
  - 5 of the 7 were a real regression from this feature: `history_enabled` defaults
    to `true`, so `tracked_service()` now wraps plain text requests in
    `HistoryTrackingService` where before they hit `AnalysisService` directly. The
    wrapper called `self._inner.analyze(request, activity=activity)` unconditionally,
    which passes an explicit `activity=None` keyword where the old direct call passed
    no keyword at all — functionally identical, but it broke `assert_awaited_once_with`
    mock assertions in `tests/backend/test_level_two_api.py` (4 cases) and
    `tests/backend/test_image_api.py::test_text_requests_never_touch_the_image_pipeline`.
    Fixed in `backend/history/service.py`: `HistoryTrackingService.analyze` now only
    passes `activity=` as a kwarg when it isn't `None`, matching the exact calling
    convention a direct caller would have used, so wrapping stays invisible to
    callers/mocks. All 5 pass now.
  - The remaining 2 (`tests/test_epfo_review.py::test_inventory_is_current_and_covers_every_record`
    and `::test_review_script_supports_direct_execution`) are **unrelated** to this
    feature — the knowledge-corpus review gate (`references/review_epfo_knowledge.py`)
    reports `inventory.json` as stale against in-progress, uncommitted changes elsewhere
    in `references/epfo-claim-rejection-rag-dataset/` (modified README + new untracked
    `original-error-remarks.*` data files). That's Avyakta's knowledge track; regenerating
    the inventory here would bypass the semantic-review gate the test is meant to enforce,
    so it was deliberately left untouched. Someone on the knowledge side needs to rebuild
    and re-review the inventory before that suite is green again.
- `ruff check backend tests` — clean, no findings.

Net: **1239 passed**, 2 pre-existing/unrelated failures remain (knowledge-corpus review,
not history/cache).

## 🔧 Frontend/backend link check (follow-up, 2026-09-13)

Asked directly: is the frontend still correctly linked to the backend after this
feature, and is the extension? Checked both rather than assuming.

- **Frontend — was broken, now fixed.** `backend/main.py`'s `/api/v1/capabilities`
  handler now always includes `"history_available": <bool>` in its response (added
  this session, see line ~384). The frontend's `capabilitiesSchema` in
  `frontend/src/lib/contracts.ts` uses Zod `.strict()`, which rejects any unrecognized
  key. Confirmed live by capturing the real FastAPI response via `TestClient` and
  parsing it with the actual frontend schema (`vite-node`) — it failed with
  `unrecognized_keys: ["history_available"]`. Since `App.tsx` calls the strict
  `getCapabilities()` (not the older loose `fetchCapabilities()`) on load, this would
  have made the real app treat the backend as unavailable/invalid on every load,
  disabling analysis entirely — a silent full outage, not a visible new-field diff.
  Fixed:
  - Added `history_available: z.boolean()` to `capabilitiesSchema`
    (`frontend/src/lib/contracts.ts`).
  - Added `history_available?: boolean` to the loose `Capabilities` type
    (`frontend/src/lib/api.ts`) for type completeness.
  - Updated the `capabilities` test fixture in `frontend/src/lib/api.test.ts` to include
    it, since that fixture is meant to mirror the real contract.
  - Re-verified: real backend payload now parses successfully, `npx vitest run` → 327/327
    passed, `npx tsc -b` clean, and the Python suite is still 1239 passed / 2 unrelated
    failures.
  - **Lesson for next time:** any new top-level field added to an existing endpoint's
    response is a breaking change wherever the frontend validates with Zod `.strict()`
    (capabilities, the live analyze responses, etc. — check `contracts.ts` for
    `.strict()` before adding fields to those response shapes on the backend).
- **Extension — unaffected, no change needed.** `extension/epfo-background.js`'s
  `validateCapabilities()` is a hand-rolled allowlist validator: it reads only the
  specific fields it cares about (`schema_version`, `languages[]`, `default_language`,
  `analysis_available`) and rebuilds its own object from them. It does not reject
  unknown keys, so the new `history_available` field is silently ignored. Same for the
  analyze-response path — the extension never asserts an exhaustive field set. No
  extension changes were required.

## Open follow-ups / ideas not yet done

- No real login exists — `X-Session-Id` is just a client-supplied opaque string right
  now. If/when auth lands, swap what `_session_id()` derives it from without touching
  `HistoryTrackingService` or `CaseHistoryStore` (they only ever see a string).
- Image-originated requests are never cache-checked even after OCR produces text
  (documented as a deliberate v1 simplification in `service.py`) — a future pass could
  cache-check on the *post-OCR* text too, saving a further LLM call.
- Coordinate the `/api/v1/history` response shape with Shravya (frontend) before it's
  relied on — it's new and nothing consumes it yet.
- Consider whether `history_persist_path` should be wired to an actual default path in
  deployment, or stay opt-in (currently opt-in/off by default is the safer choice).
