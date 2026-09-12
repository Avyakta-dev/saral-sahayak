"""Opt-in synthetic acceptance; default execution never loads provider settings.

Run from the repository root with python -m scripts.run_agent_acceptance.
"""

import argparse
import asyncio
import json
import os
import sys
from dataclasses import asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASE_FILE = ROOT / "references/reviews/epfo/cases.json"
KNOWLEDGE_ROOT = ROOT / "references/knowledge/epfo"
CASE_IDS = (
    "epfo-case-001-initials-paraphrase",
    "epfo-case-002-ambiguous-kyc",
    "epfo-case-003-joint-account-claim-type",
    "epfo-case-004-cheque-waiver-ambiguity",
    "epfo-case-005-missing-service-purpose",
    "epfo-case-006-overlap-applicability",
    "epfo-case-007-conflicting-activation",
    "epfo-case-008-unverified-2026-rules",
    "epfo-case-009-unknown-zx999",
)
LANGUAGES = ("en", "hi", "kn", "ta", "te", "ml")
STATES = {"success", "needs_clarification", "unsupported"}
MAX_MODEL_CALLS = 12


class SafeParser(argparse.ArgumentParser):
    def error(self, message):
        # argparse normally echoes invalid values, including accidental private input.
        super().error("Invalid acceptance arguments; use --help for allowed options.")


def parse_args(argv):
    parser = SafeParser(description=__doc__, allow_abbrev=False)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--allow-live", action="store_true", help="Explicitly permit provider calls")
    mode.add_argument("--dry-run", action="store_true", help="Plan only (the default)")
    parser.add_argument("--case", action="append", choices=CASE_IDS, default=[])
    parser.add_argument("--language", choices=LANGUAGES, default="en")
    parser.add_argument("--max-model-calls", type=int, help="Explicit total ceiling, 1 through 12")
    parser.add_argument("--output", type=Path, help="Create a new content-free JSON report only")
    args = parser.parse_args(argv)
    if len(args.case) != len(set(args.case)):
        parser.error("Duplicate case")
    if args.max_model_calls is not None and not 1 <= args.max_model_calls <= MAX_MODEL_CALLS:
        parser.error("Invalid total ceiling")
    if args.allow_live and (not args.case or args.max_model_calls is None):
        parser.error("Live execution requires explicit cases and a total ceiling")
    return args


def load_cases(selected):
    """Load only the fixed public manifest; never accept an input file or free text."""
    manifest = json.loads(CASE_FILE.read_text(encoding="utf-8"))
    if [case["id"] for case in manifest] != list(CASE_IDS):
        raise ValueError("Review manifest changed")
    by_id = {case["id"]: case for case in manifest}
    cases = []
    for case_id in selected:
        case = by_id[case_id]
        expected = case["expected_states"]
        if (
            not isinstance(expected, list)
            or not expected
            or any(state not in STATES for state in expected)
            or not isinstance(case["input"], str)
            or not case["input"].startswith("Synthetic example:")
        ):
            raise ValueError("Invalid review case")
        # Review rationale/evidence/forbidden behaviors are NOT model instructions.
        cases.append({"id": case_id, "input": case["input"], "expected_states": expected})
    return cases


def load_settings():
    from backend.config import Settings

    # Environment-only, even when live is explicitly allowed. Never read .env.
    return Settings(_env_file=None)


def create_client(config):
    from backend.llm import LLMClient

    return LLMClient(config)


class TotalCallClient:
    """One sequential limiter shared by all cases, including repair/failed turns."""

    def __init__(self, client, limit):
        self.client = client
        self.config = client.config
        self.limit = limit
        self.calls = 0
        self.blocked = False

    async def complete(self, messages, tools=(), *, max_output_tokens=None, timeout_seconds=None):
        from backend.tools.budget import BudgetExceeded

        if self.calls >= self.limit:
            self.blocked = True
            raise BudgetExceeded("total model calls")
        self.calls += 1  # Reserve BEFORE awaiting; a failed/timeout call still consumes a slot.
        return await self.client.complete(
            messages, tools, max_output_tokens=max_output_tokens, timeout_seconds=timeout_seconds
        )


