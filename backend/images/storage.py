"""Bounded access to the configured private bucket, never caller-supplied URLs."""

import asyncio
import logging
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
_LOG = logging.getLogger(__name__)
# A delete may finish late safely: keys are random and never reused. Unlike writes,
# it need not be joined indefinitely before request capacity can be released.
DELETE_TIMEOUT_SECONDS = 7.0


@dataclass(frozen=True)
class ObjectInfo:
    content_type: str
    size: int


class StorageError(Exception):
    """Sanitized storage failure; never contains provider text or URLs."""


class InvalidImage(Exception):
    """The stored object does not match the admitted image contract."""


def new_object_key(config: ImageConfig, content_type: str) -> str:
    extension = config.extension_for(content_type)
    if extension is None:
        raise StorageError("Unsupported image type")
    return f"{PREFIX}{secrets.token_hex(16)}.{extension}"


def is_admissible_key(key: str) -> bool:
    return bool(_KEY.fullmatch(key))


def _status(error: ClientError) -> int | None:
    metadata = error.response.get("ResponseMetadata") if isinstance(error.response, dict) else None
    code = metadata.get("HTTPStatusCode") if isinstance(metadata, dict) else None
    return code if isinstance(code, int) else None


async def joined_thread(function, *args, **kwargs):
    """Join bounded SDK/decode work on cancellation before cleanup or releasing capacity.

    Cancelling to_thread alone leaves a writer running after finally-delete. Shield
    and join it instead. SDK socket timeouts and byte/pixel bounds limit this wait.
    """
    task = asyncio.create_task(asyncio.to_thread(function, *args, **kwargs))
    try:
        return await asyncio.shield(task)
    except asyncio.CancelledError:
        while not task.done():
            try:
                await asyncio.shield(task)
            except asyncio.CancelledError:
                continue
            except Exception:
                break
        # Retrieve exceptions without leaking provider detail during cancellation.
        if not task.cancelled():
            task.exception()
        raise


class R2Storage:
    def __init__(self, config: ImageConfig, client: Any | None = None):
        self.config = config
        try:
            self._client = client if client is not None else self._connect()
            return
        except (BotoCoreError, ClientError, OSError, ValueError):
            pass
        # Raise outside the handler: `from None` hides, but retains, raw context.
        raise StorageError("Image storage is unavailable.")

    def _connect(self) -> Any:
        return boto3.client(
            "s3",
            endpoint_url=self.config.endpoint,
            region_name=self.config.region,
            config=BotoConfig(
                signature_version="s3v4",
                connect_timeout=3,
                read_timeout=3,
                retries={"total_max_attempts": 1, "mode": "standard"},
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
            pass
        raise StorageError("Image storage is unavailable.")

    def presign_put(self, key: str, content_type: str, content_length: int) -> tuple[str, int]:
        """Sign the exact type AND byte count; browser derives length from the File body."""
        ttl = self.config.upload_ttl_seconds
        return self._sign(
            "put_object",
            {"Key": key, "ContentType": content_type, "ContentLength": content_length},
            ttl,
        ), ttl

    def presign_get(self, key: str) -> str:
        # No original-upload URL can reach a provider through this boundary.
        if not re.fullmatch(r"validated/[0-9a-f]{32}\.png", key):
            raise StorageError("Image storage is unavailable.")
        return self._sign("get_object", {"Key": key}, self.config.url_max_ttl_seconds)

    async def head(self, key: str) -> ObjectInfo | None:
        """Metadata helper retained for diagnostics, never sufficient for admission."""
        try:
            response = await joined_thread(self._head, key)
            if response is None:
                return None
            if not isinstance(response, dict):
                raise StorageError("Image storage is unavailable.")
            return ObjectInfo(
                content_type=str(response.get("ContentType") or ""),
                size=int(response.get("ContentLength") or 0),
            )
        except (BotoCoreError, ClientError, OSError, TypeError, ValueError):
            pass
        raise StorageError("Image storage is unavailable.")

    def _head(self, key: str) -> dict[str, Any] | None:
        try:
            return self._client.head_object(Bucket=self.config.bucket, Key=key)
        except ClientError as error:
            if _status(error) == 404:
                return None
            raise

    async def read(self, key: str, content_type: str, content_length: int) -> bytes:
        try:
            return await joined_thread(self._read, key, content_type, content_length)
        except ClientError as error:
            missing = _status(error) == 404
        except (BotoCoreError, OSError, TypeError, ValueError):
            missing = False
        if missing:
            raise InvalidImage()
        raise StorageError("Image storage is unavailable.")

    def _read(self, key: str, content_type: str, content_length: int) -> bytes:
        # One GET snapshot, not HEAD followed by an unchecked mutable GET URL.
        if type(content_length) is not int or not 0 < content_length <= self.config.max_bytes:
            raise InvalidImage()
        response = self._client.get_object(Bucket=self.config.bucket, Key=key)
        if not isinstance(response, dict):
            raise InvalidImage()
        body = response.get("Body")
        close = getattr(body, "close", None)
        try:
            if (
                not callable(close)
                or not callable(getattr(body, "read", None))
                or response.get("ContentType") != content_type
                or type(response.get("ContentLength")) is not int
                or response["ContentLength"] != content_length
                or response.get("ContentRange") is not None
            ):
                raise InvalidImage()
            data = body.read(content_length + 1)
            if not isinstance(data, bytes) or len(data) != content_length:
                raise InvalidImage()
            return data
        finally:
            if callable(close):
                close()

    async def put_validated(self, key: str, data: bytes) -> None:
        if not re.fullmatch(r"validated/[0-9a-f]{32}\.png", key):
            raise StorageError("Image storage is unavailable.")
        try:
            await joined_thread(
                self._client.put_object,
                Bucket=self.config.bucket,
                Key=key,
                Body=data,
                ContentType="image/png",
                ContentLength=len(data),
                IfNoneMatch="*",
                CacheControl="no-store",
            )
            return
        except (BotoCoreError, ClientError, OSError):
            pass
        raise StorageError("Image storage is unavailable.")

    async def delete(self, key: str) -> bool:
        """At most two attempts within one cleanup deadline, with no detached async task.

        Cancelling the executor future cannot preempt a running SDK thread. A timed-out
        delete can finish later, but must not start a concurrent retry. Socket limits
        remain necessary; lifecycle is the fallback, not a promise of immediate erasure.
        """
        try:
            async with asyncio.timeout(DELETE_TIMEOUT_SECONDS):
                for _ in range(2):
                    try:
                        await asyncio.to_thread(
                            self._client.delete_object, Bucket=self.config.bucket, Key=key
                        )
                        return True
                    except (BotoCoreError, ClientError, OSError):
                        pass
        except TimeoutError:
            pass
        _LOG.warning("Image cleanup failed; configured storage lifecycle must expire the object.")
        return False
