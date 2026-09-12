# Saral Sahayak — Hackathon Build Plan

> **Hackathon build window:** 19 hours  
> **Team:** Anish, Avyakta, Shravya, Ajay  
> **Primary demo:** EPFO claim rejection  
> **Stretch goal:** PM-JAY and voice only after the EPFO flow is stable

**Status:** This is an implementation plan, not a completed application. Runtime code, file-reading tools, dependencies and deployment are not implemented yet. The [current Markdown agent design](markdown-agent-design.md) is the architecture source of truth above this plan and the historical PDFs/text. Markdown conversion is a separate generator task; verify its artifacts independently of runtime progress.

**Architecture decision:** a tool-using agent reads bounded sections of public Markdown under `references/knowledge/epfo/` and cites file path, canonical record ID/heading and original source URLs. No embeddings, vector database, RAG/chunk pipeline or deterministic alias retriever; never load the entire corpus into the prompt. The original dataset remains source/archive only.

---

## 1. What We Are Building

### One-line pitch

**Saral Sahayak aims to turn a confusing government claim rejection into a plain-language explanation, evidence-backed next steps and a usable draft, targeting under 30 seconds.**

This is an unmeasured product target, not a performance claim. Unsupported cases must clarify or abstain rather than produce an exact-looking but ungrounded fix.

### Problem

When an EPFO claim is rejected, the user may receive a short or bureaucratic rejection remark without enough explanation of:

- Why the claim was rejected
- What information is wrong
- What needs to be corrected
- Which document or form is required
- What the user should do next
- Whether an appeal/resubmission is possible

Saral Sahayak converts that rejection into an actionable resolution.

### Primary target

**EPFO claim rejection flow.**

PM-JAY is a stretch feature. It must never block the core EPFO experience.

---

# 2. Core User Flow

```text
Paste rejection text (optional image extraction later)
          ↓
Extract supplied facts; preserve missing fields
          ↓
Tool-using agent/orchestrator
          ↔ bounded list/read of public Markdown index and candidate sections
          ↓
Evidence-guided classification using canonical reason IDs
          ├── ambiguous / insufficient evidence → clarify or abstain
          ↓
Selected evidence + source URLs + user-supplied details
          ↓
Explanation and supported fix steps
          ↓
Draft with placeholders for missing details
          ↓
Validate claim-level citations and uncertainty
          ↓
Structured response and honest UI status
```

The Extractor, Classifier, Explainer, Fix Generator and Draft roles below are logical stages, not five mandatory deployed services. The agent may refine its classification after reading candidate Markdown sections.

---

# 3. What The User Gets

For a rejection such as:

> "Name mismatch"

the system should return:

### Why was my claim rejected?

A simple explanation of the likely issue.

### What should I do?

A numbered, actionable checklist.

### What do I need?

Required documents, forms, and relevant actions where supported by the knowledge base.

### Ready-to-use draft

A generated resubmission/appeal/request draft using the information supplied by the user.

### Language

- English
- Hindi

### Grounding

Require claim-level citations to Markdown paths, canonical record IDs/exact headings and original source URLs for substantive guidance. Clarify or abstain when evidence is unknown, ambiguous or insufficient.

---

# 4. Agent Architecture

## 4.1 Extractor Agent

### Input

- Raw rejection text
- Uploaded rejection image

### Output

Structured information:

```json
{
  "raw_text": "...",
  "claim_id": null,
  "rejection_remark": "Name mismatch",
  "dates": [],
  "amount": null,
  "other_fields": {}
}
```

### Rules

- Extract only information supported by the input.
- Do not invent missing values.
- For an image, use vision/OCR capability.
- Text paste remains the primary/demo-safe input path.

---

## 4.2 Classifier Agent

### Purpose

Use bounded Markdown index and candidate-section reads to map the extracted rejection to a supported canonical reason and category. Classification is evidence-guided and may be refined after further permitted reads.

### Example

```text
Input:
"Name mismatch between Aadhaar and PF details"

Output:
epfo-rr-001
```

