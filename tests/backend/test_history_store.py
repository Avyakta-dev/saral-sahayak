"""Unit tests for the lifecycle/cache store. Synthetic fixtures only."""

import json
from pathlib import Path

import pytest

from backend.api.schemas import AnalyzeResponse
from backend.history.store import CaseHistoryStore, fingerprint

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "examples"
SCOPE = "a" * 64


def cached(store, text, language="en", session_id="alice"):
    return store.find_cached(language, text, session_id=session_id, cache_scope=SCOPE)


def synthetic_response(**overrides) -> AnalyzeResponse:
    payload = json.loads((EXAMPLES / "success.json").read_text(encoding="utf-8"))
    payload.update(overrides)
    return AnalyzeResponse.model_validate(payload)


def test_fingerprint_is_stable_but_preserves_case_and_whitespace():
    text = "My   claim   was Rejected"
    assert fingerprint("en", text) == fingerprint("en", text)
    assert fingerprint("en", text) != fingerprint("en", text.lower())
    assert fingerprint("en", text) != fingerprint("en", " ".join(text.split()))
    assert fingerprint("en", text) != fingerprint("hi", text)


def test_fingerprint_with_a_key_is_not_the_bare_hash():
    import hashlib

    bare = hashlib.sha256("en\nmy claim was rejected".encode()).hexdigest()
    assert fingerprint("en", "my claim was rejected") == bare  # key=None: the bare path
    keyed = fingerprint("en", "my claim was rejected", key=b"x" * 32)
    assert keyed != bare, "a keyed fingerprint must never equal the unkeyed digest"


def test_fingerprint_changes_with_the_key():
    a = fingerprint("en", "my claim was rejected", key=b"a" * 32)
    b = fingerprint("en", "my claim was rejected", key=b"b" * 32)
    assert a != b


def test_each_store_instance_gets_its_own_fingerprint_key():
    """CaseHistoryStore.start()/find_cached() always pass their own per-process key
    (see CaseHistoryStore.__init__) - this is what actually protects a persisted log,
    not the bare fingerprint() default, which exists only for direct, unkeyed callers."""
    one = CaseHistoryStore()
    other = CaseHistoryStore()
    record = one.start("alice", "en", "my claim was rejected")
    assert record.fingerprint != fingerprint("en", "my claim was rejected")  # not the bare hash
    other_record = other.start("alice", "en", "my claim was rejected")
    assert record.fingerprint != other_record.fingerprint


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
    store.complete(record.case_id, synthetic_response(), cache_scope=SCOPE)

    replay = cached(store, "My claim was rejected")
    assert replay is not None
    assert replay.draft is None
    assert replay.classification.reason_id == "epfo-rr-001"

    # A different session, scope, language or exact text never matches.
    assert cached(store, "My claim was rejected", language="hi") is None
    assert cached(store, "my claim was rejected") is None
    assert cached(store, "My claim was rejected", session_id="bob") is None
    assert store.find_cached("en", "My claim was rejected", session_id="alice") is None
    assert store.find_cached("en", "My claim was rejected", cache_scope=SCOPE) is None
    assert (
        store.find_cached("en", "My claim was rejected", session_id="alice", cache_scope="b" * 64)
        is None
    )


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
        store_.complete(record.case_id, response, cache_scope=SCOPE)
        assert cached(store_, "Ambiguous question") is None


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
    store.complete(record.case_id, response, cache_scope=SCOPE)
    replay = cached(store, "Totally unknown rejection reason")
    assert replay is not None
    assert replay.status == "unsupported"


def test_a_cache_hit_recorded_via_complete_does_not_recache_itself():
    store = CaseHistoryStore(max_records=10)
    original = store.start("alice", "en", "Question")
    store.complete(original.case_id, synthetic_response(), cache_scope=SCOPE)

    replay = store.start("alice", "en", "Question")
    response = cached(store, "Question")
    store.complete(replay.case_id, response, from_cache=True, cache_scope=SCOPE)

    history = store.history("alice")
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


