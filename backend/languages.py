from typing import Literal

LanguageCode = Literal["en", "hi", "kn", "ta", "te", "ml"]

LANGUAGES: dict[str, tuple[str, str]] = {
    "en": ("English", "English"),
    "hi": ("Hindi", "हिन्दी"),
    "kn": ("Kannada", "ಕನ್ನಡ"),
    "ta": ("Tamil", "தமிழ்"),
    "te": ("Telugu", "తెలుగు"),
    "ml": ("Malayalam", "മലയാളം"),
}
