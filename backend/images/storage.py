"""Private object storage. Only this module holds bucket credentials.

The bucket stays private: objects are reachable only through short-lived presigned
URLs, and the raw endpoint plus keys never appear in an error, log or response.
"""

import asyncio
import re
import secrets
from dataclasses import dataclass
from typing import Any

import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import BotoCoreError, ClientError

from .config import ImageConfig

PREFIX = "inbox/"
_KEY = re.compile(rf"^{PREFIX}[0-9a-f]{{32}}\.(?:png|jpg|jpeg|webp)$")


@dataclass(frozen=True)
class ObjectInfo:
    content_type: str
    size: int


class StorageError(Exception):
    """Storage is unavailable or refused the object. Never carries provider text or URLs."""


def new_object_key(config: ImageConfig, content_type: str) -> str:
    extension = config.extension_for(content_type)
    if extension is None:
        raise StorageError("Unsupported image type")
    return f"{PREFIX}{secrets.token_hex(16)}.{extension}"


def is_admissible_key(key: str) -> bool:
    """Strict shape check before any storage call: hex only, one bounded prefix, no traversal."""
    return bool(_KEY.fullmatch(key))


def _status(error: ClientError) -> int | None:
    metadata = error.response.get("ResponseMetadata") if isinstance(error.response, dict) else None
    code = metadata.get("HTTPStatusCode") if isinstance(metadata, dict) else None
    return code if isinstance(code, int) else None


class R2Storage:
    def __init__(self, config: ImageConfig, client: Any | None = None):
        self.config = config
        self._client = client if client is not None else self._connect()

    def _connect(self) -> Any:
        # Credentials resolve through the standard boto3 chain; only the destination is ours.
        return boto3.client(
            "s3",
            endpoint_url=self.config.endpoint,
            region_name=self.config.region,
            config=BotoConfig(
                signature_version="s3v4",
                retries={"max_attempts": 1, "mode": "standard"},
                # Newer botocore adds checksum headers that R2 and browser PUTs reject.
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
            ),
        )

    def _sign(self, operation: str, params: dict[str, Any], ttl: int) -> str:
        try:
            return self._client.generate_presigned_url(
                operation, Params={"Bucket": self.config.bucket, **params}, ExpiresIn=ttl
            )
        except (BotoCoreError, ClientError, TypeError, ValueError):
            raise StorageError("Image storage is unavailable.") from None

    def presign_put(self, key: str, content_type: str) -> tuple[str, int]:
        """Content type is signed in, so a mismatched upload cannot be stored under it."""
        ttl = self.config.upload_ttl_seconds
        return self._sign("put_object", {"Key": key, "ContentType": content_type}, ttl), ttl

    def presign_get(self, key: str) -> str:
        return self._sign("get_object", {"Key": key}, self.config.url_max_ttl_seconds)

    async def head(self, key: str) -> ObjectInfo | None:
        try:
            response = await asyncio.to_thread(self._head, key)
        except StorageError:
            raise
        except (BotoCoreError, ClientError, OSError):
            raise StorageError("Image storage is unavailable.") from None
        if response is None:
            return None
        return ObjectInfo(
            content_type=str(response.get("ContentType") or ""),
            size=int(response.get("ContentLength") or 0),
        )

    def _head(self, key: str) -> dict[str, Any] | None:
        try:
            return self._client.head_object(Bucket=self.config.bucket, Key=key)
        except ClientError as error:
            if _status(error) == 404:
                return None
            raise

    async def delete(self, key: str) -> None:
        """Best effort. A retained object is still private and its signed URL expires."""
        try:
            await asyncio.to_thread(self._client.delete_object, Bucket=self.config.bucket, Key=key)
        except (BotoCoreError, ClientError, OSError):
            return
