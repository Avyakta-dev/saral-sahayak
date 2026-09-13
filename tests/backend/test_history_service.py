"""Offline history/cache checks. All requests and model responses are synthetic."""

import hashlib
import json
from pathlib import Path

import pytest

from backend.api.schemas import AnalyzeRequest, AnalyzeResponse
from backend.history.service import HistoryTrackingService
from backend.history.store import CaseHistoryStore

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"
SCOPE = "a" * 64


def synthetic_response(**overrides) -> AnalyzeResponse:
    payload = json.loads((EXAMPLES / "success.json").read_text(encoding="utf-8"))
    payload.update(overrides)
    return AnalyzeResponse.model_validate(payload)


class StubInner:
    def __init__(self, response: AnalyzeResponse | Exception):
        self.response = response
        self.calls: list[AnalyzeRequest] = []

    async def analyze(self, request: AnalyzeRequest, *, activity=None) -> AnalyzeResponse:
        self.calls.append(request)
        if isinstance(self.response, Exception):
            raise self.response
        return self.response


def scoped(inner, store, session_id="alice", scope=SCOPE):
    return HistoryTrackingService(inner, store, session_id=session_id, cache_scope=scope)


async def test_default_scope_disables_response_retention_but_keeps_history():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = HistoryTrackingService(inner, store, session_id="alice")
    request = AnalyzeRequest(text="My claim was rejected")
    await service.analyze(request)
    await service.analyze(request)
    assert len(inner.calls) == 2
    assert store._cache == {}
    assert [record.from_cache for record in store.history("alice")] == [False, False]


async def test_repeat_text_query_hits_explicit_scope_and_preserves_evidence():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = scoped(inner, store)
    request = AnalyzeRequest(text="My claim was rejected")
    first = await service.analyze(request)
    second = await service.analyze(request)
    assert len(inner.calls) == 1
    assert second.citations == first.citations
    assert second.actions == first.actions
    assert second.explanation == first.explanation
    assert second.draft is not None
    assert second.draft.missing_fields  # no synthetic fixture identity is replayed
    assert [record.status for record in store.history("alice")] == ["completed", "completed"]
    assert [record.from_cache for record in store.history("alice")] == [True, False]


@pytest.mark.parametrize(
    "details",
    [
        {"claimant_name": "Synthetic Second Caller"},
        {"claim_id": "SYNTHETIC-CLAIM-2"},
        {"claim_type": "Form 19"},
        {"claimant_name": ""},  # supplied empty strings still differ from absent details
    ],
)
async def test_details_bypass_both_cache_lookup_and_write(details):
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = scoped(inner, store)
    text = "My claim was rejected"
    await service.analyze(AnalyzeRequest(text=text))
    original = store.find_cached("en", text, session_id="alice", cache_scope=SCOPE)
    inner.response = synthetic_response()
    inner.response.classification.rationale = "SYNTHETIC PRIVATE DETAIL ECHO"
    detailed = AnalyzeRequest(text=text, details=details)
    await service.analyze(detailed)
    await service.analyze(detailed)
    assert len(inner.calls) == 3, "details must not consume even a generic cached answer"
    cached = store.find_cached("en", text, session_id="alice", cache_scope=SCOPE)
    assert cached == original, "details must not replace the generic cache entry"
    assert "SYNTHETIC PRIVATE DETAIL ECHO" not in cached.model_dump_json()
    # Nor may a detail-bearing request seed a fresh slot.
    await service.analyze(AnalyzeRequest(text="New synthetic question", details=details))
    assert (
        store.find_cached("en", "New synthetic question", session_id="alice", cache_scope=SCOPE)
        is None
    )


@pytest.mark.parametrize(
    "text,language",
    [
        ("my claim was rejected", "en"),
        ("My  claim was rejected", "en"),
        ("A completely different question", "en"),
        ("My claim was rejected", "hi"),
    ],
)
async def test_different_exact_text_or_language_never_shares_a_cache_slot(text, language):
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = scoped(inner, store)
    await service.analyze(AnalyzeRequest(text="My claim was rejected"))
    await service.analyze(AnalyzeRequest(text=text, language=language))
    assert len(inner.calls) == 2


