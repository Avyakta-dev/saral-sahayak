# Vercel frontend hosting preparation — issue #30

## Status and scope

**Not deployed. Live integration remains blocked.** This prepares hosting for the existing React/Vite preview only. It does not implement Shravya's #25 API integration, complete Anish's #29 acceptance, or close #30. See the [frontend integration boundary](../frontend/README.md#integration-boundary) and [live acceptance status](live-acceptance-status.md).

The frontend sends no analysis requests and reads no API-base environment variable. In particular, setting `VITE_API_BASE_URL` does not connect this app. User text/images stay in browser memory; only the explicit example action loads synthetic guidance. Hosting does not add OCR, provider access, accounts, downloads or live-government integration.

Frontend hosting and backend Docker packaging are independent changes/PRs. This configuration neither packages nor deploys the backend, and does not depend on a Docker file from another branch. No deployment, domain binding, provider request, commit or push is authorized by this guide.

## Vercel project settings (when deployment is authorized)

Import the Git repository, retaining its directory layout. Use these settings:

| Setting                           | Value                                               |
| --------------------------------- | --------------------------------------------------- |
| Root Directory                    | Repository root (`.`); do **not** select `frontend` |
| Framework Preset                  | Vite                                                |
| Node.js version                   | 22.x (local prerequisite: 22.17+)                   |
| Install Command                   | `npm --prefix frontend ci`                          |
| Build Command                     | `npm --prefix frontend run build`                   |
| Output Directory                  | `frontend/dist`                                     |
| Application environment variables | None required for this preview                      |

The root [`vercel.json`](../vercel.json) supplies the framework, install/build commands, output directory, rewrite and headers. Keep project overrides consistent with it. Explicit commands avoid relying on root package-manager detection: the committed npm lockfile is in `frontend/`. Node version is a project setting, not a `vercel.json` field.

**Why repository root:** `frontend/src/lib/demo.ts` imports four JSON fixtures from `docs/examples/`, outside `frontend/`. Selecting only `frontend` without including external source files can break the build. The chosen root configuration makes both directories available without an external-files toggle, copying fixtures or changing Vite's filesystem policy. Do not use the frontend-directory setup with these root-relative commands.

Only `frontend/dist` is published, not the repository, backend, knowledge corpus or private originals. The four imported synthetic examples become bundle content; they are intentionally public test data, not runtime knowledge. Prefer an authorized clean Git import, not a CLI upload from a workspace containing local secrets or private claim files. Vercel preview URLs may be publicly reachable: verify access settings before sharing, and use fictional/redacted inputs only. Hosting configuration does not suppress hosting-platform request logs.

## Routing and conservative headers

The configuration uses Vercel's documented SPA fallback, `/(.*)` to `/index.html`. Existing generated assets are served normally; unmatched paths load the app shell on direct navigation/reload. This app currently has no separate routed pages. An `/api/...` path is **not** a backend endpoint: the fallback can return HTML, not API JSON. No proxy, serverless backend, CORS override or authentication bypass is configured.

All paths receive:

- `X-Content-Type-Options: nosniff` — prevent MIME sniffing.
- `Referrer-Policy: no-referrer` — do not send the page URL as a referrer.
- `X-Frame-Options: DENY` — prevent framing of this standalone preview.
- `Permissions-Policy: geolocation=(), microphone=()` — disable unused location and microphone access. Camera/file selection and clipboard behavior are not disabled by this policy.

No custom long-lived cache policy or untested CSP is added. Review headers with future integration changes rather than weakening privacy controls to make a demo appear live. Local Vite dev/preview does not apply Vercel headers or prove Vercel routing behavior.

Official references: [Vite SPA rewrites](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas), [project configuration](https://vercel.com/docs/project-configuration), and the [configuration schema](https://openapi.vercel.sh/vercel.json).

## Local checks

From the repository root:

```sh
npm --prefix frontend ci
npm --prefix frontend run check
npm --prefix frontend run test:e2e
```

`check` includes formatting, TypeScript/Vite production build and unit/component tests, including the focused hosting configuration tests. E2E uses the existing Playwright desktop/mobile suite and installed Chrome by default. If version-matched Chromium is already installed, use `PLAYWRIGHT_CHANNEL=chromium npm --prefix frontend run test:e2e`. See [browser prerequisites](../frontend/README.md#tests); installing system dependencies is not part of this hosting task.

For manual local inspection after building, run `npm --prefix frontend run preview` and open `http://127.0.0.1:4173`. These checks require no model keys or analysis backend. A local pass is not a deployment, hosted-header or live-analysis pass.

After a separately authorized Vercel deployment, record these currently **not-run** hosted checks before approval:

1. `/` and a fresh nested-path reload render the preview, with working JavaScript/CSS assets and the four expected headers.
2. Explicit sample guidance stays labelled synthetic; sending fictional text or selecting a synthetic image shows the honest disconnected behavior and sends no analysis/upload request.
3. Mobile/keyboard interaction and source/copy controls still work. Do not treat the SPA fallback at `/api/...` as an API health check.
4. Record the actual deployment URL, revision, access settings and results; do not invent a domain or claim deployment from a successful build.

## Later HTTPS Docker backend integration — separate approval

- Deploy the separately packaged backend behind an approved HTTPS endpoint; a Docker container alone does not provide public TLS or access control. Keep provider endpoints/keys and other backend secrets server-side. Never put secrets in `VITE_*`, the frontend bundle, committed configuration or browser requests; Vite-prefixed values are public build-time data.
- Before exposing provider-backed analysis publicly, require independently tested authentication/access protection and abuse controls (including rate/concurrency/cost limits) at the backend or approved gateway. Current CORS is not authentication. Protecting only the Vercel preview does not protect a separately reachable backend. Do not publish an unprotected provider-funded endpoint.
- Anish must approve the **actual exact** HTTPS frontend origin(s) in backend `CORS_ORIGINS` (JSON array). Include only deliberately approved production/preview origins, with scheme and optional port but no path, query, fragment or trailing slash. No wildcard Vercel domains, `*`, reflected origins or automatic trust of every preview. Leave CORS unchanged until origins are known.
- The current backend allows GET/POST and Content-Type with credentialed CORS disabled. Adding browser authentication or credentials requires an explicit shared contract/security review, not a CORS or auth bypass. See the [implemented backend contract](backend-contract.md#cors-and-remaining-integration).
- Shravya's #25 must implement and test genuine transport, capabilities-driven languages, current citation columns and strict response/error handling. Agree the API-base configuration then; no existing environment-variable transport is assumed. Preserve missing-configuration/readiness failures, clarification and abstention; never silently replace failures with fixtures.
- #29 still needs authorized, bounded live provider/grounding acceptance, followed by the required language/source review. Health/readiness or `analysis_available` proves configuration/structure only, not connectivity, successful guidance or fluent output. A Vercel build or Docker packaging pass does not satisfy these gates or close #30.
