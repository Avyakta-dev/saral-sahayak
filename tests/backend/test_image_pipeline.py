"""Admission, byte validation, immutable provider snapshot and cleanup (all offline)."""

import asyncio
import io

import pytest
from PIL import Image, PngImagePlugin
from test_agent import FakeClient
from test_level_two_api import (  # noqa: F401
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.agent.service import AnalysisError
from backend.images.config import ImageConfig
from backend.images.pipeline import ImagePipeline, validate_image
from backend.images.storage import (
    InvalidImage,
    ObjectInfo,
    StorageError,
    is_admissible_key,
    new_object_key,
)
from backend.tools.budget import Budget, BudgetLimits

ENDPOINT = "https://account.r2.cloudflarestorage.com"
URL = ENDPOINT + "/synthetic-bucket/validated/signed"
KEY = "inbox/" + "a" * 32 + ".png"
OTHER_KEY = "inbox/" + "b" * 32 + ".png"
SECRET_TEXT = "synthetic-private-storage-detail"


def raster(format="PNG", size=(8, 8), **kwargs):
    out = io.BytesIO()
    Image.new("RGB", size, "red").save(out, format=format, **kwargs)
    return out.getvalue()


PNG = raster()


def config(**overrides):
    values = {"endpoint": ENDPOINT, "bucket": "synthetic-bucket", "lifecycle_configured": True}
    values.update(overrides)
    return ImageConfig(**values)


class FakeStorage:
    def __init__(self, info=ObjectInfo("image/png", len(PNG)), failure=None, data=PNG):
        self.info = info
        self.failure = failure
        self.data = data
        self.deleted = []
        self.presigned = []
        self.reads = []
        self.uploads = []
        self.copies = {}

    def presign_put(self, key, content_type, content_length):
        if self.failure is not None:
            raise self.failure
        self.uploads.append((key, content_type, content_length))
        return URL, 120

    def presign_get(self, key):
        self.presigned.append(key)
        assert key.startswith("validated/") and key in self.copies
        return URL

    async def read(self, key, content_type, content_length):
        self.reads.append(key)
        if self.failure is not None:
            raise self.failure
        if self.info != ObjectInfo(content_type, content_length):
            raise InvalidImage()
        return self.data

    async def put_validated(self, key, data):
        assert key not in self.copies
        self.copies[key] = data

    async def delete(self, key):
        self.deleted.append(key)
        return True


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


def mint(store, content_type="image/png", content_length=len(PNG), **kwargs):
    return store.admit(content_type, content_length, **kwargs)[0]


def test_admit_mints_a_key_and_bounded_url_for_an_allowed_type():
    storage = FakeStorage()
    key, url, ttl = pipeline(storage).admit("image/png", len(PNG))
    assert is_admissible_key(key) and url == URL and ttl == 120
    assert storage.uploads == [(key, "image/png", len(PNG))]


@pytest.mark.parametrize("content_type", ["image/gif", "image/svg+xml", "text/html", ""])
def test_admit_rejects_unsupported_types_before_touching_storage(content_type):
    storage = FakeStorage()
    with pytest.raises(AnalysisError) as error:
        mint(pipeline(storage), content_type)
    assert error.value.code == "image_not_admitted" and error.value.http_status == 422
    assert storage.uploads == []


@pytest.mark.parametrize("length", [0, -1, True, "12", 1.5, 10 * 1024 * 1024 + 1])
def test_admit_rejects_invalid_lengths_before_storage(length):
    storage = FakeStorage()
    with pytest.raises(AnalysisError):
        mint(pipeline(storage), content_length=length)
    assert storage.uploads == []


def test_admit_maps_storage_failure_to_unavailable():
    with pytest.raises(AnalysisError) as error:
        mint(pipeline(FakeStorage(failure=StorageError(SECRET_TEXT))))
    assert error.value.code == "image_input_unavailable" and error.value.http_status == 503
    assert SECRET_TEXT not in str(error.value)


async def test_extract_verifies_its_own_object_then_removes_it():
    storage = FakeStorage()
    store = pipeline(storage, FakeClient(admitted()))
    key = mint(store)
    assert await store.extract(key, budget()) == "Name does not match Aadhaar."
    assert storage.reads == [key]
    (provider_key,) = storage.presigned
    assert provider_key != key and provider_key.startswith("validated/")
    assert storage.deleted == [key, provider_key]
    assert Image.open(io.BytesIO(storage.copies[provider_key])).format == "PNG"


@pytest.mark.parametrize(
    "key",
    [
        "",
        "inbox/short.png",
        "other/" + "a" * 32 + ".png",
        "inbox/" + "a" * 32 + ".png/../x.png",
        "https://account.r2.cloudflarestorage.com/inbox/" + "a" * 32 + ".png",
        "inbox/" + "A" * 32 + ".png",
        KEY,
        OTHER_KEY,
    ],
)
async def test_bad_or_unminted_key_never_reaches_storage_or_provider(key):
    storage = FakeStorage()
    client = FakeClient(admitted())
    with pytest.raises(AnalysisError) as error:
        await pipeline(storage, client).extract(key, budget())
    assert error.value.code == "image_not_admitted"
    assert storage.reads == [] and storage.presigned == [] and storage.deleted == []
    assert client.calls == []


@pytest.mark.parametrize(
    "info",
    [
        None,
        ObjectInfo("text/html", len(PNG)),
        ObjectInfo("image/gif", len(PNG)),
        ObjectInfo("image/png", 0),
        ObjectInfo("image/png", 10 * 1024 * 1024 + 1),
    ],
)
async def test_unusable_objects_are_rejected_and_cleaned_up(info):
    storage = FakeStorage(info=info)
    client = FakeClient(admitted())
    store = pipeline(storage, client)
    key = mint(store)
    with pytest.raises(AnalysisError) as error:
        await store.extract(key, budget())
    assert error.value.code == "image_not_admitted" and error.value.http_status == 422
    assert client.calls == [] and storage.deleted == [key]


async def test_object_is_removed_even_when_extraction_fails():
    storage = FakeStorage()
    store = pipeline(storage, FakeClient(admitted(status="unreadable", text="")))
    key = mint(store)
    with pytest.raises(AnalysisError) as error:
        await store.extract(key, budget())
    assert error.value.code == "image_unreadable"
    assert storage.deleted == [key, *storage.presigned]


async def test_storage_failure_is_sanitized_and_still_attempts_cleanup():
    storage = FakeStorage()
    store = pipeline(storage)
    key = mint(store)
    storage.failure = StorageError(SECRET_TEXT)
    with pytest.raises(AnalysisError) as error:
        await store.extract(key, budget())
    assert error.value.code == "image_input_unavailable" and error.value.http_status == 503
    assert SECRET_TEXT not in str(error.value)
    assert storage.deleted == [key]


async def test_extraction_charges_the_caller_owned_budget():
    shared = budget()
    store = pipeline(client=FakeClient(admitted()))
    await store.extract(mint(store), shared)
    assert shared.usage.model_turns == 1


async def test_two_objects_use_independent_keys_and_cleanup():
    storage = FakeStorage()
    store = pipeline(storage, FakeClient(admitted(), admitted()))
    first, second = mint(store), mint(store)
    await store.extract(first, budget())
    await store.extract(second, budget())
    assert storage.deleted == [first, storage.presigned[0], second, storage.presigned[1]]
    assert new_object_key(config(), "image/png") != new_object_key(config(), "image/png")


async def test_replay_and_new_pipeline_reject_without_storage_access():
    storage = FakeStorage()
    client = FakeClient(admitted())
    store = pipeline(storage, client)
    key = mint(store)
    with pytest.raises(AnalysisError):
        await pipeline(storage, client).extract(key, budget())
    assert storage.reads == []
    await store.extract(key, budget())
    with pytest.raises(AnalysisError):
        await store.extract(key, budget())
    assert len(client.calls) == 1 and storage.reads == [key]
    assert len(storage.deleted) == 2  # replay cannot delete someone else's copy


async def test_failed_validation_consumes_ticket_permanently():
    storage = FakeStorage(data=b"x" * len(PNG))
    store = pipeline(storage)
    key = mint(store)
    with pytest.raises(AnalysisError):
        await store.extract(key, budget())
    storage.data = PNG
    with pytest.raises(AnalysisError):
        await store.extract(key, budget())
    assert storage.reads == [key] and storage.presigned == []


async def test_expired_or_wrong_language_ticket_rejected_before_read():
    now = [10.0]
    storage = FakeStorage()
    store = ImagePipeline(config(), FakeClient(), storage, clock=lambda: now[0])
    key = mint(store)
    now[0] = 130.0
    with pytest.raises(AnalysisError):
        await store.extract(key, budget())
    key2 = mint(store, language="hi")
    with pytest.raises(AnalysisError):
        await store.extract(key2, budget(), language="en")
    assert storage.reads == [] and storage.deleted == [key, key2]


def test_ticket_capacity_is_bounded_and_expired_entries_are_evicted():
    now = [0.0]
    store = ImagePipeline(
        config(max_pending_tickets=1), FakeClient(), FakeStorage(), clock=lambda: now[0]
    )
    mint(store)
    with pytest.raises(AnalysisError):
        mint(store)
    assert len(store._tickets) == 1
    now[0] = 121.0
    mint(store)
    assert len(store._tickets) == 1


async def test_concurrent_replay_is_consumed_before_first_await():
    started, finish = asyncio.Event(), asyncio.Event()

    class Waiting(FakeStorage):
        async def read(self, *args):
            started.set()
            await finish.wait()
            return await super().read(*args)

    storage = Waiting()
    client = FakeClient(admitted())
    store = pipeline(storage, client)
    key = mint(store)
    running = asyncio.create_task(store.extract(key, budget()))
    await started.wait()
    with pytest.raises(AnalysisError):
        await store.extract(key, budget())
    finish.set()
    await running
    assert len(client.calls) == 1 and storage.reads == [key]


async def test_mutating_original_after_validation_cannot_change_provider_copy():
    class Mutable(FakeStorage):
        async def put_validated(self, key, data):
            self.data = b"<svg>unsafe replacement</svg>"
            await super().put_validated(key, data)

    storage = Mutable()
    store = pipeline(storage, FakeClient(admitted()))
    key = mint(store)
    await store.extract(key, budget())
    (copied,) = storage.copies.values()
    assert copied != storage.data and copied.startswith(b"\x89PNG\r\n\x1a\n")
    assert storage.presigned[0] != key


@pytest.mark.parametrize(
    "data,content_type",
    [
        (b"<svg>not raster</svg>", "image/png"),
        (raster("JPEG"), "image/png"),
        (raster()[:40], "image/png"),
        (raster() + b"x", "image/jpeg"),
    ],
)
async def test_actual_bytes_and_type_are_validated_before_provider(data, content_type):
    storage = FakeStorage(info=ObjectInfo(content_type, len(data)), data=data)
    client = FakeClient(admitted())
    store = pipeline(storage, client)
    with pytest.raises(AnalysisError) as error:
        await store.extract(mint(store, content_type, len(data)), budget())
    assert error.value.code == "image_not_admitted"
    assert storage.copies == {} and client.calls == []


@pytest.mark.parametrize(
    "format,content_type", [("PNG", "image/png"), ("JPEG", "image/jpeg"), ("WEBP", "image/webp")]
)
def test_supported_formats_are_decoded_and_flattened(format, content_type):
    data = raster(format)
    output = validate_image(data, content_type, len(data), config())
    image = Image.open(io.BytesIO(output))
    assert image.format == "PNG" and image.mode == "RGB" and image.size == (8, 8)
    assert image.info == {}


def test_metadata_trailing_payload_and_transparency_do_not_reach_provider():
    metadata = PngImagePlugin.PngInfo()
    metadata.add_text("Private", "synthetic identity")
    out = io.BytesIO()
    Image.new("RGBA", (8, 8), (255, 0, 0, 0)).save(out, format="PNG", pnginfo=metadata)
    data = out.getvalue() + b"<script>trailing private payload</script>"
    output = validate_image(data, "image/png", len(data), config())
    assert b"synthetic identity" not in output and b"<script>" not in output
    image = Image.open(io.BytesIO(output))
    assert image.info == {} and image.getpixel((0, 0)) == (255, 255, 255)


def test_byte_pixel_dimension_animation_and_output_bounds():
    for overrides in ({"max_bytes": len(PNG) - 1}, {"max_pixels": 63}, {"max_dimension": 7}):
        with pytest.raises(InvalidImage):
            validate_image(PNG, "image/png", len(PNG), config(**overrides))
    with pytest.raises(InvalidImage):
        validate_image(PNG, "image/png", len(PNG) - 1, config())
    out = io.BytesIO()
    Image.new("RGB", (2, 2), "red").save(
        out,
        format="PNG",
        save_all=True,
        append_images=[Image.new("RGB", (2, 2), "blue")],
        duration=100,
    )
    data = out.getvalue()
    with pytest.raises(InvalidImage):
        validate_image(data, "image/png", len(data), config())
    from backend.images.pipeline import _BoundedOutput

    with pytest.raises(InvalidImage):
        _BoundedOutput(2).write(b"123")


def test_lifecycle_is_a_required_dependency():
    with pytest.raises(StorageError):
        pipeline(lifecycle_configured=False)


def test_an_out_of_range_configured_port_fails_with_the_typed_storage_error():
    """ImageConfig.https_origin doesn't validate port syntax, and urlsplit(...).port
    raises a bare ValueError (not None) for an out-of-range port - that must not escape
    construction as an unhandled exception, defeating the documented fail-loud-with-
    StorageError invariant."""
    with pytest.raises(StorageError):
        pipeline(endpoint=f"{ENDPOINT}:99999")


async def test_cancellation_during_provider_still_deletes_both_objects():
    entered = asyncio.Event()

    class WaitingClient(FakeClient):
        async def complete(self, *args, **kwargs):
            entered.set()
            await asyncio.Event().wait()

    storage = FakeStorage()
    store = pipeline(storage, WaitingClient())
    key = mint(store)
    task = asyncio.create_task(store.extract(key, budget()))
    await entered.wait()
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert storage.deleted == [key, *storage.presigned] and store._active == 0


async def test_expired_budget_never_reads_storage_or_calls_provider():
    shared = Budget(BudgetLimits(request_seconds=1), clock=lambda: 0)
    shared._clock = lambda: 2
    storage = FakeStorage()
    store = pipeline(storage)
    key = mint(store)
    with pytest.raises(AnalysisError) as error:
        await store.extract(key, shared)
    assert error.value.code == "budget_exhausted"
    assert storage.reads == [] and storage.deleted == [key]


async def test_cancellation_of_original_cleanup_does_not_skip_provider_cleanup():
    class CancelFirstDelete(FakeStorage):
        async def delete(self, key):
            self.deleted.append(key)
            if key.startswith("inbox/"):
                raise asyncio.CancelledError()
            return True

    storage = CancelFirstDelete()
    store = pipeline(storage, FakeClient(admitted()))
    key = mint(store)
    with pytest.raises(asyncio.CancelledError):
        await store.extract(key, budget())
    assert storage.deleted == [key, *storage.presigned] and store._active == 0
