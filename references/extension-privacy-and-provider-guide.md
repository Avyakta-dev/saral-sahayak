# Extension privacy, placeholders and provider choices — requirements handoff

## Status, owners and track boundaries

This is a **future requirements and acceptance guide, not an implementation report**. It creates no capture feature, vault, provider setting, uploader, companion, credentials or test results. Work on one explicitly requested level, report evidence and stop. Do not run providers, install dependencies, read secrets, publish or change shared contracts through this handoff.

| Owner | Responsibility |
| --- | --- |
| Ajay — `Ajay-B-Acharya` | Extension privacy implementation: capture/redaction, isolated client vault, placeholder validation/restoration, provider transport and security tests; image/OCR implementation remains his separate track. |
| Avyakta — `Avyakta-dev` | Extension UI: privacy controls, preview/result renderer, provider-mode presentation and accessibility. Existing knowledge curation/evidence role remains the priority while its PR is pending; UI work must not imply that PR is merged or knowledge is verified. |
| Shravya — `Shravya2820` | Retains the main web frontend and its UX. Coordinates shared terminology/citations/accessibility with Avyakta and Ajay; this is not a web ownership transfer. |
| Anish — `iotserver24` | Approves shared backend/API, model protocol, grounding, security and budget contracts. No extension task silently changes these. |

Keep the [original Extension Levels 1–5](ajay-extension-guide.md) and [Image Levels 1–5](ajay-image-input-guide.md) unchanged as separate tracks. The original extension track is text/selection plus the existing backend, not screenshot capture or custom model access. The image track is a proposed controlled URL-only image API, not an uploader. **Extension Privacy Levels 1–5** below add advanced requirements; **Extension UI Levels 1–3** are Avyakta's separate UI milestones, not replacements for knowledge Levels 1–3. A level number never marks another track complete. Planning/mocks can proceed independently when requested; integration requires the relevant reviewed contracts and components.

Read [AGENTS](../AGENTS.md), [contribution ownership](../CONTRIBUTING.md), [team levels](team-work-levels.md), [reference index](README.md), [architecture](planning/markdown-agent-design.md) and [current backend contract](../docs/backend-contract.md). This guide specifies future extension privacy/provider scope; it does not override the architecture's grounding rules or broaden the current API. Any shared change needs Anish's approval first.

## User-visible flow and minimum data contract

1. The user explicitly chooses the page area/eligible fields and requests capture. Opening the popup, navigation and selection changes must not collect data.
2. Keep only approved restorable values in an isolated, in-memory extension vault. Replace them with request-bound placeholders before any AI boundary. Never collect prohibited secrets for that vault.
3. Produce a new, locally flattened, sanitized bitmap of only the approved area. Show a manual preview and allow more masking, cropping or cancellation. Never send the original screenshot.
4. Show the selected mode, actual destination/provider, what will leave the device and known limitations. A separate **Analyze** action approves exactly the reviewed redacted payload.
5. The model may fill a safe template with approved placeholder tokens, not reconstruct private values. Validate its output before local restoration. Show the restored result only locally for user review.
6. Any eligible page-field fill needs a **separate explicit Fill action**. It is not submission. Submission remains a distinct manual user action; never automatically submit, click, navigate or execute a model instruction.

### Masks are local presentation, not the AI protocol

- Show at least three stars for a masked local preview, with a fixed default such as `***`, independent of the value's length. Do not encode length in star count, placeholder length, metadata or mask dimensions; use uniform blocks/whole-field regions where necessary.
- Optional first/last-character preview is **off by default**, explicit per-field opt-in, only for sufficiently long **non-sensitive** fields after the user previews them locally. Agree a conservative minimum length in Privacy Level 1; shorter, unknown or sensitive fields get full masking. First/last characters must never enter AI text, screenshots, logs or metadata, even after preview opt-in.
- Client variable names represent local slots, not values. Map them to opaque, unpredictable, request-bound tokens. AI sees only those tokens, a boolean `filled` flag (whether an approved local value is present), and allowlisted safe labels such as “applicant name”. The flag is not permission to fill/submit. Do not forward raw DOM names/IDs, selectors, URLs, sensitive labels, actual values, first/last characters, star counts or value-length metadata.
- Review/redact free text and image text too: hiding a form input does not sanitize a rejection paragraph, tooltip, background image or error message. Fail closed if sensitive content cannot be safely excluded. Use synthetic fixtures only.
- **Passwords, OTPs, authentication cookies/tokens and API keys are never collected as page content, restored, or sent to a model.** Provider authentication keys entered intentionally in trusted settings are a separate transport-only secret, never a model input. Do not infer or guess missing identifiers; unresolved placeholders remain unresolved with clear feedback.

