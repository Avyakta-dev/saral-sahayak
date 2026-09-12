from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from backend.images.config import SUPPORTED_IMAGE_TYPES, ImageConfig
from backend.languages import LANGUAGES, LanguageCode
from backend.llm import LLMConfig
from backend.tools.budget import BudgetLimits

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_KNOWLEDGE_ROOT = PROJECT_ROOT / "references" / "knowledge" / "epfo"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env", extra="ignore", hide_input_in_errors=True
    )

    llm_api_style: Literal["responses", "chat_completions", "messages"] = "responses"
    llm_base_url: str = ""
    llm_api_key: SecretStr = SecretStr("")
    llm_model: str = ""
    llm_stream: bool = False
    llm_timeout_seconds: float = Field(default=25, gt=0, le=120)
    analysis_request_seconds: float = Field(default=30, gt=0, le=120)
    analysis_access_mode: Literal["local", "protected"] = "local"
    analysis_access_token: SecretStr = Field(default=SecretStr(""), repr=False)
    analysis_requests_per_minute: int = Field(default=10, ge=1, le=600)
    analysis_max_concurrent: int = Field(default=2, ge=1, le=32)
    llm_connect_timeout_seconds: float = Field(default=5, gt=0, le=30)
    llm_max_output_tokens: int = Field(default=2000, gt=0, le=16000)
    llm_extra_headers: dict[str, SecretStr] = Field(default_factory=dict)
    llm_anthropic_version: str = "2023-06-01"
    cors_origins: list[str] = Field(default_factory=list)
    supported_languages: list[LanguageCode] = Field(default_factory=lambda: list(LANGUAGES))

    # Lifecycle/history/cache. In-memory only by default: no path means nothing touches
    # disk. Persisted rows never contain raw text or user-supplied details (see
    # backend/history/models.py) - only a one-way fingerprint and the outcome fields the
    # response already exposes.
    history_enabled: bool = True
    history_max_records: int = Field(default=5000, gt=0, le=200_000)
    history_max_per_session: int = Field(default=200, gt=0, le=10_000)
    history_persist_path: str = ""

    # Private image input. Disabled by default and never inferred from the model name.
    # Credentials come from the standard boto3 chain (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY),
    # so only the destination is configured here.
    image_input_enabled: bool = False
    image_lifecycle_configured: bool = False
    image_r2_endpoint: str = ""
    image_r2_bucket: str = ""
    image_upload_ttl_seconds: int = Field(default=120, gt=0, le=900)
    image_url_max_ttl_seconds: int = Field(default=120, gt=0, le=900)
    image_max_bytes: int = Field(default=10 * 1024 * 1024, gt=0, le=10 * 1024 * 1024)
    image_ocr_max_chars: int = Field(default=8000, gt=0)
    image_ocr_max_output_tokens: int = Field(default=1000, gt=0, le=16000)
    image_content_types: list[str] = Field(default_factory=lambda: list(SUPPORTED_IMAGE_TYPES))

    @model_validator(mode="after")
    def protected_access(self):
        if self.analysis_access_mode == "protected":
            token = self.analysis_access_token.get_secret_value()
            if not 32 <= len(token) <= 256 or any(not 33 <= ord(c) <= 126 for c in token):
                raise ValueError("Protected analysis requires a 32-256 character ASCII token")
        return self

    @field_validator("supported_languages")
    @classmethod
    def language_set(cls, value: list[LanguageCode]) -> list[LanguageCode]:
        if not value or len(value) != len(set(value)) or "en" not in value:
            raise ValueError("Supported languages must be unique and include default English")
        return value

    @field_validator("image_content_types")
    @classmethod
    def image_content_type_set(cls, value: list[str]) -> list[str]:
        if (
            not value
            or len(value) != len(set(value))
            or any(item not in SUPPORTED_IMAGE_TYPES for item in value)
        ):
            raise ValueError("Image content types must be unique and one of the supported types")
        return value

    @field_validator(
        "llm_base_url", "llm_model", "image_r2_endpoint", "image_r2_bucket", "history_persist_path"
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("history_persist_path")
    @classmethod
    def history_persist_path_is_a_plausible_file(cls, value: str) -> str:
        if not value:
            return value
        path = Path(value).expanduser()
        if path.exists() and path.is_dir():
            raise ValueError("history_persist_path must be a file path, not a directory")
        if not path.parent.is_dir():
            raise ValueError(f"history_persist_path's parent directory does not exist: {path.parent}")
        return value

    @field_validator("cors_origins")
    @classmethod
    def explicit_origins(cls, value: list[str]) -> list[str]:
        from urllib.parse import urlsplit

        for origin in value:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or parsed.username
                or parsed.password
                or parsed.path
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError("CORS requires explicit HTTP(S) origins without paths")
        return value

    def analysis_budget_limits(self) -> BudgetLimits:
        return BudgetLimits(request_seconds=self.analysis_request_seconds)

    def history_store(self):
        """Build the lifecycle/cache store this instance describes, or None when disabled."""
        if not self.history_enabled:
            return None
        from backend.history import CaseHistoryStore

        return CaseHistoryStore(
            max_records=self.history_max_records,
            max_per_session=self.history_max_per_session,
            persist_path=Path(self.history_persist_path) if self.history_persist_path else None,
        )

    def image_config(self) -> ImageConfig | None:
        """Fail closed: image input needs an explicit opt-in and an explicit destination."""
        if not self.image_input_enabled or not self.image_lifecycle_configured:
            return None
        if not all((self.image_r2_endpoint, self.image_r2_bucket)):
            return None
        return ImageConfig(
            endpoint=self.image_r2_endpoint,
            bucket=self.image_r2_bucket,
            lifecycle_configured=self.image_lifecycle_configured,
            content_types=tuple(self.image_content_types),
            upload_ttl_seconds=self.image_upload_ttl_seconds,
            url_max_ttl_seconds=self.image_url_max_ttl_seconds,
            max_bytes=self.image_max_bytes,
            ocr_max_chars=self.image_ocr_max_chars,
            ocr_max_output_tokens=self.image_ocr_max_output_tokens,
        )

    def llm_config(self) -> LLMConfig | None:
        if not all(
            (self.llm_base_url, self.llm_model, self.llm_api_key.get_secret_value().strip())
        ):
            return None
        return LLMConfig(
            api_style=self.llm_api_style,
            base_url=self.llm_base_url,
            api_key=self.llm_api_key,
            model=self.llm_model,
            stream=self.llm_stream,
            timeout_seconds=self.llm_timeout_seconds,
            connect_timeout_seconds=self.llm_connect_timeout_seconds,
            max_output_tokens=self.llm_max_output_tokens,
            extra_headers=self.llm_extra_headers,
            anthropic_version=self.llm_anthropic_version,
        )
