# Saral Sahayak — Hackathon Build Plan

> **Hackathon build window:** 19 hours  
> **Team:** Anish, Avyakta, Sharvya, Ajay  
> **Primary demo:** EPFO claim rejection  
> **Stretch goal:** PM-JAY only after the EPFO flow is stable

---

## 1. What We Are Building

### One-line pitch

**Saral Sahayak turns a confusing government claim rejection into a plain-language explanation, an exact fix, and a ready-to-use draft in under 30 seconds.**

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
User
  │
  ├── Paste rejection text
  │
  └── Upload rejection image
          │
          ▼
    Extractor Agent
          │
          ▼
    Structured rejection data
          │
          ▼
    Classifier Agent
          │
          ▼
    Rejection Category
          │
          ├───────────────┐
          ▼               ▼
     RAG / KB        User details
          │               │
          ├───────────────┤
          ▼               ▼
     Explainer       Fix Generator
          │               │
          └───────┬───────┘
                  ▼
              Draft Agent
                  │
                  ▼
             Orchestrator
                  │
                  ▼
             Final Response
```

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

Show the source/evidence used for the result whenever possible.

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

Map the extracted rejection to a known category in the curated knowledge base.

### Example

```text
Input:
"Name mismatch between Aadhaar and PF details"

Output:
EPFO_NAME_MISMATCH
```

### Output

```json
{
  "category_id": "EPFO_NAME_MISMATCH",
  "confidence": 0.94,
  "matched_phrases": [
    "name mismatch",
    "Aadhaar",
    "PF details"
  ]
}
```

### Rules

- Prefer known categories from the knowledge base.
- Do not invent a new government rule.
- Low-confidence results should be clearly marked.

---

## 4.3 RAG / Knowledge Base

The knowledge base is the grounding layer.

### Each record should contain

```json
{
  "id": "EPFO_NAME_MISMATCH_001",
  "scheme": "EPFO",
  "category": "Name mismatch",
  "rejection_phrases": [
    "name mismatch",
    "name does not match"
  ],
  "meaning": "...",
  "possible_causes": [],
  "fix_steps": [],
  "required_documents": [],
  "form": null,
  "portal_action": null,
  "sources": [],
  "source_urls": [],
  "verification_status": "verified"
}
```

### Important rule

**The LLM is not the source of truth.**

The workflow is:

```text
Rejection
   ↓
Classifier
   ↓
Known category
   ↓
Retrieve verified knowledge
   ↓
LLM generation using retrieved context
   ↓
Answer
```

The system should avoid giving unsupported instructions when the knowledge base does not contain adequate evidence.

---

## 4.4 Explainer Agent

### Purpose

Turn bureaucratic/technical language into simple language.

### Requirements

- Plain language
- Short explanation
- English/Hindi
- No unnecessary jargon
- Must stay grounded in retrieved evidence

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

---

## 4.7 Orchestrator

The orchestrator owns the complete pipeline.

### Responsibilities

1. Accept request
2. Extract information
3. Classify rejection
4. Retrieve supporting knowledge
5. Run explanation/fix/draft work
6. Merge outputs
7. Return final structured response
8. Send pipeline status to frontend

### Parallelization

After the category and retrieved context are available, independent work should run in parallel where practical:

```text
                 ┌── Explainer ──────┐
Classifier ──────┼── Fix Generator ──┼── Final Result
                 └── Draft Agent ────┘
```

---

# 5. Final API Contract

The frontend should receive one predictable response shape.

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
    "category_id": "...",
    "confidence": 0.94
  },
  "explanation": {
    "title": "...",
    "body": "...",
    "language": "en"
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
  "sources": [],
  "warnings": []
}
```

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

Show live pipeline status:

```text
✓ Extracting
✓ Identifying rejection
● Finding verified solution
○ Preparing draft
```

Possible status labels:

- Extracting
- Classifying
- Retrieving guidance
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
- RAG integration
- Environment/configuration
- Final integration
- Deployment
- Final debugging
- Demo reliability

### Branch

```text
feature/anish-backend
```

### Critical principle

Anish owns the integration spine. Other team members should not silently change shared backend contracts.

---

## Avyakta — Research / Knowledge Base / RAG

### Owns

- EPFO research
- Rejection categories
- Rejection phrases
- Meaning/causes
- Fix/remedy information
- Required documents
- Forms/actions
- Source collection
- Knowledge base JSON
- Retrieval system
- Source verification

### Branch

```text
feature/avyakta-rag
```

### Main deliverable

A reliable, structured, source-backed EPFO knowledge base.

