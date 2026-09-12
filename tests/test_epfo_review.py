import copy
import json

import pytest

from references.build_epfo_knowledge import OUTPUT, load_records, write_output
from references.review_epfo_knowledge import (
    ARCHIVE,
    REVIEW_ROOT,
    build_inventory,
    sections,
    validate_readable_record,
    validate_register,
    validate_review_cases,
)


@pytest.fixture(scope="module")
def records():
    return load_records()


def read_review(name):
    return json.loads((REVIEW_ROOT / name).read_text(encoding="utf-8"))


def test_inventory_is_current_and_covers_every_record(records):
    inventory = build_inventory(records)
    assert read_review("inventory.json") == inventory
    assert inventory["record_count"] == 181
    assert {row["record_id"] for row in inventory["records"]} == {r["id"] for r in records}
    assert all(row["readable_source_fidelity"] == "passed" for row in inventory["records"])
    assert all(row["semantic_review"] == "pending" for row in inventory["records"])
    assert all(row["live_source_verification"] == "not_attempted" for row in inventory["records"])
    assert inventory["unique_source_urls"] == len({url for r in records for url in r["source_urls"]})
    for field, groups in inventory["groups"].items():
        for value, ids in groups.items():
            expected = [r["id"] for r in records if value in (
                r[field] if isinstance(r[field], list) else [r[field]]
            )]
            assert ids == expected
    for ids in inventory["shared_normalized_aliases"].values():
        assert len(ids) > 1


@pytest.mark.parametrize("record_number", range(181))
def test_readable_evidence_matches_source_not_just_embedded_json(records, record_number):
    record = records[record_number]
    text = (OUTPUT / "reasons" / f"{record['id']}.md").read_text(encoding="utf-8")
    validate_readable_record(record, text)
    content = sections(text)
    assert all(len(body.encode("utf-8")) <= 12 * 1024 and len(body.splitlines()) <= 120
               for heading, body in content.items() if heading != "Complete source record")


@pytest.mark.parametrize("field", ["fix_steps", "notes", "source_urls", "related_reason_ids"])
def test_readable_tampering_is_rejected_while_embedded_source_is_intact(records, field):
    record = records[0]
    text = (OUTPUT / "reasons" / f"{record['id']}.md").read_text(encoding="utf-8")
    value = record[field][0] if isinstance(record[field], list) else record[field]
    modified = text.replace(value, "TAMPERED", 1)
    assert json.loads(modified.split("```json\n")[1].split("\n```")[0]) == record
    with pytest.raises(ValueError, match="readable evidence drift"):
        validate_readable_record(record, modified)


def test_fresh_regeneration_matches_every_committed_markdown_file(records, tmp_path):
    write_output(records, tmp_path)
    expected = {path.relative_to(tmp_path) for path in tmp_path.rglob("*.md")}
    actual = {path.relative_to(OUTPUT) for path in OUTPUT.rglob("*.md")}
    assert expected == actual
    assert len(actual) == 186
    for relative in expected:
        assert (tmp_path / relative).read_text(encoding="utf-8") == (
            OUTPUT / relative
        ).read_text(encoding="utf-8")


def test_catalog_preserves_authority_without_claiming_verification(records):
    inventory = build_inventory(records)
    catalog = inventory["source_authority_catalog"]
    assert len(catalog) == 119
    assert {entry["recorded_type"] for entry in catalog.values()} == {
        "official", "circular", "news", "blog", "forum",
    }
    assert all(entry["independently_verified"] is False for entry in catalog.values())
    for record in records:
        assert all(record["id"] in catalog[url]["used_by_reason_ids"]
                   for url in record["source_urls"])


def test_empty_fields_and_source_type_summary_are_explicit(records):
    for record in records:
        content = sections((OUTPUT / "reasons" / f"{record['id']}.md").read_text(encoding="utf-8"))
        if not record["notes"]:
            assert "_No additional note recorded._" in content["Sources and verification"]
        if not record["required_documents"]:
            assert content["Required documents"] == "_None recorded._"
        assert "record-level summary; not URL-position aligned" in content["Sources and verification"]


@pytest.mark.parametrize("filename", [
    "sources.md", "glossary.md", "claim-types-overview.md", "resolution-playbooks.md",
])
def test_supporting_document_caveats_and_attribution_are_preserved(filename):
    source = ARCHIVE / filename if filename == "sources.md" else ARCHIVE / "docs" / filename
    text = (OUTPUT / filename).read_text(encoding="utf-8")
    assert source.read_text(encoding="utf-8").strip() in text


def test_cases_reference_readable_evidence_without_claiming_agent_success(records):
    cases = read_review("cases.json")
    validate_review_cases(cases, records)
    kinds = {case["kind"] for case in cases}
    assert {"paraphrase", "ambiguous", "missing_facts", "uncertain_policy", "unknown"} <= kinds
    for case in cases:
        if "success" in case["expected_states"]:
            headings = {evidence["heading"] for evidence in case["evidence"]}
            assert "Sources and verification" in headings
        assert case["agent_execution"] == "not_run"


@pytest.mark.parametrize("mutation, error", [
    (lambda cases: cases[0]["evidence"][0].update(heading="Invented heading"), "evidence section"),
    (lambda cases: cases[0]["evidence"][0].update(excerpt="INVENTED EXCERPT"), "excerpt drift"),
    (lambda cases: cases[0].update(agent_execution="passed"), "executed agent"),
])
def test_review_manifest_rejects_fabricated_evidence_and_results(records, mutation, error):
    cases = copy.deepcopy(read_review("cases.json"))
    mutation(cases)
    with pytest.raises(ValueError, match=error):
        validate_review_cases(cases, records)


def test_unknown_case_cannot_be_declared_supported(records):
    cases = copy.deepcopy(read_review("cases.json"))
    unknown = next(case for case in cases if case["kind"] == "unknown")
    unknown["expected_states"] = ["success"]
    with pytest.raises(ValueError, match="clarify or abstain"):
        validate_review_cases(cases, records)


def test_register_preserves_unverified_status_and_actual_source_urls(records):
    register = read_review("verification-register.json")
    assert len(register) >= 6
    validate_register(register, records)
    for entry in register:
        assert entry["fetch_status"] == "not_attempted"
        assert entry["verified_on"] is None
        assert entry["gap"] and entry["acceptance_requirement"]


@pytest.mark.parametrize("field, value, error", [
    ("verified_on", "2026-09-12", "live verification"),
    ("source_url", "https://example.org/invented.pdf", "not in original"),
    ("gap", "", "limitation"),
])
def test_register_rejects_false_verification_or_provenance(records, field, value, error):
    register = copy.deepcopy(read_review("verification-register.json"))
    register[0][field] = value
    with pytest.raises(ValueError, match=error):
        validate_register(register, records)


def test_section_parser_does_not_treat_embedded_json_as_evidence_headings():
    content = sections("## Fix\nOriginal\n```\n## Invented\n```\n## Sources\nhttps://example.org")
    assert set(content) == {"Fix", "Sources"}
    with pytest.raises(ValueError, match="Duplicate"):
        sections("## Fix\nFirst\n## Fix\nSecond")
