"""Offline regressions for oversized reads observed during synthetic live acceptance."""

import json

import pytest

from backend.agent.service import dispatch_tool
from backend.llm import ToolCall
from backend.tools.budget import Budget, BudgetLimits
from backend.tools.knowledge_files import KnowledgeFiles


@pytest.mark.parametrize("requested", [None, 3072, 10000, 100000])
def test_explicit_model_read_cannot_spend_entire_evidence_budget(tmp_path, requested):
    (tmp_path / "README.md").write_text("# Index\nSynthetic only.\n")
    (tmp_path / "reason.md").write_text(
        "# Reason\n"
        + "Synthetic details. " * 1000
        + "\n## Sources\nhttps://example.invalid/source\n",
        encoding="utf-8",
    )
    with KnowledgeFiles(tmp_path) as tools:
        tools.read_file("README.md", max_bytes=2048, max_lines=30)
        call = ToolCall(
            id="large",
            name="read_file",
            arguments={"relative_path": "reason.md", "max_bytes": requested},
        )
        first = json.loads(dispatch_tool(tools, call).content)
        assert len(first["text"].encode("utf-8")) <= 3072
        assert first["truncated"] and first["next_cursor"]
        source = dispatch_tool(
            tools,
            ToolCall(
                id="source",
                name="read_file",
                arguments={"relative_path": "reason.md", "heading": "Sources"},
            ),
        )
        assert not source.is_error
        assert json.loads(source.content)["source_urls"] == ["https://example.invalid/source"]


def test_agent_clamp_respects_smaller_request_and_host_limit(tmp_path):
    (tmp_path / "reason.md").write_text("# Reason\n" + "Synthetic details. " * 100)
    for requested, expected in [(20, 20), (10000, 64)]:
        with KnowledgeFiles(tmp_path, budget=Budget(BudgetLimits(read_bytes=64))) as tools:
            message = dispatch_tool(
                tools,
                ToolCall(
                    id="small",
                    name="read_file",
                    arguments={"relative_path": "reason.md", "max_bytes": requested},
                ),
            )
            assert not message.is_error
            assert len(json.loads(message.content)["text"].encode("utf-8")) <= expected
