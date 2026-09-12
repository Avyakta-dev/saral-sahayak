# Local text-analysis demo

This is local development integration, not a public deployment. Run both processes from the repository checkout. Keep model credentials in the ignored repository-root `.env`; never put them in a `VITE_` variable.

## Start the backend

```sh
LLM_STREAM=true ANALYSIS_REQUEST_SECONDS=60 LLM_TIMEOUT_SECONDS=45 \
  .venv/bin/uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

These process-only timeout overrides use the existing bounded configuration. Defaults remain 30 seconds for the request and 25 seconds per model call. File, tool, output and grounding limits are unchanged. Provider streaming is enabled for the Responses protocol; other protocols currently require `LLM_STREAM=false`. Only complete validated answers are shown, not raw streamed model text. On Windows PowerShell, set `$env:LLM_STREAM="true"`, `$env:ANALYSIS_REQUEST_SECONDS="60"` and `$env:LLM_TIMEOUT_SECONDS="45"`, then run `.venv\Scripts\python -m uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000`.

Check `http://127.0.0.1:8000/health/ready`. Readiness verifies configuration and knowledge structure, not model connectivity or policy/translation quality.

## Start the frontend

Install the locked dependencies with `npm --prefix frontend ci`. To opt in locally, add this non-secret flag to ignored `frontend/.env.local`, preserving any existing settings:

```dotenv
VITE_ENABLE_STREAMING=true
VITE_PREVIEW_ONLY=false
```

Then start `npm --prefix frontend run dev` and open `http://127.0.0.1:5173/`. Restart Vite after configuration changes if it does not reload automatically. Development API calls use the same-origin `/api` proxy to the loopback backend; no provider credentials are sent to the browser. Production has no development proxy. Set VITE_PREVIEW_ONLY=true for an intentionally offline build; otherwise the API client uses its validated configured server root (same-origin when blank).

## Rehearse safely

Use fictional/redacted text, review it, and explicitly approve analysis. The configured model may be a remote paid provider even though the app runs locally. Never use real Aadhaar, UAN, PAN, bank numbers or claim documents for the demonstration. Images stay local unless validated capabilities explicitly enable image input and the user separately approves the preview. Image Analyze uploads the entire selected File, including embedded metadata, to service-controlled private storage for backend/model processing. There is no browser automatic personal-data redaction; manually remove identifiers before attaching. Backend image security and lifecycle configuration are required and disabled by default. The explicit example walkthrough is fictional and separate from model analysis.

A suitable synthetic text-only case:

> Synthetic example: my Form 19 remark says the name does not match Aadhaar. My UAN profile uses an initial for my middle name, while Aadhaar spells that same middle name out. Aadhaar has the correct name. Why might this fail?

The chat activity panel receives real host events from `POST /api/v1/analyze/stream`: model turns, successful Markdown reads with file/section/line ranges, and final validation. Its working indicator animates only during a request and respects reduced-motion preferences. The activity history remains available after completion or failure; it does not fabricate a percentage or pretend to have read a file. See [the activity stream contract](analysis-stream.md).

Inspect the response, actions and source citations. A validated response is not independent verification of the underlying policy. Do not describe configured languages as quality-certified. Failed/unsupported/clarification outcomes must remain visible rather than being replaced with an example answer.

## Local rehearsal evidence

One synthetic service-level run on the merged backend with 60/45-second process limits completed successfully in 44.89 seconds: three model turns, five tool calls, one bounded output repair, three citations, and reason `epfo-rr-001`. The same case previously hit the default 30-second deadline. This is one successful rehearsal, not a latency guarantee or a complete language/policy acceptance matrix.

After the model was changed, non-streaming final generation timed out. Responses streaming initially rejected a changed terminal encrypted-reasoning blob; the adapter now accepts that specific opaque-field update and replays the final value without relaxing tool identity, arguments or citation checks. The updated model's subsequent streamed service run completed transport but failed final validation in 55.86 seconds. A full live request through the Vite proxy then emitted 11 real activity events and ended with `invalid_model_output` in 20.29 seconds. This verifies live activity transport, not a successful answer with the updated model. Do not present it as passing model acceptance.

## Historical verification before publication merge

- Backend-only regression suite: 788 passed, including 40 activity-stream tests.
- Full Python suite: 1,005 passed, two existing review-inventory failures. The new local `original-error-sources.md` archive document is not yet fingerprinted in the saved review inventory; this work did not overwrite that separate dataset change.
- Frontend formatting/build and 306 unit/component tests passed.
- Browser regressions: 124 preview tests and 26 live-mode synthetic SSE tests passed. Mock browser success is not proof of successful output from the configured model.
- Direct local review covered bounded streaming, cancellation cleanup, privacy, citation metadata and final-only rendering.

No public tunnel or deployment is required for a demonstration on this laptop. Do not expose the unauthenticated development API publicly without a separate access-control and deployment review.
