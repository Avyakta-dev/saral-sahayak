"""Offline curation inventory; never imported by the runtime agent or used for retrieval."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from references.build_epfo_knowledge import OUTPUT, ROOT, load_records

REVIEW_ROOT = ROOT / "references/reviews/epfo"
ARCHIVE = ROOT / "references/epfo-claim-rejection-rag-dataset"
LIST_FIELDS = (
    "aliases",
    "claim_types_affected",
    "fix_steps",
    "required_documents",
    "prevention_tips",
    "related_reason_ids",
    "source_urls",
    "source_types",
)
GROUP_FIELDS = ("category", "claim_types_affected", "severity", "confidence", "source_types")
SCALAR_SECTIONS = {
    "what_it_means": "What it means",
    "root_cause": "Root cause",
    "how_detected": "How it is detected",
    "who_acts": "Who acts",
}
LIST_SECTIONS = {
    "fix_steps": "Fix",
    "required_documents": "Required documents",
    "prevention_tips": "Prevention",
}


def sections(text: str) -> dict[str, str]:
    """Extract unique level-two evidence sections, ignoring headings inside fences."""
    result: dict[str, list[str]] = {}
    current = None
    fence = None
    for line in text.splitlines():
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
        if fence:
            if (
                marker
                and marker[1][0] == fence[0]
                and len(marker[1]) >= len(fence)
                and not marker[2].strip()
            ):
                fence = None
        elif marker:
            fence = marker[1]
        elif line.startswith("## "):
            current = line[3:].strip()
            if current in result:
                raise ValueError(f"Duplicate evidence heading: {current}")
            result[current] = []
            continue
        if current is not None:
            result[current].append(line)
    return {heading: "\n".join(lines).strip() for heading, lines in result.items()}


def validate_readable_record(record: dict, text: str) -> None:
    """Check readable evidence independently of the embedded JSON source snapshot."""
    content = sections(text)
    rid = record["id"]
    expected = {heading: record[field] for field, heading in SCALAR_SECTIONS.items()}
    expected["Rejection phrase and aliases"] = (
        f"**Canonical phrase:** {record['rejection_reason']}\n\n"
        f"**Aliases:** {', '.join(record['aliases'])}"
    )
    expected["Classification"] = "\n".join(
        (
            f"- **Category:** {record['category']}",
            f"- **Affected claim types:** {', '.join(record['claim_types_affected'])}",
            f"- **Severity:** {record['severity']}",
            f"- **Official/common message status:** {record['official_status_or_message']}",
        )
    )
    for field, heading in LIST_SECTIONS.items():
        expected[heading] = "\n".join(f"- {value}" for value in record[field]) or "_None recorded._"
    expected["Related records"] = "\n".join(
        f"- [{related}](./{related}.md)" for related in record["related_reason_ids"]
    )
    expected["Sources and verification"] = "\n".join(
        (
            f"- **Source types (record-level summary; not URL-position aligned):** {', '.join(record['source_types'])}",
            f"- **Confidence:** {record['confidence']}",
            f"- **Last verified in source record:** {record['last_verified']}",
            f"- **Notes/caveats:** {record['notes'] or '_No additional note recorded._'}",
            "",
            *[f"- {url}" for url in record["source_urls"]],
        )
    )
    for heading, value in expected.items():
        if content.get(heading) != value:
            raise ValueError(f"{rid}: readable evidence drift in {heading}")


def grouped_records(records: list[dict], field: str) -> dict[str, list[str]]:
    groups = defaultdict(list)
    for record in records:
        values = record[field] if isinstance(record[field], list) else [record[field]]
        for value in sorted(set(values)):
            groups[value].append(record["id"])
    return dict(sorted(groups.items()))


def build_inventory(records: list[dict], corpus: Path = OUTPUT) -> dict:
    aliases = defaultdict(set)
    rows = []
    all_urls = set()
    for record in records:
        rid = record["id"]
        path = corpus / "reasons" / f"{rid}.md"
        text = path.read_text(encoding="utf-8")
        validate_readable_record(record, text)
        for alias in record["aliases"]:
            aliases[" ".join(alias.casefold().split())].add(rid)
        duplicates = {}
        for field in LIST_FIELDS:
            counts = Counter(record[field])
            repeated = sorted(value for value, count in counts.items() if count > 1)
            if repeated:
                duplicates[field] = repeated
        all_urls.update(record["source_urls"])
        rows.append(
            {
                "record_id": rid,
                "path": f"reasons/{rid}.md",
                "readable_source_fidelity": "passed",
                "semantic_review": "pending",
                "live_source_verification": "not_attempted",
                "empty_fields": [
                    field for field, value in record.items() if value == "" or value == []
                ],
                "duplicate_values": duplicates,
                "related_record_ids": record["related_reason_ids"],
                "source_urls": record["source_urls"],
                "source_types_summary": record["source_types"],
                "source_types_url_aligned": False,
                "source_confidence": record["confidence"],
                "source_last_verified": record["last_verified"],
                "review_signals": [
                    term
                    for term in ("2026", "verify", "secondary", "conflict", "not independently")
                    if term in json.dumps(record, ensure_ascii=False).casefold()
                    # Date metadata is excluded below when evaluating policy-year mentions.
                    and (
                        term != "2026"
                        or "2026"
                        in " ".join(
                            str(value)
                            for field, value in record.items()
                            if field != "last_verified"
                        )
                    )
                ],
            }
        )
    fingerprints = {}
    source_paths = {
        ARCHIVE / "data/rejections.json",
        ARCHIVE / "data/source_links.json",
        ARCHIVE / "sources.md",
        *(ARCHIVE / "docs").glob("*.md"),
        *corpus.rglob("*.md"),
    }
    for path in sorted(source_paths):
        label = (
            str(path.relative_to(ROOT)).replace("\\", "/")
            if path.is_relative_to(ROOT)
            else "corpus/" + path.relative_to(corpus).as_posix()
        )
        # Normalize checkout line endings, not source content or whitespace.
        fingerprints[label] = hashlib.sha256(path.read_text(encoding="utf-8").encode()).hexdigest()
    index = sections((corpus / "README.md").read_text(encoding="utf-8"))
    catalog = json.loads((ARCHIVE / "data/source_links.json").read_text(encoding="utf-8"))
    catalog_by_url = {entry["url"]: entry for entry in catalog}
    if len(catalog_by_url) != len(catalog) or set(catalog_by_url) != all_urls:
        raise ValueError("Catalog URL coverage differs from source records")
    for url, entry in catalog_by_url.items():
        expected_ids = sorted(r["id"] for r in records if url in r["source_urls"])
        if sorted(entry["used_by_reason_ids"]) != expected_ids or entry["use_count"] != len(
            expected_ids
        ):
            raise ValueError(f"Catalog record mapping drift: {url}")
    return {
        "schema_version": 1,
        "scope": "offline curation inventory, not a retriever or policy verification",
        "record_count": len(records),
        "unique_source_urls": len(all_urls),
        "source_catalog_entries": len(catalog),
        "catalog_missing_source_type": sum(not source.get("source_type") for source in catalog),
        "source_authority_catalog": {
            url: {
                "recorded_type": entry.get("source_type"),
                "title": entry["title"],
                "used_by_reason_ids": entry["used_by_reason_ids"],
                "independently_verified": False,
            }
            for url, entry in sorted(catalog_by_url.items())
        },
        "groups": {field: grouped_records(records, field) for field in GROUP_FIELDS},
        "shared_normalized_aliases": {
            alias: sorted(ids) for alias, ids in sorted(aliases.items()) if len(ids) > 1
        },
        "index_sections": {
            heading: {"bytes": len(body.encode("utf-8")), "lines": len(body.splitlines())}
            for heading, body in index.items()
        },
        "records": rows,
        "sha256_normalized_utf8": fingerprints,
    }


def serialize_inventory(records: list[dict]) -> str:
    """Render the checked artifact deterministically."""
    return json.dumps(build_inventory(records), ensure_ascii=False, indent=2) + "\n"


def evidence_excerpt(reference: dict, records: dict[str, dict], corpus: Path = OUTPUT) -> str:
    rid = reference["record_id"]
    if rid not in records:
        raise ValueError(f"Unknown evidence record: {rid}")
    content = sections((corpus / "reasons" / f"{rid}.md").read_text(encoding="utf-8"))
    heading = reference["heading"]
    if heading not in content or heading == "Complete source record":
        raise ValueError(f"Not a readable evidence section: {rid}/{heading}")
    excerpt = reference["excerpt"]
    if not excerpt or excerpt not in content[heading]:
        raise ValueError(f"Evidence excerpt drift: {rid}/{heading}")
    return content[heading]


def validate_review_cases(cases: list[dict], records: list[dict], corpus: Path = OUTPUT) -> None:
    by_id = {record["id"]: record for record in records}
    seen = set()
    for case in cases:
        if case["id"] in seen:
            raise ValueError("Duplicate review case")
        seen.add(case["id"])
        if case["agent_execution"] != "not_run":
            raise ValueError("Offline fixtures cannot claim executed agent behavior")
        if not case["input"] or not case["review_rationale"]:
            raise ValueError("Case lacks input or review rationale")
        if (
            not set(case["expected_states"]) <= {"success", "needs_clarification", "unsupported"}
            or not case["expected_states"]
        ):
            raise ValueError("Invalid expected states")
        if set(case["candidate_ids"]) - by_id.keys():
            raise ValueError("Unknown candidate")
        if case["kind"] in {"ambiguous", "missing_facts", "uncertain_policy", "unknown"}:
            if "success" in case["expected_states"] or not case["no_ready_guidance"]:
                raise ValueError("Uncertain cases must clarify or abstain without ready guidance")
        if "success" in case["expected_states"] and not case["candidate_ids"]:
            raise ValueError("Supported case requires candidate evidence")
        if not case["evidence"]:
            raise ValueError("Review case requires evidence or an explicit limitation excerpt")
        for reference in case["evidence"]:
            evidence_excerpt(reference, by_id, corpus)
        if not case["forbidden_behavior"]:
            raise ValueError("Review case must preserve limitations")


def validate_register(entries: list[dict], records: list[dict], corpus: Path = OUTPUT) -> None:
    by_id = {record["id"]: record for record in records}
    if len({entry["id"] for entry in entries}) != len(entries):
        raise ValueError("Duplicate verification entry")
    for entry in entries:
        evidence_excerpt(entry["evidence"], by_id, corpus)
        rid = entry["evidence"]["record_id"]
        if entry["source_url"] not in by_id[rid]["source_urls"]:
            raise ValueError("Verification URL not in original record")
        if entry["fetch_status"] != "not_attempted" or entry["verified_on"] is not None:
            raise ValueError("Offline register must not claim live verification")
        for field in ("assertion_to_verify", "authority_basis", "gap", "acceptance_requirement"):
            if not entry[field]:
                raise ValueError(f"Missing verification limitation: {field}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("build", "check"))
    args = parser.parse_args()
    records = load_records()
    cases = json.loads((REVIEW_ROOT / "cases.json").read_text(encoding="utf-8"))
    register = json.loads((REVIEW_ROOT / "verification-register.json").read_text(encoding="utf-8"))
    validate_review_cases(cases, records)
    validate_register(register, records)
    serialized = serialize_inventory(records)
    target = REVIEW_ROOT / "inventory.json"
    if args.command == "build":
        target.write_text(serialized, encoding="utf-8", newline="\n")
    elif target.read_text(encoding="utf-8") != serialized:
        raise ValueError("Review inventory is stale; rebuild and review changed findings")
    print(
        f"Checked {len(records)} readable records, {len(cases)} review cases, {len(register)} verification gaps. No live sources or agent execution verified."
    )


if __name__ == "__main__":
    main()