async def run_live(args, cases, report, settings_factory, client_factory):
    from backend.agent import AnalysisError, AnalysisService
    from backend.agent.diagnostics import AnalysisOutcome
    from backend.api.schemas import AnalyzeRequest
    from backend.knowledge_readiness import check_corpus

    # Validate every request before settings/client construction or the first paid call.
    requests = [AnalyzeRequest(text=case["input"], language=args.language) for case in cases]
    settings = settings_factory()
    if args.language not in settings.supported_languages:
        report["error_code"] = "language_disabled"
        return
    config = settings.llm_config()
    if config is None:
        report["error_code"] = "model_not_configured"
        return
    limits = settings.analysis_budget_limits()
    report["request_seconds"] = limits.request_seconds
    if not check_corpus(KNOWLEDGE_ROOT).structure_ready:
        report["error_code"] = "knowledge_unavailable"
        return
    # Model identifiers can themselves contain private configuration; omit them entirely.
    async with client_factory(config) as client:
        bounded = TotalCallClient(client, args.max_model_calls)
        service = AnalysisService(bounded, KNOWLEDGE_ROOT, limits)
        for request, row in zip(requests, report["cases"], strict=True):
            if bounded.calls >= bounded.limit:
                row["execution_status"] = "skipped"
                row["error_code"] = "total_model_call_budget_exhausted"
                continue
            before = bounded.calls
            events = []
            try:
                response = await service.analyze(request, diagnostics=events.append)
            except AnalysisError as error:
                row["execution_status"] = "error"
                row["observed_status"] = "error"
                safe_codes = {outcome.value for outcome in AnalysisOutcome} - STATES
                row["error_code"] = (
                    "total_model_call_budget_exhausted"
                    if bounded.blocked
                    else error.code
                    if error.code in safe_codes
                    else "analysis_failed"
                )
                row["contract_status_match"] = False
            else:
                row["execution_status"] = "completed"
                row["observed_status"] = response.status
                row["contract_status_match"] = response.status in row["expected_states"]
                # Do not serialize the response, citations, draft or any provider replay items.
            finally:
                row["model_calls"] = bounded.calls - before
                report["model_calls"] = bounded.calls
                row["events"] = [asdict(event) for event in events]
        report["run_status"] = "completed"
        report["contract_status_match"] = all(
            row["contract_status_match"] is True for row in report["cases"]
        )


def main(argv=None, *, settings_factory=load_settings, client_factory=create_client):
    args = parse_args(argv)
    report = {
        "schema_version": 1,
        "mode": "live" if args.allow_live else "dry_run",
        "run_status": "not_run",
        "error_code": None,
        "max_model_calls": args.max_model_calls,
        "model_calls": 0,
        "request_seconds": None,
        "contract_status_match": None,
        "semantic_verified": False,
        "language_quality_verified": False,
        "available_case_ids": list(CASE_IDS),
        "cases": [],
    }
    output = None
    try:
        cases = load_cases(args.case)
        report["cases"] = [
            {
                "case_id": case["id"],
                "language": args.language,
                "expected_states": case["expected_states"],
                "observed_status": None,
                "contract_status_match": None,
                "execution_status": "not_run",
                "error_code": None,
                "model_calls": 0,
                "events": [],
            }
            for case in cases
        ]
        if args.output is not None:
            # Reserve before live work; exclusive creation also refuses existing symlinks.
            fd = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            output = os.fdopen(fd, "w", encoding="utf-8")
        if args.allow_live:
            asyncio.run(run_live(args, cases, report, settings_factory, client_factory))
        else:
            report["run_status"] = "dry_run"
    except KeyboardInterrupt:
        report["error_code"] = "interrupted"
    except Exception:
        # No raw configuration, transport, manifest, filesystem or validation exceptions.
        report["error_code"] = "runner_failed"
    if report["error_code"] is not None:
        report["run_status"] = "failed"
    serialized = json.dumps(report, indent=2, allow_nan=False) + "\n"
    try:
        if output is not None:
            output.write(serialized)
    except OSError:
        report["run_status"] = "failed"
        report["error_code"] = "report_write_failed"
    finally:
        if output is not None:
            try:
                output.close()
            except OSError:
                report["run_status"] = "failed"
                report["error_code"] = "report_write_failed"
    print(json.dumps(report, indent=2, allow_nan=False))
    return int(
        report["run_status"] == "failed"
        or (args.allow_live and report["contract_status_match"] is not True)
    )


if __name__ == "__main__":
    sys.exit(main())
