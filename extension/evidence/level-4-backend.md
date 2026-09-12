# Extension Level 4 — backend transport evidence and blocker

Owner: Ajay. Related to issue 9 under revised acceptance. Date: 2026-09-12. Status: **blocked/incomplete network acceptance**, not a passing live flow.

## Actual browser observation

In the installed Chrome 152.0.7977.83 toolbar popup, after clearing synthetic input, pressed **Connect backend**. The actual worker attempted capabilities discovery and the popup displayed:

> Cannot reach Saral Sahayak at http://127.0.0.1:8000. Start FastAPI, then connect again.

The language selector and Analyze remained disabled. No success, synthetic advice or provider fallback appeared. This is evidence of real unavailable-backend handling, **not** an observed HTTP 503 or successful analysis.

## Evidence boundaries

| Requirement | Available evidence | Result |
| --- | --- | --- |
| Honest connection failure | Actual unpacked Chrome popup showed the above failure after explicit Connect | PASS |
| No fabricated language capabilities | Selector stayed unavailable after failure | PASS |
| Only reviewed text/language in Analyze | Production source plus issue 7 fake-runtime call assertions | PASS for UI message boundary; actual HTTP trace NOT RUN |
| Capabilities without user body | Production `transport` uses GET without body; explicit popup action observed | Source-reviewed; network capture NOT RUN |
| Genuine missing-model/corpus 503 | Needs runnable backend with controlled configuration | NOT RUN |
| Supported/clarification/unsupported live analysis | Needs configured backend and approved provider evaluation | NOT RUN |
| No ambient credentials, redirects, retries | Source uses omit/error/no retry; not packet capture | Source-reviewed only |
| Browser request size/cancellation/latency matrix | Existing VM coverage is not installed-extension HTTP evidence | NOT RUN as full network acceptance |

The earlier native Windows startup attempt failed on POSIX `os.O_DIRECTORY` in knowledge-file tools. Current main adds a Docker deployment path, but `docker` was not available on this shell path, and `wsl --list --quiet` returned no listed distributions. No Docker/WSL installation, backend rewrite, `.env` read or provider request was performed to bypass the blocker. Existing Python acceptance reports are other runs, not this machine's browser evidence.

## Newly merged backend access boundary

Main now includes `docs/protected-analysis.md`: public deployments require a separately authenticated gateway; the server-to-server access token must never be put into the extension, frontend settings or CORS. This extension's fixed loopback development destination has no such browser-authenticated gateway integration. Protected 401/429/outer-504 small envelopes must remain honest errors; never copy the server token into browser code to make a demo pass. Current generic unexpected-HTTP fallback is not full deployed-gateway UX acceptance. No endpoint or auth setting was changed here.

The backend deadline is now configurable; the extension still has its own 35-second client timeout. A deployment must coordinate compatible timeout semantics rather than imply the longer server configuration guarantees client success. That configuration was not changed in this evidence task.

No HAR, provider endpoint/key, personal remark, image or real claim data is recorded. Required remaining work: a runnable approved backend environment, sanitized request observations from the real extension, and explicit model/dependency outcomes. Issue 9 remains open for reviewer acceptance.
