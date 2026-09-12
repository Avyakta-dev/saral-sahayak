"""Pipeline admission and cleanup ordering, with fake storage and a fake client."""

import pytest
from test_agent import FakeClient
from test_level_two_api import (  # noqa: F401  (autouse offline guard)
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.agent.service import AnalysisError
from backend.images.config import ImageConfig
from backend.images.pipeline import ImagePipeline
from backend.images.storage import ObjectInfo, StorageError, is_admissible_key, new_object_key
from backend.tools.budget import Budget, BudgetLimits

ENDPOINT = "https://account.r2.cloudflarestorage.com"
URL = ENDPOINT + "/synthetic-bucket/inbox/signed"
KEY = "inbox/" + "a" * 32 + ".png"
OTHER_KEY = "inbox/" + "b" * 32 + ".png"
SECRET_TEXT = "synthetic-private-storage-detail"


def config(**overrides):
    values = {"endpoint": ENDPOINT, "bucket": "synthetic-bucket"}
    values.update(overrides)
    return ImageConfig(**values)


class FakeStorage:
    def __init__(self, info=ObjectInfo("image/png", 2048), failure=None):
        self.info = info
        self.failure = failure
        self.deleted = []
        self.presigned = []
        self.heads = []

    def presign_put(self, key, content_type):
        if self.failure is not None:
            raise self.failure
        return URL, 120

    def presign_get(self, key):
        self.presigned.append(key)
        return URL

    async def head(self, key):
        self.heads.append(key)
        if isinstance(self.failure, StorageError):
            raise self.failure
        return self.info

    async def delete(self, key):
        self.deleted.append(key)


def pipeline(storage=None, client=None, **overrides):
    return ImagePipeline(
        config(**overrides),
        client if client is not None else FakeClient(),
        storage if storage is not None else FakeStorage(),
    )


def budget():
    return Budget(BudgetLimits())


def admitted(status="extracted", text="Name does not match Aadhaar."):
    import json

    from backend.llm import LLMResult, Message

    payload = json.dumps({"status": status, "text": text})
    return LLMResult(
        message=Message(role="assistant", content=payload), finish_reason="stop", usage=None
    )


def test_admit_mints_a_key_and_bounded_url_for_an_allowed_type():
    key, url, ttl = pipeline().admit("image/png")
    assert is_admissible_key(key) and url == URL and ttl == 120


@pytest.mark.parametrize("content_type", ["image/gif", "image/svg+xml", "text/html", ""])
def test_admit_rejects_unsupported_types_before_touching_storage(content_type):
    storage = FakeStorage()
    with pytest.raises(AnalysisError) as error:
        pipeline(storage).admit(content_type)
    assert error.value.code == "image_not_admitted" and error.value.http_status == 422
    assert storage.presigned == []


def test_admit_maps_storage_failure_to_unavailable():
    with pytest.raises(AnalysisError) as error:
        pipeline(FakeStorage(failure=StorageError(SECRET_TEXT))).admit("image/png")
    assert error.value.code == "image_input_unavailable" and error.value.http_status == 503
    assert SECRET_TEXT not in str(error.value)


async def test_extract_verifies_its_own_object_then_removes_it():
    storage = FakeStorage()
    text = await pipeline(storage, FakeClient(admitted())).extract(KEY, budget())
    assert text == "Name does not match Aadhaar."
    assert storage.heads == [KEY]
    assert storage.presigned == [KEY]
    assert storage.deleted == [KEY]


@pytest.mark.parametrize(
    "key",
    [
        "",
        "inbox/short.png",
        "other/" + "a" * 32 + ".png",
        "inbox/" + "a" * 32 + ".png/../x.png",
        "https://account.r2.cloudflarestorage.com/inbox/" + "a" * 32 + ".png",
        "inbox/" + "A" * 32 + ".png",
    ],
)
async def test_bad_key_shape_never_reaches_storage_or_a_provider(key):
    storage = FakeStorage()
    client = FakeClient(admitted())
    with pytest.raises(AnalysisError) as error:
        await pipeline(storage, client).extract(key, budget())
    assert error.value.code == "image_not_admitted"
    assert storage.heads == [] and storage.presigned == [] and storage.deleted == []
    assert client.calls == []


@pytest.mark.parametrize(
    "info",
    [
        None,  # never uploaded, or already cleaned up
        ObjectInfo("text/html", 2048),
        ObjectInfo("image/gif", 2048),
        ObjectInfo("image/png", 0),
        ObjectInfo("image/png", 10 * 1024 * 1024 + 1),
    ],
)
async def test_unusable_objects_are_rejected_and_cleaned_up(info):
    storage = FakeStorage(info=info)
    client = FakeClient(admitted())
    with pytest.raises(AnalysisError) as error:
        await pipeline(storage, client).extract(KEY, budget())
    assert error.value.code == "image_not_admitted" and error.value.http_status == 422
    assert client.calls == []
    assert storage.deleted == [KEY]


async def test_object_is_removed_even_when_extraction_fails():
    storage = FakeStorage()
    client = FakeClient(admitted(status="unreadable", text=""))
    with pytest.raises(AnalysisError) as error:
        await pipeline(storage, client).extract(KEY, budget())
    assert error.value.code == "image_unreadable"
    assert storage.deleted == [KEY]


async def test_storage_failure_is_sanitized_and_still_attempts_cleanup():
    storage = FakeStorage(failure=StorageError(SECRET_TEXT))
    with pytest.raises(AnalysisError) as error:
        await pipeline(storage, FakeClient()).extract(KEY, budget())
    assert error.value.code == "image_input_unavailable" and error.value.http_status == 503
    assert SECRET_TEXT not in str(error.value)
    assert storage.deleted == [KEY]


async def test_extraction_charges_the_caller_owned_budget():
    shared = budget()
    await pipeline(FakeStorage(), FakeClient(admitted())).extract(KEY, shared)
    assert shared.usage.model_turns == 1


async def test_two_objects_use_independent_keys_and_cleanup():
    storage = FakeStorage()
    store = pipeline(storage, FakeClient(admitted(), admitted()))
    await store.extract(KEY, budget())
    await store.extract(OTHER_KEY, budget())
    assert storage.deleted == [KEY, OTHER_KEY]
    assert new_object_key(config(), "image/png") != new_object_key(config(), "image/png")
