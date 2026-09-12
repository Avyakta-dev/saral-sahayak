"""Content-free HTTP readiness probe for the local integrated demo (issue #30).

Default mode never loads provider settings or .env secrets. It only GETs
/health/live, /health/ready and /api/v1/capabilities.

Opt-in --allow-live delegates to scripts.run_agent_acceptance after the probe.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
from typing import Any

DEFAULT_BASE = "http://127.0.0.1:8000"
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
MAX_MODEL_CALLS = 12


class SafeParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:  # noqa: ARG002 — keep argparse from echoing values
        super().error("Invalid demo readiness arguments; use --help for allowed options.")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = SafeParser(description=__doc__, allow_abbrev=False)
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE,
        help="Backend origin without trailing slash (default: http://127.0.0.1:8000)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="Per-request timeout seconds for HTTP probes (default: 5)",
    )
    parser.add_argument(
        "--allow-live",
        action="store_true",
        help="After a successful probe, run the opt-in acceptance runner",
    )
    parser.add_argument("--case", action="append", choices=CASE_IDS, default=[])
    parser.add_argument("--language", choices=LANGUAGES, default="en")
    parser.add_argument("--max-model-calls", type=int, help="Acceptance ceiling 1–12")
    args = parser.parse_args(argv)
    base = args.base_url.strip().rstrip("/")
    if not base.startswith(("http://", "https://")):
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    if "://" in base[base.find("://") + 3 :] and "@" in base.split("://", 1)[1].split("/", 1)[0]:
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    args.base_url = base
    if args.timeout <= 0 or args.timeout > 60:
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    if len(args.case) != len(set(args.case)):
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    if args.max_model_calls is not None and not 1 <= args.max_model_calls <= MAX_MODEL_CALLS:
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    if args.allow_live and (not args.case or args.max_model_calls is None):
        parser.error("Invalid demo readiness arguments; use --help for allowed options.")
    return args


def _get_json(url: str, timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(url, method="GET", headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = int(response.status)
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        status = int(error.code)
        body = error.read().decode("utf-8", errors="replace")
    except urllib.error.URLError:
        return {
            "ok": False,
            "http_status": None,
            "error_code": "unreachable",
            "body": None,
        }
    except TimeoutError:
        return {
            "ok": False,
            "http_status": None,
            "error_code": "timeout",
            "body": None,
        }
    try:
        parsed: Any = json.loads(body) if body.strip() else None
    except json.JSONDecodeError:
        return {
            "ok": False,
            "http_status": status,
            "error_code": "non_json",
            "body": None,
        }
    return {"ok": 200 <= status < 300, "http_status": status, "error_code": None, "body": parsed}


def probe(base_url: str, timeout: float) -> dict[str, Any]:
    live = _get_json(f"{base_url}/health/live", timeout)
    ready = _get_json(f"{base_url}/health/ready", timeout)
    caps = _get_json(f"{base_url}/api/v1/capabilities", timeout)

    analysis_available = None
    checks = None
    if isinstance(caps.get("body"), dict):
        analysis_available = caps["body"].get("analysis_available")
        raw_checks = caps["body"].get("checks")
        if isinstance(raw_checks, dict):
            # Only boolean flags — never echo arbitrary nested payloads.
            checks = {
                key: value
                for key, value in raw_checks.items()
                if isinstance(key, str) and isinstance(value, bool)
            }

    ready_status = None
    if isinstance(ready.get("body"), dict) and isinstance(ready["body"].get("status"), str):
        ready_status = ready["body"]["status"]

    live_ok = bool(live.get("ok") and isinstance(live.get("body"), dict))
    report = {
        "schema_version": "demo-readiness-1.0",
        "base_url_host": urllib.request.urlparse(base_url).hostname,
        "live_ok": live_ok,
        "ready_http_status": ready.get("http_status"),
        "ready_status": ready_status,
        "capabilities_http_status": caps.get("http_status"),
        "analysis_available": analysis_available if isinstance(analysis_available, bool) else None,
        "checks": checks,
        "probe_errors": {
            "live": live.get("error_code"),
            "ready": ready.get("error_code"),
            "capabilities": caps.get("error_code"),
        },
        "readiness_ok": bool(
            live_ok
            and ready.get("http_status") in (200, 503)
            and caps.get("ok")
            and isinstance(analysis_available, bool)
        ),
        "analysis_ready": bool(
            live_ok and ready.get("http_status") == 200 and analysis_available is True
        ),
        "semantic_verified": False,
        "language_quality_verified": False,
        "closes_issue_29": False,
        "closes_issue_30": False,
    }
    return report


def run_acceptance(args: argparse.Namespace) -> int:
    command = [
        sys.executable,
        "-m",
        "scripts.run_agent_acceptance",
        "--allow-live",
        "--language",
        args.language,
        "--max-model-calls",
        str(args.max_model_calls),
    ]
    for case_id in args.case:
        command.extend(["--case", case_id])
    # Do not capture output: the acceptance runner already emits content-free JSON.
    completed = subprocess.run(command, check=False)
    return int(completed.returncode)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report = probe(args.base_url, args.timeout)
    print(json.dumps(report, indent=2, sort_keys=True))
    if not report["readiness_ok"]:
        return 1
    if not args.allow_live:
        # HTTP probe success is not live analyze acceptance.
        return 0
    if not report["analysis_ready"]:
        print(
            json.dumps(
                {
                    "allow_live_skipped": True,
                    "reason": "analysis_not_ready",
                    "closes_issue_29": False,
                    "closes_issue_30": False,
                },
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 1
    return run_acceptance(args)


if __name__ == "__main__":
    raise SystemExit(main())