def test_global_eviction_cleans_up_the_stale_records_own_session_not_the_caller():
    """The globally-oldest record can belong to a different session than the one
    currently calling start() - eviction must remove it from its own bucket, and must
    drop that session's dict entry entirely once it has no records left, or a store
    fielding many distinct session ids would grow without bound.

    history()'s own defensive filtering of missing ids means this cannot be observed
    through the public API alone (a dangling id is silently skipped either way regardless
    of whether the bug is present), so this test reaches into the store's internal
    bookkeeping - the thing actually under test.
    """
    store = CaseHistoryStore(max_records=1, max_per_session=10)
    store.start("alice", "en", "alice question 1")
    # Evicts alice's only record - but the caller here is "bob", not "alice". A buggy
    # implementation that cleans up the *caller's* bucket instead of the stale record's
    # own bucket leaves alice's dangling id in place forever.
    store.start("bob", "en", "bob question 1")
    assert store._by_session.get("alice", []) == [], "alice's evicted id must not dangle"

    # Symmetrically, evicts bob's only record while carol is the caller.
    store.start("carol", "en", "carol question 1")
    assert "bob" not in store._by_session, "an empty session bucket must not linger forever"
    assert list(store._by_session) == ["carol"]


def test_invalid_bounds_rejected():
    with pytest.raises(ValueError):
        CaseHistoryStore(max_records=0)
    with pytest.raises(ValueError):
        CaseHistoryStore(max_per_session=0)


def test_empty_session_case_or_fingerprint_id_never_validates():
    """An empty id is exactly the shared-bucket collapse this module's per-session
    isolation exists to prevent - it must be rejected at the model/schema level, not
    only avoided by callers (backend.main never emits one today, but that must not be
    the sole guarantee)."""
    from pydantic import ValidationError

    from backend.history.models import CaseRecord
    from backend.history.schemas import HistoryCase, HistoryResponse

    base = dict(
        case_id="c1",
        session_id="alice",
        language="en",
        fingerprint="f" * 64,
        status="completed",
        created_at=1.0,
        updated_at=1.0,
    )
    CaseRecord.model_validate(base)  # sanity: the valid case passes
    for field in ("case_id", "session_id", "fingerprint"):
        with pytest.raises(ValidationError):
            CaseRecord.model_validate({**base, field: ""})

    case = dict(
        case_id="c1",
        status="completed",
        language="en",
        from_cache=False,
        created_at=1.0,
        updated_at=1.0,
    )
    HistoryCase.model_validate(case)
    with pytest.raises(ValidationError):
        HistoryCase.model_validate({**case, "case_id": ""})
    HistoryResponse.model_validate({"session_id": "alice", "cases": []})
    with pytest.raises(ValidationError):
        HistoryResponse.model_validate({"session_id": "", "cases": []})


def test_persisted_rows_never_contain_raw_text(tmp_path):
    log = tmp_path / "history.jsonl"
    store = CaseHistoryStore(persist_path=log)
    secret_text = "SECRET_RAW_CLAIM_TEXT_NEVER_PERSISTED"
    record = store.start("alice", "en", secret_text)
    store.complete(record.case_id, synthetic_response())

    contents = log.read_text(encoding="utf-8")
    assert secret_text not in contents
    assert (log.stat().st_mode & 0o777) == 0o600, (
        "the persisted log must not be group/world-readable"
    )
    lines = [json.loads(line) for line in contents.splitlines() if line]
    assert len(lines) == 1
    assert lines[0]["case_id"] == record.case_id
    assert lines[0]["status"] == "completed"
    # session_id is caller-controlled (X-Session-Id); the on-disk copy must be a
    # pseudonym, never the literal value, even though the in-memory store keys on it.
    assert lines[0]["session_id"] != "alice"
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


