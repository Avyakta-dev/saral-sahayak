"""Acceptance CLI regressions: only fake clients or HTTP MockTransport, never live."""

import asyncio
import json
import os
from dataclasses import asdict

import httpx
import pytest
from test_agent import FakeClient, read_call, text_result, tool_result
from test_real_corpus_acceptance import supported_final, tool_results, wire

from backend.agent.diagnostics import AnalysisDiagnostic, AnalysisOutcome, AnalysisPhase
from backend.config import Settings
from backend.llm import LLMClient, LLMError
from backend.tools.budget import Usage
from scripts import run_agent_acceptance as runner

SECRET = "PRIVATE-CANARY-https://secret.invalid/key"


def forbidden(*args, **kwargs):
    pytest.fail("Settings/client/network must not be used")


def settings(**overrides):
    # Explicit synthetic configuration; no dotenv or provider connection.
    return Settings(
        _env_file=None,
        llm_base_url="https://example.invalid/v1",
        llm_api_key=SECRET,
        llm_model=SECRET,
        llm_extra_headers={"x-private": SECRET},
        **overrides,
    )


class ManagedFake(FakeClient):
    closed = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        self.closed = True


def live_args(*indices, budget=3, language="en"):
    return [
        "--allow-live",
        "--max-model-calls",
        str(budget),
        "--language",
        language,
        *[value for index in indices for value in ("--case", runner.CASE_IDS[index])],
    ]


def invoke(capsys, args, client, config=None):
    result = runner.main(
        args, settings_factory=lambda: config or settings(), client_factory=lambda _: client
    )
    captured = capsys.readouterr()
    assert not captured.err
    assert SECRET not in captured.out
    assert "PRIVATE-MODEL-PROSE" not in captured.out
    return result, json.loads(captured.out)


def unsupported(language="en"):
    return text_result(
        {
            "status": "unsupported",
            "language": language,
            "warnings": ["PRIVATE-MODEL-PROSE evidence is insufficient."],
        }
    )


@pytest.mark.parametrize(
    "args",
    [[], ["--dry-run"], ["--case", runner.CASE_IDS[0]], ["--dry-run", "--max-model-calls", "2"]],
)
def test_default_and_dry_run_never_load_settings_or_client(args, capsys, monkeypatch):
    monkeypatch.setattr(httpx.AsyncClient, "__init__", forbidden)
    assert runner.main(args, settings_factory=forbidden, client_factory=forbidden) == 0
    report = json.loads(capsys.readouterr().out)
    assert report["mode"] == report["run_status"] == "dry_run"
    assert report["request_seconds"] is None
    assert report["contract_status_match"] is None
    assert report["model_calls"] == 0
    assert report["available_case_ids"] == list(runner.CASE_IDS)
    for row in report["cases"]:
        assert row["observed_status"] is row["contract_status_match"] is None
        assert row["execution_status"] == "not_run"


@pytest.mark.parametrize(
    "args",
    [
        ["--allow-live"],
        ["--allow-live", "--case", runner.CASE_IDS[0]],
        ["--allow-live", "--max-model-calls", "1"],
        ["--allow-live", "--dry-run"],
        ["--max-model-calls", "0"],
        ["--max-model-calls", "-1"],
        ["--max-model-calls", "13"],
        ["--max-model-calls", "1.5"],
        ["--max-model-calls", SECRET],
        ["--case", SECRET],
        ["--language", SECRET],
        ["--input", SECRET],
        ["--case", runner.CASE_IDS[0], "--case", runner.CASE_IDS[0]],
        ["--allow-li"],
    ],
)
def test_invalid_arguments_fail_before_manifest_settings_client(args, capsys, monkeypatch):
    monkeypatch.setattr(runner, "load_cases", forbidden)
    with pytest.raises(SystemExit) as error:
        runner.main(args, settings_factory=forbidden, client_factory=forbidden)
    assert error.value.code == 2
    captured = capsys.readouterr()
    assert SECRET not in captured.err + captured.out
    assert "Invalid acceptance arguments" in captured.err


