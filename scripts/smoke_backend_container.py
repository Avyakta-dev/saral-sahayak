"""Validate a local Docker image without secrets, outbound network or live models."""

import argparse
import json
import subprocess
import time
import uuid


def docker(*args):
    return subprocess.check_output(["docker", *args], text=True).strip()


def request(container, path, *, method="GET", data=None, headers=None):
    script = """
import json, urllib.error, urllib.request, sys
path, method, data, headers = json.loads(sys.argv[1])
req = urllib.request.Request('http://127.0.0.1:8000' + path, method=method,
    data=data.encode() if data is not None else None, headers=headers or {})
try:
    response = urllib.request.urlopen(req, timeout=5)
except urllib.error.HTTPError as error:
    response = error
with response:
    print(json.dumps({'status': response.status, 'headers': dict(response.headers),
        'body': response.read().decode()}))
"""
    result = json.loads(
        docker("exec", container, "python", "-c", script, json.dumps([path, method, data, headers]))
    )
    result["headers"] = {key.lower(): value for key, value in result["headers"].items()}
    return result


def smoke(image):
    name = "setu-smoke-" + uuid.uuid4().hex[:12]
    config = json.loads(docker("image", "inspect", image))[0]["Config"]
    assert config["User"] == "10001:10001"
    assert "/health/live" in " ".join(config["Healthcheck"]["Test"])
    assert not any(value.startswith(("LLM_", "CORS_ORIGINS=")) for value in config["Env"])
    started = False
    try:
        docker(
            "run",
            "--detach",
            "--name",
            name,
            "--network",
            "none",
            "--read-only",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges:true",
            "--pids-limit",
            "64",
            "--memory",
            "256m",
            "--cpus",
            "1",
            "--env",
            'CORS_ORIGINS=["https://preview.example.invalid"]',
            image,
        )
        started = True
        for _ in range(60):
            state = json.loads(docker("inspect", name))[0]["State"]
            if state.get("Health", {}).get("Status") == "healthy":
                break
            assert state["Running"], "Container exited before liveness became healthy"
            time.sleep(1)
        else:
            raise AssertionError("Container did not become healthy within 60 seconds")

        assert request(name, "/health/live")["status"] == 200
        ready = request(name, "/health/ready")
        assert ready["status"] == 503
        checks = json.loads(ready["body"])["checks"]
        assert checks["knowledge_structure_ready"] and not checks["model_configured"]
        assert (
            not checks["model_connectivity_verified"] and not checks["knowledge_content_verified"]
        )
        capabilities = json.loads(request(name, "/api/v1/capabilities")["body"])
        assert not capabilities["analysis_available"]
        assert capabilities["inputs"] == ["text"] and not capabilities["downloads_available"]
        assert {lang["code"] for lang in capabilities["languages"]} == {
            "en",
            "hi",
            "kn",
            "ta",
            "te",
            "ml",
        }
        assert all(not lang["quality_verified"] for lang in capabilities["languages"])

        headers = {"Content-Type": "application/json"}
        response = request(
            name,
            "/api/v1/analyze",
            method="POST",
            data=json.dumps({"text": "Synthetic name mismatch"}),
            headers=headers,
        )
        assert response["status"] == 503
        body = json.loads(response["body"])
        assert body["error"]["code"] == "model_not_configured"
        assert body["draft"] is None and not body["actions"]
        malformed = request(name, "/api/v1/analyze", method="POST", data="{", headers=headers)
        assert malformed["status"] == 422 and "Synthetic" not in malformed["body"]
        oversized = request(
            name, "/api/v1/analyze", method="POST", data="x" * 32769, headers=headers
        )
        assert oversized["status"] == 413
        for origin, allowed in [
            ("https://preview.example.invalid", True),
            ("https://other.example.invalid", False),
        ]:
            response = request(
                name,
                "/api/v1/analyze",
                method="OPTIONS",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "content-type",
                },
            )
            assert response["status"] == (200 if allowed else 400)
            assert response["headers"].get("access-control-allow-origin") == (
                origin if allowed else None
            )
            assert "access-control-allow-credentials" not in response["headers"]

        audit = """
import importlib.util, os
from pathlib import Path
from backend.config import PUBLIC_KNOWLEDGE_ROOT
from backend.knowledge_readiness import check_corpus
assert os.getuid() == 10001
assert check_corpus(PUBLIC_KNOWLEDGE_ROOT).structure_ready
assert len(list(PUBLIC_KNOWLEDGE_ROOT.rglob('*.md'))) == 186
assert not os.access(PUBLIC_KNOWLEDGE_ROOT / 'README.md', os.W_OK)
assert {p.name for p in Path('/app').iterdir()} == {'.venv', 'backend', 'references'}
assert {p.name for p in Path('/app/references').iterdir()} == {'knowledge'}
for name in ('pytest', 'ruff'):
    assert importlib.util.find_spec(name) is None
for directory in (Path('/app/backend'), Path('/app/references')):
    for path in directory.rglob('*'):
        assert not path.name.startswith('.env')
        assert path.suffix not in {'.key', '.pem'}
print('non-root, read-only public corpus, production dependencies only')
"""
        print(docker("exec", name, "python", "-c", audit))
        print("PASS: liveness, dependency gating, capabilities, CORS, validation and image privacy")
    finally:
        if started:
            docker("rm", "--force", name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", help="Already-built local backend image tag or ID")
    smoke(parser.parse_args().image)