def test_session_id_pseudonym_is_stable_and_never_leaks_the_live_keying(tmp_path):
    log = tmp_path / "history.jsonl"
    store = CaseHistoryStore(persist_path=log)
    for session_id in ("alice", "alice", "bob"):
        record = store.start(session_id, "en", "question")
        store.complete(record.case_id, synthetic_response())

    lines = [json.loads(line) for line in log.read_text(encoding="utf-8").splitlines()]
    alice_pseudonyms = {lines[0]["session_id"], lines[1]["session_id"]}
    assert alice_pseudonyms == {lines[0]["session_id"]}, "same session must persist identically"
    assert lines[2]["session_id"] not in alice_pseudonyms
    # The live view is keyed on the real id regardless of what is written to disk.
    assert len(store.history("alice")) == 2
    assert len(store.history("bob")) == 1


def test_persist_failure_never_raises(tmp_path):
    store = CaseHistoryStore(persist_path=tmp_path / "missing-dir" / "history.jsonl")
    record = store.start("alice", "en", "question")
    store.complete(record.case_id, synthetic_response())  # must not raise


def test_unscoped_completion_never_retains_response():
    store = CaseHistoryStore()
    record = store.start("alice", "en", "Synthetic question")
    store.complete(record.case_id, synthetic_response())
    assert store._cache == {}
    assert cached(store, "Synthetic question") is None
    assert store.history("alice")[0].status == "completed"


@pytest.mark.parametrize("scope", ["", " ", "a" * 63, "A" * 64, "z" * 64, 123, b"a" * 64])
def test_invalid_scope_is_rejected_without_exposing_its_value(scope):
    store = CaseHistoryStore()
    with pytest.raises(ValueError, match="trusted SHA-256"):
        store.find_cached("en", "Synthetic question", session_id="alice", cache_scope=scope)
    record = store.start("alice", "en", "Synthetic question")
    with pytest.raises(ValueError, match="trusted SHA-256"):
        store.complete(record.case_id, synthetic_response(), cache_scope=scope)
    assert store._cache == {}


@pytest.mark.parametrize("ttl", [0, -1, 301, float("inf"), float("nan"), True])
def test_cache_ttl_is_finite_positive_and_bounded(ttl):
    with pytest.raises(ValueError):
        CaseHistoryStore(cache_ttl_seconds=ttl)


def test_cache_copies_on_both_insert_and_read():
    store = CaseHistoryStore()
    response = synthetic_response()
    record = store.start("alice", "en", "Synthetic question")
    store.complete(record.case_id, response, cache_scope=SCOPE)
    response.actions[0].text = "SYNTHETIC POST-RETURN MUTATION"
    response.citations[0].source_urls.clear()
    replay = cached(store, "Synthetic question")
    assert replay.actions[0].text != response.actions[0].text
    assert replay.citations[0].source_urls
    replay.actions[0].text = "SYNTHETIC REPLAY MUTATION"
    replay.citations.clear()
    fresh = cached(store, "Synthetic question")
    assert fresh.actions[0].text != replay.actions[0].text
    assert fresh.citations


def test_start_and_history_do_not_expose_mutable_internal_records():
    store = CaseHistoryStore()
    record = store.start("alice", "en", "Synthetic question")
    record.session_id = "bob"
    record.fingerprint = "f" * 64
    store.complete(record.case_id, synthetic_response(), cache_scope=SCOPE)
    assert cached(store, "Synthetic question") is not None
    view = store.history("alice")
    view[0].status = "failed"
    assert store.history("alice")[0].status == "completed"
    assert store.history("bob") == []
    assert store.history("alice", limit=0) == []