### Output

```json
{
  "reason_id": "epfo-rr-001",
  "category": "KYC_Identity",
  "confidence": "supported",
  "rationale": "Candidate sections support the supplied Aadhaar/UAN mismatch context.",
  "matched_phrases": [
    "name mismatch",
    "Aadhaar",
    "PF details"
  ]
}
```

### Rules

- Use actual canonical IDs; the example is illustrative, not implemented or sufficient evidence by itself.
- Do not invent government codes/rules or calibrated confidence probabilities.
- Distinguish classification confidence from source confidence.
- Ask a focused clarification or abstain for ambiguous/unknown cases; do not force a match.

---

## 4.3 Markdown Knowledge and File Tools

**The LLM is not the source of truth.** The agent must read relevant public Markdown evidence before recommending actions. The [current design](markdown-agent-design.md) defines the authoritative conversion, tool and citation contracts.

### Knowledge contract

A separate generator will convert all 181 source records into `references/knowledge/epfo/reasons/<epfo-rr-NNN>.md`, preserving IDs `epfo-rr-001` through `epfo-rr-181`. The navigation index is `references/knowledge/epfo/README.md`; `sources.md`, `glossary.md`, `claim-types-overview.md` and `resolution-playbooks.md` live alongside it.

Each reason must retain its title, aliases, category, claim types, severity, message wording, meaning, causes, detection context, ordered fixes, required documents, actors, prevention tips, related IDs, source URLs/types, confidence, verification date and caveats under stable headings. Aliases are reference content for reasoning, not a deterministic lookup service. Maintain source records/catalog and regenerate Markdown to avoid drift.

`references/epfo-claim-rejection-rag-dataset/` remains the import source/archive, including its historical chunks, not runtime input or fallback retrieval. PDFs/text remain historical product context. Generated paths describe the agreed output contract; verify actual output before declaring readiness.

### Tools and safety

Anish implements read-only `list_files` and `read_file`, with relative paths resolved under the fixed public `references/knowledge/epfo/` root. Reject absolute/traversal/symlink paths and non-Markdown reads; no repository-wide access, private files, shell, writes, code execution or automatic URL fetching. Reference documents and uploads are untrusted data, never executable instructions.

