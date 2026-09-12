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

For preview-only Vercel hosting preparation, see [the deployment guide](../docs/vercel-deployment.md). Use the repository root with the root `vercel.json`, not `frontend/` as Vercel's Root Directory. This is not a deployed or API-connected service.

## Opt-in local live text demo

Default development without a flag and all standard production/Vercel builds remain preview-only. For an authorized local demo, set `VITE_ENABLE_ANALYSIS=true` in your shell or an ignored `frontend/.env.local`, then run `npm run dev`. Do not put model keys or provider configuration in any `VITE_` variable. This change does not create an environment file.

The development server proxies same-origin `/api` requests only to `http://127.0.0.1:8000`; start the backend separately following [the local demo guide](../docs/local-demo.md). There is no client provider connection, configurable remote proxy or CORS relaxation. Restart Vite after changing the flag. `npm run build` explicitly forces preview mode even when a local live flag exists; the Vercel build remains unchanged.

Live mode fetches read-only capabilities and offers only enabled output languages (up to all six). The separate English/Hindi selector controls fictional samples. The independent Interface language selector localizes controls, consent, errors and disclosures to English, Hindi, Kannada, Tamil, Telugu or Malayalam using local dictionaries; it never translates input, prior responses or original evidence metadata. It defaults to English and stays in memory only. Interface changes invalidate pending consent but do not send requests, change output language or cancel an active request. All six translation catalogs require native-language review; see [interface language notes](../docs/interface-languages.md). Availability means model configuration plus corpus structure, not verified model connectivity, evidence correctness or language quality.

Paste/import redacted rejection wording, select the output language, then **Review**. The per-request consent dialog displays the exact trimmed text and destination disclosure. **Back to edit** or Escape sends nothing; **Analyze reviewed text** sends only `{text, language}` to the backend/configured model. Images block analysis until removed: no image, filename, bytes, base64, identifiers object or conversation history is transmitted. A text file is read locally into the editable composer; its filename is not sent. Each request is independent.

Stop, edit, output/sample language changes, new chat and unmount abort requests and invalidate stale completions. Consent never carries over. Cancellation cannot recall text already received by the backend/model. The frontend stores no input outside transient component memory and does not log it. Responses are bounded at 2 MiB, validated before display, and limited to 125 seconds (capabilities: 15 seconds/16 KiB). No automatic retries or raw provider error display. Failures, unsupported remarks and clarification do not become sample answers or usable drafts. Only final validated JSON is rendered, not unvalidated streamed model tokens.

The live UI uses `POST /api/v1/analyze/stream`. Its SSE reader accepts up to 128 strictly validated activity events plus one final result, handles split UTF-8/CRLF and comments, and fails closed on incomplete, excessive or unexpected events. The chat activity panel shows only host-reported phases and actual Markdown paths, headings and line ranges; it invents no timed steps, percentages or source checks. Activity history stays per turn in memory after completion/error, in a bounded scrollable list. Working animation respects reduced motion. Source files are not fetched by the browser. The final answer appears only after a validated result and complete stream; an error never becomes a partial draft.

## Use the interface (default preview)

- Type or paste a fictional remark into the single chat composer. Enter sends; Shift+Enter adds a line. Composition/IME input is respected.
- Use **Attach** to choose an image or plain `.txt` file. Camera selection uses the device's file/camera picker; actual capture depends on the browser and device.
- Paste a screenshot or drop an image onto the composer. Select its thumbnail to enlarge it, or remove/replace it before sending.
- Choose **Show me an example** for a clearly labelled visual walkthrough. Overview, Next steps and Draft are compact keyboard-accessible tabs, not separate pages or a user-selected success/error matrix.
- Expand Source only when evidence details are wanted. Checklist ticks are temporary personal tracking. Copy sample retains the sample's disclosures and placeholders.
- Language selection changes future sample output, not English interface controls or earlier replies.
- Edit a message to return its wording/image to the composer. New chat or reload clears temporary state. Only the latest six turns are retained in memory.

**Sending your own text or image does not return a canned sample as though it were analysis.** It shows an honest connection limitation instead. Only the explicit example button loads sample guidance.

## Working local input versus backend capabilities

Implemented locally:

- Image selection, real browser decoding, thumbnails/enlargement, removal/replacement, pasted screenshots and drag/drop.
- PNG/JPEG/WebP MIME plus signature validation, a 10 MiB file limit, successful decode and a 40-megapixel decoded-dimension limit. SVG, GIF, PDF, mismatched/corrupt and oversized inputs are refused.
- Plain UTF-8 `.txt` imports up to 64 KiB/8,000 Unicode code points. Invalid encoding, binary controls, blank content and misleading file types are rejected. Imported text remains editable.
- Original-text 8,000-codepoint validation and serialized trimmed `{text, language}` 32,768-byte validation. Input is not silently truncated.
- Object URL cleanup on removal, replacement, dropped conversation turns, reset and unmount. Stale file selections and cancelled sample responses cannot reappear later.

