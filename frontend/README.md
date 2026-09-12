# Saral Sahayak web frontend

A responsive, conversational React + TypeScript interface for EPFO text guidance. The web UI belongs to Shravya; backend orchestration, provider configuration and OCR/document services remain separate team responsibilities.

## Run locally

Use Node.js 22.17+ and npm from this directory:

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. The development server binds to loopback and requires port 5173.

```sh
npm run build
npm run preview
```

Production preview uses <http://127.0.0.1:4173> by default.

For preview-only Vercel hosting preparation, see [the deployment guide](../docs/vercel-deployment.md). Use the repository root with the root `vercel.json`, not `frontend/` as Vercel's Root Directory. Hosting preparation alone does not deploy or connect a backend API.

## Connect the application API

The committed `.env.example` contains **public configuration only**. Copy it to an ignored `frontend/.env.local`, set the application server root and restart Vite:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT_MS=120000
VITE_PREVIEW_ONLY=false
```

The shared `VITE_API_BASE_URL` convention is a server root, not an `/api/v1` prefix. The client appends `/api/v1` itself. Empty or omitted roots use same-origin `/api/v1`; set `VITE_PREVIEW_ONLY=true` only for an intentionally offline example build.

- This is the Saral Sahayak API, **not an LLM provider URL**. Never place provider keys, passwords or tokens in any `VITE_*` variable; these values are visible in the browser.
- Absolute production URLs require HTTPS. HTTP is accepted only for loopback development. A root-relative prefix such as `/api/v1` is supported only when a real same-origin backend/reverse proxy serves it. The existing static Vercel SPA fallback is not an API proxy.
- The backend owner must allow the exact frontend origin through CORS. `localhost` and `127.0.0.1`, schemes and ports differ. The frontend does not weaken CORS or send cookies/authorization headers.
- Metadata GET requests are capped at five seconds. The analysis timeout defaults to 120 seconds and may be configured from 1,000 to 300,000 ms to suit the approved deployment deadline.
- Empty API configuration defaults to same-origin discovery. A static SPA fallback returning HTML is rejected, not mistaken for an available API. An invalid configured URL produces a blocked configuration error, not a silent mock fallback. Explicit example mode remains available.
- Protected analysis may return `access_denied`, `analysis_capacity` or `request_timeout` even when capabilities report availability. Access denial and capacity saturation are not blindly retried. A protected deployment needs an authenticated/rate-limited **server-side gateway** as described in [protected analysis](../docs/protected-analysis.md); never put its shared token in browser code or headers.

With a configured client, the UI reads `GET /api/v1/capabilities`, derives enabled/default languages and native names from the response, and enables **Analyze text** only when the metadata permits text analysis. Availability indicates configuration/structural readiness, **not verified model connectivity, policy accuracy or language quality**.

Only an explicit Analyze action submits text to `POST /api/v1/analyze`. Images, filenames, object URLs and image bytes are never included. Current capabilities support text only; paste the image's wording if you want to analyze it. A typed request uses the original text, chosen enabled language and schema-default null detail fields.

## Use the interface

- Type or paste a remark into the composer. Enter sends/analyzes; Shift+Enter adds a line. IME composition is respected. Remove personal identifiers before using API mode.
- **Attach** supports local PNG/JPEG/WebP previews and editable UTF-8 `.txt` imports. Camera selection uses the device picker on supported devices; it does not implement OCR.
- API replies render the actual success, clarification, unsupported or error envelope. Clarification editing retains the original text and questions. Unsupported/error outcomes never expose ready-to-use guidance or a draft.
- **Cancel analysis**, editing, language/mode changes, new chat and changed capabilities invalidate pending work. Late responses cannot replace newer state.
- Transient failures permit at most two explicit same-message retries; retrying resends the text. Configuration, knowledge, validation and budget failures do not get blind retries. Metadata refreshes are also limited to two per connection, including an explicit return from examples to API mode.
- **Use examples** or **Show me an example** is an explicit switch to labelled offline content. Failed API requests never substitute a sample answer. **Use API** explicitly returns to the configured connection.
- Overview, Next steps and Draft remain compact keyboard-accessible tabs. Source disclosures preserve paths, record IDs, exact headings, lines, zero-based columns and URLs. Copying a draft retains its factual-block citations, limitations and missing-field placeholders.
- Language selection affects future replies, not English interface controls or earlier responses. Preview options come from a validated six-language fixture; API options come only from live capabilities. Quality flags are reported metadata rather than fluency guarantees.
- Text and local images are kept in browser memory only; new chat/reload clears them. Only the latest six turns are retained. API mode intentionally sends reviewed text to the configured service, never silently in the background.

## Safety and limits

- Validate PNG/JPEG/WebP MIME and signatures, a 10 MiB file limit, successful decode and a 40-megapixel decoded-dimension limit. SVG, GIF, PDF, corrupt, mismatched and oversized files are refused.
- `.txt` imports are limited to 64 KiB and 8,000 Unicode code points. Invalid UTF-8, binary controls, blank content and misleading file types are rejected.
- Requests enforce the original 8,000-codepoint limit and a 32,768-byte serialized JSON budget, including schema defaults. Text is not silently truncated.
- HTTP responses are streamed with a 1 MiB limit, validated JSON content type/schema and matching response language. Redirects are rejected. Small 400/401/413/422/429/504 envelopes are handled separately from full analysis errors. Unknown/invalid responses produce safe messages without printing raw bodies or configuration.
- There are no automatic retries, accounts, analytics, remote fonts or persisted claim history. Local object URLs are released on removal, replacement, dropped turns, reset and unmount.
- React renders untrusted content as text. Only validated HTTP(S) citation links can be opened, without opener/referrer access. A citation is not independent policy verification.

No provider keys, real claim fixtures or private originals belong in Git. Use synthetic or redacted material for testing. Download, OCR, PDF and voice controls remain unavailable without an agreed service contract. A true future download-availability flag alone is insufficient to invent a document endpoint.

## Implementation map

- `src/App.tsx`: explicit API/preview modes, capabilities, request lifecycle, privacy notices, local attachments, clarification and retry limits.
- `src/lib/api.ts`: trusted public API configuration, bounded GET/POST transport, cancellation/timeouts and safe error handling.
- `src/lib/contracts.ts`: current request/response/citation and small transport-error schemas, generated-prose validation and input budgets.
- `src/lib/capabilities.ts`: capabilities validation, offline fixture and enabled-language selection.
- `src/components/AnswerCard.tsx` and `Evidence.tsx`: distinct API/sample presentation, uncertainty, draft copying and exact evidence details.
- `src/lib/attachments.ts`: bounded local image/text handling, not extraction or transmission.
- `src/lib/demo.ts`, `mockContent.ts`, `walkthrough.ts`: explicit fictional examples preserving synthetic provenance and unreviewed translation disclosures.
- `scripts/fixture_backend.py`: test-only real FastAPI/AnalysisService HTTP server with injected fake model and temporary synthetic Markdown; not a deployment service.

Original fixture warnings are historical test data, not current backend readiness reports. No knowledge corpus or archived dataset is bundled into the UI.

## Tests

```sh
npm run check
npm run test:e2e
npm run test:api
```

`check` runs formatting, TypeScript/production build and Vitest unit/component tests. `test:e2e` starts an isolated example-only Vite server with `VITE_PREVIEW_ONLY=true` and no `.env` reads for preview regression; default same-origin behavior is covered by API UI/client tests. `test:api` uses the actual backend factory, analysis service, tools and ledger over loopback HTTP, with a fake model and temporary synthetic corpus; it does not intercept analysis responses or call a real provider.

### Real API test prerequisites

The backend's secure file tools require POSIX `dir_fd`/`O_NOFOLLOW`; do not bypass them with a Windows shim. On Linux/macOS, use the repository's locked Python environment (`uv sync --frozen`), then run the API suite. The config uses `uv run --no-sync` when available, or an existing interpreter specified by `FIXTURE_PYTHON`.

On Windows, the standard Python launcher delegates to an existing WSL environment. Set `FIXTURE_WSL_PYTHON` to that Linux environment's Python path (and optionally `FIXTURE_WSL_DISTRO`, default `Ubuntu`). For example in PowerShell:

```powershell
$env:FIXTURE_WSL_PYTHON='/home/your-user/.cache/saral-api-tests/bin/python'
npm run test:api
```

In Git Bash, also set `MSYS2_ENV_CONV_EXCL=FIXTURE_WSL_PYTHON` to prevent Windows path rewriting. Test scripts install nothing automatically. Prepare Linux dependencies from the repository lock in a separate user-owned environment; do not replace a Windows `.venv` with Linux binaries.

The API suite exclusively owns ports **8011** (fixture backend) and **5174** (isolated Vite). Occupied ports cause failure; existing processes are never reused or killed. The fixture clears inherited settings, refuses external network connections, avoids `.env`, and cleans its child processes and temporary corpus. Windows cleanup uses a lease so terminating the launcher does not orphan the WSL server.

Playwright uses installed Google Chrome by default, desktop/mobile layouts and axe checks. Set `PLAYWRIGHT_CHANNEL` to another installed compatible channel such as `msedge`. For the version-matched browser used in CI, run `npx playwright install chromium` and then `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e` (PowerShell: `$env:PLAYWRIGHT_CHANNEL='chromium'; npm run test:e2e`). Generated screenshots/traces/reports under `test-results/` and `playwright-report*/` are ignored and contain synthetic data only.

The repository's [CI workflow](../.github/workflows/ci.yml) runs on pull requests and pushes to `main`. It verifies Python/backend and knowledge integrity, extension tests and syntax, frontend formatting/build/unit tests, and Chromium desktop/mobile E2E including accessibility and local-data privacy checks. It uses no provider credentials or live analysis requests. Failed browser runs retain synthetic test artifacts for seven days. Adding this workflow does not configure branch protection or make these checks mandatory for merging. The dedicated `test:api` suite is an additional explicitly invoked acceptance check, not a claim that the existing CI workflow runs it.

## Review and integration status

Anish accepted issue 24 through merged PR 35. This follow-up implements issue 25 and requests review; issue 26 requires completed/reviewed issue 25 before advancing. Real provider policy/translation quality, physical camera behavior, OCR and deployment are not certified by these tests.

See [WEB_UI_ACCEPTANCE.md](WEB_UI_ACCEPTANCE.md) for coverage, exact test evidence and remaining gates. Coordinate backend/API/CORS settings with Anish and image/document services with Ajay. No automatic issue closure or merge is implied by this document.
