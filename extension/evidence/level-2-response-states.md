# Extension Level 2 — four response states, automated UI evidence

Owner: Ajay. Related to issue 7 and [Anish's revised acceptance](https://github.com/iotserver24/saral-sahayak/issues/6#issuecomment-5646145756). Date: 2026-09-12. Source: production `epfo-popup.js` and `popup.html` at `e2e89aa`; runtime files unchanged by this evidence commit.

## What ran

`node --test extension/tests/epfo-popup.test.cjs` on Node 22.18.0: **15 passed, 0 failed**.

The dependency-free suite loads the actual production script unchanged in a VM, extracts EPFO control IDs/tags from actual popup markup, and drives the script's registered connect/detect/edit/consent/Analyze handlers. A deliberately minimal DOM implementation records nodes and rejects HTML sinks; a fake extension runtime supplies the existing `docs/examples/*.json` fixtures. No backend, model, network or standalone synthetic HTML page is involved. This is automated UI logic evidence explicitly allowed by the revised criterion, **not Chrome layout or browser evidence**.

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Synthetic success | Classification, explanation, actions, documents, draft, warnings and attached source details | Fixture text and claim-linked citations emitted by production renderer | PASS |
| Synthetic clarification | Questions/warnings, no old successful guidance | Prior success removed, questions present, no source links/draft | PASS |
| Synthetic unsupported | Limitation warnings only | Prior guidance/draft removed | PASS |
| Synthetic error | Explicit code/message/HTTP result, no guidance | Error fixture rendered as text; previous success absent | PASS |
| Hostile HTML in claims/draft/questions/error | Inert text, never parser execution | Literal strings retained; no IMG/SCRIPT elements or HTML sink calls | PASS within DOM stub |
| Unsafe links / traversal citation path | Do not create unsafe navigation | Invalid URLs omitted; canonical citations retain safe HTTP(S) links with noopener/noreferrer | PASS |
| Capability language subset | Use only returned codes/names/native names | Six-code and reduced fixtures rendered; no quality guarantee inferred | PASS |
| Edit/cancel with late completion | Clear approval/results, ignore late success | New input/result survives stale completion | PASS |
| Startup and explicit Analyze | No startup request; only reviewed text/language on Analyze | Fake-runtime call log matches intended message boundary; no direct network available | PASS within mock boundary |
| Real provider/corpus/HTTP outcome | Must not be inferred from fixtures | Not exercised | NOT RUN |
| Screen reader, keyboard, layout/zoom, native browser rendering | Actual browser checks needed | VM has no layout/accessibility engine | NOT RUN |

Historical `error.json` is kept unchanged, including its earlier backend-not-implemented message. It is not asserted to represent today's API; production dependency errors come from the real backend. Imaginary fixture URLs/warnings remain synthetic. Deliberately malformed success fields injected into non-success fake replies test UI defense in depth, not backend schema acceptance.

The complete existing-plus-new Node suite passed **118 checks** in this round. No existing test was removed or weakened. Production renderer, API contract, permissions, provider configuration and UI mode controls were not changed. There is still no claim that a live four-state backend sequence was observed. Acceptance remains a reviewer decision.
