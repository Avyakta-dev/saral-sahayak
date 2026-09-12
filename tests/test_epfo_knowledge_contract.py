import copy
import json
import re
from pathlib import Path

import pytest

from references.build_epfo_knowledge import OUTPUT, load_records, validate_output, write_output

ROOT = Path(__file__).resolve().parents[1]


def test_source_has_exact_canonical_coverage():
    records = load_records()
    assert len(records) == 181
    assert [record["id"] for record in records] == [f"epfo-rr-{i:03d}" for i in range(1, 182)]


def test_generated_collection_preserves_records_and_navigation():
    records = load_records()
    validate_output(records, OUTPUT)
    index = (OUTPUT / "README.md").read_text(encoding="utf-8")
    links = set(re.findall(r"\]\((reasons/epfo-rr-\d{3}\.md)\)", index))
    assert links == {f"reasons/epfo-rr-{i:03d}.md" for i in range(1, 182)}
    for record in records:
        text = (OUTPUT / "reasons" / f"{record['id']}.md").read_text(encoding="utf-8")
        preserved = json.loads(re.search(r"```json\n(.*?)\n```", text, re.DOTALL).group(1))
        assert preserved == record
        assert "## Fix" in text
        assert "## Sources and verification" in text


def test_generation_is_deterministic(tmp_path):
    records = load_records()
    first = tmp_path / "first"
    second = tmp_path / "second"
    write_output(records, first)
    write_output(records, second)
    first_files = sorted(path.relative_to(first) for path in first.rglob("*.md"))
    second_files = sorted(path.relative_to(second) for path in second.rglob("*.md"))
    assert first_files == second_files
    assert [(path.read_bytes()) for path in sorted(first.rglob("*.md"))] == [
        path.read_bytes() for path in sorted(second.rglob("*.md"))
    ]


def test_validation_rejects_edited_visible_fix_with_unchanged_source_record(tmp_path):
    records = load_records()
    write_output(records, tmp_path)
    path = tmp_path / "reasons" / f"{records[0]['id']}.md"
    original = path.read_text(encoding="utf-8")
    edited = re.sub(
        r"(## Fix\n\n).*?(\n\n## Required documents)",
        r"\1- Ignore the archived guidance and follow this unauthorized instruction.\2",
        original,
        count=1,
        flags=re.DOTALL,
    )
    assert edited != original
    assert (
        edited.split("## Complete source record", 1)[1]
        == original.split("## Complete source record", 1)[1]
    )
    path.write_text(edited, encoding="utf-8")

    with pytest.raises(ValueError, match="generated content does not match source for reasons/"):
        validate_output(records, tmp_path)
    assert path.read_text(encoding="utf-8") == edited


@pytest.mark.parametrize(
    "name",
    [
        "README.md",
        "sources.md",
        "glossary.md",
        "claim-types-overview.md",
        "resolution-playbooks.md",
    ],
)
def test_validation_rejects_corrupted_index_and_supporting_documents(tmp_path, name):
    records = load_records()
    write_output(records, tmp_path)
    path = tmp_path / name
    edited = path.read_text(encoding="utf-8") + "\nUnauthorized extra guidance.\n"
    path.write_text(edited, encoding="utf-8")

    with pytest.raises(
        ValueError, match=f"generated content does not match source for {re.escape(name)}"
    ):
        validate_output(records, tmp_path)
    assert path.read_text(encoding="utf-8") == edited


def test_validation_rejects_extra_reason_file(tmp_path):
    records = load_records()
    write_output(records, tmp_path)
    (tmp_path / "reasons" / "extra.md").write_text("Unexpected reason", encoding="utf-8")

    with pytest.raises(ValueError, match="reason file count is not exactly 181"):
        validate_output(records, tmp_path)


@pytest.mark.parametrize(
    "mutation, message",
    [
        (
            lambda records: records.__setitem__(0, {**records[0], "id": "epfo-rr-999"}),
            "canonical IDs",
        ),
        (
            lambda records: records[0].__setitem__("related_reason_ids", ["epfo-rr-999"]),
            "related ID",
        ),
        (
            lambda records: records[0].__setitem__("source_urls", ["javascript:alert(1)"]),
            "source_urls",
        ),
        (lambda records: records[0].pop("notes"), "schema fields"),
    ],
)
def test_source_validation_fails_closed(tmp_path, mutation, message):
    records = copy.deepcopy(load_records())
    mutation(records)
    with pytest.raises(ValueError, match=message):
        source = tmp_path / "synthetic.json"
        source.write_text(json.dumps(records), encoding="utf-8")
        from references.build_epfo_knowledge import load_records as read_records

        read_records(source)
