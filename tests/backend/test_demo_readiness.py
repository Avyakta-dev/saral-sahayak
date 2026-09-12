"""Offline tests for scripts.check_demo_readiness — no provider calls."""

from __future__ import annotations

import json

import pytest

from scripts import check_demo_readiness as demo


class _FakeResponse:
    def __init__(self, status: int, body: bytes):
        self.status = status
        self._body = body

    def read(self) -> bytes:
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def test_parse_args_defaults():
    args = demo.parse_args([])
    assert args.base_url == "http://127.0.0.1:8000"
    assert args.allow_live is False
    assert args.case == []


def test_parse_args_rejects_live_without_ceiling():
    with pytest.raises(SystemExit):
        demo.parse_args(["--allow-live", "--case", "epfo-case-001-initials-paraphrase"])


def test_parse_args_strips_trailing_slash():
    args = demo.parse_args(["--base-url", "http://127.0.0.1:8000/"])
    assert args.base_url == "http://127.0.0.1:8000"


def test_probe_ready(monkeypatch):
    payloads = {
        "/health/live": (200, {"status": "alive", "version": "0.2.0"}),
        "/health/ready": (
            200,
            {
                "status": "ready",
                "checks": {"model_configured": True, "knowledge_structure_ready": True},
            },
        ),
        "/api/v1/capabilities": (
            200,
            {
                "analysis_available": True,
                "checks": {
                    "model_configured": True,
                    "knowledge_structure_ready": True,
                    "model_connectivity_verified": False,
                },
            },
        ),
    }

    def fake_urlopen(request, timeout=5):  # noqa: ARG001
        path = request.full_url.split("8000", 1)[-1]
        status, body = payloads[path]
        return _FakeResponse(status, json.dumps(body).encode())

    monkeypatch.setattr(demo.urllib.request, "urlopen", fake_urlopen)
    report = demo.probe("http://127.0.0.1:8000", 5.0)
    assert report["readiness_ok"] is True
    assert report["analysis_ready"] is True
    assert report["closes_issue_29"] is False
    assert report["closes_issue_30"] is False
    assert report["semantic_verified"] is False
    assert report["checks"]["model_connectivity_verified"] is False
    # Never embed secrets or free-form bodies in the report keys we care about.
    dumped = json.dumps(report)
    assert "api_key" not in dumped.lower()
    assert "Bearer" not in dumped


def test_probe_not_ready_still_readiness_ok(monkeypatch):
    payloads = {
        "/health/live": (200, {"status": "alive", "version": "0.2.0"}),
        "/health/ready": (503, {"status": "not_ready", "checks": {"model_configured": False}}),
        "/api/v1/capabilities": (
            200,
            {"analysis_available": False, "checks": {"model_configured": False}},
        ),
    }

    def fake_urlopen(request, timeout=5):  # noqa: ARG001
        path = request.full_url.split("8000", 1)[-1]
        status, body = payloads[path]
        return _FakeResponse(status, json.dumps(body).encode())

    monkeypatch.setattr(demo.urllib.request, "urlopen", fake_urlopen)
    report = demo.probe("http://127.0.0.1:8000", 5.0)
    assert report["readiness_ok"] is True
    assert report["analysis_ready"] is False
    assert report["ready_http_status"] == 503


def test_probe_unreachable(monkeypatch):
    def fake_urlopen(request, timeout=5):  # noqa: ARG001
        raise demo.urllib.error.URLError("refused")

    monkeypatch.setattr(demo.urllib.request, "urlopen", fake_urlopen)
    report = demo.probe("http://127.0.0.1:8000", 5.0)
    assert report["readiness_ok"] is False
    assert report["live_ok"] is False
    assert report["probe_errors"]["live"] == "unreachable"


def test_main_skips_live_when_not_ready(monkeypatch, capsys):
    monkeypatch.setattr(
        demo,
        "probe",
        lambda *args, **kwargs: {
            "schema_version": "demo-readiness-1.0",
            "readiness_ok": True,
            "analysis_ready": False,
            "closes_issue_29": False,
            "closes_issue_30": False,
        },
    )
    called = {"acceptance": False}

    def fake_run_acceptance(args):  # noqa: ARG001
        called["acceptance"] = True
        return 0

    monkeypatch.setattr(demo, "run_acceptance", fake_run_acceptance)
    code = demo.main(
        [
            "--allow-live",
            "--case",
            "epfo-case-001-initials-paraphrase",
            "--max-model-calls",
            "3",
        ]
    )
    assert code == 1
    assert called["acceptance"] is False
    err = capsys.readouterr().err
    assert "analysis_not_ready" in err


def test_main_delegates_live(monkeypatch):
    monkeypatch.setattr(
        demo,
        "probe",
        lambda *args, **kwargs: {
            "schema_version": "demo-readiness-1.0",
            "readiness_ok": True,
            "analysis_ready": True,
            "closes_issue_29": False,
            "closes_issue_30": False,
        },
    )
    monkeypatch.setattr(demo, "run_acceptance", lambda args: 42)
    code = demo.main(
        [
            "--allow-live",
            "--case",
            "epfo-case-001-initials-paraphrase",
            "--max-model-calls",
            "3",
        ]
    )
    assert code == 42