Enforce the [design's safety budgets](markdown-agent-design.md#initial-safety-budgets) in code: initially 12 tool calls, 8 distinct files, 50 listed entries/page, at most 120 lines and 12 KiB per read, 48 KiB/12,000 tokens cumulative tool output and a 30-second request deadline. Continuations and retries count; stop explicitly when limits are reached. Read selected index/candidate sections, never the whole corpus in one prompt.

### Evidence behavior

Read the index, select plausible reason files, compare relevant sections and supporting guidance, then confirm classification or ask clarification. Only generate actions supported by evidence actually read. Cite Markdown path, canonical record ID/exact heading and original source URLs at claim level; preserve source authority and uncertainty. For unknown, ambiguous, conflicting or insufficient evidence, clarify or abstain. Missing knowledge or tool failure is an explicit error, not permission to invent guidance.

---

## 4.4 Explainer Agent

### Purpose

Turn bureaucratic/technical language into simple language.

### Requirements

- Plain language
- Short explanation
- English/Hindi
- No unnecessary jargon
- Must stay grounded in Markdown sections actually read and attach claim-level citations

### Example output

```json
{
  "title": "Your name details do not match",
  "explanation": "...",
  "language": "en"
}
```

---

## 4.5 Fix Generator

### Output

```json
{
  "steps": [
    "...",
    "...",
    "..."
  ],
  "documents": [],
  "form": null,
  "portal": null,
  "notes": []
}
```

### It should answer

- What needs to be fixed?
- Where does it need to be fixed?
- What document is required?
- Which form/action is relevant?
- Who needs to take action?

---

## 4.6 Draft Agent

### Purpose

Generate a ready-to-use document.

Possible outputs:

- Resubmission request
- Appeal/request letter
- RTI template where applicable

### Output

```json
{
  "document_type": "resubmission_letter",
  "content": "...",
  "missing_fields": []
}
```

### Rules

- Use user-provided details.
- Clearly identify missing information.
- Do not fabricate personal details.
- Do not claim guaranteed success.
- Draft only from supported actions; preserve source citations for factual assertions and suppress a ready-to-use draft when clarification or abstention is required.

---

## 4.7 Orchestrator

The orchestrator owns the complete pipeline.

### Responsibilities

1. Accept request
2. Extract information
3. Form candidate classification hypotheses
4. Read bounded public Markdown evidence using tools, then confirm classification or clarify/abstain
5. Run explanation/fix/draft work
6. Merge outputs and validate claim-level file/heading/URL citations
7. Return final structured response
8. Send pipeline status to frontend

### Parallelization

After classification and cited Markdown evidence are available, explanation and fix generation may run in parallel. Drafting depends on approved actions and user details; all stages share one request budget:

```text
Evidence ──┬── Explainer ────────────────┐
           └── Fix Generator → Draft ────┴── Validated Result
```

---

# 5. Proposed API Contract

The frontend should receive one predictable response shape. This illustrative shape is not implemented; Anish and Shravya must agree the concrete schema using the [citation and response contract](markdown-agent-design.md#citation-and-response-contract).

```json
{
  "status": "success",
  "input": {
    "type": "text",
    "raw_text": "..."
  },
  "extraction": {
    "rejection_remark": "...",
    "claim_id": null,
    "dates": [],
    "amount": null
  },
  "classification": {
    "reason_id": "epfo-rr-001",
    "category": "KYC_Identity",
    "confidence": "supported",
    "rationale": "..."
  },
  "explanation": {
    "title": "...",
    "body": "...",
    "language": "en",
    "citation_ids": ["e1"]
  },
  "fix": {
    "steps": [],
    "documents": [],
    "form": null,
    "portal": null
  },
  "draft": {
    "document_type": "...",
    "content": "...",
    "missing_fields": []
  },
  "citations": [
    {
      "id": "e1",
      "path": "references/knowledge/epfo/reasons/epfo-rr-001.md",
      "record_id": "epfo-rr-001",
      "heading": "<exact heading read from generated Markdown>",
      "source_urls": [
        "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
      ]
    }
  ],
  "clarification_questions": [],
  "warnings": []
}
```

The ID and URL above come from a source record, but the heading and claims are placeholders to validate against actual Markdown reads. Each fix step and factual draft assertion must also reference citation IDs. Preserve source authority, confidence and verification metadata where available. Use `needs_clarification`, `unsupported` or `error` instead of `success` when appropriate, with questions/limitations and no unsupported fixes or ready-to-use draft.

---

# 6. Frontend Screens

## Screen 1 — Landing / Input

```text
Saral Sahayak

Understand your rejected government claim.

[ Paste rejection text ]

or

[ Upload image ]

Language:
[ English ] [ हिन्दी ]

[ Analyze Rejection ]
```

---

## Screen 2 — Processing

Show actual reported progress only; do not simulate live file reads or source verification:

```text
Completed: Extracting
In progress: Reading relevant Markdown evidence
Pending: Confirming reason and supported actions
Pending: Preparing draft
```

Possible status labels:

- Extracting
- Classifying
- Reading Markdown evidence
- Explaining
- Finding fix
- Drafting
- Complete

---

## Screen 3 — Result

Sections:

```text
Why was my claim rejected?

...

What should I do?

1. ...
2. ...
3. ...

Documents required

...

Relevant form / action

...

Sources

...

[ Generate Draft ]
[ Download Draft ]
```

---

## Screen 4 — Draft

Show:

- Document title
- Generated text
- Missing information if any
- Download button

---

# 7. Team Ownership

## Anish — Lead / AI / Backend / Integration

### Owns

- Overall architecture
- Backend
- Agent orchestration
- LLM integration
- API contracts
- Bounded Markdown file tools and evidence/citation integration
- Environment/configuration
- Final integration
- Deployment
- Final debugging
- Demo reliability

### Critical principle

Anish owns the integration spine. Other team members should not silently change shared backend contracts.

---

## Avyakta — Research / Markdown Knowledge / Evidence Verification

### Owns

- EPFO research
- Rejection categories
- Rejection phrases
- Meaning/causes
- Fix/remedy information
- Required documents
- Forms/actions
- Source collection
- Markdown knowledge authoring/curation and index clarity
- Source record/catalog maintenance with reproducible Markdown rebuilds
- Evidence verification, authority/currency and caveat review

### Main deliverable

A reliable, source-backed Markdown knowledge collection covering all 181 canonical reasons, with a navigable index and preserved evidence. File tools and orchestration belong to Anish; the generator is a separate task.

---

## Shravya — Frontend / UX

### Owns

- Landing page
- Paste/upload interface
- Language toggle
- Processing screen
- Agent pipeline visualization
- Result screen
- Draft screen
- Download UI
- Loading/error states
- Visual polish

### Main deliverable

A complete frontend that works with mocked data first and the real API later.

---

## Ajay — Documents / OCR / Testing / Support

### Owns

- Image input handling
- OCR/vision support
- Document generation
- PDF/DOCX templates
- Test fixtures
- Sample rejection inputs
- Regression/security testing
- Run/test/demo documentation
- Hindi checks
- Demo samples
- PPT/demo support

### Main deliverable

Reliable supporting systems and a tested, demo-ready build.

---

# 8. Repository Structure

Existing documentation/source references and proposed generator/runtime paths are shown together below. Runtime modules are not implemented; the Python module layout is a proposal, not an installed stack. Generator implementation is separate from application implementation.

```text
saral-sahayak/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── .gitignore
├── .env.example                       # proposed
├── references/
│   ├── README.md
│   ├── team-work-levels.md
│   ├── planning/
│   │   ├── markdown-agent-design.md   # current architecture
│   │   └── hackathon-plan.md
│   ├── knowledge/epfo/               # generator output contract
│   │   ├── README.md
│   │   ├── sources.md
│   │   ├── glossary.md
│   │   ├── claim-types-overview.md
│   │   ├── resolution-playbooks.md
│   │   └── reasons/epfo-rr-NNN.md     # 181 records
│   ├── epfo-claim-rejection-rag-dataset/ # source/archive only
│   ├── pdfs/                         # historical context
│   └── text/                         # historical context
├── backend/                          # proposed application
│   ├── main.py
│   ├── api/
│   │   ├── routes.py
│   │   └── schemas.py
│   ├── agents/
│   │   ├── extractor.py
│   │   ├── classifier.py
│   │   ├── explainer.py
│   │   ├── fix_generator.py
│   │   └── draft_agent.py
│   ├── orchestrator/pipeline.py
│   ├── tools/knowledge_files.py      # bounded list/read, not retrieval
│   ├── services/
│   │   ├── llm.py
│   │   └── documents.py
│   └── config.py
├── frontend/                         # proposed
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── documents/                        # proposed
│   ├── templates/
│   └── generated/                    # ignored user outputs
└── tests/
    ├── knowledge_tools/               # proposed application tests
    ├── classifier/
    ├── pipeline/
    └── fixtures/                      # synthetic inputs only
```

---

# 9. Git Strategy

`main` is the shared integration baseline. Ownership is name-to-role only. This section describes the intended workflow, not verified remote settings or completed branch cleanup.

### Temporary task workflow

1. Preserve unfinished work; fetch and fast-forward local `main` from the remote before each new task.
2. Create a local temporary descriptive branch, for example `task/markdown-file-tools`. Keep focused commits local while work is in progress.
3. Push the task branch only when its pull request is ready. PRs need a pushed source branch; explicitly choose `main` as the PR base rather than relying on the remote default.
4. Coordinate shared API/schema changes with Anish, update from `main` before merge when needed, and merge reviewed PRs into `main`.
5. Delete the task branch remotely and locally after merge; preserve any unmerged work. Start the next task from newly updated `main`.
6. No direct task pushes to `main`, destructive overwrites or force-pushing others' work. Once an application exists, merges must keep it runnable; until then validate documentation and knowledge artifacts.

See [CONTRIBUTING.md](../../CONTRIBUTING.md#branch-workflow) for commands and cleanup caveats. Remote default/protection settings require separate authorization and verification.

### Commit examples

```text
feat: add bounded Markdown file tools
feat: add result screen
feat: add draft generation
fix: handle empty rejection
fix: preserve evidence section citations
test: reject knowledge path traversal
docs: update architecture
```

---

# 10. Ownership Boundaries

## Anish

```text
backend/agents/
backend/orchestrator/
backend/tools/knowledge_files.py
backend/api/
backend/services/
```

## Avyakta

```text
references/knowledge/epfo/
references/epfo-claim-rejection-rag-dataset/  # source curation; rebuild Markdown
```

## Shravya

```text
frontend/
```

## Ajay

```text
documents/
tests/
tests/fixtures/
```

### Shared / protected

The following should be changed only with coordination:

```text
backend/api/schemas.py
backend/orchestrator/pipeline.py
.env.example
README.md
```

---

# 11. 19-Hour Execution Plan

## Hours 0–2 — Foundation

### Anish

- Inspect repository and start a temporary task from up-to-date main
- Set backend structure
- Define API contracts
- Define agent output schemas
- Create orchestration skeleton
- Define bounded list/read tools, path containment, budgets and citation schemas

### Avyakta

- Begin EPFO research
- Collect authoritative sources
- Define initial rejection categories
- Agree Markdown record headings/index and review the separate generator contract

### Shravya

- Create frontend scaffold
- Build input page
- Build result page skeleton
- Build pipeline component

### Ajay

- Prepare sample inputs
- Create test fixtures
- Set up upload/image handling
- Start document templates

### Goal at hour 2

All four people can work independently without waiting for another person's implementation.

---

# Hours 2–6 — Core Components

## Anish

Build:

- Extractor
- Classifier
- Basic orchestrator
- Read-only Markdown file tools with containment/budget tests
- LLM interface

## Avyakta

Build:

- Review 181-record Markdown conversion and index navigation
- Aliases and claim-type context as Markdown evidence
- Remedy content with preserved caveats
- Original URL/source metadata validation
- Supported, ambiguous and unknown evidence cases

## Shravya

Build:

- Complete primary UI
- Input flow
- Language selection
- Processing visualization
- Result UI

## Ajay

Build:

- Upload support
- Basic image path
- Document templates
- Test samples

### Goal at hour 6

Individual pieces exist and can be tested independently.

---

# Hours 6–10 — Connect The System

## Anish

Build:

- Explainer
- Fix Generator
- Draft Agent
- Bounded Markdown file tools and evidence/citation integration
- Complete orchestration

## Avyakta

Expand:

- Rejection categories
- Fixes
- Documents
- Forms
- Sources
- Markdown navigation, source fidelity and ambiguous-case evidence review

## Shravya

Connect frontend to API.

## Ajay

Integrate:

- Documents
- Downloads
- Image path
- Hindi checks
- Test fixtures

### Goal at hour 10

A rejection can go through the complete pipeline.

```text
Input
 ↓
Extract
 ↓
Read candidate Markdown sections
 ↓
Confirm reason or clarify/abstain
 ↓
Explain
 ↓
Fix
 ↓
Draft
 ↓
Display
```

---

# Hours 10–14 — First Complete Demo

This is the most important milestone.

The following MUST work:

1. Paste an EPFO rejection
2. Analyze it
3. Extract rejection information
4. Classify the rejection
5. Read bounded Markdown evidence and preserve path/heading/URL citations
6. Explain it
7. Generate fix steps
8. Generate a draft
9. Show the result in the UI
10. Download the draft

### Hard rule

At hour 14, do NOT still be missing a core stage.

---

# Hours 14–18 — Testing + Feature Polish

Priority order:

## 1. Reliability

- Error handling
- Empty input
- LLM failure
- Missing knowledge or file-tool failure
- Path traversal/symlink denial and document prompt injection
- Tool-call, output and deadline budget exhaustion
- Invalid image
- Missing fields

## 2. Grounding

- Claim-level path, record ID/heading and original URL display
- Evidence actually read; official/secondary distinction and caveats
- Classification uncertainty separate from source confidence
- Avoid unsupported claims

## 3. UX

- Loading states
- Pipeline animation
- Clear result hierarchy
- Hindi polish
- Download experience

## 4. Documents

- Better formatting
- Correct placeholders
- Missing-field handling

## 5. OCR

Improve image handling only after text input is stable.

## 6. PM-JAY

Only if the EPFO product is already reliable.

---

# Hour 18 — FEATURE FREEZE

No major new feature.

Only:

- Critical bugs
- Demo-breaking issues
- Deployment issues
- Documentation
- PPT
- Rehearsal

---

# Hour 18–19 — Final Hour

## 18:00–18:20

Full regression test.

## 18:20–18:35

Final deployment check.

## 18:35–18:50

PPT / README / architecture screenshot.

## 18:50–19:00

Run the complete demo once or twice.

---

# 12. Definition of Done

The MVP is complete only when a user can:

- Paste an EPFO rejection
- Upload an image when supported
- See extraction
- See classification
- Receive a grounded explanation
- Receive evidence-supported actionable fix steps
- See relevant documents/forms/actions where supported
- Generate a draft
- Download the draft
- Switch between English and Hindi

Acceptance also requires clarification/abstention for unknown, ambiguous or insufficient evidence; no forced reason or unsupported ready-to-use draft. Validate all 181 generated records/index links, citation fidelity, read-only public-root containment, document-instruction rejection and budget limits. Trace checks must show selective Markdown reads rather than full-corpus prompts.

The system must clearly state that it is a guidance tool and does not guarantee appeal/rejection outcomes.

---

# 13. Things We Are NOT Building

Do not spend the 19-hour window on:

- User authentication
- User accounts
- Complex persistence
- Live EPFO API integration
- Complex microservices
- Embeddings or a vector database
- Runtime RAG/chunk or deterministic alias retrieval
- Full-corpus prompt stuffing
- Custom ML training
- Fine-tuning
- Mobile application
- Admin dashboard
- Full support for every government scheme
- Large-scale production infrastructure

The goal is a convincing, grounded, working hackathon MVP.

---

# 14. Demo Story

### Step 1 — Show the problem

Display a realistic EPFO rejection:

```text
CLAIM REJECTED

Reason:
Name mismatch
```

### Step 2 — Submit to Saral Sahayak

Show the live agent pipeline.

### Step 3 — Explain

Show a clear explanation.

### Step 4 — Fix

Show supported actionable steps and any remaining uncertainty.

### Step 5 — Draft

Generate a ready-to-use resubmission request.

### Step 6 — Language

Switch:

```text
English → हिन्दी
```

### Step 7 — Sources

Show the exact Markdown paths, canonical record IDs/headings and original source URLs used. Include an ambiguous or unknown case to demonstrate clarification/abstention rather than invented guidance.

### Final message

> We turn "claim rejected" into understandable, source-backed next steps — and say when more information is needed.

---

# 15. Team Rule

The project succeeds through parallel work.

Do not build sequentially:

```text
Person 1 → Person 2 → Person 3 → Person 4
```

Build in parallel:

```text
              Anish
          Integration Spine
               │
      ┌────────┼────────┐
      ↓        ↓        ↓
  Avyakta   Shravya    Ajay
 Knowledge   UI      Docs/Test
      └────────┼────────┘
               ↓
          Final Product
```

### Most important milestone

**By hour 10, the whole pipeline must work for at least one rejection category.**

After that, improve reliability and presentation instead of risking the core project with large new features.
