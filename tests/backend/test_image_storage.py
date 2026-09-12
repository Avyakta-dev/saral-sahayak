"""Offline storage-boundary tests. No real boto3 client, credential or socket is used."""

import asyncio
import io
import threading
from urllib.parse import parse_qs, urlsplit

import boto3
import pytest
from botocore.config import Config as BotoConfig
from botocore.exceptions import BotoCoreError, ClientError
from test_level_two_api import (  # noqa: F401  (autouse offline guard)
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.images.config import ImageConfig
from backend.images.storage import (
    InvalidImage,
    R2Storage,
    StorageError,
    is_admissible_key,
    new_object_key,
)

ENDPOINT = "https://account.r2.cloudflarestorage.com"
SIGNED = "https://account.r2.cloudflarestorage.com/synthetic-bucket/inbox/signed"


def config(**overrides):
    values = {"endpoint": ENDPOINT, "bucket": "synthetic-bucket"}
    values.update(overrides)
    return ImageConfig(**values)


def client_error(status):
    return ClientError(
        {"Error": {"Code": "Synthetic"}, "ResponseMetadata": {"HTTPStatusCode": status}},
        "HeadObject",
    )


class FakeS3:
    """Records calls and returns canned responses; never opens a socket."""

    def __init__(self, head=None, failure=None):
        self.head = head
        self.failure = failure
        self.signed = []
        self.calls = []

    def generate_presigned_url(self, operation, Params=None, ExpiresIn=None):
        self.signed.append((operation, Params, ExpiresIn))
        return SIGNED

    def head_object(self, **kwargs):
        self.calls.append(("head_object", kwargs))
        if self.failure is not None:
            raise self.failure
        return self.head

    def delete_object(self, **kwargs):
        self.calls.append(("delete_object", kwargs))
        if self.failure is not None:
            raise self.failure
        return {}


def test_new_key_is_prefixed_hex_and_matches_its_admissible_shape():
    for content_type, extension in (
        ("image/png", "png"),
        ("image/jpeg", "jpg"),
        ("image/webp", "webp"),
    ):
        key = new_object_key(config(), content_type)
        assert key.startswith("inbox/") and key.endswith(f".{extension}")
        assert len(key) == len("inbox/") + 32 + len(extension) + 1
        assert is_admissible_key(key)


def test_new_key_is_random_and_rejects_unknown_types():
    assert new_object_key(config(), "image/png") != new_object_key(config(), "image/png")
    with pytest.raises(StorageError):
        new_object_key(config(), "image/gif")


@pytest.mark.parametrize(
    "key",
    [
        "",
        "inbox/",
        "inbox/short.png",
        "inbox/" + "A" * 32 + ".png",  # uppercase hex
        "inbox/" + "a" * 31 + ".png",
        "inbox/" + "a" * 33 + ".png",
        "inbox/" + "a" * 32 + ".gif",
        "inbox/" + "a" * 32 + ".svg",
        "inbox/" + "a" * 32,  # no extension
        "inbox/" + "a" * 32 + ".png.png",
        "inbox/" + "a" * 32 + ".png/../x.png",
        "inbox/sub/" + "a" * 32 + ".png",
        "other/" + "a" * 32 + ".png",
        "/inbox/" + "a" * 32 + ".png",
        "inbox/" + "a" * 32 + ".png ",
        "inbox/" + "a" * 32 + ".png\n",
        "../../etc/passwd",
        "inbox\\" + "a" * 32 + ".png",
        "https://account.r2.cloudflarestorage.com/inbox/" + "a" * 32 + ".png",
    ],
)
def test_admissible_key_rejects_traversal_shapes_and_foreign_prefixes(key):
    assert not is_admissible_key(key)


def test_put_signs_the_content_type_and_get_signs_only_the_key():
    store = R2Storage(config(), client=FakeS3())
    url, ttl = store.presign_put("inbox/" + "a" * 32 + ".png", "image/png", 2048)
    assert url == SIGNED and ttl == 120
    assert store._client.signed == [
        (
            "put_object",
            {
                "Bucket": "synthetic-bucket",
                "Key": "inbox/" + "a" * 32 + ".png",
                "ContentType": "image/png",
                "ContentLength": 2048,
            },
            120,
        )
    ]

    store.presign_get("validated/" + "a" * 32 + ".png")
    assert store._client.signed[-1] == (
        "get_object",
        {"Bucket": "synthetic-bucket", "Key": "validated/" + "a" * 32 + ".png"},
        120,
    )


def test_configured_ttls_are_used_and_bounded():
    store = R2Storage(config(upload_ttl_seconds=45, url_max_ttl_seconds=60), client=FakeS3())
    assert store.presign_put("inbox/" + "a" * 32 + ".png", "image/png", 2048)[1] == 45
    store.presign_get("validated/" + "a" * 32 + ".png")
    assert store._client.signed[-1][2] == 60
    for ttl in (0, 901):
        with pytest.raises(ValueError):
            config(upload_ttl_seconds=ttl)
        with pytest.raises(ValueError):
            config(url_max_ttl_seconds=ttl)


def test_signing_failure_is_sanitized():
    class Broken(FakeS3):
        def generate_presigned_url(self, operation, Params=None, ExpiresIn=None):
            raise BotoCoreError()

    store = R2Storage(config(), client=Broken())
    with pytest.raises(StorageError) as error:
        store.presign_put("inbox/" + "a" * 32 + ".png", "image/png", 2048)
    assert "synthetic-bucket" not in str(error.value)
    assert ENDPOINT not in str(error.value)


async def test_head_reports_type_and_size():
    store = R2Storage(
        config(), client=FakeS3(head={"ContentType": "image/png", "ContentLength": 2048})
    )
    info = await store.head("inbox/" + "a" * 32 + ".png")
    assert info is not None and info.content_type == "image/png" and info.size == 2048
    assert store._client.calls == [
        ("head_object", {"Bucket": "synthetic-bucket", "Key": "inbox/" + "a" * 32 + ".png"})
    ]


async def test_head_missing_object_and_broken_metadata():
    assert (
        await R2Storage(config(), client=FakeS3(failure=client_error(404))).head("inbox/x.png")
        is None
    )
    store = R2Storage(config(), client=FakeS3(head={}))
    info = await store.head("inbox/" + "a" * 32 + ".png")
    assert info is not None and info.content_type == "" and info.size == 0


async def test_head_failures_are_sanitized_and_never_echo_storage_details():
    for failure in (client_error(500), client_error(403), BotoCoreError(), OSError("private")):
        store = R2Storage(config(), client=FakeS3(failure=failure))
        with pytest.raises(StorageError) as error:
            await store.head("inbox/" + "a" * 32 + ".png")
        assert "synthetic-bucket" not in str(error.value)
        assert ENDPOINT not in str(error.value)
        assert "private" not in str(error.value)


async def test_delete_is_best_effort():
    store = R2Storage(config(), client=FakeS3())
    await store.delete("inbox/" + "a" * 32 + ".png")
    assert store._client.calls == [
        ("delete_object", {"Bucket": "synthetic-bucket", "Key": "inbox/" + "a" * 32 + ".png"})
    ]

    broken = R2Storage(config(), client=FakeS3(failure=client_error(500)))
    await broken.delete("inbox/" + "a" * 32 + ".png")  # Retained object stays private.


@pytest.mark.parametrize(
    "endpoint",
    [
        "http://account.r2.cloudflarestorage.com",
        "https://account.r2.cloudflarestorage.com/path",
        "https://account.r2.cloudflarestorage.com?query=1",
        "https://account.r2.cloudflarestorage.com#fragment",
        "https://user:pass@account.r2.cloudflarestorage.com",
        "account.r2.cloudflarestorage.com",
        "https://",
        "",
    ],
)
def test_endpoint_must_be_a_bare_https_origin(endpoint):
    with pytest.raises(ValueError):
        config(endpoint=endpoint)


def test_content_types_are_restricted_to_raster_images():
    assert config().extension_for("image/png") == "png"
    assert config().extension_for("image/gif") is None
    for content_types in ((), ("image/png", "image/png"), ("image/svg+xml",), ("text/html",)):
        with pytest.raises(ValueError):
            config(content_types=content_types)


def test_secrets_are_never_returned_by_repr_or_errors():
    # No credential field exists on ImageConfig: the standard boto3 chain holds them.
    assert "access_key" not in ImageConfig.model_fields
    assert "secret" not in repr(config())
    assert ENDPOINT in repr(config())  # the destination is not a secret


def test_real_botocore_signer_binds_length_without_credentials_or_network():
    client = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        region_name="auto",
        aws_access_key_id="synthetic-access",
        aws_secret_access_key="synthetic-secret",
        config=BotoConfig(signature_version="s3v4"),
    )
    url, _ = R2Storage(config(), client=client).presign_put(
        "inbox/" + "a" * 32 + ".png",
        "image/png",
        80,
    )
    assert parse_qs(urlsplit(url).query)["X-Amz-SignedHeaders"] == [
        "content-length;content-type;host"
    ]


