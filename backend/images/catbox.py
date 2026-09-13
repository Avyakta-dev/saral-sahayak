"""Catbox.moe object store: inbox bytes locally, validated PNG on files.catbox.moe."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlsplit

import httpx

from .config import ImageConfig
from .storage import (
    InvalidImage,
    ObjectInfo,
    StorageError,
    is_admissible_key,
    joined_thread,
)

CATBOX_API = "https://catbox.moe/user/api.php"
CATBOX_FILES = "https://files.catbox.moe"
_CATBOX_FILE = re.compile(r"^https://files\.catbox\.moe/[A-Za-z0-9]+\.(?:png|jpg|jpeg|webp)$")


class CatboxStorage:
    def __init__(self, config: ImageConfig, http_client: Any | None = None):
        self.config = config
        self._http = http_client
        self._inbox: dict[str, tuple[str, bytes]] = {}
        self._public: dict[str, str] = {}

    def presign_put(self, key: str, content_type: str, content_length: int) -> tuple[str, int]:
        if not is_admissible_key(key) or content_type not in self.config.content_types:
            raise StorageError("Image storage is unavailable.")
        if type(content_length) is not int or not 0 < content_length <= self.config.max_bytes:
            raise StorageError("Image storage is unavailable.")
        return f"/api/v1/images/inbox/{key}", self.config.upload_ttl_seconds

    def presign_get(self, key: str) -> str:
        url = self._public.get(key)
        if not url or not _CATBOX_FILE.fullmatch(url):
            raise StorageError("Image storage is unavailable.")
        return url

    def receive_put(self, key: str, content_type: str, data: bytes) -> None:
        if not is_admissible_key(key) or content_type not in self.config.content_types:
            raise InvalidImage()
        if not isinstance(data, bytes) or not 0 < len(data) <= self.config.max_bytes:
            raise InvalidImage()
        self._inbox[key] = (content_type, data)

    async def head(self, key: str) -> ObjectInfo | None:
        stored = self._inbox.get(key)
        if stored is None:
            return None
        return ObjectInfo(content_type=stored[0], size=len(stored[1]))

    async def read(self, key: str, content_type: str, content_length: int) -> bytes:
        stored = self._inbox.get(key)
        if stored is None or stored[0] != content_type or len(stored[1]) != content_length:
            raise InvalidImage()
        return stored[1]

    async def put_validated(self, key: str, data: bytes) -> None:
        if not re.fullmatch(r"validated/[0-9a-f]{32}\.png", key):
            raise StorageError("Image storage is unavailable.")
        url = await self._upload(data, "image.png", "image/png")
        self._public[key] = url

    async def delete(self, key: str) -> bool:
        self._inbox.pop(key, None)
        self._public.pop(key, None)
        return True

    async def _upload(self, data: bytes, filename: str, content_type: str) -> str:
        try:
            return await joined_thread(self._upload_sync, data, filename, content_type)
        except (OSError, httpx.HTTPError, ValueError, TypeError):
            pass
        raise StorageError("Image storage is unavailable.")

    def _upload_sync(self, data: bytes, filename: str, content_type: str) -> str:
        client = self._http
        close = False
        if client is None:
            client = httpx.Client(
                timeout=20.0,
                follow_redirects=False,
                trust_env=False,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; SaralSahayak/1.0; +https://catbox.moe/tools.php)"
                },
            )
            close = True
        try:
            response = client.post(
                CATBOX_API,
                data={"reqtype": "fileupload"},
                files={"fileToUpload": (filename, data, content_type)},
            )
            url = (response.text or "").strip()
            if response.status_code != 200 or not _CATBOX_FILE.fullmatch(url):
                raise StorageError("Image storage is unavailable.")
            if urlsplit(url).hostname != "files.catbox.moe":
                raise StorageError("Image storage is unavailable.")
            return url
        finally:
            if close:
                client.close()