Not connected or implemented by this frontend:

- OCR, PDF reading, voice, document downloads and live-government integration. Analysis is connected only in the opt-in local mode described above; model calls remain backend-owned.
- No claim assessment or extraction from an attached image. Local file selection is not a server upload.
- No accounts, analytics, remote fonts, local/session storage or persisted claim history. Text/images stay in browser memory; analysis requests are sent only after per-request approval in opt-in live mode.

Use fictional or properly redacted material. The interface never needs Aadhaar, PAN, UAN or bank details for testing. The sample is neither verified advice nor a usable claim draft. Original fixture citations and `example.invalid` URLs are imaginary; those URLs remain plain text rather than live links.

## Contract and implementation

The version 1.0 validator accepts all six backend languages and paired nullable zero-based citation columns, with strict object fields and state/citation invariants. The live boundary additionally requires explicit response fields and visible prose; historical fixture defaults remain compatible. This validates transport structure, not semantic grounding. See [`../docs/backend-contract.md`](../docs/backend-contract.md). Only four synthetic JSON examples are imported from `../docs/examples/`; no knowledge corpus or archived dataset enters the bundle.

- `src/App.tsx`: conversational shell, local messages, composer, attachment lifecycle, cancellation and connection notices.
- `src/components/AnswerCard.tsx`: compact answer tabs, personal checklist, document tile, sample draft/copy feedback and guidance-free non-success states.
- `src/components/Evidence.tsx`: claim-level Markdown path, record ID, exact heading, lines and original URLs; unsafe links are not activated.
- `src/lib/attachments.ts`: bounded local image and UTF-8 text handling; never OCR or transmission.
- `src/lib/contracts.ts`: strict version 1.0 response/state/citation validation and input budgets.
- `src/lib/demo.ts`: unchanged source-fixture behavior and abort-safe sample delay.
- `src/lib/walkthrough.ts`: short English/Hindi fictional display content that preserves original synthetic provenance and warnings.
- `src/styles.css`: forest/cream visual system, illustration, responsive chat/composer, focus and reduced-motion support.

Schema validity is not evidence verification. Source-authority, verification-date or policy-confidence information is never fabricated. React renders untrusted text rather than injecting HTML; source links reject unsafe syntax and credentials. Hindi sample translations are not live Hindi analysis and require the team's language review before release.

## Tests

```sh
npm run check
npm run test:e2e
npm run test:e2e:live
```

`check` runs formatting, TypeScript/production build and Vitest unit/component tests. Playwright uses installed Google Chrome on desktop and Pixel-sized mobile layouts, with axe accessibility scans. Browser tests use synthetic canvas-generated image files and test camera-input routing, not physical camera hardware. No real provider/backend connection is required.

Set `PLAYWRIGHT_CHANNEL` to an installed compatible channel such as `msedge` if necessary. For the version-matched browser used in CI, run `npx playwright install chromium` and then `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e` (PowerShell: `$env:PLAYWRIGHT_CHANNEL='chromium'; npm run test:e2e`). Preview E2E always starts an isolated server on port 5174 with the flag forced false; live E2E uses port 5175 with the flag forced true and mocked routes (no backend proxy). Neither reuses an existing server. The original preview suite is unchanged. Live tests exercise consent, output languages, success/citations/draft, clarification/unsupported/errors, image non-transmission and cancellation races. These mocks do not establish provider or translation quality. Screenshots/traces/reports under `test-results/` and `playwright-report/` are ignored and contain synthetic test content only.

The repository's [CI workflow](../.github/workflows/ci.yml) runs on pull requests and pushes to `main`. It verifies Python/backend and knowledge integrity, extension tests and syntax, frontend formatting/build/unit tests, and Chromium desktop/mobile E2E including accessibility and local-data privacy checks. It uses no provider credentials or live analysis requests. Failed browser runs retain synthetic test artifacts for seven days. Adding this workflow does not configure branch protection or make these checks mandatory for merging.

## Integration boundary

Local live text integration is opt-in and does not establish production readiness or deployment. Original fixture warnings remain historical test data, not current readiness reports. Backend configuration, provider compatibility, grounded supported-case acceptance and independent six-language quality review remain separate responsibilities. No live provider requests are part of the frontend regression suites.

Coordinate real API/CORS origins and response handling with Anish, and image extraction/document services with Ajay. A working input control must not imply a working backend feature. Do not weaken CORS, silently substitute fixtures for API errors or enable voice/PDF/download controls without an agreed service.

Preview approval remains required before commits. Push approval is a separate gate; the PR follows the approved push.
