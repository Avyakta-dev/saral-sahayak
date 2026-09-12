# Team issue board

## Current verified baseline

- [PR #5](https://github.com/Avyakta-dev/saral-sahayak/pull/5) merged output-security fixes, Ajay's image handoff and advanced extension privacy/provider requirements.
- [PR #4](https://github.com/Avyakta-dev/saral-sahayak/pull/4) merged Avyakta's **181-record Markdown corpus**, reproducible generator, stronger rendered-content validation and knowledge test discovery. The corpus is at `references/knowledge/epfo/`; earlier notes saying it is absent predate this merge.
- After integrating both changes, **646 offline tests passed**. Structural readiness and generated-content fidelity passed. No new live model/source requests were made. Policy accuracy, translation quality and extension privacy implementation are not certified by these tests.
- The advanced extension/image/UI features are assigned work, not implemented features. Read the issue for the next unfinished level, inspect code, and report evidence before closing it.

## Assigned work

| Owner | Track | Issues |
| --- | --- | --- |
| Ajay (`Ajay-B-Acharya`) | Extension Levels 1–5 | [#6](https://github.com/Avyakta-dev/saral-sahayak/issues/6), [#7](https://github.com/Avyakta-dev/saral-sahayak/issues/7), [#8](https://github.com/Avyakta-dev/saral-sahayak/issues/8), [#9](https://github.com/Avyakta-dev/saral-sahayak/issues/9), [#10](https://github.com/Avyakta-dev/saral-sahayak/issues/10) |
| Ajay | Image Levels 1–5 | [#11](https://github.com/Avyakta-dev/saral-sahayak/issues/11), [#12](https://github.com/Avyakta-dev/saral-sahayak/issues/12), [#13](https://github.com/Avyakta-dev/saral-sahayak/issues/13), [#14](https://github.com/Avyakta-dev/saral-sahayak/issues/14), [#15](https://github.com/Avyakta-dev/saral-sahayak/issues/15) |
| Ajay | Extension Privacy Levels 1–5 | [#16](https://github.com/Avyakta-dev/saral-sahayak/issues/16), [#17](https://github.com/Avyakta-dev/saral-sahayak/issues/17), [#18](https://github.com/Avyakta-dev/saral-sahayak/issues/18), [#19](https://github.com/Avyakta-dev/saral-sahayak/issues/19), [#20](https://github.com/Avyakta-dev/saral-sahayak/issues/20) |
| Avyakta (`Avyakta-dev`) | Extension UI Levels 1–3 | [#21](https://github.com/Avyakta-dev/saral-sahayak/issues/21), [#22](https://github.com/Avyakta-dev/saral-sahayak/issues/22), [#23](https://github.com/Avyakta-dev/saral-sahayak/issues/23) |
| Shravya (`Shravya2820`) | Main web UI Levels 1–3 | [#24](https://github.com/Avyakta-dev/saral-sahayak/issues/24), [#25](https://github.com/Avyakta-dev/saral-sahayak/issues/25), [#26](https://github.com/Avyakta-dev/saral-sahayak/issues/26) |
| Avyakta | Remaining knowledge evidence/quality work | [#27](https://github.com/Avyakta-dev/saral-sahayak/issues/27), [#28](https://github.com/Avyakta-dev/saral-sahayak/issues/28) |
| Anish (`iotserver24`) | Level 2 acceptance; Level 3 integration/demo | [#29](https://github.com/Avyakta-dev/saral-sahayak/issues/29), [#30](https://github.com/Avyakta-dev/saral-sahayak/issues/30) |

## How to start

> I am [name]. Read AGENTS.md, references/team-issue-board.md and my assigned issue [number]. Inspect the linked requirements and current code. Work only on that level, preserve other contributors' changes, and follow the issue's approvals and dependencies. Report exact tests and blockers; do not mark completion from code generation alone. Use a temporary task branch and reviewed PR into main.

Every issue includes level instructions, acceptance checklists and dependencies. Work can proceed in parallel across owners, but implementation that depends on another contract waits for that contract's approval. Avyakta's extension UI does not replace Shravya's main web frontend. Local model mode does not bypass redaction, grounding or key-handling requirements.
