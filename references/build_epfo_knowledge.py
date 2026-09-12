"""Build and validate the public EPFO Markdown knowledge collection.

The archived JSON is the source of truth. Generated files under references/knowledge
must be rebuilt, not hand-edited.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "references/epfo-claim-rejection-rag-dataset/data/rejections.json"
SOURCE_LINKS = ROOT / "references/epfo-claim-rejection-rag-dataset/data/source_links.json"
ARCHIVE_DOCS = ROOT / "references/epfo-claim-rejection-rag-dataset/docs"
OUTPUT = ROOT / "references/knowledge/epfo"
EXPECTED_FIELDS = (
    "id",
    "rejection_reason",
    "aliases",
    "category",
    "claim_types_affected",
    "severity",
    "official_status_or_message",
    "what_it_means",
    "root_cause",
    "how_detected",
    "fix_steps",
    "required_documents",
    "who_acts",
    "prevention_tips",
    "related_reason_ids",
    "source_urls",
    "source_types",
    "confidence",
    "notes",
    "last_verified",
)
ID_RE = re.compile(r"^epfo-rr-(\d{3})$")
URL_RE = re.compile(r"^https?://[^\s<>\"']+$", re.IGNORECASE)
OFFICIAL_SOURCE_TYPES = frozenset({"official", "circular"})
SECONDARY_SOURCE_TYPES = frozenset({"news", "blog", "forum"})
CLAIM_TYPE_SHORT = {
    "Form 19 PF Final Settlement": "Form 19",
    "Form 10C Pension Withdrawal Benefit": "Form 10C",
    "Form 10D Monthly Pension": "Form 10D",
    "Form 31 Partial Withdrawal/Advance": "Form 31",
    "Form 13 Transfer": "Form 13",
    "Form 20 Death PF Settlement": "Form 20",
    "Form 5IF EDLI Death Insurance": "Form 5IF",
    "Composite Claim Form": "CCF",
    "UMANG/Member Portal Online Claim": "UMANG/portal",
    "International Worker Claim": "IW",
    "Form 14 Financing of Life Insurance Policy": "Form 14",
}
# Curated offline navigation flags for agreed Level-2 cases. Not policy corrections.
GROUNDING_FLAGS = (
    (
        "UAN activation channel conflict",
        "`epfo-rr-007` vs `epfo-rr-181`",
        "Do not merge Fix steps; read both Sources sections and clarify the active channel.",
        ("epfo-rr-007", "epfo-rr-181"),
    ),
    (
        "2026 withdrawal thresholds",
        "`epfo-rr-039`, `epfo-rr-040`, `epfo-rr-096`",
        "Secondary/gazette-unchecked; withhold definitive percentages until authoritative text is reviewed.",
        ("epfo-rr-039", "epfo-rr-040", "epfo-rr-096"),
    ),
    (
        "Short EPS service currency",
        "`epfo-rr-035`",
        "Older FAQ material; do not treat skip-Form-10C guidance as independently verified current entitlement.",
        ("epfo-rr-035",),
    ),
    (
        "Ambiguous KYC pending",
        "`epfo-rr-010` vs `epfo-rr-016`",
        "Ask which KYC row and exact status before assigning employer vs bank/NPCI action.",
        ("epfo-rr-010", "epfo-rr-016"),
    ),
    (
        "Name mismatch subtype overlap",
        "`epfo-rr-001` and `epfo-rr-012`",
        "Shared applicability is not an exclusive lookup; preserve JD requirement caveats.",
        ("epfo-rr-001", "epfo-rr-012"),
    ),
    (
        "Overlap / transfer-only scope",
        "`epfo-rr-041` and `epfo-rr-070`",
        "StaffNews reproduction is secondary; do not generalize transfer-only guidance to settlements.",
        ("epfo-rr-041", "epfo-rr-070"),
    ),
)


def load_source_catalog(path: Path = SOURCE_LINKS) -> dict[str, dict]:
    entries = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(entries, list) or not entries:
        raise ValueError("source_links catalog must be a non-empty list")
    catalog: dict[str, dict] = {}
    for entry in entries:
        url = entry.get("url")
        source_type = entry.get("source_type")
        title = entry.get("title")
        if not isinstance(url, str) or not URL_RE.fullmatch(url) or not urlparse(url).netloc:
            raise ValueError(f"invalid catalog URL: {url!r}")
        if source_type not in OFFICIAL_SOURCE_TYPES | SECONDARY_SOURCE_TYPES:
            raise ValueError(f"unknown catalog source_type for {url}: {source_type!r}")
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"missing catalog title for {url}")
        if url in catalog:
            raise ValueError(f"duplicate catalog URL: {url}")
        catalog[url] = {
            "url": url,
            "title": title.strip(),
            "source_type": source_type,
        }
    return catalog


def load_records(path: Path = SOURCE) -> list[dict]:
    records = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(records, list) or len(records) != 181:
        raise ValueError("source must contain exactly 181 records")
    ids = [record.get("id") for record in records]
    expected = [f"epfo-rr-{i:03d}" for i in range(1, 182)]
    if ids != expected:
        raise ValueError("records must have contiguous canonical IDs in order")
    valid_ids = set(expected)
    catalog = load_source_catalog()
    for record in records:
        if tuple(record) != EXPECTED_FIELDS:
            raise ValueError(f"{record.get('id')}: schema fields do not match contract")
        for field in EXPECTED_FIELDS:
            if field not in record:
                raise ValueError(f"{record.get('id')}: missing field {field}")
        if (
            not isinstance(record["rejection_reason"], str)
            or not record["rejection_reason"].strip()
        ):
            raise ValueError(f"{record['id']}: empty rejection_reason")
        for field in (
            "aliases",
            "claim_types_affected",
            "fix_steps",
            "required_documents",
            "prevention_tips",
            "related_reason_ids",
            "source_urls",
            "source_types",
        ):
            if not isinstance(record[field], list) or not all(
                isinstance(item, str) for item in record[field]
            ):
                raise ValueError(f"{record['id']}: {field} must be a string list")
        if not record["source_urls"] or not all(
            URL_RE.fullmatch(url) and urlparse(url).netloc for url in record["source_urls"]
        ):
            raise ValueError(f"{record['id']}: source_urls must contain valid HTTP(S) URLs")
        for url in record["source_urls"]:
            if url not in catalog:
                raise ValueError(f"{record['id']}: URL missing from source_links catalog: {url}")
        for claim_type in record["claim_types_affected"]:
            if claim_type not in CLAIM_TYPE_SHORT:
                raise ValueError(f"{record['id']}: unknown claim type {claim_type!r}")
        if any(related not in valid_ids for related in record["related_reason_ids"]):
            raise ValueError(f"{record['id']}: related ID does not resolve")
        for field, value in record.items():
            if isinstance(value, str) and any(
                ord(char) < 32 and char not in "\n\t\r" for char in value
            ):
                raise ValueError(f"{record['id']}: control character in {field}")
    return records


def bullets(values: list[str], empty: str = "_None recorded._") -> str:
    return "\n".join(f"- {value}" for value in values) if values else empty


def short_claim_types(record: dict) -> str:
    return ", ".join(CLAIM_TYPE_SHORT[claim] for claim in record["claim_types_affected"])


def format_source_line(url: str, catalog: dict[str, dict]) -> str:
    """Compact labeled URL for bounded reads; full titles live in sources.md."""
    entry = catalog[url]
    return f"- [{entry['source_type']}] {url}"


def sources_and_verification(record: dict, catalog: dict[str, dict]) -> str:
    lines = [
        (
            "- **Source types (record-level summary; not a positional zip with URLs):** "
            f"{', '.join(record['source_types'])}"
        ),
        f"- **Confidence:** {record['confidence']}",
        f"- **Last verified in source record:** {record['last_verified']}",
        f"- **Notes/caveats:** {record['notes'] or '_No additional note recorded._'}",
        "",
        "Per-URL labels below come from `source_links.json` (official/circular vs secondary). "
        "Titles and citation counts are in [sources.md](../sources.md). Labels are archived "
        "metadata; the generator does not fetch URLs or re-verify current policy.",
        "",
    ]
    official = [
        url for url in record["source_urls"] if catalog[url]["source_type"] in OFFICIAL_SOURCE_TYPES
    ]
    secondary = [
        url
        for url in record["source_urls"]
        if catalog[url]["source_type"] in SECONDARY_SOURCE_TYPES
    ]
    if official:
        lines.append("### Official / circular")
        lines.append("")
        lines.extend(format_source_line(url, catalog) for url in official)
        lines.append("")
    if secondary:
        lines.append("### Secondary (news / blog / forum)")
        lines.append("")
        lines.extend(format_source_line(url, catalog) for url in secondary)
        lines.append("")
        lines.append(
            "_Secondary reporting is not statutory text; prefer official/circular sources and "
            "preserve caveats rather than forcing current-policy certainty._"
        )
        lines.append("")
    if not official and not secondary:
        raise ValueError(f"{record['id']}: no catalog-classified source URLs")
    return "\n".join(lines).rstrip()


def reason_markdown(record: dict, catalog: dict[str, dict] | None = None) -> str:
    catalog = catalog or load_source_catalog()
    rid = record["id"]
    metadata = json.dumps(record, ensure_ascii=False, indent=2)
    return f"""# {record["rejection_reason"]} ({rid})