def test_settings_loader_explicitly_disables_dotenv(monkeypatch):
    calls = []
    monkeypatch.setattr("backend.config.Settings", lambda **kwargs: calls.append(kwargs))
    runner.load_settings()
    assert calls == [{"_env_file": None}]


def test_manifest_inputs_and_expectations_are_exact():
    source = json.loads(runner.CASE_FILE.read_text(encoding="utf-8"))
    selected = runner.load_cases(list(runner.CASE_IDS))
    assert selected == [
        {"id": case["id"], "input": case["input"], "expected_states": case["expected_states"]}
        for case in source
    ]


def test_total_budget_spans_cases_and_counts_repair(capsys):
    client = ManagedFake(unsupported(), text_result({}), unsupported())
    code, report = invoke(capsys, live_args(8, 1, 2, budget=2), client)
    assert code == 1 and client.closed
    assert len(client.calls) == report["model_calls"] == 2
    first, second, third = report["cases"]
    assert first["contract_status_match"] is True
    assert second["error_code"] == third["error_code"] == "total_model_call_budget_exhausted"
    assert second["execution_status"] == "error"
    assert second["contract_status_match"] is False
    assert second["events"][-1]["usage"]["retries"] == 1
    assert second["events"][-1]["usage"]["model_turns"] == 2  # Includes blocked attempt.
    assert third["execution_status"] == "skipped" and third["events"] == []
    assert third["observed_status"] is third["contract_status_match"] is None
    assert [row["model_calls"] for row in report["cases"]] == [1, 1, 0]
    assert report["contract_status_match"] is False


def test_no_extra_retries_and_status_mismatch(capsys):
    client = ManagedFake(text_result({}), text_result({}), unsupported())
    code, report = invoke(capsys, live_args(0, 1, budget=3), client)
    assert code == 1 and len(client.calls) == 3
    assert report["cases"][0]["error_code"] == "invalid_model_output"
    assert report["cases"][0]["events"][-1]["usage"]["retries"] == 1
    assert report["cases"][1]["contract_status_match"] is True
    code, report = invoke(capsys, live_args(0, budget=1), ManagedFake(unsupported()))
    assert code == 1
    assert report["cases"][0]["execution_status"] == "completed"
    assert report["cases"][0]["observed_status"] == "unsupported"
    assert report["cases"][0]["contract_status_match"] is False


@pytest.mark.parametrize("language", runner.LANGUAGES)
def test_six_languages_status_match_does_not_verify_quality(language, capsys):
    # Deliberately not translated: matching the language field proves no fluency.
    client = ManagedFake(unsupported(language))
    code, report = invoke(capsys, live_args(8, language=language, budget=1), client)
    assert code == 0 and report["contract_status_match"] is True
    assert report["semantic_verified"] is report["language_quality_verified"] is False
    row = report["cases"][0]
    assert row["case_id"] == runner.CASE_IDS[8] and row["language"] == language
    request = json.loads(client.calls[0][0][1].content)
    assert request["text"] == runner.load_cases([runner.CASE_IDS[8]])[0]["input"]
    assert request["language"] == language


@pytest.mark.parametrize(
    "failure,expected",
    [
        (RuntimeError(SECRET), "analysis_failed"),
        (LLMError("auth"), "model_unavailable"),
        (LLMError("timeout"), "analysis_timeout"),
    ],
)
def test_errors_are_sanitized_and_failed_calls_charged(failure, expected, capsys):
    client = ManagedFake(failure, unsupported())
    code, report = invoke(capsys, live_args(0, 8, budget=1), client)
    assert code == 1 and report["model_calls"] == len(client.calls) == 1
    assert report["cases"][0]["error_code"] == expected
    assert report["cases"][1]["execution_status"] == "skipped"
    assert client.closed


