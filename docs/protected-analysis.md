# Protected analysis admission — issue 30 preparation

## Scope

`ANALYSIS_ACCESS_MODE=protected` adds a server-to-server Bearer-token gate, per-process request admission limit and active-request limit to `POST /api/v1/analyze` (including its trailing-slash alias). The gate runs before body buffering, readiness inspection or model work. Invalid/missing/duplicate Authorization headers return a generic 401 without consuming an analysis slot. Health and capabilities remain public; CORS preflight remains unchanged.

The default **local** mode preserves existing development/tests. It is not safe public paid-model exposure. Protected mode refuses startup unless `ANALYSIS_ACCESS_TOKEN` is 32–256 printable non-space ASCII characters. Generate a random high-entropy token in your secret manager (for example 32 random bytes encoded as hex), separate from the model provider key. A length check does not prove entropy. Inject it at runtime, never in image build arguments, Git, chat, browser code, `VITE_*` variables or frontend settings.

## Intended deployment boundary

Browser → separately authenticated and rate-limited HTTPS gateway/server → protected Docker backend → model provider.

The gateway must authenticate/authorize users and attach `Authorization: Bearer <server secret>` to backend requests. Restrict the raw backend port/network to that gateway. No gateway, user accounts, browser credential flow or Vercel Function is implemented here; the current Vercel frontend is still preview-only. CORS deliberately does not add Authorization to allowed browser headers. Do not distribute the shared backend token to users or modify CORS as a shortcut. Protecting a Vercel page alone does not protect the backend.

## Controls and response contract

- `ANALYSIS_REQUESTS_PER_MINUTE`: 1–600, default 10. Fixed 60-second process-local window. Authenticated admitted requests count even when malformed, dependency-blocked, failed or cancelled. Denied authentication/concurrency/rate requests are not counted as admissions.
- `ANALYSIS_MAX_CONCURRENT`: 1–32, default 2. No queue. Admission is atomic; slots release on completion, failure and cancellation. Saturation returns 429 immediately.
- `ANALYSIS_REQUEST_SECONDS`: existing reviewed request deadline, now also bounds the entire protected downstream request, including body receipt and readiness. The inner agent budget still applies; protected mode can time out earlier because it includes those additional phases. Slow body reads cannot hold a slot forever. Synchronous blocked filesystem work remains cooperatively bounded, not preemptible.
- 401: `{"error":{"code":"access_denied","message":"Analysis access denied."}}`.
- 429: `{"error":{"code":"analysis_capacity","message":"Analysis capacity is limited."}}`, with integer `Retry-After` (window remainder or one second for concurrency).
- Protected outer timeout before response headers: 504 with `request_timeout` and a generic message. Existing agent/dependency envelopes remain unchanged after admission. Clients/gateways must handle these small transport errors rather than assume every error is a full analysis envelope.

Limits are **per process**, shared by all admitted users and not keyed by IP. Forwarded headers cannot bypass them. Multiple workers/replicas multiply effective limits; restarts reset the window. Fixed windows allow boundary bursts. These controls are not distributed rate limiting, DDoS protection, calibrated credit billing or per-user quotas. Configure stricter gateway/provider spend limits, header/body timeouts, TLS and network restrictions before public use. Unauthorized traffic can still consume HTTP-server resources; public health/readiness also needs gateway protection.

## Offline validation

`tests/backend/test_analysis_access.py` covers fail-closed configuration, secret-safe repr/errors, authentication before oversized body handling, duplicate headers, unchanged health/readiness/CORS, dependency gating after admission, fixed-window rate reset, forged forwarded addresses, concurrency saturation, cancellation and timeout slot release. Tests use synthetic tokens, no `.env` and no provider calls.

```sh
uv run --no-sync pytest tests/backend/test_analysis_access.py -q
uv run --no-sync pytest -q
docker build --tag setu-backend:protected .
python3 scripts/smoke_backend_container.py setu-backend:protected
```

Local verification: **906 Python tests passed**, including 16 new access/pipeline checks; lint/format passed. Docker build and the existing isolated smoke passed. An additional network-none protected container check returned 401 without authorization, preserved the authenticated missing-model 503, and rejected the next admission with 429. No external provider requests were made. Two existing upstream deprecation warnings remain.

The existing Docker smoke runs default local mode with no network or credentials; it remains a regression check, not protected deployment acceptance. This change does not resolve live model/source/language acceptance or actual hosting. Issues 29 and 30 remain incomplete.
