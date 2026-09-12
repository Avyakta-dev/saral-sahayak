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


@pytest.mark.parametrize(
    "mutation, message",
    [
        (lambda records: records.__setitem__(0, {**records[0], "id": "epfo-rr-999"}), "canonical IDs"),
        (lambda records: records[0].__setitem__("related_reason_ids", ["epfo-rr-999"]), "related ID"),
        (lambda records: records[0].__setitem__("source_urls", ["javascript:alert(1)"]), "source_urls"),
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