---

## Sharvya — Frontend / UX

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

### Branch

```text
feature/sharvya-ui
```

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
- Regression testing
- Hindi checks
- Demo samples
- PPT/demo support

### Branch

```text
feature/ajay-documents-tests
```

### Main deliverable

Reliable supporting systems and a tested, demo-ready build.

---

# 8. Repository Structure

```text
saral-sahayak/
│
├── README.md
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── .gitignore
├── .env.example
│
├── backend/
│   ├── main.py
│   ├── api/
│   │   ├── routes.py
│   │   └── schemas.py
│   │
│   ├── agents/
│   │   ├── extractor.py
│   │   ├── classifier.py
│   │   ├── explainer.py
│   │   ├── fix_generator.py
│   │   └── draft_agent.py
│   │
│   ├── orchestrator/
│   │   └── pipeline.py
│   │
│   ├── rag/
│   │   ├── retriever.py
│   │   └── knowledge.py
│   │
│   ├── services/
│   │   ├── llm.py
│   │   └── documents.py
│   │
│   └── config.py
│
├── data/
│   ├── epfo/
│   │   ├── rejection_categories.json
│   │   ├── remedies.json
│   │   └── sources.json
│   │
│   └── samples/
│       ├── text/
│       └── images/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
│
├── documents/
│   ├── templates/
│   └── generated/
│
├── tests/
│   ├── classifier/
│   ├── rag/
│   ├── pipeline/
│   └── fixtures/
│
└── docs/
    ├── architecture.md
    ├── dataset.md
    └── demo.md
```

---

# 9. Git Strategy

## Main branch

```text
main
```

`main` must remain runnable.

## Feature branches

```text
feature/anish-backend
feature/avyakta-rag
feature/sharvya-ui
feature/ajay-documents-tests
```

### Rules

1. No direct pushes to `main`.
2. Each person works primarily in their own branch.
3. Keep commits small and descriptive.
4. Do not silently change shared API contracts.
5. Before a major merge, update from `main`.
6. Anish performs final integration merges.
7. Every merged feature must keep the project runnable.

### Commit examples

```text
feat: add extractor agent
feat: add EPFO knowledge base
feat: add result screen
feat: add draft generation
fix: handle empty rejection
fix: improve retrieval matching
test: add name mismatch cases
docs: update architecture
```

---

# 10. Ownership Boundaries

## Anish

```text
backend/agents/
backend/orchestrator/
backend/api/
backend/services/
```

## Avyakta

```text
data/
backend/rag/
docs/dataset.md
```

## Sharvya

```text
frontend/
```

## Ajay

```text
documents/
tests/
data/samples/
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

- Initialize repository
- Set backend structure
- Define API contracts
- Define agent output schemas
- Create orchestration skeleton

### Avyakta

- Begin EPFO research
- Collect authoritative sources
- Define initial rejection categories
- Start knowledge-base schema

### Sharvya

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
- LLM interface

## Avyakta

Build:

- Initial verified knowledge base
- Rejection phrase mapping
- Remedy data
- Source metadata
- Retrieval prototype

## Sharvya

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
- RAG integration
- Complete orchestration

## Avyakta

Expand:

- Rejection categories
- Fixes
- Documents
- Forms
- Sources
- Retrieval quality

## Sharvya

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
Classify
 ↓
Retrieve
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
5. Retrieve grounded information
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
- Retrieval failure
- Invalid image
- Missing fields

## 2. Grounding

- Source display
- Verified knowledge
- Confidence
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
- Receive exact actionable fix steps
- See relevant documents/forms/actions where supported
- Generate a draft
- Download the draft
- Switch between English and Hindi

The system must clearly state that it is a guidance tool and does not guarantee appeal/rejection outcomes.

---

# 13. Things We Are NOT Building

Do not spend the 19-hour window on:

- User authentication
- User accounts
- Complex persistence
- Live EPFO API integration
- Complex microservices
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

Show exact actionable steps.

### Step 5 — Draft

Generate a ready-to-use resubmission request.

### Step 6 — Language

Switch:

```text
English → हिन्दी
```

### Step 7 — Sources

Show that the answer is grounded in the curated knowledge base.

### Final message

> We turn "claim rejected" into "here's exactly what to do."

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
  Avyakta   Sharvya    Ajay
   RAG       UI      Docs/Test
      └────────┼────────┘
               ↓
          Final Product
```

### Most important milestone

**By hour 10, the whole pipeline must work for at least one rejection category.**

After that, improve reliability and presentation instead of risking the core project with large new features.