## Capture boundary and honest limitations

Capture is only allowed after a user gesture using temporary `activeTab` authority and the minimum reviewed permissions. No continuous capture, background scraping, full-tab history or silent retries. Reject restricted pages and offer paste/crop/cancel rather than broadening access.

DOM masking alone is insufficient: page scripts can race changes and pixels may contain images, canvas content, shadow DOM, overlays or cross-origin frames. A future capture design must sanitize **pixels locally** and flatten replacements into a new raster, not send removable overlay layers. Keep the original browser screenshot immutable, internal and transient; never transmit or persist it, including debug paths, thumbnails, error reports or telemetry. Destroy temporary originals promptly; cancellation/close discards artifacts. Analyze must use the exact reviewed sanitized bitmap and invalidate it when source/page state changes.

Uncovered cross-origin iframes, canvas, images, inaccessible shadow trees and unknown sensitive regions are **deny-by-default**. Mask the entire unverified region, crop it out, or block capture; never assume inaccessible content is safe. If coverage, page-version consistency or pixel sanitization cannot be established, block and explain. Manual preview is mandatory but is not a substitute for these controls. Document residual risks from dynamic pages, misclassification and visible context; do not promise absolute privacy or perfect detection.

The browser's screenshot API may internally return a base64/data representation. In-memory local decoding is permitted solely to create the sanitized bitmap; this is **not** permission to forward/embed base64 in any API or model payload. The [image contract](ajay-image-input-guide.md#security-contract-to-agree-before-coding) still prohibits base64/data URLs at its boundary. A future authorized uploader could send **only the approved redacted raster** to an approved controlled host and return a signed, narrowly scoped ephemeral URL. Host authorization, expiry, size/type limits, provider fetching and retention require that image track's review. No uploader or image path is implemented or authorized here; until available, image transmission stays disabled. A loopback model endpoint does not relax the image-host rules.

## Client vault, output validation and restoration

- Vault values live only in extension-isolated memory, never page globals, DOM attributes, content-script shared state, sync storage, localStorage, IndexedDB, persistent extension storage, logs, analytics, traces or crash reports. Minimize any narrow field-read boundary; do not expose the vault to page messaging or a generic fetch/fill bridge.
- Bind each approved value/token to **origin, tab, frame, page version and request nonce**, with a finite TTL agreed in Level 1. Clear on expiry, cancellation, close, navigation, origin/frame changes, page-version changes, mode/provider changes or superseding requests. Lost worker/popup state means recapture, not persistence as a workaround. Late responses cannot reuse old bindings.
- Allowlist tokens per request and approved template slot. Treat model output as untrusted plain data: reject unknown, forged, repeated where disallowed, cross-request, malformed or misplaced tokens, unexpected keys and executable content. Enforce bounded output and allowed safe text/structure. Never recursively substitute restored text; a literal value resembling another token remains literal.
- Restore only exact allowlisted occurrences into the local reviewed result. Use escaped/text DOM rendering (`textContent`/text nodes), never `innerHTML`, scripts or model-supplied markup. Never send restored output back in follow-up prompts, retries, diagnostics or exports to providers.
- Page fill is limited to exact, user-approved eligible fields whose bindings are revalidated immediately before the explicit Fill action. The model cannot choose selectors, DOM destinations or actions. Use the field's `.value` assignment only, not HTML injection or a generic script/event executor. Do not synthesize submit/click actions or trigger site workflows. If a site requires automation beyond this boundary, report unsupported and offer manual copy.
- Restoring into a page exposes the value to that page and potentially its scripts: state this before Fill. Do not claim extension isolation protects a value after the user releases it to a page. No automatic financial actions, transfers, claims submission, account/security changes or credential filling. Keep high-impact workflows manual, outside model execution.

## Provider settings, modes and network requirements

Custom **API base URL, model identifier and API key** are future settings for local or remote providers, configured only in trusted extension options, never supplied by a page/content script, model response or imported untrusted document. Model compatibility is not inferred from its name; unsupported protocols/features fail clearly, with no automatic provider fallback.

