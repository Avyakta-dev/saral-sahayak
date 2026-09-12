"""Conservative generated-prose checks, not a general phishing or semantic classifier."""

import html
import re
import unicodedata
from typing import Annotated
from urllib.parse import unquote

from pydantic import AfterValidator


def nonblank(value: str) -> str:
    if not any(
        not char.isspace() and unicodedata.category(char) not in {"Cf", "Cc"} for char in value
    ):
        raise ValueError("Generated prose must not be blank")
    return value


def _normalized(value: str) -> str:
    # Detect common escaping without changing text that will be shown to the user.
    for _ in range(3):
        updated = html.unescape(unquote(value))
        if updated == value:
            break
        value = updated
    value = unicodedata.normalize("NFKC", value)
    return "".join(c for c in value if unicodedata.category(c) != "Cf")


_LINK = re.compile(
    r"(?:\b(?:https?|ftp|file|data|javascript|vbscript|mailto|tel)\s*:"
    r"|\b[a-z][a-z0-9+.-]*\s*:\s*[/\\]"
    r"|[/\\]{2}|\bwww\s*\."
    r"|\[[^\]\n]*\]\s*(?:\(|\[|:)"
    r"|<\s*(?:a|img)\b"
    r"|\b(?:[a-z0-9-]+\.)+(?:com|org|net|gov|edu|in|io|co|dev|app|info|biz|invalid|test)\b)",
    re.IGNORECASE,
)


def link_free(value: str) -> str:
    nonblank(value)
    if _LINK.search(_normalized(value)):
        raise ValueError("Uncited prose must not contain links or URL syntax")
    return value


def evidence_links(value: str, allowed_urls: set[str]) -> None:
    """Remove exact evidenced URLs, then reject remaining URL/link syntax.

    Only plain evidenced HTTP(S) URLs are accepted, not model-authored Markdown
    link labels or HTML. Existing structured citations remain the navigation UI.
    """
    remainder = value
    for url in sorted(allowed_urls, key=len, reverse=True):
        remainder = re.sub(re.escape(url) + r"(?=$|[\s<>\"'`)\]])", "", remainder)
    if _LINK.search(_normalized(remainder)):
        raise ValueError("Generated link is not a plain URL from cited evidence")


NonBlankText = Annotated[str, AfterValidator(nonblank)]
LinkFreeText = Annotated[str, AfterValidator(link_free)]
