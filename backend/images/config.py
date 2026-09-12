"""Validated settings for the private object store. Deliberately free of provider imports."""

from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator

SUPPORTED_IMAGE_TYPES = ("image/png", "image/jpeg", "image/webp")


class ImageConfig(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", hide_input_in_errors=True)

    endpoint: str
    bucket: str
    # R2 accepts any region label; credentials come from the standard boto3 chain.
    region: str = "auto"
    content_types: tuple[str, ...] = SUPPORTED_IMAGE_TYPES
    upload_ttl_seconds: int = Field(default=120, gt=0, le=900)
    url_max_ttl_seconds: int = Field(default=120, gt=0, le=900)
    # Operator attestation: both inbox/ and validated/ have enforced expiry rules.
    # False keeps image input unavailable; URL expiry alone does not delete objects.
    lifecycle_configured: bool = False
    max_bytes: int = Field(default=10 * 1024 * 1024, gt=0, le=10 * 1024 * 1024)
    max_pixels: int = Field(default=16_000_000, gt=0, le=16_000_000)
    max_dimension: int = Field(default=8192, gt=0, le=8192)
    max_pending_tickets: int = Field(default=1024, gt=0, le=1024)
    max_concurrent: int = Field(default=2, gt=0, le=2)
    ocr_max_chars: int = Field(default=8000, gt=0, le=8000)
    ocr_max_output_tokens: int = Field(default=1000, gt=0, le=16000)

    @field_validator("endpoint")
    @classmethod
    def https_origin(cls, value: str) -> str:
        parsed = urlsplit(value)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.path
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError("Image storage requires an explicit HTTPS origin without a path")
        return value

    @field_validator("content_types")
    @classmethod
    def known_types(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if not value or len(value) != len(set(value)):
            raise ValueError("Image content types must be unique and nonempty")
        if any(content_type not in SUPPORTED_IMAGE_TYPES for content_type in value):
            raise ValueError("Only PNG, JPEG and WebP images are supported")
        return value

    def extension_for(self, content_type: str) -> str | None:
        return {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/webp": "webp",
        }.get(content_type)
