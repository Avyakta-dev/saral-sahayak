import os
from pathlib import Path

import pytest

from backend.tools.budget import Budget, BudgetExceeded, BudgetLimits, KnowledgeError
from backend.tools.knowledge_files import KnowledgeFiles, check_knowledge_root


@pytest.fixture
def root(tmp_path):
    root = tmp_path / "public"
    root.mkdir()
    (root / "README.md").write_text("# Index\nSynthetic data only.\n", encoding="utf-8")
    return root


def generous(**limits):
    return Budget(BudgetLimits(output_tokens=100000, output_bytes=100000, **limits))


@pytest.mark.parametrize(
    "path",
    [
        "/etc/passwd",
        "../private.md",
        "x/../../private.md",
        "x/../README.md",
        "./README.md",
        ".env",
        ".git/config.md",
        "x//README.md",
        "x\\README.md",
        "C:/README.md",
        "README.md\x00",
        "",
        "README.txt",
    ],
)
def test_invalid_paths_count(root, path):
    with KnowledgeFiles(root) as tools:
        with pytest.raises(KnowledgeError):
            tools.read_file(path)
        assert tools.budget.usage.tool_calls == 1
        assert not tools.ledger.entries
        assert tools.budget.usage.output_bytes > 0


@pytest.mark.parametrize("path", ["/", "../", "x/..", "./", ".git", "x\\y"])
def test_invalid_listing(root, path):
    with KnowledgeFiles(root) as tools, pytest.raises(KnowledgeError):
        tools.list_files(path)


def test_missing_and_unsafe_roots(tmp_path):
    with pytest.raises(KnowledgeError, match="unavailable") as error:
        check_knowledge_root(tmp_path / "missing")
    assert str(tmp_path) not in str(error.value)
    real = tmp_path / "real"
    real.mkdir()
    (real / "child").mkdir()
    alias = tmp_path / "alias"
    alias.symlink_to(real, target_is_directory=True)
    for root in [alias, alias / "child", Path("relative"), Path("/"), real / ".."]:
        with pytest.raises(KnowledgeError):
            check_knowledge_root(root)
    check_knowledge_root(real)


def test_symlinks_nonregular_and_markdown_filter(root, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "secret.md").write_text("private")
    (root / "leaf.md").symlink_to(outside / "secret.md")
    (root / "dir").symlink_to(outside, target_is_directory=True)
    (root / "fifo.md").parent.mkdir(exist_ok=True)
    os.mkfifo(root / "fifo.md")
    (root / "file.txt").write_text("not Markdown")
    (root / "safe").mkdir()
    with KnowledgeFiles(root) as tools:
        for path in ["leaf.md", "dir/secret.md", "fifo.md", "safe.md"]:
            with pytest.raises(KnowledgeError):
                tools.read_file(path)
        with pytest.raises(KnowledgeError):
            tools.list_files("dir")
        assert [entry.path.rsplit("/", 1)[1] for entry in tools.list_files().entries] == [
            "README.md",
            "safe",
        ]
        assert not tools.ledger.entries


def test_directory_swap_cannot_follow_symlink(root, tmp_path, monkeypatch):
    (root / "nested").mkdir()
    (root / "nested" / "doc.md").write_text("safe")
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "doc.md").write_text("PRIVATE")
    original = os.open
    with KnowledgeFiles(root) as tools:

        def swapped(path, flags, *args, **kwargs):
            if path == "nested":
                (root / "nested").rename(root / "original")
                (root / "nested").symlink_to(outside, target_is_directory=True)
            return original(path, flags, *args, **kwargs)

        monkeypatch.setattr(os, "open", swapped)
        with pytest.raises(KnowledgeError):
            tools.read_file("nested/doc.md")
        assert not tools.ledger.entries


def test_leaf_swap_cannot_follow_symlink(root, tmp_path, monkeypatch):
    (root / "doc.md").write_text("safe")
    outside = tmp_path / "private.md"
    outside.write_text("PRIVATE")
    original = os.open
    with KnowledgeFiles(root) as tools:

        def swapped(path, flags, *args, **kwargs):
            if path == "doc.md":
                (root / "doc.md").unlink()
                (root / "doc.md").symlink_to(outside)
            return original(path, flags, *args, **kwargs)

        monkeypatch.setattr(os, "open", swapped)
        with pytest.raises(KnowledgeError):
            tools.read_file("doc.md")