| Mode | Intended boundary and visible disclosure |
| --- | --- |
| Existing backend mode | Extension calls only the approved backend. Provider keys and model configuration remain server-side. Future backend configuration changes require Anish; an extension key is not forwarded as user content to the backend. |
| Direct model mode (remote or loopback) | Trusted extension context calls an explicitly approved compatible model endpoint; no content-script model calls. The options key is used only as that endpoint's authentication, never in prompts, page messages, URLs, logs or result content. Requires separate approval and protocol/grounding review before enabling. |
| Optional local companion mode | A separately approved local service may hold secrets or run a local model/grounding boundary. It is **not built** and must not be silently installed. Define a narrow authenticated interface; never grant arbitrary shell, environment or filesystem tools. |

- Default key retention is session/in-memory only; no plaintext localStorage or persistent extension storage. An optional OS-keychain-backed companion may be considered separately, but there is no built-in keychain integration claim. Explain session loss and explicit clearing; never echo the key in preview or errors.
- “Local” does not mean private: a local service may forward requests, log them, or listen on the network. Disclose host/provider behavior, retention uncertainty and LAN exposure. Obtain explicit opt-in for the chosen endpoint/mode and any remote routing. Apply **identical redaction and placeholder rules to local and remote models**.
- Default-deny network destinations. Grant incremental exact-host permissions only after endpoint approval, never `<all_urls>` or wildcard-wide access. Enforce exact scheme/host/port and approved path in transport as browser match patterns cannot constrain ports. Reject credential-bearing URLs, unapproved redirects, page-chosen destinations and generic proxy behavior.
- HTTPS is required except an explicitly approved `localhost`/loopback **local service**. Plain HTTP to a LAN/remote host is not the exception. Document service binding, authentication, other local clients and network exposure; no silent discovery or exposure on all interfaces. Validate endpoint changes and clear old consent/results/secret associations.
- Send no page cookies or ambient credentials. Authentication headers go only to their approved endpoint. No automatic requests containing user data on capture, settings edits or mode switching; any connection test needs explicit action and must use no private sample data. Keep demo, backend, direct and companion states distinct, with honest unavailable/error states, not fabricated success.
- Knowledge grounding is unchanged in every mode: bounded read-only public Markdown tools, evidence actually read, host-validated citations, existing budgets, clarification/abstention and readiness gates. A direct/local model without that reviewed grounding boundary cannot offer EPFO policy analysis; expose it as unavailable, not an ungrounded substitute. No full-corpus stuffing, arbitrary filesystem/environment/shell tools or invented EPFO guidance.
- Do not promise faster performance, zero retention or absolute privacy. Report measured behavior only after authorized checks; configuration is not evidence of model compatibility or security.

## Extension Privacy Level 1 — threat contract

**Owner:** Ajay; Anish reviews shared security/API contracts; Avyakta reviews UI implications.

**Small tasks:** map page → isolated vault → sanitized preview → approved destination → validated result → local restoration; classify allowed versus prohibited fields; agree token grammar/slot rules, finite TTL, page-version invalidation, first/last minimum length, pixel coverage and fail-closed rules. Separate provider modes and image-upload dependencies.

**Acceptance/artifact:** a reviewable threat/data-flow contract with explicit prohibited data, trust boundaries, approval checklist and unresolved decisions. Include synthetic acceptance scenarios and proposed file ownership; all runtime checks are planned/not run. Do not create code or enable a provider. Stop for approval.

## Extension Privacy Level 2 — client vault and redacted capture

**Owner:** Ajay; consumes Level 1 approval and Avyakta's UI mocks.

**Small tasks:** when separately authorized, satisfy transient vault/binding lifecycle, click-only scoped capture, local pixel flattening, deny/crop/block behavior and exact-preview consent. Keep transport disabled until a reviewed transmission path exists.

**Acceptance/artifact:** synthetic lifecycle/capture test evidence and sanitized preview examples. Cover prohibited fields, cross-origin frames, canvas/images/shadow/unknown regions, changing pages, cancel/expiry/close and stale capture; demonstrate that original bytes and first/last preview never enter outbound data or debug output. Record uncovered cases as blockers, not privacy guarantees. Stop.

## Extension Privacy Level 3 — placeholder filling and local restoration

**Owner:** Ajay; Avyakta integrates the reviewed result presentation.

**Small tasks:** define/validate the model-visible token + filled-flag + safe-label envelope, then approved template-slot filling and one-pass local restoration. Add separate reviewed Fill only for eligible exact fields; keep submission and high-impact actions manual.

**Acceptance/artifact:** synthetic request/output examples and pass/fail/not-run cases for forged/cross-request/misplaced tokens, literal token-like values, hostile HTML, missing values, stale fields and late responses. Verify no private values or length hints cross the AI boundary, no recursive substitution or automatic actions, and local restored text is not echoed in a later request. Stop.

