"""Unit tests for the lifecycle/cache store. Synthetic fixtures only."""

import json
from pathlib import Path

import pytest

from backend.api.schemas import AnalyzeResponse
from backend.history.store import CaseHistoryStore, fingerprint

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"


def synthetic_response(**overrides) -> AnalyzeResponse:
    payload = json.loads((EXAMPLES / "success.json").read_text(encoding="utf-8"))
    payload.update(overrides)
    return AnalyzeResponse.model_validate(payload)


def test_fingerprint_is_stable_and_ignores_case_and_whitespace():
    a = fingerprint("en", "My   claim   was Rejected")
    b = fingerprint("en", "my claim was rejected")
    c = fingerprint("hi", "my claim was rejected")
    assert a == b
    assert a != c


def test_lifecycle_transitions_and_history_order():
    store = CaseHistoryStore()
    first = store.start("alice", "en", "First question")
    assert first.status == "started"
    store.mark_processing(first.case_id)
    response = synthetic_response()
    store.complete(first.case_id, response)

    second = store.start("alice", "en", "Second question")
    store.fail(second.case_id)

    history = store.history("alice")
    assert [record.case_id for record in history] == [second.case_id, first.case_id]
    assert history[0].status == "failed"
    assert history[1].status == "completed"
    assert history[1].reason_id == "epfo-rr-001"
    assert history[1].outcome == "success"
    assert history[1].from_cache is False


def test_history_is_isolated_per_session():
    store = CaseHistoryStore()
    mine = store.start("alice", "en", "Question")
    store.complete(mine.case_id, synthetic_response())
    store.start("bob", "en", "Unrelated question")

    assert len(store.history("alice")) == 1
    assert len(store.history("bob")) == 1
    assert store.history("nobody") == []


def test_success_is_cached_and_replayed_without_draft():
    store = CaseHistoryStore()
    record = store.start("alice", "en", "My claim was rejected")
    store.complete(record.case_id, synthetic_response())

    cached = store.find_cached("en", "my   claim WAS rejected")
    assert cached is not None
    assert cached.draft is None
    assert cached.classification.reason_id == "epfo-rr-001"

    # A different language or different text never matches.
    assert store.find_cached("hi", "my claim was rejected") is None
    assert store.find_cached("en", "a totally different question") is None


def test_error_and_clarification_are_never_cached():
    for status, extra in [
        (
            "error",
            {
                "classification": None,
                "explanation": [],
                "actions": [],
                "required_documents": [],
                "draft": None,
                "citations": [],
                "error": {"code": "analysis_failed", "message": "failed"},
            },
        ),
        (
            "needs_clarification",
            {
                "classification": None,
                "explanation": [],
                "actions": [],
                "required_documents": [],
                "draft": None,
                "citations": [],
                "error": None,
                "questions": ["Which claim number?"],
            },
        ),
    ]:
        store_ = CaseHistoryStore()
        record = store_.start("alice", "en", "Ambiguous question")
        response = synthetic_response(status=status, **extra)
        store_.complete(record.case_id, response)
        assert store_.find_cached("en", "Ambiguous question") is None


def test_unsupported_is_cached():
    store = CaseHistoryStore()
    record = store.start("alice", "en", "Totally unknown rejection reason")
    response = synthetic_response(
        status="unsupported",
        classification=None,
        explanation=[],
        actions=[],
        required_documents=[],
        draft=None,
        citations=[],
        error=None,
        warnings=["No matching reason was found in the knowledge corpus."],
    )
    store.complete(record.case_id, response)
    cached = store.find_cached("en", "Totally unknown rejection reason")
    assert cached is not None
    assert cached.status == "unsupported"


def test_a_cache_hit_recorded_via_complete_does_not_recache_itself():
    store = CaseHistoryStore(max_records=10)
    original = store.start("alice", "en", "Question")
    store.complete(original.case_id, synthetic_response())

    replay = store.start("bob", "en", "question")
    cached = store.find_cached("en", "question")
    store.complete(replay.case_id, cached, from_cache=True)

    history = store.history("bob")
    assert history[0].from_cache is True
    assert history[0].outcome == "success"


def test_bounded_store_evicts_oldest_first():
    store = CaseHistoryStore(max_records=3, max_per_session=3)
    ids = []
    for i in range(5):
        record = store.start("alice", "en", f"question {i}")
        ids.append(record.case_id)
    history_ids = {record.case_id for record in store.history("alice", limit=10)}
    assert len(history_ids) <= 3
    assert ids[0] not in history_ids


def test_invalid_bounds_rejected():
    with pytest.raises(ValueError):
        CaseHistoryStore(max_records=0)
    with pytest.raises(ValueError):
        CaseHistoryStore(max_per_session=0)


def test_persisted_rows_never_contain_raw_text(tmp_path):
    log = tmp_path / "history.jsonl"
    store = CaseHistoryStore(persist_path=log)
    secret_text = "SECRET_RAW_CLAIM_TEXT_NEVER_PERSISTED"
    record = store.start("alice", "en", secret_text)
    store.complete(record.case_id, synthetic_response())

    contents = log.read_text(encoding="utf-8")
    assert secret_text not in contents
    lines = [json.loads(line) for line in contents.splitlines() if line]
    assert len(lines) == 1
    assert lines[0]["case_id"] == record.case_id
    assert lines[0]["status"] == "completed"
    assert set(lines[0]) == {
        "case_id",
        "session_id",
        "language",
        "fingerprint",
        "status",
        "reason_id",
        "outcome",
        "from_cache",
        "created_at",
        "updated_at",
    }


def test_persist_failure_never_raises(tmp_path):
    store = CaseHistoryStore(persist_path=tmp_path / "missing-dir" / "history.jsonl")
    record = store.start("alice", "en", "question")
    store.complete(record.case_id, synthetic_response())  # must not raise