def test_configured_request_deadline_and_exact_event_shape(capsys):
    client = ManagedFake(unsupported())
    client.config.timeout_seconds = 90
    code, report = invoke(
        capsys, live_args(8, budget=1), client, settings(analysis_request_seconds=60)
    )
    assert code == 0 and report["request_seconds"] == 60
    events = report["cases"][0]["events"]
    start = next(event for event in events if event["phase"] == "model_start")
    assert 30 < start["call_timeout_seconds"] <= 60
    assert start["call_timeout_seconds"] == client.calls[0][2]["timeout_seconds"]
    assert start["model_token_allowance"] == client.calls[0][2]["max_output_tokens"]
    expected_shape = asdict(
        AnalysisDiagnostic(AnalysisPhase.START, 0, 60, None, None, None, Usage(0, 0, 0, 0, 0, 0, 0))
    )
    assert all(set(event) == set(expected_shape) for event in events)
    assert events[-1]["outcome"] == AnalysisOutcome.UNSUPPORTED
    assert events[-1]["usage"]["tool_calls"] == 1
    assert events[-1]["usage"]["files"] == 1
    serialized = json.dumps(report)
    for private in ("https://", "README.md", "evidence_id", "provider_items", "Synthetic example:"):
        assert private not in serialized


def test_real_timeout_no_retry(capsys):
    class Slow(ManagedFake):
        cancelled = False

        async def complete(self, messages, tools, **kwargs):
            self.calls.append(kwargs)
            try:
                await asyncio.sleep(10)
            finally:
                self.cancelled = True

    client = Slow()
    code, report = invoke(
        capsys, live_args(8, budget=2), client, settings(analysis_request_seconds=0.05)
    )
    assert code == 1 and client.cancelled and client.closed
    assert len(client.calls) == report["model_calls"] == 1
    assert report["cases"][0]["error_code"] == "analysis_timeout"


def test_real_service_adapter_exact_bounded_reads_and_content_free_report(capsys):
    reads = [
        ("epfo-rr-012", "Root cause"),
        ("epfo-rr-012", "Sources and verification"),
        ("epfo-rr-001", "Fix"),
        ("epfo-rr-001", "Sources and verification"),
    ]
    observed = []
    requests = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        results = tool_results(payload, "responses")
        if len(requests) == 1:
            assert len(results) == 1
            assert results[0]["path"].endswith("/README.md")
            return httpx.Response(200, json=wire("responses", reads=reads))
        observed.extend(results)
        return httpx.Response(200, json=wire("responses", final=supported_final(results)))

    def factory(config):
        client = LLMClient(config, httpx.AsyncClient(transport=httpx.MockTransport(handler)))
        client._owned = True  # Runner owns and closes this injected test transport.
        return client

    assert (
        runner.main(live_args(0, budget=2), settings_factory=settings, client_factory=factory) == 0
    )
    report = json.loads(capsys.readouterr().out)
    assert len(requests) == report["model_calls"] == 2
    assert [(r["record_id"], r["heading"]) for r in observed[1:]] == reads
    assert len(observed) == 5 and len({r["path"] for r in observed}) == 3
    assert all(len(r["text"].encode()) <= 3072 for r in observed)
    assert all(not r["truncated"] for r in observed[1:])
    assert report["cases"][0]["events"][-1]["usage"]["tool_calls"] == 5
    assert report["contract_status_match"] is True
    assert report["semantic_verified"] is report["language_quality_verified"] is False
    for private in [
        SECRET,
        "Sources and verification",
        "Root cause",
        "Synthetic example:",
        "https://",
        "epfo-rr-012",
        "provider_items",
        "evidence_id",
    ]:
        assert private not in json.dumps(report)


@pytest.mark.parametrize("stage", ["settings", "client", "manifest"])
def test_setup_exceptions_never_disclose_private_details(stage, capsys, monkeypatch):
    def fail(*args, **kwargs):
        raise ValueError(SECRET)

    if stage == "manifest":
        monkeypatch.setattr(runner, "load_cases", fail)
    code = runner.main(
        live_args(0, budget=1),
        settings_factory=fail if stage == "settings" else settings,
        client_factory=fail,
    )
    captured = capsys.readouterr()
    assert code == 1 and SECRET not in captured.out + captured.err
    assert json.loads(captured.out)["error_code"] == "runner_failed"