async def test_image_requests_bypass_both_cache_lookup_and_write():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = scoped(inner, store)
    key = "synthetic-opaque-key-1"
    await service.analyze(AnalyzeRequest(text=key))
    original = store.find_cached("en", key, session_id="alice", cache_scope=SCOPE)
    inner.response = synthetic_response()
    inner.response.classification.rationale = "SYNTHETIC OCR ECHO"
    request = AnalyzeRequest(image_key=key)
    await service.analyze(request)
    await service.analyze(request)
    assert len(inner.calls) == 3
    assert len(store.history("alice")) == 3
    assert store.find_cached("en", key, session_id="alice", cache_scope=SCOPE) == original
    await service.analyze(AnalyzeRequest(image_key="new-synthetic-image-key"))
    assert (
        store.find_cached("en", "new-synthetic-image-key", session_id="alice", cache_scope=SCOPE)
        is None
    )


async def test_failure_is_recorded_and_never_cached():
    store = CaseHistoryStore()
    inner = StubInner(RuntimeError("synthetic failure"))
    service = scoped(inner, store)
    with pytest.raises(RuntimeError):
        await service.analyze(AnalyzeRequest(text="Question that fails"))
    assert store.history("alice")[0].status == "failed"
    assert (
        store.find_cached("en", "Question that fails", session_id="alice", cache_scope=SCOPE)
        is None
    )


async def test_identical_text_in_different_sessions_never_replays_response():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    alice = scoped(inner, store)
    bob = scoped(inner, store, session_id="bob")
    request = AnalyzeRequest(text="My claim was rejected")
    await alice.analyze(request)
    await bob.analyze(request)
    assert len(inner.calls) == 2
    assert len(store.history("alice")) == len(store.history("bob")) == 1
    assert store.history("alice")[0].case_id != store.history("bob")[0].case_id
    assert store.history("nobody") == []
    await bob.analyze(request)
    assert len(inner.calls) == 2


async def test_synthetic_corpus_model_and_contract_revisions_never_replay_old_guidance(tmp_path):
    # This test host hashes ONLY its tiny public synthetic corpus and nonsecret identity.
    # Production remains unscoped: no filesystem/config access is added to history.
    corpus = tmp_path / "public-synthetic.md"
    corpus.write_text("# Synthetic evidence\nRevision one, not policy.\n")

    def scope(model="synthetic-model-v1", contract="synthetic-contract-v1"):
        return hashlib.sha256(corpus.read_bytes() + model.encode() + contract.encode()).hexdigest()

    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    request = AnalyzeRequest(text="Synthetic revision test")
    first = scoped(inner, store, scope=scope())
    await first.analyze(request)
    await first.analyze(request)
    assert len(inner.calls) == 1
    corpus.write_text("# Synthetic evidence\nRevision two, not policy.\n")
    await scoped(inner, store, scope=scope()).analyze(request)
    await scoped(inner, store, scope=scope(model="synthetic-model-v2")).analyze(request)
    await scoped(inner, store, scope=scope(contract="synthetic-contract-v2")).analyze(request)
    assert len(inner.calls) == 4


async def test_scope_change_during_old_inflight_request_cannot_seed_new_scope():
    import asyncio

    entered = asyncio.Event()
    release = asyncio.Event()

    class DelayedInner(StubInner):
        async def analyze(self, request, *, activity=None):
            entered.set()
            await release.wait()
            return await super().analyze(request, activity=activity)

    store = CaseHistoryStore()
    inner = DelayedInner(synthetic_response())
    request = AnalyzeRequest(text="Synthetic in-flight request")
    old_task = asyncio.create_task(scoped(inner, store).analyze(request))
    await entered.wait()
    new = scoped(inner, store, scope="b" * 64)
    release.set()
    await old_task
    await new.analyze(request)
    assert len(inner.calls) == 2


async def test_expiry_runs_inner_again_and_replay_does_not_extend_ttl(monkeypatch):
    now = [100.0]
    monkeypatch.setattr("backend.history.store.time.monotonic", lambda: now[0])
    store = CaseHistoryStore(cache_ttl_seconds=10)
    inner = StubInner(synthetic_response())
    service = scoped(inner, store)
    request = AnalyzeRequest(text="Synthetic expiry test")
    await service.analyze(request)
    now[0] = 109
    await service.analyze(request)
    assert len(inner.calls) == 1
    now[0] = 110
    await service.analyze(request)
    assert len(inner.calls) == 2
    assert [r.from_cache for r in store.history("alice")] == [False, True, False]