def test_root_capability_survives_root_replacement(root, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "README.md").write_text("PRIVATE")
    with KnowledgeFiles(root) as tools:
        root.rename(tmp_path / "original")
        root.symlink_to(outside, target_is_directory=True)
        assert tools.read_file("README.md").text == "# Index\nSynthetic data only.\n"


def test_listing_pages_and_cursor_binding(root):
    for number in range(53):
        (root / f"doc-{number:02}.md").write_text("x")
    with KnowledgeFiles(root, budget=generous()) as tools:
        page = tools.list_files()
        assert len(page.entries) == 50 and page.truncated
        final = tools.list_files(cursor=page.next_cursor)
        assert len(final.entries) == 4 and not final.truncated and final.next_cursor is None
        assert not set(page.entries) & set(final.entries)
        with pytest.raises(KnowledgeError):
            tools.read_file("README.md", cursor=page.next_cursor)
        with pytest.raises(KnowledgeError):
            tools.list_files(cursor="invented")
        assert not tools.ledger.entries


def test_line_pages_and_citation_prefix(root):
    content = "".join(f"line {i}\n" for i in range(125))
    (root / "doc.md").write_text(content)
    with KnowledgeFiles(root, budget=generous(), citation_prefix="public/docs") as tools:
        first = tools.read_file("doc.md")
        assert first.path == "public/docs/doc.md"
        assert first.start_line == 1 and first.end_line == 120 and first.truncated
        second = tools.read_file("doc.md", cursor=first.next_cursor)
        assert second.start_line == 121 and not second.truncated
        assert first.text + second.text == content
        assert tools.budget.usage.files == 1


def test_unicode_oversized_line_advances(root):
    content = "हिंदी🙂" * 30 + "\nnext\n"
    (root / "unicode.md").write_text(content, encoding="utf-8")
    with KnowledgeFiles(root, budget=generous(tool_calls=200)) as tools:
        chunks, positions = [], []
        cursor = None
        while True:
            page = tools.read_file("unicode.md", cursor=cursor, max_bytes=31)
            assert 0 < len(page.text.encode("utf-8")) <= 31
            positions.append((page.start_line, page.start_column))
            chunks.append(page.text)
            if not page.truncated:
                break
            assert page.next_cursor
            cursor = page.next_cursor
        assert positions == sorted(set(positions))
        assert "".join(chunks) == content


def test_heading_selection_duplicates_and_fences(root):
    content = "# Top\nintro\n## Fix ###\nbody\n### Child\nchild\n## Other\nend\n"
    (root / "doc.md").write_text(content)
    with KnowledgeFiles(root, budget=generous()) as tools:
        page = tools.read_file("doc.md", heading="Fix", max_lines=2)
        assert page.text == "## Fix ###\nbody\n"
        assert page.heading == "Fix" and page.start_line == 3 and page.end_line == 4
        end = tools.read_file("doc.md", cursor=page.next_cursor)
        assert end.text == "### Child\nchild\n" and not end.truncated
        with pytest.raises(KnowledgeError, match="not found"):
            tools.read_file("doc.md", heading="No heading")
    (root / "dup.md").write_text("## Same\na\n## Same\nb\n")
    (root / "fenced.md").write_text("```md\n## Fake\n```\n## Actual\n~~~\n## Fake\n~~~\n")
    with KnowledgeFiles(root) as tools:
        with pytest.raises(KnowledgeError, match="duplicated"):
            tools.read_file("dup.md", heading="Same")
        assert tools.read_file("fenced.md").headings == ("Actual",)