@pytest.mark.parametrize("gate", ["language", "model", "knowledge"])
def test_readiness_gates_before_client(gate, capsys, monkeypatch, tmp_path):
    config = settings(supported_languages=["en"])
    if gate == "model":
        config.llm_model = ""
    if gate == "knowledge":
        monkeypatch.setattr(runner, "KNOWLEDGE_ROOT", tmp_path)
    code = runner.main(
        live_args(8, language="hi" if gate == "language" else "en"),
        settings_factory=lambda: config,
        client_factory=forbidden,
    )
    report = json.loads(capsys.readouterr().out)
    assert code == 1 and report["model_calls"] == 0
    assert (
        report["error_code"]
        == {
            "language": "language_disabled",
            "model": "model_not_configured",
            "knowledge": "knowledge_unavailable",
        }[gate]
    )


def test_opt_in_report_exclusive_and_no_overwrite(tmp_path, capsys):
    path = tmp_path / "safe.json"
    assert runner.main(["--output", str(path)], settings_factory=forbidden) == 0
    assert json.loads(path.read_text()) == json.loads(capsys.readouterr().out)
    original = path.read_bytes()
    assert runner.main(live_args(0) + ["--output", str(path)], settings_factory=forbidden) == 1
    assert path.read_bytes() == original
    assert str(path) not in capsys.readouterr().out


@pytest.mark.skipif(os.name != "posix", reason="POSIX permission bits only; Windows uses ACLs")
def test_report_private_posix_permissions(tmp_path, capsys):
    path = tmp_path / "safe.json"
    assert runner.main(["--output", str(path)], settings_factory=forbidden) == 0
    capsys.readouterr()
    assert path.stat().st_mode & 0o777 == 0o600


def test_report_refuses_symlink_without_overwriting_target(tmp_path, capsys):
    path = tmp_path / "safe.json"
    path.write_bytes(b"existing report")
    link = tmp_path / "link.json"
    try:
        link.symlink_to(path)
    except NotImplementedError:
        pytest.skip("Symlinks are unavailable on this platform")
    except OSError as error:
        if os.name == "nt" and getattr(error, "winerror", None) == 1314:
            pytest.skip("Windows symlink privilege is unavailable")
        raise
    assert runner.main(live_args(0) + ["--output", str(link)], settings_factory=forbidden) == 1
    assert path.read_bytes() == b"existing report"
    assert str(link) not in capsys.readouterr().out


def test_interrupt_report_is_sanitized_and_written(tmp_path, capsys):
    def interrupted():
        raise KeyboardInterrupt(SECRET)

    path = tmp_path / "interrupted.json"
    assert (
        runner.main(
            live_args(0) + ["--output", str(path)],
            settings_factory=interrupted,
            client_factory=forbidden,
        )
        == 1
    )
    captured = capsys.readouterr()
    assert not captured.err and SECRET not in captured.out
    report = json.loads(captured.out)
    assert json.loads(path.read_text()) == report
    assert report["run_status"] == "failed" and report["error_code"] == "interrupted"
    assert report["model_calls"] == 0 and report["contract_status_match"] is None
    assert report["cases"][0]["execution_status"] == "not_run"


def test_no_output_file_by_default(tmp_path, capsys, monkeypatch):
    monkeypatch.chdir(tmp_path)
    assert runner.main([], settings_factory=forbidden, client_factory=forbidden) == 0
    capsys.readouterr()
    assert list(tmp_path.iterdir()) == []


def test_tool_continuation_cannot_bypass_total_budget(capsys):
    client = ManagedFake(tool_result(read_call("fix")), unsupported())
    code, report = invoke(capsys, live_args(0, 8, budget=1), client)
    assert code == 1 and len(client.calls) == report["model_calls"] == 1
    assert report["cases"][0]["error_code"] == "total_model_call_budget_exhausted"
    assert report["cases"][0]["events"][-1]["usage"]["tool_calls"] == 2
    assert report["cases"][1]["execution_status"] == "skipped"
