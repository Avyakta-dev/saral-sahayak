# Demo acceptance hardening — 2026-09-13

## Baseline and scope

Started from `origin/main` at `1fcd433` on `task/demo-acceptance-hardening`, preserving the previous task branch. The user authorized priority engineering and testing; a separate bot owns PR publication/merging. No live deployment is part of this pass.

Baseline offline Python suite: **1,330 passed**, with two dependency deprecation warnings. This supersedes earlier local-demo counts and the historical two inventory failures, which are not present in this baseline.

## Bounded current-model baseline

Ran the repository acceptance runner with only three fixed synthetic English inputs, Responses streaming enabled, a 60-second request limit, a 45-second per-call limit, and **12 provider calls maximum across the matrix**. Credentials, endpoint, model identifiers and raw provider output were not included in the report. The runner bypasses history and tests the actual model/agent/file-tool path, not browser rendering or image upload.

| Case | Expected | Observed | Calls | Duration |
| --- | --- | --- | --- | --- |
| Initials/name mismatch | success | success | 3 | 14.61 s |
| Ambiguous KYC | clarification or unsupported | success — failed acceptance | 3 | 11.40 s |
| Unknown ZX-999 | clarification or unsupported | needs_clarification | 6 | 19.29 s |

This matrix **did not pass**. Source-pair completeness was being treated too strongly as a reason to finish with success. Valid citations are not proof that the input contains enough facts to distinguish similar causes. Semantic and language quality remain unverified by status matching alone.

## Post-correction bounded live retest

The same three cases were rerun under the same 60/45-second limits and a fresh 12-call total ceiling after correcting the model instructions. Every finish/repair path now distinguishes citation completeness from applicability; missing discriminator facts require clarification or abstention. Model-only state validation mirrors the public outcome constraints; citation checks and the one-repair limit remain intact.

| Case | Observed | Calls | Duration |
| --- | --- | --- | --- |
| Initials/name mismatch | success | 3 | 14.19 s |
| Ambiguous KYC | needs_clarification | 8 | 26.00 s |
| Unknown ZX-999 | unsupported | 1 | 5.08 s |

**All three expected statuses matched on this run.** The runner still reports `semantic_verified: false` and `language_quality_verified: false`. This is one passing English status matrix, not a reliability rate or an independent review of advice. Baseline plus retest consumed 24 provider calls total; no image/cloud requests were made. A separate real HTTP/SSE follow-up through the Vite proxy returned `needs_clarification` for ambiguous KYC in **11.68 seconds**, with ten actual activity events. Its questions asked which KYC item and exact status were affected, distinguished upload from verification, and explicitly excluded personal identifiers. This additional request used the existing per-request model/tool/time ceilings; its exact provider-call count was not recorded by the HTTP check.

## Work boundaries

- Cache hardening preserves session history but disables response reuse by default until an explicit trusted scope is supplied. Details and images must bypass cache reads and writes. See [history/cache handoff](../HANDOFF-history-cache.md).
- Image lifecycle hardening is separate from proving the cloud bucket is configured. Current local settings have image input enabled and a destination present, but `IMAGE_LIFECYCLE_CONFIGURED=false`; image capability therefore remains intentionally unavailable. This flag must not be changed merely to bypass readiness. The operator must verify bucket privacy, cleanup/lifecycle policy and browser upload origin configuration first.
- Local image flattening removes active structure/metadata; it is not personal-data redaction. Do not claim that reviewed original-file upload satisfies a locally redacted screenshot contract.
- UI translations and generated multilingual answers still require independent native-language review. Policy assertions and recorded source gaps still require authoritative-source review.

## Engineering validation

The combined post-hardening Python suite passed **1,416 tests** before the final image exception-context follow-up, with the same two dependency deprecation warnings. Ruff lint and formatting passed after formatting the new code with the project toolchain. Cache tests cover exact text/session/scope matching, expiry, details/image bypass, mutation isolation and metadata-only persistence. Image tests cover cleanup deadlines, repeated cancellation, stale tickets, malformed storage replies, EXIF orientation and metadata stripping. These remain offline tests.

Independent local review found and prompted a follow-up for image exception objects retaining private SDK context despite sanitized display text. The follow-up detaches safe exceptions rather than merely suppressing traceback display. Final combined Python validation after that follow-up: **1,436 passed**, two existing dependency deprecation warnings; Ruff lint/format checks and patch whitespace checks passed. The focused image/native-adapter suite includes 245 passing checks. Standard frontend build/format/unit validation passed **900 tests**, preview browser tests passed **160 tests** (including 36 accessibility scans), and live/locale browser tests passed **50 tests** using synthetic API/storage responses. The extension suite passed **378 tests**. Some newly merged readiness/failure status strings still remain English; this pass localized 16 additional controls/disclosures across all six dictionaries, not every remaining operational string.

