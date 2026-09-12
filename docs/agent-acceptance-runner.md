# Bounded synthetic agent acceptance runner

Issue #29 remains open. This CLI prepares or runs explicitly selected public review cases through the real `AnalysisService` and `LLMClient`; it does not certify policy accuracy, semantic grounding, fluent language output or Level 2 completion. No live calls were made while implementing/testing the runner.

## Safe default

From the repository root, using the installed project environment:

```sh
python -m scripts.run_agent_acceptance
python -m scripts.run_agent_acceptance --dry-run \
  --case epfo-case-001-initials-paraphrase --max-model-calls 3
```

The first command lists canonical case IDs in a content-free JSON plan. Neither command loads settings, reads `.env`, constructs a provider client, checks the corpus or calls a network service. An omitted language means English. No case is selected automatically and no report file is written by default. Invalid options fail before loading the review manifest or settings; errors do not echo argument values.

Only inputs from the fixed `references/reviews/epfo/cases.json` manifest are supported. There is no arbitrary text/input-file, endpoint, model-label, replay or raw-output CLI option. Do not replace those synthetic inputs with real claimant data. Review rationales, expected states and reference excerpts are not sent as instructions or preloaded evidence. The agent selects its own bounded Markdown reads through the existing tools.

## Explicit live authorization

Do not run the following without separate authorization for provider requests/credits. Configuration presence is not authorization. Supply reviewed configuration through environment variables in a trusted operator shell; the runner always disables dotenv loading, including in live mode. Do not paste secrets into reports or shell commands intended for sharing.

```sh
python -m scripts.run_agent_acceptance --allow-live \
  --case epfo-case-001-initials-paraphrase --max-model-calls 3
```

Live mode requires both explicit `--case` selections and explicit `--max-model-calls` in **1–12**. Repeat `--case` for multiple cases, in desired execution order; duplicates are rejected. `--allow-live` and `--dry-run` are mutually exclusive. No retries of a whole case are added.

- One shared counter reserves a slot **before** every delegated model `complete()` call, including failed calls, tool continuations and the service's existing one-repair attempt. It is a conservative attempted-call count, not proof of provider receipt or billing. A blocked attempt never reaches `LLMClient`.
- A case stopped by this counter reports `total_model_call_budget_exhausted`. Remaining cases are skipped without bootstrapping tools or constructing another analysis request execution. A case consuming the last slot may still complete successfully.
- Existing per-request tool, evidence, token and retry limits remain unchanged. `Settings.analysis_budget_limits()` applies the reviewed `ANALYSIS_REQUEST_SECONDS` setting (default 30, maximum 120). The actual model timeout is the smaller of remaining request time and `LLM_TIMEOUT_SECONDS`. There is no CLI timeout override or new timeout retry.
- Selected language enablement, complete model configuration and the existing structural corpus check are required before client creation. Readiness is not connectivity or quality verification.
- Cases run sequentially. There is no separate run-wide wall-clock deadline: each attempted case has its configured request deadline. The shared model-call limit does not bound local setup/structural checking. As with existing file tools, a blocked local filesystem syscall cannot be preempted by asyncio; use local storage.

## Report semantics and privacy

Standard output is content-free JSON with canonical case ID, requested language, expected states copied from the review manifest, observed status, execution status, safe error code, attempted-call counts and existing diagnostic events. Events contain phases, elapsed/remaining time, actual per-call timeout/token allowance and cumulative usage counters. They contain no read paths, headings, excerpts, prompts, user/model prose, citation IDs, URLs or provider replay items.

`contract_status_match: true` means **only** that the validated response status belongs to that case's expected state set. It does not check candidate reason selection, semantic support, forbidden behaviors, policy currency or translation quality. A valid but unexpected status is a completed execution with a false match. Failures report `observed_status: error` and false match; unrun/skipped cases retain null observation/match. The run match is true only when all selected cases matched; dry runs and preflight failures retain null. `semantic_verified` and `language_quality_verified` always remain false. Existing review `agent_execution` markers are never rewritten.

`model_calls` is the limiter's actual delegation count. Diagnostic `usage.model_turns` and `model_start` can also include a turn blocked at that boundary, and therefore need not equal delegated calls. Unknown provider token usage remains null; no tokens are inferred for unfinished responses. `run_status: completed` means the selected run ended, not that it passed. Exit code 0 means a safe dry run or all live statuses matched, 1 means failure/mismatch/skipped cases, and 2 means invalid CLI arguments.

Provider endpoint/key/headers, configured model identifiers, exception messages and stack traces are intentionally omitted. A model label can itself contain secrets and is not emitted or accepted as a free-form report field. This report cannot replace separately authorized private response/trace review; there is no raw trace option.

An optional report is created exclusively before any live work. On POSIX, creation requests mode 0600 (subject to the operator's umask). Windows does not provide the same POSIX permission-bit guarantee; restricting the destination directory and report file through Windows ACLs is the operator's responsibility:

```sh
python -m scripts.run_agent_acceptance --dry-run \
  --case epfo-case-001-initials-paraphrase --output /tmp/new-acceptance-plan.json
```

Existing files and symlinks are refused without loading settings or making calls. Parent directories are not created. Output defaults to stdout only. A write failure returns a sanitized error; an interrupted process or full disk may leave an incomplete newly created file. Never treat an incomplete report as acceptance evidence.

## Six-language evaluation is separate

Run each language as a separately authorized, explicitly bounded evaluation. The following is an example for Hindi, **not authorization to execute**:

```sh
python -m scripts.run_agent_acceptance --allow-live \
  --case epfo-case-001-initials-paraphrase --language hi --max-model-calls 3
```

Repeat separately for `en`, `hi`, `kn`, `ta`, `te`, `ml` only after approval; each invocation has its own call ceiling, so six invocations with ceiling 3 can consume up to 18 calls. English synthetic input with a requested output language tests that contract, not translated-input coverage. Independent reviewers must evaluate actual output meaning, citations, caveats and language quality through a separately approved process. Neither six matching statuses nor fake-client tests establish independent quality verification.

## Offline regression checks

```sh
python -m pytest tests/backend/test_acceptance_runner.py -q
python -m pytest -q
python -m ruff check scripts/run_agent_acceptance.py tests/backend/test_acceptance_runner.py
python -m ruff format --check scripts/run_agent_acceptance.py tests/backend/test_acceptance_runner.py
```

Tests inject fake clients or `httpx.MockTransport` only. They cover authorization/dry-run gates, exact manifest inputs, the real service/adapter and bounded selected reads, cross-case accounting, timeout/repair behavior, six-language status-only semantics, privacy, setup failures and exclusive report creation. Public API and diagnostics callable signatures are unchanged.
