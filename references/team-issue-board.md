# Team issue board

## Current verified baseline

- Repo transferred from `Avyakta-dev/saral-sahayak` → [`iotserver24/saral-sahayak`](https://github.com/iotserver24/saral-sahayak). Prefer `iotserver24` issue/PR links going forward.
- [PR #5](https://github.com/iotserver24/saral-sahayak/pull/5) merged output-security fixes, Ajay's image handoff and advanced extension privacy/provider requirements.
- [PR #4](https://github.com/iotserver24/saral-sahayak/pull/4) merged Avyakta's **181-record Markdown corpus**, reproducible generator, stronger rendered-content validation and knowledge test discovery. The corpus is at `references/knowledge/epfo/`; earlier notes saying it is absent predate this merge.
- After integrating both changes, **646 offline tests passed**. Structural readiness and generated-content fidelity passed. No new live model/source requests were made. Policy accuracy, translation quality and extension privacy implementation are not certified by these tests.
- Recent merges (high level, **not** live acceptance): [#35](https://github.com/iotserver24/saral-sahayak/pull/35) frontend conversational preview; [#36](https://github.com/iotserver24/saral-sahayak/pull/36)/[#37](https://github.com/iotserver24/saral-sahayak/pull/37) privacy and image L1 contracts (approved/closed for Level 1); [#38](https://github.com/iotserver24/saral-sahayak/pull/38)–[#39](https://github.com/iotserver24/saral-sahayak/pull/39) acceptance diagnostics and configurable analysis deadline; [#40](https://github.com/iotserver24/saral-sahayak/pull/40) Docker packaging; [#41](https://github.com/iotserver24/saral-sahayak/pull/41) Vercel frontend preview prep. Live supported-case acceptance remains historically failing; deadline config alone is not acceptance.
- The advanced extension/image/UI features are assigned work, not implemented features. Read the issue for the next unfinished level, inspect code, and report evidence before closing it.

## Assigned work

| Owner | Track | Issues | Next notes |
| --- | --- | --- | --- |
| Ajay (`Ajay-B-Acharya`) | Extension Levels 1–5 | [#6](https://github.com/iotserver24/saral-sahayak/issues/6), [#7](https://github.com/iotserver24/saral-sahayak/issues/7), [#8](https://github.com/iotserver24/saral-sahayak/issues/8), [#9](https://github.com/iotserver24/saral-sahayak/issues/9), [#10](https://github.com/iotserver24/saral-sahayak/issues/10) | #6–#10 remain open under **revised evidence acceptance** (see Anish comment on issue 6); supply browser/manual evidence, do not relabel mocks |
| Ajay | Image Levels 1–5 | [#11](https://github.com/iotserver24/saral-sahayak/issues/11), [#12](https://github.com/iotserver24/saral-sahayak/issues/12), [#13](https://github.com/iotserver24/saral-sahayak/issues/13), [#14](https://github.com/iotserver24/saral-sahayak/issues/14), [#15](https://github.com/iotserver24/saral-sahayak/issues/15) | #11 L1 contract closed; #12+ needs host/name agreement before implementation |
| Ajay | Extension Privacy Levels 1–5 | [#16](https://github.com/iotserver24/saral-sahayak/issues/16), [#17](https://github.com/iotserver24/saral-sahayak/issues/17), [#18](https://github.com/iotserver24/saral-sahayak/issues/18), [#19](https://github.com/iotserver24/saral-sahayak/issues/19), [#20](https://github.com/iotserver24/saral-sahayak/issues/20) | #16 L1 approved/closed; implement #17+ against that contract |
| Avyakta (`Avyakta-dev`) | Extension UI Levels 1–3 | [#21](https://github.com/iotserver24/saral-sahayak/issues/21), [#22](https://github.com/iotserver24/saral-sahayak/issues/22), [#23](https://github.com/iotserver24/saral-sahayak/issues/23) | Start with #21 UI mocks (not Shravya's main web UI) |
| Shravya (`Shravya2820`) | Main web UI Levels 1–3 | [#24](https://github.com/iotserver24/saral-sahayak/issues/24), [#25](https://github.com/iotserver24/saral-sahayak/issues/25), [#26](https://github.com/iotserver24/saral-sahayak/issues/26) | #24 done; next is #25 API integration |
| Avyakta | Remaining knowledge evidence/quality work | [#27](https://github.com/iotserver24/saral-sahayak/issues/27), [#28](https://github.com/iotserver24/saral-sahayak/issues/28) | Continue #27–#28 knowledge evidence/quality |
| Anish (`iotserver24`) | Level 2 acceptance; Level 3 integration/demo | [#29](https://github.com/iotserver24/saral-sahayak/issues/29), [#30](https://github.com/iotserver24/saral-sahayak/issues/30) | #29 live acceptance still open; #30 demo/hosting hygiene |

## How to start

> I am [name]. Read AGENTS.md, references/team-issue-board.md and my assigned issue [number]. Inspect the linked requirements and current code. Work only on that level, preserve other contributors' changes, and follow the issue's approvals and dependencies. Report exact tests and blockers; do not mark completion from code generation alone. Use a temporary task branch and reviewed PR into main.

Every issue includes level instructions, acceptance checklists and dependencies. Work can proceed in parallel across owners, but implementation that depends on another contract waits for that contract's approval. Avyakta's extension UI does not replace Shravya's main web frontend. Local model mode does not bypass redaction, grounding or key-handling requirements.