## Extension Privacy Level 4 — provider settings and modes

**Owner:** Ajay; Anish approves protocols/grounding/shared boundaries; Avyakta owns options UI.

**Small tasks:** satisfy trusted API-base/model/key configuration, session-key handling, explicit mode/destination consent, exact-host transport and compatible capability/error states. Treat an optional companion as a separate reviewed dependency, not an assumed service.

**Acceptance/artifact:** mode/permission/secret-lifecycle matrix and synthetic transport evidence covering remote HTTPS, approved loopback, denied LAN HTTP, redirects, host/port changes, key clearing, provider failures and unsupported grounding. Verify identical redaction in all modes and no key in model content. Live tests require separate authorization; without it mark them not run. Stop.

## Extension Privacy Level 5 — cross-mode security acceptance

**Owner:** Ajay; Anish reviews security/grounding; Avyakta checks extension UI and Shravya shared web consistency.

**Small tasks:** review capture-to-output-to-fill across every enabled mode and browser; exercise injection, secret leakage, lifecycle races, permissions, preview consent, unavailable image paths, inaccessible content and local-service exposure. Recheck original Extension and Image track boundaries without marking their levels complete.

**Acceptance/artifact:** per-browser/per-mode acceptance matrix with expected/observed/pass/fail/not-run, sanitized network observations, limitations, dependency approvals and handoff. Use only synthetic data; do not save secret-bearing HARs or original screenshots. No unsupported privacy/performance claims, automated submissions or silent fallback. Any uncovered sensitive path blocks release. Stop; no publishing/deployment implied.

## Extension UI Level 1 — privacy UX mocks

**Owner:** Avyakta, after the priority pending knowledge PR work is addressed or explicitly rescheduled.

**Small tasks:** mock Capture, mask/crop preview, fixed-star display, explicit first/last opt-in, Analyze, local restored-result preview, separate Fill/manual submission, and provider/mode disclosure. Include blocked/unsupported/restricted-page cases and a clear “not connected” state. Coordinate shared labels with Shravya and data boundaries with Ajay.

**Acceptance/artifact:** synthetic annotated privacy-flow mocks and state checklist. No real secrets, network or claim that mocks implement redaction. First/last is local-only; local mode is not labelled inherently private. Stop.

## Extension UI Level 2 — controls, preview and renderer integration

**Owner:** Avyakta; Ajay retains security logic/transport ownership.

**Small tasks:** integrate approved controls with actual privacy contracts, sanitized bitmap preview, trusted provider options and plain-text result renderer. Show what is sent versus restored locally; invalidate approval on edits, new capture, mode/destination/page changes. Do not duplicate vault logic or render secrets in hidden DOM attributes.

**Acceptance/artifact:** synthetic integrated flow checks for capture → preview → Analyze → local review → separate Fill; mask opt-in, blocked capture, unavailable uploader/provider, cancellation and stale output. No `innerHTML`, automatic transmission or automatic submission. Dependencies not ready stay visibly disabled; mocks stay labelled. Stop.

## Extension UI Level 3 — accessibility, errors and completion

**Owner:** Avyakta; coordinate web consistency with Shravya without editing her main frontend scope.

**Small tasks:** check keyboard/focus, labels, zoom/contrast, assistive announcements, supported scripts, long safe labels, loading/errors, timeouts, expiry, permission denial and completion. Announcements must not expose restored secrets. Clearly distinguish analysis completion, local restoration, eligible field fill and a submission that the extension did not perform.

**Acceptance/artifact:** browser/accessibility state matrix and extension UI handoff with observed versus not-run checks, remaining security blockers and honest completion messages. Rendering checks are not translation verification. Preserve Avyakta's knowledge responsibility and Shravya's web ownership. Stop.

## Level reports and issue handoff

For each level report owner/username, **track and level**, status, artifacts/changed paths, checks with expected/observed/pass/fail/not-run, synthetic versus live scope, data/network/permissions, approvals/blockers and next checkpoint awaiting explicit request. Nothing in this guide marks a level complete.

The coordinator creates issues separately, linking each level heading above and its acceptance/artifact requirements. Do not invent issue numbers, opened PRs, merge status or completed artifacts. Keep all five Privacy and all three UI levels addressable; retain links to the original five Extension and five Image levels. No Git operations, dependency installs, environment/secret access or runtime implementation are part of this doc-only handoff.