def test_terminal_completion_cannot_extend_expiry_or_duplicate_persistence(tmp_path, monkeypatch):
    now = [100.0]
    monkeypatch.setattr("backend.history.store.time.monotonic", lambda: now[0])
    log = tmp_path / "history.jsonl"
    store = CaseHistoryStore(persist_path=log, cache_ttl_seconds=10)
    record = store.start("alice", "en", "Synthetic question")
    response = synthetic_response()
    store.complete(record.case_id, response, cache_scope=SCOPE)
    now[0] = 109
    store.complete(record.case_id, response, cache_scope=SCOPE)
    store.fail(record.case_id)
    store.mark_processing(record.case_id)
    assert store.history("alice")[0].status == "completed"
    now[0] = 110
    assert cached(store, "Synthetic question") is None
    assert len(log.read_text().splitlines()) == 1


def test_cache_entry_count_is_bounded_and_expiry_removes_unrelated_entries(monkeypatch):
    now = [100.0]
    monkeypatch.setattr("backend.history.store.time.monotonic", lambda: now[0])
    store = CaseHistoryStore(max_records=2, cache_ttl_seconds=10)
    for i in range(3):
        record = store.start("alice", "en", f"Synthetic question {i}")
        store.complete(record.case_id, synthetic_response(), cache_scope=SCOPE)
    assert len(store._cache) == 2
    assert cached(store, "Synthetic question 0") is None
    now[0] = 110
    assert cached(store, "An unrelated question") is None
    assert store._cache == {}


def test_restart_never_rehydrates_history_or_cache_and_never_persists_payload(tmp_path):
    log = tmp_path / "history.jsonl"
    store = CaseHistoryStore(persist_path=log)
    record = store.start("SYNTHETIC PRIVATE SESSION", "en", "SYNTHETIC PRIVATE INPUT")
    response = synthetic_response()
    response.explanation[0].text = "SYNTHETIC PRIVATE MODEL ECHO"
    store.complete(record.case_id, response, cache_scope=SCOPE)
    contents = log.read_text()
    assert "SYNTHETIC PRIVATE" not in contents
    assert SCOPE not in contents
    restarted = CaseHistoryStore(persist_path=log)
    assert restarted.history("SYNTHETIC PRIVATE SESSION") == []
    assert (
        cached(restarted, "SYNTHETIC PRIVATE INPUT", session_id="SYNTHETIC PRIVATE SESSION") is None
    )
    new = restarted.start("SYNTHETIC PRIVATE SESSION", "en", "SYNTHETIC PRIVATE INPUT")
    assert new.fingerprint != record.fingerprint


def test_existing_persistence_file_is_private_before_any_bytes_are_written(tmp_path, monkeypatch):
    import os

    log = tmp_path / "history.jsonl"
    log.touch(mode=0o644)
    log.chmod(0o644)
    real_write = os.write
    writes = []

    def partial_write(fd, data):
        assert os.fstat(fd).st_mode & 0o777 == 0o600
        writes.append(len(data))
        return real_write(fd, data[:13])  # force short writes

    monkeypatch.setattr("backend.history.store.os.write", partial_write)
    store = CaseHistoryStore(persist_path=log)
    record = store.start("alice", "en", "Synthetic question")
    store.complete(record.case_id, synthetic_response())
    assert len(writes) > 1
    assert json.loads(log.read_text())["case_id"] == record.case_id


@pytest.mark.parametrize("kind", ["symlink", "hardlink", "fifo"])
def test_persistence_refuses_linked_or_nonregular_targets(tmp_path, kind):
    import os

    target = tmp_path / "target"
    target.write_text("synthetic untouched bytes")
    log = tmp_path / "history.jsonl"
    if kind == "symlink":
        log.symlink_to(target)
    elif kind == "hardlink":
        os.link(target, log)
    else:
        os.mkfifo(log)
    store = CaseHistoryStore(persist_path=log)
    record = store.start("alice", "en", "Synthetic question")
    store.complete(record.case_id, synthetic_response())
    assert target.read_text() == "synthetic untouched bytes"
    assert store.history("alice")[0].status == "completed"