## Follow-up verification

Fresh supported-case runs returned success in English (19.78 seconds, four model calls) and Kannada (21.54 seconds, two calls). AI-assisted comparison of the actual response prose to the cited `epfo-rr-001.md` excerpts found both omitted an explicit same-day resubmission restriction from the cited Fix section. These status successes therefore **failed strict caveat-preservation review**. Kannada also overstated the input as an exact quoted remark and used substantial English terminology. This review is not an authoritative-policy or native-speaker certification.

A general evidence-fidelity instruction was then added to the prompt and repair path: retain action prerequisites/prohibitions/timing/authority caveats, avoid treating narrated input as a verbatim quotation, and prefer plain requested-language prose. A capped eight-call retest used seven calls total: English success in 21.30 seconds (five calls), Kannada success in 14.62 seconds (two calls). AI-assisted comparison found the English response aligned with the cited corpus and preserved the missing same-day restriction in both actions and draft. Kannada also preserved that restriction but still attributed Form 19 coverage to an explanation whose attached excerpts did not contain that statement (the source's Classification section did); “exact remark” wording and plain-language quality remained imperfect. **English bounded corpus alignment passed this review; Kannada strict claim-level alignment did not.** Neither finding certifies official policy or independent native-language quality. No additional prompt-tuning loop was performed. The first English/Kannada pair used six provider calls; the corrective pair used seven. Raw synthetic response artifacts stayed in restricted temporary files outside Git; the report records conclusions rather than provider-owned reasoning or credentials. The post-fidelity Python suite passed **1,442 tests**, with the same two dependency deprecation warnings.

Read-only R2 preflight used the correct project runtime (`uv run --no-sync python`); boto3/botocore are available. The configured destination has the shape of a Cloudflare public-delivery hostname, not a recognized R2 S3 API endpoint. No credentials were sent and no network/cloud calls were made. The operator must provide/confirm the actual S3 API endpoint before authenticated read-only policy checks. Bucket lifecycle, CORS and public-access status remain unknown, and the lifecycle attestation remains false. In Cloudflare, use the bucket/account's **S3 API endpoint**, normally `https://<account-id>.r2.cloudflarestorage.com` (or the documented jurisdiction-specific API endpoint), not a public `r2.dev` or custom delivery URL. Confirm the endpoint privately; never paste credentials into chat. Only then can read-only lifecycle/CORS/access checks be performed. No flag or destination was changed during this preflight.

## Remaining interface coverage follow-up

Added 102 further operational messages to all six dictionaries, bringing each to **361 keys**. Readiness states, missing-configuration reasons, refresh limits, safe errors, manual retry copy, sample-gallery labels, confidence notes, download feedback and export labels now use the interface locale. Existing user/model/sample prose, citations, URLs and identifiers are preserved. Locale changes do not initiate model requests.

The live error boundary now maps messages by safe code and displays only allowlisted canonical error identifiers; unknown error-code prose is hidden. Explicit sample error text remains illustrative content. A local reviewer confirmed the raw-code disclosure fix by source inspection. Final standard frontend validation passed formatting/build and **916 unit/component tests**, **160 preview browser tests**, and **62 live/locale browser tests**. All six catalogs passed key/placeholder parity at 361 keys each. Browser tests used synthetic API/storage responses; no R2 or model requests were made by those suites. Native-language quality remains independently unverified.

## Post-push claim-level citation follow-up

After publishing the hardening checkpoint, a six-line generic prompt/repair rule was added: every source-backed factual clause must be supported by its attached exact excerpt IDs; a relevant statement elsewhere in the same file or history is insufficient. The model should attach the already-read supporting section or omit that clause, and distinguish user-reported facts from source attributions. Six language-parameterized instruction regressions were added; the full Python suite passed **1,448 tests**, with the same two dependency deprecation warnings.

One capped Kannada retest used six provider calls and returned `unsupported` in **23.44 seconds** on the supported initials case. It withheld guidance and a draft, but this **does not pass supported-case acceptance**. The rule is a defense-in-depth instruction, not semantic citation enforcement or proof of multilingual readiness. Further model evaluation is still required; no successful Kannada acceptance is claimed by this follow-up.

## Acceptance interpretation

Offline mocked browser/storage tests do not prove model output quality, bucket lifecycle, successful cloud uploads or deployment. Repeatable synthetic live status checks are a narrower gate, not certification of every rejection case. Keep unsupported and ambiguous cases fail-closed; never substitute fictional example output for a failed real request.
