# Local integrated demo runbook — issue #30

Operator guide for a **reproducible local** frontend → analyze API → grounded answer path.
This does **not** close issue #29 or #30, certify policy accuracy, multilingual quality, or production hosting.

## What “working demo” means here

| Layer | Expected |
| --- | --- |
| Backend liveness | `GET /health/live` → 200 |
| Readiness / capabilities | `GET /health/ready` and `GET /api/v1/capabilities` reflect model **configuration** + corpus **structure** only (`analysis_available`). Not connectivity, fluency, or policy correctness. |
| Live analyze (opt-in) | `POST /api/v1/analyze` with synthetic text returns a contract-shaped response (success / clarification / unsupported / error). Citations come from the host ledger when status is `success`. |
| Frontend | Vite UI with `VITE_API_BASE_URL` pointing at the backend; submit text only (no auto-submit). Sample walkthrough stays fixture-labelled. |

Stay on **`LLM_API_STYLE=responses`**. Never commit `.env`, API keys, OTPs, or real claim PII.

## Prerequisites

- Python 3.12+, [uv](https://github.com/astral-sh/uv), Node.js 22.17+, npm
- Clean checkout of `main` (or this branch)
- Local ignored `.env` copied from [`.env.example`](../.env.example) — inject secrets only in that file or the shell

## 1. Configure backend (no secrets in Git)

```sh
cp .env.example .env
# Edit .env locally: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL, timeouts.
# Keep LLM_API_STYLE=responses
```

**CORS must match the browser origin exactly.** The Vite dev server binds **`http://127.0.0.1:5173`** (see `frontend/vite.config.ts`). `localhost` ≠ `127.0.0.1` for CORS:

```sh
# Recommended for the default Vite host:
CORS_ORIGINS=["http://127.0.0.1:5173"]

# If you also open http://localhost:5173 in the browser, list both:
# CORS_ORIGINS=["http://127.0.0.1:5173","http://localhost:5173"]
```

For authorized live retests, operators often raise budgets (defaults stay 30s / 25s offline):

```sh
ANALYSIS_REQUEST_SECONDS=120
LLM_TIMEOUT_SECONDS=90
```

`LLM_TIMEOUT_SECONDS` must stay ≤ `ANALYSIS_REQUEST_SECONDS`. Keep `ANALYSIS_ACCESS_MODE=local` for loopback demos; do not put `ANALYSIS_ACCESS_TOKEN` in `VITE_*` or the browser.

## 2. Start backend

From the repository root:

```sh
uv sync --frozen
uv run uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

Quick probes (no provider call beyond whatever readiness already avoids — these routes do not call the model):

```sh
curl -sS http://127.0.0.1:8000/health/live
curl -sS http://127.0.0.1:8000/health/ready
curl -sS http://127.0.0.1:8000/api/v1/capabilities
```

Or the content-free checker:

```sh
python -m scripts.check_demo_readiness
python -m scripts.check_demo_readiness --base-url http://127.0.0.1:8000
```

| Symptom | Likely cause |
| --- | --- |
| Connection refused | Backend not listening on `127.0.0.1:8000` |
| `/health/ready` 503 / `analysis_available: false` | Missing model config and/or corpus structure gate — UI should show an honest unavailable message, not a fixture |
| Browser CORS error | `CORS_ORIGINS` missing the exact page origin (scheme/host/port) |
| Analyze 504 / timeout | Raise reviewed budgets; do not invent success |

## 3. Start frontend pointed at the backend

```sh
cd frontend
npm ci
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

Open **http://127.0.0.1:5173** (match CORS). The header status line reports whether the API base is reachable and whether `analysis_available` is true. Empty `VITE_API_BASE_URL` means same-origin `/api/...` (no separate backend unless you proxy).

**Never** put LLM keys or `ANALYSIS_ACCESS_TOKEN` in `VITE_*`.

## 4. Synthetic UI demo (judges)

Use only synthetic text (for example `epfo-case-001-initials-paraphrase` input in `references/reviews/epfo/cases.json`). Paste into the composer and **Send**.

Expect when the live path works:

- AnswerCard `mode="live"` with grounded / not-chatbot disclosures
- Explanation, checklist actions, draft when the contract returns `success`
- Evidence citations with Markdown path, record/heading, source URLs

If analysis is unavailable, the UI shows a failure — it must **not** silently swap in the sample fixture. Use **Show me an example** only when you intentionally want labelled fixtures.

UI language selector remains English/Hindi for sample walkthroughs; backend capabilities may list six codes with `quality_verified: false`. Multilingual live evaluation stays a separately authorized acceptance-runner task ([agent acceptance runner](agent-acceptance-runner.md)).

## 5. Opt-in bounded live smoke (reuse acceptance runner)

Default acceptance listing makes **no** provider calls:

```sh
python -m scripts.run_agent_acceptance
```

Authorized single-case live check (synthetic only; set ceilings explicitly):

```sh
python -m scripts.check_demo_readiness --allow-live \
  --case epfo-case-001-initials-paraphrase --max-model-calls 8
```

That runs the HTTP readiness probe first, then delegates to `scripts.run_agent_acceptance` with the same flags. Reports stay content-free (no keys, prompts, or claimant PII). `contract_status_match` is not semantic or language-quality verification. See [live acceptance status](live-acceptance-status.md).

## 6. Docker / Vercel notes

- [Docker backend packaging](docker-backend-deployment.md) and [Vercel frontend prep](vercel-deployment.md) are hosting hygiene. A container or Vercel build alone is **not** an accepted integrated demo.
- Public paid-model exposure still needs protected analysis / gateway controls ([protected analysis](protected-analysis.md)). CORS is not authentication.

## Honesty limits (do not over-claim)

- Related to issue **30** (and live-status docs for **29**): this runbook advances reproducible demo setup; it does **not** mark either issue complete.
- One successful synthetic analyze or acceptance match is progress evidence, not full Level 2 matrix completion or Level 3 “done when.”
- OCR, downloads, voice, PM-JAY, and live-government integration remain out of scope here.
