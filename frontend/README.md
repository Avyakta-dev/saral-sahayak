# Saral Sahayak web frontend

A responsive, conversational React + TypeScript interface for EPFO claim guidance. This is Shravya's web UI, not Ajay's extension or an implementation of the analysis/OCR backend.

## Run locally

Use Node.js 22.17+ and npm from this directory:

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. The server binds to loopback and requires port 5173. It is not exposed to the local network.

```sh
npm run build
npm run preview
```

Production preview uses <http://127.0.0.1:4173> by default.

### Live backend (optional)

From the repository root, run the FastAPI app (Python 3.12+, uv):

```sh
uv sync --frozen
uv run uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

In `frontend/`, point Vite at that origin (no trailing slash). An empty value means same-origin relative `/api/...` paths:

```sh
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

Copy `VITE_API_BASE_URL=` from the root [`.env.example`](../.env.example). Backend `CORS_ORIGINS` must include this exact page origin (`http://127.0.0.1:5173` by default — `localhost` differs). **LLM keys and `ANALYSIS_ACCESS_TOKEN` stay server-side only** — never put them in `VITE_*`, browser code, or frontend settings. Submitting a remark calls `POST /api/v1/analyze` only when you send; nothing auto-submits. The composer status line reports capabilities readiness for judges. The sample walkthrough still uses local fixtures via **Show me an example**. Full steps: [demo runbook](../docs/demo-runbook.md).

For preview-only Vercel hosting preparation, see [the deployment guide](../docs/vercel-deployment.md). Use the repository root with the root `vercel.json`, not `frontend/` as Vercel's Root Directory.

## Use the interface

- Type or paste a fictional remark into the single chat composer. Enter sends; Shift+Enter adds a line. Composition/IME input is respected.
- Use **Attach** to choose an image or plain `.txt` file. Camera selection uses the device's file/camera picker; actual capture depends on the browser and device.
- Paste a screenshot or drop an image onto the composer. Select its thumbnail to enlarge it, or remove/replace it before sending.
- Choose **Show me an example** for a clearly labelled visual walkthrough. Overview, Next steps and Draft are compact keyboard-accessible tabs, not separate pages or a user-selected success/error matrix.
- Expand Source only when evidence details are wanted. Checklist ticks are temporary personal tracking. Copy sample retains the sample's disclosures and placeholders.
- Language selection changes future sample output, not English interface controls or earlier replies.
- Edit a message to return its wording/image to the composer. New chat or reload clears temporary state. Only the latest six turns are retained in memory.

**Sending your own text** calls the live analyze API when a backend is reachable; failures show an honest unavailable message (never a silent canned sample). **Images alone** still show that OCR is not connected. Only the explicit example button loads sample guidance.

## Working local input versus backend capabilities

Implemented locally:

- Image selection, real browser decoding, thumbnails/enlargement, removal/replacement, pasted screenshots and drag/drop.
- PNG/JPEG/WebP MIME plus signature validation, a 10 MiB file limit, successful decode and a 40-megapixel decoded-dimension limit. SVG, GIF, PDF, mismatched/corrupt and oversized inputs are refused.
- Plain UTF-8 `.txt` imports up to 64 KiB/8,000 Unicode code points. Invalid encoding, binary controls, blank content and misleading file types are rejected. Imported text remains editable.
- Original-text 8,000-codepoint validation and serialized trimmed `{text, language}` 32,768-byte validation. Input is not silently truncated.
- Object URL cleanup on removal, replacement, dropped conversation turns, reset and unmount. Stale file selections and cancelled sample responses cannot reappear later.

Connected when configured:

- `src/lib/api.ts` → `GET /api/v1/capabilities` and `POST /api/v1/analyze` using `VITE_API_BASE_URL` (or same-origin). Live turns render in AnswerCard `mode="live"` with grounded / not-chatbot disclosures and evidence citations.

Still not implemented by this frontend:

- LLM calls or secrets in the browser, OCR, PDF reading, voice, document downloads and live-government integration.
- No claim assessment or extraction from an attached image. Local file selection is not a server upload.
- No accounts, analytics, remote fonts, local/session storage or persisted claim history.

