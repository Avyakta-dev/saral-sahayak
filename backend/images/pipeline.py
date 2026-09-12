"""One-use admission and validated private snapshots on a caller-owned budget."""

import asyncio
import io
import secrets
import time
import warnings
from dataclasses import dataclass
from urllib.parse import urlsplit

from PIL import Image, ImageOps, UnidentifiedImageError

from backend.agent.service import AnalysisError
from backend.llm import LLMClient
from backend.tools.budget import Budget, KnowledgeError

from .config import ImageConfig
from .extractor import extract_rejection_text
from .storage import (
    InvalidImage,
    R2Storage,
    StorageError,
    is_admissible_key,
    joined_thread,
    new_object_key,
)

_NOT_ADMITTED = "That image reference is not accepted."
_UNAVAILABLE = "Image input is unavailable."
_FORMATS = {"image/png": "PNG", "image/jpeg": "JPEG", "image/webp": "WEBP"}


@dataclass(frozen=True, repr=False)
class _Ticket:
    content_type: str
    content_length: int
    language: str
    expires_at: float


class _BoundedOutput(io.BytesIO):
    def __init__(self, limit: int):
        super().__init__()
        self.limit = limit

    def write(self, data):
        if self.tell() + len(data) > self.limit:
            raise InvalidImage()
        return super().write(data)


def validate_image(
    data: bytes, content_type: str, content_length: int, config: ImageConfig
) -> bytes:
    """Decode a bounded static raster and flatten pixels into a new metadata-free PNG.

    This removes EXIF, text chunks, profiles, trailing payloads and transparency. It
    is not PII redaction; users must review/redact visible pixels before uploading.
    """
    if len(data) != content_length or not 0 < len(data) <= config.max_bytes:
        raise InvalidImage()
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as image:
                if image.format != _FORMATS.get(content_type):
                    raise InvalidImage()
                width, height = image.size
                if (
                    not 0 < width <= config.max_dimension
                    or not 0 < height <= config.max_dimension
                    or width * height > config.max_pixels
                    or getattr(image, "n_frames", 1) != 1
                ):
                    raise InvalidImage()
                image.verify()
            with Image.open(io.BytesIO(data)) as image:
                image.load()  # Reject truncated/invalid raster data, not just its header.
                oriented = ImageOps.exif_transpose(image)
                rgba = oriented.convert("RGBA")
                flattened = Image.new("RGB", rgba.size, "white")
                flattened.paste(rgba, mask=rgba.getchannel("A"))
                output = _BoundedOutput(config.max_bytes)
                flattened.save(output, format="PNG")
                return output.getvalue()
    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        SyntaxError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ):
        raise InvalidImage() from None


class ImagePipeline:
    def __init__(
        self,
        config: ImageConfig,
        client: LLMClient,
        storage: R2Storage | None = None,
        *,
        clock=time.monotonic,
    ):
        if not config.lifecycle_configured:
            raise StorageError(_UNAVAILABLE)
        self.config = config
        self.client = client
        self.storage = storage if storage is not None else R2Storage(config)
        self._image_host = urlsplit(config.endpoint).hostname
        if not self._image_host:
            # ImageConfig.https_origin already guarantees a truthy hostname, so this
            # should never fire; it exists so a broken invariant fails loud here rather
            # than silently turning extract_rejection_text's host guard into a no-op
            # (a falsy allowed_host would compare equal to a URL with no host too).
            raise StorageError(_UNAVAILABLE)
        self._clock = clock
        # Deliberately process-local: restarts/other workers reject rather than guess
        # authorization from a filename. Deploy one worker or use sticky routing.
        self._tickets: dict[str, _Ticket] = {}
        self._active = 0

    def admit(
        self, content_type: str, content_length: int, *, language: str = "en"
    ) -> tuple[str, str, int]:
        if (
            content_type not in self.config.content_types
            or type(content_length) is not int
            or not 0 < content_length <= self.config.max_bytes
        ):
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
        now = self._clock()
        self._tickets = {
            key: ticket for key, ticket in self._tickets.items() if ticket.expires_at > now
        }
        if len(self._tickets) >= self.config.max_pending_tickets:
            raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503)
        try:
            key = new_object_key(self.config, content_type)
            url, ttl = self.storage.presign_put(key, content_type, content_length)
        except StorageError:
            raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503) from None
        self._tickets[key] = _Ticket(content_type, content_length, language, now + ttl)
        return key, url, ttl

    async def extract(self, image_key: str, budget: Budget, *, language: str = "en") -> str:
        # Check and consume synchronously before the first await. The opaque key is
        # a bearer capability, not account authentication; never log or serialize it.
        if not is_admissible_key(image_key):
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
        ticket = self._tickets.pop(image_key, None)
        if ticket is None:
            # Never read OR delete an object that this process did not authorize.
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
        provider_key = None
        acquired = False
        try:
            if ticket.expires_at <= self._clock() or ticket.language != language:
                raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422)
            if self._active >= self.config.max_concurrent:
                raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503)
            self._active += 1
            acquired = True
            async with asyncio.timeout(budget.remaining_seconds()):
                data = await self.storage.read(
                    image_key, ticket.content_type, ticket.content_length
                )
                budget.check()
                validated = await joined_thread(
                    validate_image, data, ticket.content_type, ticket.content_length, self.config
                )
                budget.check()
                # Not CopyObject: use exactly the decoded bytes, never mutable inbox.
                # This key has never had a PUT signature; only server writes it once.
                provider_key = f"validated/{secrets.token_hex(16)}.png"
                await self.storage.put_validated(provider_key, validated)
                budget.check()
                image_url = self.storage.presign_get(provider_key)
                return await extract_rejection_text(
                    self.client,
                    image_url,
                    budget,
                    max_chars=self.config.ocr_max_chars,
                    max_output_tokens=self.config.ocr_max_output_tokens,
                    allowed_host=self._image_host,
                )
        except InvalidImage:
            raise AnalysisError("image_not_admitted", _NOT_ADMITTED, 422) from None
        except StorageError:
            raise AnalysisError("image_input_unavailable", _UNAVAILABLE, 503) from None
        except KnowledgeError:
            raise AnalysisError(
                "budget_exhausted", "Analysis exceeded its request budget.", 503
            ) from None
        except TimeoutError:
            raise AnalysisError("analysis_timeout", "Analysis timed out.", 504) from None
        finally:
            # Joined writes cannot complete after this cleanup. Storage retries twice;
            # mandatory lifecycle covers failures, crashes, abandonment and late PUTs.
            try:
                try:
                    await self.storage.delete(image_key)
                finally:
                    # Cancellation/failure of inbox cleanup must not skip the copy.
                    if provider_key is not None:
                        await self.storage.delete(provider_key)
            finally:
                if acquired:
                    self._active -= 1
