"""TEST ONLY: real FastAPI/AnalysisService HTTP with a deterministic fake model.

No production corpus, .env, provider client, credentials, or government requests.
Run --self-test for an HTTP-only smoke test (no browser/App required).
--protected-self-test checks real admission-gate errors with a synthetic server
credential only. No browser credentials, gateway or auth bypass is provided.
The real knowledge tools require POSIX. On Windows this launcher uses existing
WSL dependencies: set FIXTURE_WSL_PYTHON to a Linux venv's Python executable.
A lease shuts down the Linux child even when Playwright taskkills the Windows
launcher. No firewall/port forwarding or backend security changes are made.
"""

from __future__ import annotations

import argparse
import asyncio
import contextvars
import json
import os
import socket
import subprocess
import sys
import tempfile
import threading
import time
import uuid
from pathlib import Path
from types import SimpleNamespace

HOST = "127.0.0.1"
PORT = 8011
ORIGIN = "http://127.0.0.1:5174"
NOTICE = "SYNTHETIC web UI issue25 fixture; not EPFO policy or verified advice."
SOURCE = "https://example.org/synthetic/web-ui-issue25/source-001"
REASON = "reasons/epfo-rr-001.md"
ACTION = "SYNTHETIC fixture: compare the fictional notice labels."
QUESTION = "SYNTHETIC fixture: which fictional notice label needs checking?"
LIMITATION = "SYNTHETIC fixture: no evidence supports this fictional notice."
MARKER = "issue25-synthetic-real-service"
SERVER_TOKEN = "SYNTHETIC-server-only-admission-token-not-real"
ROOT = Path(__file__).resolve().parents[2]
# A request owns its counter; concurrent requests never consume a global FIFO.
MODEL_TURNS: contextvars.ContextVar[dict | None] = contextvars.ContextVar("turns", default=None)


def exclusive_socket() -> socket.socket:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # POSIX SO_REUSEADDR permits our previous TIME_WAIT sockets, not another
    # active listener. Never enable SO_REUSEPORT or Windows shared-port reuse.
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((HOST, PORT))
    except OSError:
        sock.close()
        raise SystemExit(f"Fixture refuses occupied {HOST}:{PORT}; no server reuse.") from None
    return sock


def windows_launcher(args: argparse.Namespace) -> None:
    # Windows SO_EXCLUSIVEADDRUSE also rejects harmless TIME_WAIT entries after
    # WSL forwarding closes. Check active ownership instead; the Linux child
    # still binds exclusively and Playwright independently forbids server reuse.
    table = subprocess.run(
        ["netstat", "-ano", "-p", "tcp"], capture_output=True, text=True, check=True
    ).stdout
    for line in table.splitlines():
        fields = line.split()
        if (
            len(fields) >= 5
            and fields[0] == "TCP"
            and fields[1].rsplit(":", 1)[-1] == str(PORT)
            and fields[3] != "TIME_WAIT"
        ):
            raise SystemExit(f"Fixture refuses occupied {HOST}:{PORT}; no server reuse.")
    with tempfile.TemporaryDirectory(prefix="saral-issue25-lease-") as directory:
        lease = Path(directory) / "lease"
        token = uuid.uuid4().hex
        lease.write_text(token, encoding="ascii")

        def linux_path(path: Path) -> str:
            absolute = path.resolve().as_posix()
            return f"/mnt/{absolute[0].lower()}{absolute[2:]}"

        command = [
            "wsl.exe",
            "-d",
            os.environ.get("FIXTURE_WSL_DISTRO", "Ubuntu"),
            "--exec",
            os.environ.get("FIXTURE_WSL_PYTHON", "python3"),
            linux_path(Path(__file__)),
            "--lease-file",
            linux_path(lease),
            "--lease-token",
            token,
        ]
        if args.self_test:
            command.append("--self-test")
        if args.protected_self_test:
            command.append("--protected-self-test")
        child = subprocess.Popen(command)
        try:
            while child.poll() is None:
                lease.touch()
                time.sleep(0.5)
        finally:
            lease.unlink(missing_ok=True)
            # Linux lease watcher performs graceful uvicorn/corpus cleanup. Killing
            # wsl.exe alone is not a reliable way to terminate its Linux process.
            try:
                child.wait(timeout=12)
            except subprocess.TimeoutExpired:
                child.terminate()
                child.wait(timeout=5)
        if child.returncode:
            raise SystemExit(child.returncode)