Use fictional or properly redacted material. The interface never needs Aadhaar, PAN, UAN or bank details for testing. The sample is neither verified advice nor a usable claim draft. Original fixture citations and `example.invalid` URLs are imaginary; those URLs remain plain text rather than live links.

## Contract and implementation

The preview validator models the original English/Hindi version 1.0 fixture contract, not the older plan's illustrative JSON. It is not yet aligned with every field and validation rule in the current [`../docs/backend-contract.md`](../docs/backend-contract.md) and [`../backend/api/schemas.py`](../backend/api/schemas.py). Only four synthetic JSON examples are imported from `../docs/examples/`; no knowledge corpus or archived dataset enters the bundle.

- `src/App.tsx`: conversational shell, live analyze vs sample walkthrough, composer, attachment lifecycle, AbortController cancellation, honest unavailable notices and bounded user-initiated retries (max 3 analyze attempts per live turn).
- `src/components/AnswerCard.tsx`: compact answer tabs with `mode: 'live' | 'sample'`, checklist, draft/copy feedback and guidance-free non-success states.
- `src/components/Evidence.tsx`: claim-level Markdown path, record ID, exact heading, lines and original URLs; live vs sample evidence notices; unsafe links are not activated.
- `src/lib/api.ts`: `getApiBaseUrl`, `fetchCapabilities`, `analyzeRemark` (no browser secrets).
- `src/lib/attachments.ts`: bounded local image and UTF-8 text handling; never OCR or transmission.
- `src/lib/contracts.ts`: strict version 1.0 response/state/citation validation and input budgets (optional citation columns accepted).
- `src/lib/demo.ts`: unchanged source-fixture behavior and abort-safe sample delay.
- `src/lib/walkthrough.ts`: short English/Hindi fictional display content that preserves original synthetic provenance and warnings.
- `src/styles.css`: forest/cream visual system, illustration, responsive chat/composer, focus and reduced-motion support.

Schema validity is not evidence verification. Source-authority, verification-date or policy-confidence information is never fabricated. React renders untrusted text rather than injecting HTML; source links reject unsafe syntax and credentials. Hindi sample translations are not live Hindi analysis and require the team's language review before release.

## Tests

```sh
npm run check
npm run test:e2e
```

`check` runs formatting, TypeScript/production build and Vitest unit/component tests. Playwright uses installed Google Chrome on desktop and Pixel-sized mobile layouts, with axe accessibility scans. Browser tests use synthetic canvas-generated image files and test camera-input routing, not physical camera hardware. No real provider/backend connection is required.

Set `PLAYWRIGHT_CHANNEL` to an installed compatible channel such as `msedge` if necessary. For the version-matched browser used in CI, run `npx playwright install chromium` and then `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e` (PowerShell: `$env:PLAYWRIGHT_CHANNEL='chromium'; npm run test:e2e`). E2E starts the development server if needed. Screenshots/traces/reports under `test-results/` and `playwright-report/` are ignored and contain synthetic test content only.

The repository's [CI workflow](../.github/workflows/ci.yml) runs on pull requests and pushes to `main`. It verifies Python/backend and knowledge integrity, extension tests and syntax, frontend formatting/build/unit tests, and Chromium desktop/mobile E2E including accessibility and local-data privacy checks. It uses no provider credentials or live analysis requests. Failed browser runs retain synthetic test artifacts for seven days. Adding this workflow does not configure branch protection or make these checks mandatory for merging.

## Integration boundary

This frontend can call the live analyze API when `VITE_API_BASE_URL` (or same-origin) reaches a running backend. Transport, grounded rendering and clarification/unsupported/error states landed in #48/#51/#57; this work adds bounded user-initiated retries toward issue #25. That does **not** alone close Level 2 or claim live provider/policy acceptance. Draft export remains copy-only until a real download capability exists (`downloads_available` is still false). Fixture warnings remain historical test data.

Still follow-ups: capabilities-driven language selectors beyond the current English/Hindi UI choices, richer CORS coordination with Anish, and image extraction/document services with Ajay. Do not weaken CORS, silently substitute fixtures for API errors, put secrets in `VITE_*`, or enable voice/PDF/download controls without an agreed service. Nothing auto-submits a claim.
