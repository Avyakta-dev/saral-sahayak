# Docker backend preparation — issue #30

## What this provides

A non-root Python 3.12 production image for the existing FastAPI backend, using immutable base-image digests and `uv.lock` production dependencies. Only `backend/` and the public 186-file Markdown corpus are copied into the runtime image. The default command listens on port **8000**. It runs without repository mounts, a writable application directory, developer tools or a credential file.

This is packaging and local smoke-test preparation, **not a deployed or accepted live demo**. Policy/source verification and independent six-language quality acceptance remain open. The main web UI can call live analyze when pointed at a running API (`VITE_API_BASE_URL`; see [demo-runbook.md](demo-runbook.md)); Docker packaging alone does not wire that path or satisfy Level 3 demo acceptance. OCR, uploads and downloads are not implemented by this work.

## Build and isolated smoke test

Use a clean reviewed checkout, Docker Engine/Desktop with Linux containers, and Python 3.12+ on the host. Run from the repository root:

```sh
docker build --tag setu-backend:local .
python3 scripts/smoke_backend_container.py setu-backend:local
```

The build downloads pinned base images and locked Python packages; no provider credentials or real user input are required. The smoke container has **no external network, no published ports, no secrets, read-only root filesystem, all capabilities dropped and no-new-privileges enabled**. Requests run through loopback inside the container. The script checks liveness, honest dependency errors, the included corpus, capability flags, exact-origin CORS, malformed/oversized requests, non-root execution and absence of private application material/dev dependencies. It removes only the uniquely named container it created, even on failure. The image remains available locally. The dedicated GitHub workflow builds and runs the same smoke; it never pushes an image or deploys.

## Local HTTP check without a model

```sh
docker run --rm --name setu-backend-local \
  --read-only --cap-drop ALL --security-opt no-new-privileges:true \
  --pids-limit 64 --memory 256m --cpus 1 \
  --publish 127.0.0.1:8000:8000 setu-backend:local
```

Open `/health/live`, `/health/ready` and `/api/v1/capabilities` at `http://127.0.0.1:8000`. Liveness is 200; readiness and analysis are 503 without model configuration. This is intentional. Docker's healthcheck uses **liveness**, so missing credentials do not cause a restart loop. A healthy container is not proof that analysis works. Readiness only combines model configuration and corpus structure; connectivity and content/translation quality flags remain false.

The backend has no `PORT` environment setting. Map your host/platform service port to container port 8000, or supply a reviewed command override and corresponding healthcheck override together. Do not change only the port and leave the healthcheck probing the old one. One worker is the default; increased concurrency requires resource and credit-budget evaluation, not an assumption based on this smoke test.

## Later hosting configuration

The Docker host/provider and public backend domain are not selected here. Before enabling a paid model on a publicly reachable backend:

1. Put the container behind an HTTPS reverse proxy/service endpoint. Keep the raw Docker port private. The default disables proxy-header trust; if the deployment needs forwarded headers, explicitly trust only the actual proxy addresses in a reviewed command override, not arbitrary clients.
2. Enable [protected analysis mode](protected-analysis.md) for the gateway-to-backend connection and add independently tested user authentication and distributed rate/cost limits at the gateway. Protected mode supplies a server token and per-process admission limits only; default local mode remains unrestricted. **CORS is not authentication and does not prevent credit abuse from non-browser clients.** Do not expose an unrestricted paid-model endpoint.
3. Inject operator-provided model settings at runtime via the host's secret manager or a local ignored environment file; never use Docker build arguments, image `ENV`, Git or Vercel frontend variables for keys. Docker host administrators can inspect container environment values, so protect host access. Use exact names from `.env.example` and `docs/backend-contract.md`; no provider-specific aliases are assumed.
4. Set `CORS_ORIGINS` to a JSON array of exact approved frontend HTTPS origins, without trailing slashes, paths or wildcards. The documentation-only shape is `["https://your-project.vercel.app"]`; replace it with the actual selected origin. Each preview domain needs separate approval. Do not broadly allow all Vercel projects. Keep browser credentials disabled under the current contract.
5. Keep request and proxy timeouts aligned with the reviewed backend contract. Defaults remain a 30-second analysis request deadline and 25-second model-call timeout; `ANALYSIS_REQUEST_SECONDS` / `LLM_TIMEOUT_SECONDS` are configurable up to 120 for authorized live retests. Packaging neither verifies longer live calls nor closes issue 30.
6. Run an explicitly authorized, bounded synthetic acceptance matrix before describing the service as live-ready. Never paste API keys in chat or use real claim documents for deployment smoke tests.

## Build and runtime privacy

`.dockerignore` starts deny-all and permits only lock metadata, backend code and public knowledge. It additionally excludes nested `.env*`, private-key files and Python caches. The final stage uses explicit copies, never `COPY . .`. Private originals, source/archive datasets, docs, frontend assets, Git/tool metadata, uploads and generated user documents stay outside the image. The builder's TLS trust store includes public CA certificates as a dependency; it is not a private credential bundle.

Build only reviewed commits: a new private file placed inside an allowed code/corpus tree still needs review. Do not mount the whole repository or replace the public corpus with a symlink. The application user cannot alter root-owned code/evidence; `--read-only` is also used in the smoke and recommended runtime command. The app needs no persistent volume. Access logging is disabled by default to avoid persisting client addresses/URLs; configure any gateway/application logging to exclude request bodies and credentials.

Update the Python and uv image digests deliberately when security updates are available, then rerun the build and smoke. Digest pinning is reproducibility, not vulnerability certification.

## Verified locally

On 2026-09-12, the image built successfully on Linux/amd64 with Docker Engine 29.2.1. The network-isolated smoke passed all health, dependency, capability, CORS, malformed/oversized input and filesystem checks above. The full Python suite passed **886 tests** in Python 3.12 (two upstream deprecation warnings); Ruff lint/format, generated corpus validation and the 181-record/9-case/6-gap review inventory check passed. This is local container evidence, not a hosting or provider compatibility claim. Other architectures and native Windows Docker Desktop have not been tested here.

## Acceptance limits

No registry push, Vercel project creation, production deployment, provider request or source URL fetch is part of this preparation. The separate image/extension/frontend milestones remain with their owners. Neither #29 nor #30 should be closed merely because this image builds.