def test_invalid_utf8_empty_giant_and_stale_cursor(root):
    (root / "bad.md").write_bytes(b"\xff")
    (root / "empty.md").write_bytes(b"")
    (root / "huge.md").write_bytes(b"x" * 1025)
    with KnowledgeFiles(root, budget=generous(file_bytes=1024)) as tools:
        for name in ["bad.md", "empty.md", "huge.md"]:
            with pytest.raises(KnowledgeError):
                tools.read_file(name)
        first = tools.read_file("README.md", max_lines=1)
        (root / "README.md").write_text("changed\nnext\n")
        with pytest.raises(KnowledgeError, match="changed"):
            tools.read_file("README.md", cursor=first.next_cursor)
        assert len(tools.ledger.entries) == 1


def test_request_calls_and_invalid_attempts(root):
    with KnowledgeFiles(root, budget=Budget(BudgetLimits(tool_calls=2))) as tools:
        for _ in range(2):
            with pytest.raises(KnowledgeError):
                tools.read_file("../denied.md")
        with pytest.raises(BudgetExceeded):
            tools.read_file("README.md")
        assert tools.budget.usage.tool_calls == 3


def test_distinct_file_budget(root):
    (root / "second.md").write_text("other")
    with KnowledgeFiles(root, budget=Budget(BudgetLimits(files=1))) as tools:
        tools.read_file("README.md")
        tools.read_file("README.md")
        with pytest.raises(BudgetExceeded):
            tools.read_file("second.md")
        assert len(tools.ledger.entries) == 2


def test_output_metadata_counted(root):
    with KnowledgeFiles(root) as tools:
        result = tools.read_file("README.md")
        usage = tools.budget.usage
        assert usage.output_bytes == len(result.model_dump_json().encode("utf-8"))
        assert usage.output_tokens == usage.output_bytes
        assert usage.output_bytes > len(result.text.encode("utf-8"))
    with KnowledgeFiles(root, budget=Budget(BudgetLimits(output_bytes=20))) as tools:
        with pytest.raises(BudgetExceeded):
            tools.list_files()
        assert not tools.ledger.entries


def test_exact_tokenizer_and_cumulative_limit(root):
    budget = Budget(BudgetLimits(output_tokens=1), tokenizer=lambda text: 1)
    with KnowledgeFiles(root, budget=budget) as tools:
        tools.list_files()
        with pytest.raises(BudgetExceeded):
            tools.list_files()


def test_clock_budgets(root, monkeypatch):
    now = [0.0]
    budget = Budget(clock=lambda: now[0])
    with KnowledgeFiles(root, budget=budget) as tools:
        now[0] = 30
        with pytest.raises(BudgetExceeded):
            tools.read_file("README.md")
    now[0] = 0
    budget = Budget(clock=lambda: now[0])
    with KnowledgeFiles(root, budget=budget) as tools:
        original = tools._headings

        def delayed(*args):
            result = original(*args)
            now[0] = 3.1
            return result

        monkeypatch.setattr(tools, "_headings", delayed)
        with pytest.raises(BudgetExceeded):
            tools.read_file("README.md")
        assert not tools.ledger.entries


def test_budget_hooks():
    budget = Budget(BudgetLimits(model_turns=1))
    budget.begin_model_turn()
    with pytest.raises(BudgetExceeded):
        budget.begin_model_turn()
    budget = Budget(BudgetLimits(model_output_tokens=4))
    budget.charge_model_output("🙂")
    with pytest.raises(BudgetExceeded):
        budget.charge_model_output("x")
    budget = Budget(BudgetLimits(retries=1))
    budget.retry()
    with pytest.raises(BudgetExceeded):
        budget.retry()


def test_scan_bound_and_closed_tools(root):
    with KnowledgeFiles(root, budget=Budget(BudgetLimits(directory_entries=1))) as tools:
        (root / "extra.md").write_text("extra")
        with pytest.raises(KnowledgeError, match="enumeration"):
            tools.list_files()
    with pytest.raises(KnowledgeError, match="closed"):
        tools.list_files()


@pytest.mark.parametrize(
    "kwargs",
    [
        {"max_bytes": 3},
        {"max_lines": 121},
        {"start_line": True},
        {"start_line": 0},
        {"heading": "Index", "start_line": 2},
        {"heading": ""},
    ],
)
def test_invalid_read_options(root, kwargs):
    with KnowledgeFiles(root) as tools, pytest.raises(KnowledgeError):
        tools.read_file("README.md", **kwargs)
