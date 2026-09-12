"""HistoryTrackingService: cache short-circuit, lifecycle recording, per-session isolation."""

import json
from pathlib import Path

import pytest

from backend.api.schemas import AnalyzeRequest, AnalyzeResponse
from backend.history.service import HistoryTrackingService
from backend.history.store import CaseHistoryStore

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"


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


async def test_repeat_text_query_hits_cache_and_never_calls_inner_again():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = HistoryTrackingService(inner, store, session_id="alice")

    request = AnalyzeRequest(text="My claim was rejected", language="en")
    first = await service.analyze(request)
    assert len(inner.calls) == 1
    assert first.classification.reason_id == "epfo-rr-001"

    second = await service.analyze(
        AnalyzeRequest(
            text="my   claim WAS rejected",
            language="en",
            details={"claimant_name": "Someone Else"},
        )
    )
    assert len(inner.calls) == 1, "identical query must not re-run the inner analysis"
    assert second.classification.reason_id == "epfo-rr-001"

    history = store.history("alice")
    assert [record.status for record in history] == ["completed", "completed"]
    assert history[0].from_cache is True
    assert history[1].from_cache is False


async def test_cache_hit_rebuilds_draft_from_the_new_callers_own_details():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = HistoryTrackingService(inner, store, session_id="alice")

    await service.analyze(AnalyzeRequest(text="My claim was rejected", language="en"))
    second = await service.analyze(
        AnalyzeRequest(
            text="my claim was rejected",
            language="en",
            details={"claimant_name": "Priya Verma"},
        )
    )
    assert second.draft is not None
    assert any(block.text == "Priya Verma" for block in second.draft.blocks)
    assert "claimant_name" not in second.draft.missing_fields


async def test_different_text_or_language_never_shares_a_cache_slot():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = HistoryTrackingService(inner, store, session_id="alice")

    await service.analyze(AnalyzeRequest(text="My claim was rejected", language="en"))
    await service.analyze(AnalyzeRequest(text="A completely different question", language="en"))
    await service.analyze(AnalyzeRequest(text="My claim was rejected", language="hi"))
    assert len(inner.calls) == 3


async def test_image_requests_are_never_cache_checked_but_are_still_recorded():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    service = HistoryTrackingService(inner, store, session_id="alice")

    request = AnalyzeRequest(image_key="opaque-key-1", language="en")
    await service.analyze(request)
    await service.analyze(request)
    assert len(inner.calls) == 2, "image requests always re-run; caching needs extracted text"
    assert len(store.history("alice")) == 2


async def test_failure_is_recorded_and_never_cached():
    store = CaseHistoryStore()
    inner = StubInner(RuntimeError("boom"))
    service = HistoryTrackingService(inner, store, session_id="alice")

    with pytest.raises(RuntimeError):
        await service.analyze(AnalyzeRequest(text="Question that fails", language="en"))

    history = store.history("alice")
    assert history[0].status == "failed"
    assert store.find_cached("en", "Question that fails") is None


async def test_cross_session_cache_hit_never_carries_the_first_callers_details():
    """The exact-match cache is deliberately global (see HANDOFF-history-cache.md), so a
    second, unrelated session can hit a slot a different session filled - that is the
    whole point. What must never happen: any field derived from the first caller's own
    submitted details reaching a later, different caller. Only `draft` is caller-specific
    (rebuilt fresh every time, see build_draft) - classification/explanation/actions/
    citations are grounded purely in the shared knowledge corpus and the fingerprinted
    text, never in `details`, so they are safe to share across sessions.
    """
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    alice = HistoryTrackingService(inner, store, session_id="alice")
    bob = HistoryTrackingService(inner, store, session_id="bob")

    await alice.analyze(
        AnalyzeRequest(
            text="My claim was rejected",
            language="en",
            details={"claimant_name": "Alice", "claim_id": "alice-claim-1"},
        )
    )
    assert len(inner.calls) == 1

    bob_response = await bob.analyze(
        AnalyzeRequest(
            text="my   claim WAS rejected",
            language="en",
            details={"claimant_name": "Bob", "claim_id": "bob-claim-2"},
        )
    )
    assert len(inner.calls) == 1, "the identical text must still hit the shared cache"
    assert bob_response.classification.reason_id == "epfo-rr-001"
    # Bob's own draft, never Alice's - the only caller-specific field never leaks across.
    assert not any(block.text == "Alice" for block in bob_response.draft.blocks)
    assert not any("alice-claim-1" in block.text for block in bob_response.draft.blocks)
    assert any(block.text == "Bob" for block in bob_response.draft.blocks)


async def test_sessions_never_share_history_or_bleed_into_each_others_view():
    store = CaseHistoryStore()
    inner = StubInner(synthetic_response())
    alice = HistoryTrackingService(inner, store, session_id="alice")
    bob = HistoryTrackingService(inner, store, session_id="bob")

    await alice.analyze(AnalyzeRequest(text="Alice's question", language="en"))
    await bob.analyze(AnalyzeRequest(text="Bob's question", language="en"))

    assert len(store.history("alice")) == 1
    assert len(store.history("bob")) == 1
