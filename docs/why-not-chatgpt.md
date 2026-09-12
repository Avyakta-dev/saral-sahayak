# Why not just ChatGPT?

**Audience:** hackathon judges and anyone asking whether a general chatbot already solves this.  
**Read time:** about 2–4 minutes.

Saral Sahayak is an **EPFO rejected-claim guide**: plain-language explanations, actionable checklists, source citations, and draft resubmission or grievance letters for people stuck after a Provident Fund / related claim rejection. It is educational assistance—not official EPFO guidance and not legal advice.

A general LLM can talk about EPFO. That is not the product. The niche **is** the point: depth, grounding, and fail-closed behavior on one painful workflow beats a fluent but unanchored chat.

## Concrete differences vs ChatGPT / generic LLMs

| Dimension | Generic ChatGPT-style chat | Saral Sahayak (design + current implementation) |
| --- | --- | --- |
| Knowledge | Training cutoff + whatever the user pastes | Tool-using agent over a **curated EPFO Markdown corpus** (181 canonical rejection reasons under `references/knowledge/epfo/reasons/`) |
| Grounding | May sound authoritative without a trail | Answers must cite **Markdown path + original source URLs** from evidence actually read |
| Retrieval theater | Often “RAG” demos with embeddings / chunk soup | **No embeddings, vector DB, RAG/chunk pipeline, or alias retriever**—bounded list/read tools only; no stuffing the whole corpus into a prompt |
| Uncertainty | Tends to invent plausible policy | **Fail-closed / abstain** (or clarify) when evidence is insufficient—do not invent EPFO rules |
| Outputs | Freeform advice and letter text | **Structured checklists** + grievance/resubmission **letter drafts assembled by the host** from validated cited action blocks and literal user details/placeholders—**no freeform fake identities** |
| Product honesty | “It works” vibes | **Readiness ≠ correctness**; language `quality_verified` stays **false** until independently reviewed; educational, not legal advice |
| Privacy (extension track) | User pastes screenshots / PII into a chat box | **Architecture / in-progress:** click-only capture, sanitize/flatten locally, opaque placeholders to the model—label shipped vs planned carefully (see below) |

### Tool-using agent, not RAG theater

The agent selects and reads bounded Markdown sections under `references/knowledge/epfo/`. Citations are built from an evidence ledger (path, record/heading, source URLs)—not “trust me, I retrieved something.” The archived dataset under `references/epfo-claim-rejection-rag-dataset/` is **import/source history**, not a runtime embedding pipeline.

### Fail-closed beats fluent fiction

EPFO rejections are high-stakes for workers. Prefer clarification or abstention over a confident wrong Joint Declaration path, document list, or “you are ineligible” finding. Offline tests and structural readiness do **not** certify live policy correctness.

### Structured drafts, host-assembled

Draft letters use host-localized framing plus validated cited action blocks and the user’s literal details or placeholders. The model does not get a free channel to invent names, UANs, Aadhaar numbers, or government codes.

### Honest gates

- `/health/ready` and capabilities report **configuration / structural availability**, not verified model quality or translation fluency.
- All enabled languages keep `quality_verified: false` until review says otherwise.
- Knowledge remains educational material, not official EPFO guidance or legal advice.

### Privacy-by-design (extension) — architecture / in-progress

The intended extension path is **click-only** selection with editable preview and explicit Analyze before send; advanced privacy levels call for local sanitize/flatten and **opaque request-bound placeholders** (not raw screenshots or partial PII) to the model. Treat this as **architecture and leveled work**, not a claim that every privacy level is shipped. See `references/extension-privacy-and-provider-guide.md` and open extension/privacy issues for what is implemented vs planned.

### Niche is the feature

Judges sometimes call EPFO rejections “niche.” That is intentional. A general chatbot optimizes for breadth; Saral Sahayak optimizes for **181 rejection reasons**, provenance, checklists, and safer drafts on the exact portal remarks people actually see.

## What we do **not** claim yet

Be explicit with judges:

- **Live acceptance is still open.** Documented live attempts on a synthetic supported case hit budget/timeout failures; that is **not** a green live acceptance report. See [live acceptance status](live-acceptance-status.md).
- Offline corpus/structure tests and fake-model suites do **not** prove fluent multilingual output, current EPFO policy, or production deployment.
- We do **not** claim live government integration, automatic claim submission, or guaranteed claim approval.
- Extension privacy guarantees and browser acceptance remain partly open; do not demo them as finished unless the linked evidence says so.
- Do **not** invent green live results for pitch day.

## 60-second demo script (synthetic case only)

Use only synthetic fixtures (for example the initials / name-mismatch style case in `references/reviews/epfo/cases.json`). Never paste real claimant identity, UAN, Aadhaar, or live portal screenshots into a public demo.

1. **Setup (5s):** “Worker sees a Form 19-style remark: name does not match Aadhaar. UAN used an initial; Aadhaar has the expanded middle name. Aadhaar is correct. Synthetic only.”
2. **Ask (10s):** Paste/analyze that synthetic text against the curated Markdown corpus (not a naked ChatGPT tab).
3. **Show grounding (20s):** Point at citations—Markdown path under `references/knowledge/epfo/…`, record/heading, and original source URLs. Contrast: “ChatGPT would not give you this trail by design.”
4. **Show product shape (15s):** Checklist steps from cited fix blocks; draft letter assembled from validated actions + placeholders—not invented personal data.
5. **Honest close (10s):** “Educational guide, not legal advice. Live acceptance still open; readiness is not correctness. Niche depth on EPFO rejections is the product.”

If the live path is unavailable in the room, walk the same story against corpus files and offline evidence—and say so out loud. Judges prefer an honest synthetic walkthrough over a silent fake success.