> Dataset record `{rid}`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** {record["rejection_reason"]}

**Aliases:** {", ".join(record["aliases"])}

## Classification

- **Category:** {record["category"]}
- **Affected claim types:** {", ".join(record["claim_types_affected"])}
- **Severity:** {record["severity"]}
- **Official/common message status:** {record["official_status_or_message"]}

## What it means

{record["what_it_means"]}

## Root cause

{record["root_cause"]}

## How it is detected

{record["how_detected"]}

## Fix

{bullets(record["fix_steps"])}

## Required documents

{bullets(record["required_documents"])}

## Who acts

{record["who_acts"]}

## Prevention

{bullets(record["prevention_tips"])}

## Related records

{bullets([f"[{related}](./{related}.md)" for related in record["related_reason_ids"]])}

## Sources and verification

{sources_and_verification(record, catalog)}

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{metadata}
```
"""


def supporting_doc(name: str, title: str) -> str:
    source = (ARCHIVE_DOCS / name).read_text(encoding="utf-8").rstrip()
    return f"# {title}\n\n> Copied from the archived source document for runtime reference. This is educational material, not official EPFO guidance; links and caveats are preserved and were not freshly fetched by the generator.\n\n{source}\n"


def render_index(records: list[dict]) -> str:
    groups: dict[str, list[dict]] = {}
    for record in records:
        groups.setdefault(record["category"], []).append(record)
    index = [
        "# EPFO claim-rejection knowledge index",
        "",
        "> Generated from `references/epfo-claim-rejection-rag-dataset/data/rejections.json`. This compact index is navigation only; read a reason file before making a substantive claim.",
        "",
        "## Scope and limitations",
        "",
        "This collection contains 181 educational dataset records, not government rejection codes. Portal remarks are commonly reported text, and source confidence/date metadata are preserved without implying current-policy verification. See [sources](./sources.md) for provenance and gaps.",
        "",
        "Index claim-type labels are compact navigation shortcuts. Full names remain in each reason file's Classification section and in [claim types](./claim-types-overview.md): Form 19, Form 10C, Form 10D, Form 31, Form 13, Form 20, Form 5IF, CCF (Composite Claim Form), UMANG/portal, IW (International Worker), Form 14. Offline grounding flags for agreed conflict/ambiguity cases are listed after the category sections so the opening bytes keep reason links reachable within a bounded first read.",
        "",
    ]
    for category, items in groups.items():
        index += [f"## {category}", ""]
        for record in items:
            claims = short_claim_types(record)
            index.append(
                f"- `{record['id']}` — {record['rejection_reason']} ({claims}) "
                f"([read reason](reasons/{record['id']}.md))"
            )
        index.append("")
    index += [
        "## Offline grounding flags (navigation only)",
        "",
        "Curated offline review flags for agreed ambiguous/conflict cases. These are not verified policy corrections and do not authorize ready guidance without reading the linked reason files and their Sources sections.",
        "",
    ]
    for title, ids, guidance, linked in GROUNDING_FLAGS:
        links = ", ".join(f"[`{rid}`](reasons/{rid}.md)" for rid in linked)
        index.append(f"- **{title}** — {ids}: {guidance} Links: {links}.")
    index += [
        "",
        "## Supporting references",
        "",
        "- [Sources and caveats](./sources.md)",
        "- [Glossary](./glossary.md)",
        "- [Claim types](./claim-types-overview.md)",
        "- [Resolution playbooks](./resolution-playbooks.md)",
        "",
    ]
    return "\n".join(index)


def render_outputs(records: list[dict]) -> dict[str, str]:
    catalog = load_source_catalog()
    outputs = {
        f"reasons/{record['id']}.md": reason_markdown(record, catalog) for record in records
    }
    outputs["README.md"] = render_index(records)
    outputs["glossary.md"] = supporting_doc("glossary.md", "EPFO glossary")
    outputs["claim-types-overview.md"] = supporting_doc(
        "claim-types-overview.md", "EPFO claim types"
    )
    outputs["resolution-playbooks.md"] = supporting_doc(
        "resolution-playbooks.md", "EPFO resolution playbooks"
    )
    outputs["sources.md"] = (
        "# EPFO source catalog and caveats\n\n> This catalog is preserved from the archived dataset. URLs are citation data; the generator does not fetch them. The collection is educational material, not official guidance or legal advice.\n\n"
        + (ROOT / "references/epfo-claim-rejection-rag-dataset/sources.md")
        .read_text(encoding="utf-8")
        .rstrip()
        + "\n"
    )
    return outputs


def write_output(records: list[dict], output: Path = OUTPUT) -> None:
    for relative_path, text in render_outputs(records).items():
        path = output / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8", newline="\n")


def validate_output(records: list[dict], output: Path = OUTPUT) -> None:
    if not output.is_dir():
        raise ValueError(f"missing output directory: {output}")
    for name in (
        "README.md",
        "sources.md",
        "glossary.md",
        "claim-types-overview.md",
        "resolution-playbooks.md",
    ):
        if not (output / name).is_file():
            raise ValueError(f"missing supporting document: {name}")
    catalog = load_source_catalog()
    index = (output / "README.md").read_text(encoding="utf-8")
    if "## Offline grounding flags (navigation only)" not in index:
        raise ValueError("index missing offline grounding flags section")
    if "Index claim-type labels are compact navigation shortcuts" not in index:
        raise ValueError("index missing compact claim-type legend")
    for record in records:
        path = output / "reasons" / f"{record['id']}.md"
        if not path.is_file() or f"reasons/{record['id']}.md" not in index:
            raise ValueError(f"missing index/file coverage for {record['id']}")
        if short_claim_types(record) not in index:
            raise ValueError(f"index missing compact claim types for {record['id']}")
        text = path.read_text(encoding="utf-8")
        match = re.search(r"```json\n(.*?)\n```", text, re.DOTALL)
        if not match or json.loads(match.group(1)) != record:
            raise ValueError(f"source record not preserved for {record['id']}")
        for heading in (
            "## Classification",
            "## What it means",
            "## Root cause",
            "## How it is detected",
            "## Fix",
            "## Required documents",
            "## Sources and verification",
        ):
            if heading not in text:
                raise ValueError(f"missing stable heading {heading} in {record['id']}")
        for url in record["source_urls"]:
            entry = catalog[url]
            expected_line = format_source_line(url, catalog)
            if expected_line not in text:
                raise ValueError(f"{record['id']}: missing labeled source line for {url}")
            if entry["source_type"] in OFFICIAL_SOURCE_TYPES:
                if "### Official / circular" not in text:
                    raise ValueError(f"{record['id']}: missing official/circular source grouping")
            if entry["source_type"] in SECONDARY_SOURCE_TYPES:
                if "### Secondary (news / blog / forum)" not in text:
                    raise ValueError(f"{record['id']}: missing secondary source grouping")
    if len(list((output / "reasons").glob("*.md"))) != 181:
        raise ValueError("reason file count is not exactly 181")
    for relative_path, expected_text in render_outputs(records).items():
        if (output / relative_path).read_bytes().decode("utf-8") != expected_text:
            raise ValueError(f"generated content does not match source for {relative_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("build", "validate"))
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    records = load_records()
    if args.command == "build":
        write_output(records, args.output)
    validate_output(records, args.output)


if __name__ == "__main__":
    main()
