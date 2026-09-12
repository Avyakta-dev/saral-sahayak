# Analysis activity stream

`POST /api/v1/analyze/stream` accepts the same `AnalyzeRequest` JSON body as
`POST /api/v1/analyze`. The existing non-stream endpoint and its response contract
remain unchanged. This endpoint streams host activity, **not answer tokens**.

## Gates and final output

The stream reuses the normal request schema, 32,768-byte request-body limit,
enabled-language check, model-configuration check, corpus structural-readiness
check, service lifecycle, CORS policy, agent budgets and final response validation.
An injected client does not bypass configuration or knowledge readiness.

Failures before streaming retain the normal HTTP status and JSON envelope:
413 for an oversized body, 422 for invalid schema or disabled language, and 503
for unavailable dependencies. Schema/body errors use the existing compact error
envelope; language/readiness errors use `AnalyzeResponse` with `status: "error"`.

After these gates, HTTP 200 has `Content-Type: text/event-stream`,
`Cache-Control: no-store`, and `X-Accel-Buffering: no`. The server sends zero or
more `activity` events, then exactly one `result` event containing the complete,
validated `AnalyzeResponse`, then EOF. Failures after headers have been sent
produce a sanitized `status: "error"` response in that final event; HTTP 200 alone
is not analysis success. An interrupted connection need not receive a result.
EOF without a result must be treated as cancellation/transport failure, not as
success. There is no automatic retry, heartbeat, event replay or persistence.

Each frame consists of an event name and **one JSON data line**, separated from
the next frame by a blank line. JSON escapes embedded CR/LF so strings cannot
inject additional SSE frames. Decode UTF-8 incrementally: a network chunk can
split anywhere inside a frame, JSON value or multibyte character.

```text
event: activity
data: {"phase":"reading","path":"references/knowledge/epfo/README.md","heading":"Index","start_line":1,"end_line":2}

event: activity
data: {"phase":"thinking","turn":1}

```

The example above is illustrative synthetic metadata, not a claim about an
actual production read. Final frames use `event: result` and `data:` followed by
the ordinary `AnalyzeResponse` JSON, with its existing nullable fields intact.

## Activity metadata

Allowed fields are:

| Field | Contract |
| --- | --- |
| `phase` | `thinking`, `reading`, `searching`, or `validating` |
| `turn` | Optional positive integer, emitted on actual model starts and final-output validation attempts |
| `path` | Required for `reading`; canonical repository-relative public Markdown path under `references/knowledge/epfo/` |
| `heading` | Optional exact ledger context heading; never a model-requested title or fabricated summary |
| `start_line`, `end_line` | Required for `reading`; actual positive, inclusive line range, end not before start |

Absent activity fields are omitted, not serialized as null. Unknown fields are
forbidden. Read paths reject traversal, hidden components, backslashes, `%`, `?`,
`#`, `:`, control/format characters, and non-Markdown targets. Path length is
bounded to 1,100 UTF-8 bytes. Heading length is bounded to 1,024 UTF-8 bytes;
unsafe/oversized headings are omitted, not truncated into a different title.
Clients must render metadata as text, never HTML or executable Markdown.

- `reading` is emitted **only after a successful bounded host read**, using its
  immutable evidence-ledger snapshot. This includes the initial index read.
  One read emits one event, not an event per nested heading. The heading is the
  ledger context for the returned range; a range can span nested sections or
  contain only part of a line. These fields do not claim whole-file reading.
- `searching` is emitted only after a successful host directory listing. It has
  no path, entries, requested arguments, or excerpt contents.
- `thinking` is emitted at an actual model invocation, never for a model plan.
- `validating` is emitted when the host begins validating a candidate final
  object and evidence references. A validation attempt may fail and require the
  existing bounded repair; it is not a promise of a successful answer.

No raw model tokens, partial answers, tool arguments, excerpt text, user input,
credentials, model/provider identifiers, evidence IDs or source URLs are included
in activity. Final cited content remains governed by the ordinary response
contract. Public corpus headings are untrusted public text, not instructions.
Activity means work occurred, **not** that sources were freshly fetched,
semantically verified, or approved by EPFO, and does not certify language quality.

## Bounds and cancellation

At the normal 12-tool-call and 12-model-turn limits there can be at most 36
activity events (successful tool work, model starts, and validation attempts).
The index read is included in the 12 calls; failures do not fabricate read events.
An independent transport cap permits at most 128 activity events even if a
caller injects larger test/service limits. The request-local buffer cannot exceed
that count; the one final result is handled separately. Overflow cancels and
awaits the analysis task, then emits a sanitized `budget_exhausted` error result.
Buffering never blocks the synchronous tool callback or creates per-event tasks.

The response watches disconnects while waiting for the provider, including ASGI
2.4 connections that have not attempted another send. Disconnect, request-task
cancellation, or failed transmission closes the stream iterator, cancels and
awaits its single producer, and propagates cancellation into the provider await.
Request-local knowledge descriptors close through the existing service context
manager. No analysis task is deliberately left running after cancellation. Local
filesystem operations remain synchronously/cooperatively bounded; uninterruptible
kernel calls have the same existing limitation as the ordinary analysis endpoint.

The optional `AnalysisService.analyze(..., activity=observer)` callback is fast,
synchronous, request-local and non-persistent. Its immutable allowlisted events
are entirely separate from the existing **identifier-free diagnostics** callback.
Observer exceptions cannot alter analysis; accidental returned coroutines are
closed rather than scheduled. Observers must not block, create work, or cancel
the analysis task.

## Offline verification

`tests/backend/test_analysis_activity.py` uses synthetic Markdown and fake models;
no live source/provider requests or developer credentials are needed. It covers
real read ordering and ranges, continuations, failed reads, privacy/field bounds,
readiness gates, final validation and errors, multiline framing, overflow, live
progress before completion, and disconnect/send/task-cancellation cleanup.
These tests establish mechanics, not live provider acceptance or policy accuracy.