def test_original_objects_can_never_be_presigned_for_provider_reads():
    client = FakeS3()
    with pytest.raises(StorageError):
        R2Storage(config(), client=client).presign_get("inbox/" + "a" * 32 + ".png")
    assert client.signed == []


class ReadS3(FakeS3):
    def __init__(self, data=b"abcd", content_type="image/png", length=4):
        super().__init__()
        self.body = io.BytesIO(data)
        self.content_type, self.length = content_type, length

    def get_object(self, **kwargs):
        self.calls.append(("get_object", kwargs))
        return {"Body": self.body, "ContentType": self.content_type, "ContentLength": self.length}


async def test_read_uses_single_snapshot_and_closes_body():
    client = ReadS3()
    assert await R2Storage(config(), client=client).read("inbox/key.png", "image/png", 4) == b"abcd"
    assert client.body.closed
    assert client.calls == [("get_object", {"Bucket": "synthetic-bucket", "Key": "inbox/key.png"})]


@pytest.mark.parametrize(
    "data,content_type,length",
    [
        (b"abcde", "image/png", 4),
        (b"abc", "image/png", 4),
        (b"abcd", "image/jpeg", 4),
        (b"abcd", "image/png", 5),
    ],
)
async def test_read_rejects_metadata_and_actual_byte_mismatch(data, content_type, length):
    client = ReadS3(data, content_type, length)
    with pytest.raises(InvalidImage):
        await R2Storage(config(), client=client).read("inbox/key.png", "image/png", 4)
    assert client.body.closed


