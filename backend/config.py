from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    @field_validator("llm_base_url", "llm_model")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

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
            timeout_seconds=self.llm_timeout_seconds,
            connect_timeout_seconds=self.llm_connect_timeout_seconds,
            max_output_tokens=self.llm_max_output_tokens,
            extra_headers=self.llm_extra_headers,
            anthropic_version=self.llm_anthropic_version,
        )