def isolate_environment() -> None:
    # BaseSettings otherwise still inspects process variables despite _env_file=None.
    os.environ.clear()
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(ROOT))

    def deny_external_network(event, arguments):
        if event == "socket.connect":
            sock, address = arguments
            if sock.family in (socket.AF_INET, socket.AF_INET6) and address[0] not in {
                HOST,
                "::1",
            }:
                raise RuntimeError("TEST ONLY fixture forbids external connections")
        if event == "socket.getaddrinfo" and arguments[0] not in {HOST, "::1", "localhost"}:
            raise RuntimeError("TEST ONLY fixture forbids external DNS")

    sys.addaudithook(deny_external_network)


def write_corpus(root: Path) -> None:
    (root / "reasons").mkdir()
    index = ["# SYNTHETIC fixture index", NOTICE]
    for number in range(1, 182):
        record = f"epfo-rr-{number:03}"
        index.append(f"[{record}](reasons/{record}.md) SYNTHETIC notice {number}")
        (root / "reasons" / f"{record}.md").write_text(
            f"# SYNTHETIC {record}\n## Fix\n{ACTION}\n## Sources\n"
            f"https://example.org/synthetic/web-ui-issue25/source-{number:03}\n"
            f"## Unread fixture section\n{NOTICE}\n"
            "https://example.org/synthetic/never-read\n",
            encoding="utf-8",
        )
    (root / "README.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    for name in ("sources.md", "glossary.md", "claim-types-overview.md", "resolution-playbooks.md"):
        (root / name).write_text(f"# SYNTHETIC supporting fixture\n{NOTICE}\n", encoding="utf-8")


class SyntheticModel:
    """Same public complete/history pattern as tests/backend/test_agent.py.

    Only model output is fake. Real tool dispatch chooses/reads synthetic Markdown;
    host evidence IDs, citations, validation, budgets and draft assembly are real.
    Test scenario selection is intentionally deterministic, NOT policy retrieval.
    """

    def __init__(self, *, timeout_seconds: float = 0.4):
        self.config = SimpleNamespace(max_output_tokens=2048, timeout_seconds=timeout_seconds)

    async def complete(self, messages, tools, **kwargs):
        from backend.llm import LLMError, LLMResult, Message, ToolCall, Usage

        counter = MODEL_TURNS.get()
        if counter is not None:
            counter["count"] += 1
        request = json.loads(
            next(message.content for message in messages if message.role == "user")
        )
        text, language = request["text"], request["language"]
        scenario = (
            text.split()[1]
            if text.startswith("SYNTHETIC ") and len(text.split()) > 1
            else "unsupported"
        )

        def final(value):
            return LLMResult(
                message=Message(role="assistant", content=json.dumps(value, ensure_ascii=False)),
                finish_reason="stop",
                usage=Usage(output_tokens=150),
            )

        def calls(items):
            return LLMResult(
                message=Message(role="assistant", tool_calls=tuple(items)),
                finish_reason="tool_calls",
                usage=Usage(output_tokens=30),
            )

        if scenario == "provider-failure":
            raise LLMError("transport")
        if scenario == "timeout":
            # Exercise the actual AnalysisService asyncio deadline, not just an error stub.
            await asyncio.sleep(10)
            raise AssertionError("The host must cancel the timed-out fake model")
        if scenario == "budget":
            return calls(
                [
                    ToolCall(id=f"synthetic-budget-{i}", name="list_files", arguments={"limit": 1})
                    for i in range(12)
                ]
            )
        if scenario == "invalid-output":
            return final({"status": "success", "SYNTHETIC_invalid": True})
        if scenario == "clarify":
            return final(
                {"status": "needs_clarification", "language": language, "questions": [QUESTION]}
            )
        if scenario != "supported":
            return final({"status": "unsupported", "language": language, "warnings": [LIMITATION]})

        evidence = [
            json.loads(message.content)
            for message in messages
            if message.role == "tool" and not message.is_error
        ]
        selected = [item for item in evidence if item.get("record_id") == "epfo-rr-001"]
        if not selected:
            assert {tool.name for tool in tools} == {"read_file", "list_files"}
            assert evidence[0]["path"].endswith("/README.md")
            assert evidence[0]["truncated"]  # bounded index, never full corpus stuffing
            return calls(
                [
                    ToolCall(
                        id=f"synthetic-{heading.lower()}",
                        name="read_file",
                        arguments={"relative_path": REASON, "heading": heading},
                    )
                    for heading in ("Fix", "Sources")
                ]
            )
        assert [item["heading"] for item in selected] == ["Fix", "Sources"]
        assert ACTION in selected[0]["text"] and SOURCE in selected[1]["source_urls"]
        ids = [item["evidence_id"] for item in selected]
        prose = ACTION if language == "en" else "SYNTHETIC परीक्षण: काल्पनिक सूचना के नामों की तुलना करें।"
        block = {"text": prose, "evidence_ids": ids}
        return final(
            {
                "status": "success",
                "language": language,
                "classification": {
                    "reason_id": "epfo-rr-001",
                    "category": "SYNTHETIC fixture",
                    "confidence": "low",
                    "rationale": "SYNTHETIC deterministic test only.",
                },
                "explanation": [block],
                "actions": [block],
                "required_documents": [block],
                "warnings": [NOTICE],
            }
        )


def fixture_app(root: Path, *, protected: bool = False):
    from backend.config import Settings
    from backend.main import create_app

    settings = Settings(
        _env_file=None,
        llm_api_style="responses",
        llm_base_url="https://provider.example.invalid/SYNTHETIC-NO-NETWORK",
        llm_api_key="SYNTHETIC-NOT-A-REAL-KEY",
        llm_model="SYNTHETIC-NOT-A-REAL-MODEL",
        llm_extra_headers={"X-Synthetic-Fixture": "SYNTHETIC-NOT-A-CREDENTIAL"},
        llm_timeout_seconds=1,
        analysis_request_seconds=2 if protected else 5,
        analysis_access_mode="protected" if protected else "local",
        analysis_access_token=SERVER_TOKEN if protected else "",
        analysis_requests_per_minute=2 if protected else 10,
        analysis_max_concurrent=1 if protected else 2,
        llm_connect_timeout_seconds=1,
        llm_max_output_tokens=2048,
        llm_anthropic_version="2023-06-01",
        cors_origins=[ORIGIN],
        supported_languages=["en", "hi"],
    )
    # Protected smoke puts the outer admission deadline before the fake model's
    # timeout. The local browser harness retains the service-owned 504 path.
    model = SyntheticModel(timeout_seconds=10 if protected else 0.4)
    app = create_app(settings, knowledge_root=root, model_client=model)

    @app.middleware("http")
    async def synthetic_marker(request, call_next):
        counter = {"count": 0}
        token = MODEL_TURNS.set(counter)
        try:
            response = await call_next(request)
            response.headers["X-Synthetic-Fixture"] = MARKER
            response.headers["X-Synthetic-Model-Turns"] = str(counter["count"])
            return response
        finally:
            MODEL_TURNS.reset(token)

    return app


def protected_smoke(client) -> None:
    # Server-to-server only. The public browser client must never learn this token.
    assert client.get("/api/v1/capabilities").json()["analysis_available"]
    denied = client.post("/api/v1/analyze", content="{")
    assert denied.status_code == 401
    assert denied.json() == {
        "error": {"code": "access_denied", "message": "Analysis access denied."}
    }
    assert denied.headers["x-synthetic-model-turns"] == "0"
    print("PASS real HTTP protected: 401 access_denied before body/model work", flush=True)
    preflight = client.options(
        "/api/v1/analyze",
        headers={
            "Origin": ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert preflight.status_code == 400  # No browser-credential CORS bypass.
    headers = {"Authorization": "Bearer " + SERVER_TOKEN}
    accepted = client.post(
        "/api/v1/analyze",
        json={"text": "SYNTHETIC supported server admission"},
        headers=headers,
    )
    assert accepted.status_code == 200 and accepted.json()["status"] == "success"
    assert accepted.headers["x-synthetic-model-turns"] == "2"
    for scenario, status, code, message, turns in [
        ("timeout", 504, "request_timeout", "Analysis request timed out.", "1"),
        ("supported", 429, "analysis_capacity", "Analysis capacity is limited.", "0"),
    ]:
        response = client.post(
            "/api/v1/analyze",
            json={"text": f"SYNTHETIC {scenario} server admission"},
            headers=headers,
        )
        assert response.status_code == status, response.text
        assert response.json() == {"error": {"code": code, "message": message}}
        assert response.headers["x-synthetic-fixture"] == MARKER
        assert response.headers["x-synthetic-model-turns"] == turns
        assert SERVER_TOKEN not in response.text and "Traceback" not in response.text
        if status == 429:
            assert 1 <= int(response.headers["retry-after"]) <= 60
        print(f"PASS real HTTP protected: {status} {code}; fake model turns={turns}", flush=True)


def smoke_test(server, sock, *, protected: bool = False) -> None:
    import httpx

    worker = threading.Thread(target=server.run, kwargs={"sockets": [sock]}, daemon=True)
    worker.start()
    try:
        deadline = time.monotonic() + 10
        while not server.started:
            if not worker.is_alive() or time.monotonic() > deadline:
                raise RuntimeError("Fixture server failed to start")
            time.sleep(0.05)
        with httpx.Client(base_url=f"http://{HOST}:{PORT}", trust_env=False, timeout=10) as client:
            assert client.get("/health/live").json()["status"] == "alive"
            assert client.get("/health/ready").status_code == 200
            if protected:
                protected_smoke(client)
                return
            metadata = client.get("/api/v1/capabilities", headers={"Origin": ORIGIN})
            assert metadata.headers["access-control-allow-origin"] == ORIGIN
            denied = client.get("/api/v1/capabilities", headers={"Origin": "http://127.0.0.1:5173"})
            assert "access-control-allow-origin" not in denied.headers
            caps = metadata.json()
            assert caps["analysis_available"] and [item["code"] for item in caps["languages"]] == [
                "en",
                "hi",
            ]
            assert not caps["checks"]["model_connectivity_verified"]
            assert not caps["checks"]["knowledge_content_verified"]
            assert all(not item["quality_verified"] for item in caps["languages"])
            for scenario, status, outcome, turns in [
                ("supported", 200, "success", 2),
                ("clarify", 200, "needs_clarification", 1),
                ("unsupported", 200, "unsupported", 1),
                ("provider-failure", 502, "model_unavailable", 1),
                ("timeout", 504, "analysis_timeout", 1),
                ("budget", 503, "budget_exhausted", 1),
                ("invalid-output", 502, "invalid_model_output", 2),
            ]:
                response = client.post(
                    "/api/v1/analyze",
                    json={"text": f"SYNTHETIC {scenario} smoke", "language": "en"},
                )
                assert response.status_code == status, response.text
                body = response.json()
                assert (body["error"]["code"] if status != 200 else body["status"]) == outcome, body
                assert int(response.headers["x-synthetic-model-turns"]) == turns
                if outcome == "success":
                    assert [item["heading"] for item in body["citations"]] == ["Fix", "Sources"]
                    assert body["citations"][1]["source_urls"] == [SOURCE]
                    assert "never-read" not in response.text
                    assert body["draft"]["blocks"]
                else:
                    assert body["draft"] is None and not body["citations"] and not body["actions"]
                print(
                    f"PASS real HTTP {scenario}: {status} {outcome}; fake model turns={turns}",
                    flush=True,
                )
            for data, expected, code in [
                ("{", 422, "invalid_request"),
                ("x" * 32769, 413, "request_too_large"),
            ]:
                response = client.post(
                    "/api/v1/analyze", content=data, headers={"Content-Type": "application/json"}
                )
                assert response.status_code == expected and response.json()["error"]["code"] == code
                assert response.headers["x-synthetic-model-turns"] == "0"
                print(
                    f"PASS real HTTP body validation: {expected} {code}; no model call", flush=True
                )
    finally:
        server.should_exit = True
        worker.join(timeout=12)
        assert not worker.is_alive(), "Fixture HTTP server did not clean up"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--self-test", action="store_true")
    mode.add_argument("--protected-self-test", action="store_true")
    parser.add_argument("--lease-file", type=Path)
    parser.add_argument("--lease-token")
    args = parser.parse_args()
    if os.name == "nt":
        windows_launcher(args)
        return
    if not hasattr(os, "O_NOFOLLOW") or os.open not in os.supports_dir_fd:
        raise SystemExit(
            "Real backend file tools require POSIX dir_fd/O_NOFOLLOW; no shim is allowed."
        )
    isolate_environment()
    import uvicorn

    sock = exclusive_socket()
    with sock, tempfile.TemporaryDirectory(prefix="saral-issue25-SYNTHETIC-") as temporary:
        root = Path(temporary) / "references" / "knowledge" / "epfo"
        root.mkdir(parents=True)
        write_corpus(root)
        app = fixture_app(root, protected=args.protected_self_test)
        server = uvicorn.Server(
            uvicorn.Config(app, host=HOST, port=PORT, access_log=False, log_level="warning")
        )
        if args.lease_file:

            def watch_lease():
                while not server.should_exit:
                    try:
                        alive = (
                            args.lease_file.read_text("ascii") == args.lease_token
                            and time.time() - args.lease_file.stat().st_mtime < 4
                        )
                    except OSError:
                        alive = False
                    if not alive:
                        server.should_exit = True
                        args.lease_file.unlink(missing_ok=True)
                        try:
                            args.lease_file.parent.rmdir()
                        except OSError:
                            pass
                        return
                    time.sleep(0.5)

            threading.Thread(target=watch_lease, daemon=True).start()
        print(
            f"TEST ONLY {MARKER}: {HOST}:{PORT}; fake model, temporary synthetic Markdown",
            flush=True,
        )
        if args.self_test or args.protected_self_test:
            smoke_test(server, sock, protected=args.protected_self_test)
        else:
            server.run(sockets=[sock])


if __name__ == "__main__":
    main()