async def test_read_is_bounded_even_when_body_lies_about_size():
    class Body:
        closed = False
        requested = None

        def read(self, amount):
            self.requested = amount
            return b"x" * amount

        def close(self):
            self.closed = True

    client = ReadS3()
    client.body = Body()
    with pytest.raises(InvalidImage):
        await R2Storage(config(), client=client).read("inbox/key.png", "image/png", 4)
    assert client.body.requested == 5 and client.body.closed


async def test_validated_write_uses_create_only_and_no_store():
    class Writer(FakeS3):
        def put_object(self, **kwargs):
            self.calls.append(("put_object", kwargs))

    client = Writer()
    key = "validated/" + "b" * 32 + ".png"
    await R2Storage(config(), client=client).put_validated(key, b"synthetic-raster")
    assert client.calls == [
        (
            "put_object",
            {
                "Bucket": "synthetic-bucket",
                "Key": key,
                "Body": b"synthetic-raster",
                "ContentType": "image/png",
                "ContentLength": 16,
                "IfNoneMatch": "*",
                "CacheControl": "no-store",
            },
        )
    ]


async def test_cancelled_write_is_joined_before_delete_even_when_cancelled_twice():
    started, finish = threading.Event(), threading.Event()

    class Writer(FakeS3):
        def put_object(self, **kwargs):
            started.set()
            assert finish.wait(3)
            self.calls.append(("write_completed", {}))

    client = Writer()
    store = R2Storage(config(), client=client)
    key = "validated/" + "a" * 32 + ".png"

    async def operation():
        try:
            await store.put_validated(key, b"data")
        finally:
            await store.delete(key)

    task = asyncio.create_task(operation())
    while not started.is_set():
        await asyncio.sleep(0)
    task.cancel()
    await asyncio.sleep(0)
    task.cancel()
    await asyncio.sleep(0)
    assert client.calls == [] and not task.done()
    finish.set()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert [op for op, _ in client.calls] == ["write_completed", "delete_object"]


async def test_cleanup_retries_and_logs_only_content_free_warning(caplog):
    client = FakeS3(failure=OSError("private key and credentials"))
    assert not await R2Storage(config(), client=client).delete("inbox/private.png")
    assert len(client.calls) == 2
    assert "private" not in caplog.text and "credentials" not in caplog.text
    assert "lifecycle" in caplog.text
