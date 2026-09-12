"""Admission and extraction for one private object, on a caller-owned budget."""

from backend.agent.service import AnalysisError
from backend.llm import LLMClient
from backend.tools.budget import Budget

from .config import ImageConfig
from .extractor import extract_rejection_text
from .storage import R2Storage, StorageError, is_admissible_key, new_object_key

_NOT_ADMITTED = "That image reference is not accepted."
_UNAVAILABLE = "Image input is unavailable."


class ImagePipeline:
    def __init__(self, config: ImageConfig, client: LLMClient, storage: R2Storage | None = None):
        self.config = config
        self.client = client
        self.storage = storage if storage is not None else R2Storage(config)

    def admit(self, content_type: str) -> tuple[str, str, int]:
        """Mint one opaque key and a short-lived upload URL for an allowed type."""
        if content_type not in self.config.content_types:
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
        try:
            key = new_object_key(self.config, content_type)
            url, ttl = self.storage.presign_put(key, content_type)
        except StorageError:
            raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503) from None
        return key, url, ttl

    async def extract(self, image_key: str, budget: Budget) -> str:
        """Verify our own object, transcribe it once, then remove it."""
        if not is_admissible_key(image_key):
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
        try:
            info = await self.storage.head(image_key)
            if (
                info is None
                or info.content_type not in self.config.content_types
                or not 0 < info.size <= self.config.max_bytes
            ):
                raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
            image_url = self.storage.presign_get(image_key)
            return await extract_rejection_text(
                self.client,
                image_url,
                budget,
                max_chars=self.config.ocr_max_chars,
                max_output_tokens=self.config.ocr_max_output_tokens,
            )
        except StorageError:
            raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503) from None
        finally:
            await self.storage.delete(image_key)
