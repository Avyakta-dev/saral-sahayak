"""Offline storage-boundary tests. No real boto3 client, credential or socket is used."""

import pytest
from botocore.exceptions import BotoCoreError, ClientError
from test_level_two_api import (  # noqa: F401  (autouse offline guard)
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.images.config import ImageConfig
from backend.images.storage import R2Storage, StorageError, is_admissible_key, new_object_key

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
    url, ttl = store.presign_put("inbox/" + "a" * 32 + ".png", "image/png")
    assert url == SIGNED and ttl == 120
    assert store._client.signed == [
        (
            "put_object",
            {
                "Bucket": "synthetic-bucket",
                "Key": "inbox/" + "a" * 32 + ".png",
                "ContentType": "image/png",
            },
            120,
        )
    ]

    store.presign_get("inbox/" + "a" * 32 + ".png")
    assert store._client.signed[-1] == (
        "get_object",
        {"Bucket": "synthetic-bucket", "Key": "inbox/" + "a" * 32 + ".png"},
        120,
    )


def test_configured_ttls_are_used_and_bounded():
    store = R2Storage(config(upload_ttl_seconds=45, url_max_ttl_seconds=60), client=FakeS3())
    assert store.presign_put("inbox/" + "a" * 32 + ".png", "image/png")[1] == 45
    store.presign_get("inbox/" + "a" * 32 + ".png")
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
        store.presign_put("inbox/" + "a" * 32 + ".png", "image/png")
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
