# Judge demo script (3–5 minutes)

**Product:** Saral Sahayak — grounded guide for **EPFO rejected PF claims** (plain-language why, checklist, draft letter). Educational assistance, **not** official EPFO guidance or legal advice.

**Operator setup:** [demo-runbook.md](demo-runbook.md) · keep `LLM_API_STYLE=responses` · open **http://127.0.0.1:5173** with `VITE_API_BASE_URL=http://127.0.0.1:8000`.

---

## Talk track

### 0:00–0:40 — What it is
Workers stuck on Form 19–style rejection remarks need more than a chatbot essay. We map the remark to a **curated EPFO Markdown corpus** (181 rejection reasons), return a **sourced** explanation + checklist, and assemble a **host-built** draft from cited actions—not freeform invented identity.

### 0:40–1:30 — Why not ChatGPT
| ChatGPT-style chat | Saral Sahayak |
| --- | --- |
| Fluent, unanchored advice | Citations: Markdown path + record/heading + source URLs from evidence actually read |
| Tends to invent policy | **Fail-closed / clarify** when evidence is thin |
| RAG theater / embeddings optional | Bounded list/read tools over host corpus — **no** vector RAG pipeline |
| Paste anything | Synthetic-only demo; readiness ≠ correctness |

One line: *niche depth + provenance beats generic fluency on high-stakes claim rejections.*

### 1:30–4:00 — Live click path (synthetic only)
1. Confirm header status: **Analysis available (config + structure only)** — say aloud that this is config/structure, not policy certification.
2. Paste this **synthetic** case (from `epfo-case-001-initials-paraphrase`):

   > Synthetic example: my Form 19 remark says the name does not match Aadhaar. My UAN profile uses an initial for my middle name, while Aadhaar spells that same middle name out. Aadhaar has the correct name. Why might this fail?

3. Click **Send** (user-initiated only — **no auto-submit**).
4. Point at: live AnswerCard · explanation · checklist · **citations** (path / heading / URLs) · draft when `success`.
5. If live analyze fails in the room: say so, open **Show me an example** (labelled fixtures), or walk the corpus file — **never** fake a silent success.

### 4:00–4:30 — Extension one-liner
Browser Form Assistant: user-approved **Fill** of reviewed fields — **never Submit**. EPFO analyze uses the same backend; privacy Fill stays separate from claim submission.

### 4:30–5:00 — Known limits (honesty)
- Issue **#30** demo readiness and broader **#29** live matrix remain open; one English synthetic success ≠ full acceptance.
- `/health/ready` / capabilities = configuration + corpus **structure**, not model quality or translation fluency (`quality_verified: false`).
- No live government integration, auto-claim filing, OCR-as-default, or guaranteed approval.
- Prefer `not_run` over invented green results ([demo-runbook rehearsal table](demo-runbook.md)).

---

## If something breaks

| Symptom | First fix |
| --- | --- |
| Status: unreachable | Backend on `:8000`? `VITE_API_BASE_URL` set? CORS exact origin `http://127.0.0.1:5173`? |
| Analysis not ready | Local `.env` model config + corpus present; `python -m scripts.check_demo_readiness` |
| CORS / timeout | Match origin; raise reviewed budgets only when authorized |

Longer differentiation: [why-not-chatgpt.md](why-not-chatgpt.md).
