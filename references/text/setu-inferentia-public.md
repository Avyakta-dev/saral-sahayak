# SETU / INFERENTIA — public readable reference extract

Source: `Setu_Inferentia (1).pdf` (11 slides). Public PDF: [setu-inferentia-public.pdf](../pdfs/setu-inferentia-public.pdf) (10 pages).

Original source slide 3, containing private participant details, is omitted entirely. All other source slides retain their original layouts and order. PDF metadata, annotations, interactive links and attachments are excluded from the public copy.

This extract normalizes layout, whitespace and reading order. Substantive visual content from original slides 5, 7, 8 and 9 was transcribed by the visual acceptance reviewer from rendered public-page PNGs, not inferred from their sparse PDF text layers. Transcriptions are separated from text-layer extracts and uncertainty is marked. Tables, diagrams, visual relationships and original typography may require consulting the PDF. Source claims and proposed capabilities are archival assertions, not independently verified implementation facts.

## Source page mapping

| Public PDF page | Original source slide | Content |
| --- | --- | --- |
| 1 | 1 | Event title |
| 2 | 2 | Team details |
| 3 | 4 | Track |
| 4 | 5 | Problem statement |
| 5 | 6 | Brief about the idea |
| 6 | 7 | Novelty |
| 7 | 8 | Proposed solution |
| 8 | 9 | Tech stack |
| 9 | 10 | Optional wireframe/mock diagram placeholder |
| 10 | 11 | Closing |

Source slide 3 has no public counterpart. Its private content is not reproduced in this extract.

## Known source limitations and visual acceptance

The judge inspected all 16 public PNGs across the PRD and this deck before the processor viewed any renders. No private participant phone numbers, email addresses or student IDs were visible. Privacy review passed; visual layout review reported inherited defects rather than a clean presentation-design pass. These are archival references: the defects are documented, not redesigned.

- **Public page 2 / source 2:** “SETU” overlaps the college text.
- **Public page 3 / source 4:** “Track” is split across lines as “Trac” / “k”.
- **Public page 4 / source 5:** The infographic obscures part of the “STATEMENT” heading; the small mock rejection paragraph is soft and its exact wording uncertain.
- **Public page 5 / source 6:** The word “Idea” overlaps nearby heading/content. The final bullet is clipped at the bottom. Its full ending below is recovered from the PDF text layer, not a fully visible image transcription. The 6.01 crore claims statistic has no visible source citation and is not independently verified here.
- **Public page 6 / source 7:** The 22+ voice languages, 36 text languages and 4B+ BHASHINI language-inference statistics have no visible supporting citation; they are retained as historical slide assertions, not independently verified facts.
- **Public page 8 / source 9:** The diagram obscures part of the “Stack” heading.
- **Public page 9 / source 10:** Empty optional wireframe/mock-diagram placeholder; no substantive diagram is present.

## Public page 1 — source page 1

### Event title

*PDF text-layer extract, with reading order normalized.*

- AURA presents
- INFERENTIA
- 3rd Edition of a 24hr National Level Hackathon

## Public page 2 — source page 2

### Team Details

*PDF text-layer extract, with overlapping fields separated for readability.*

- **Team Name:** SETU
- **College Name:** NMAM Institute of Technology
- **City:** Mangalore

## Public page 3 — source page 4

### Track — MAKING ACCESS BETTER

*PDF text-layer extract; split heading normalized.*

- Simplifies access to essential government services
- Breaks language and digital barriers
- Enables OCR, multilingual, STT & TTS
- Turns rejection into clear, actionable steps

## Public page 4 — source page 5

### PROBLEM STATEMENT

*Visual acceptance reviewer transcription of the five-stage infographic. The PDF text layer contains only the heading.*

1. **CLAIM REJECTED**
   - Claims are rejected with confusing, bureaucratic remarks.
2. **REJECTED — Reason**
   - The small mock rejection paragraph appears to say: “Claim is liable to be rejected due to discrepancy in the documents submitted as per para 5.6 (b)...”
   - **Transcription uncertainty:** The mock paragraph is small/soft; this is approximate wording, not an authoritative government quotation or verified policy reference.
   - Caption: Citizens struggle to understand why they were rejected and what to fix.
3. **Language Barrier / Literacy Barrier / Digital Barrier**
   - Language, literacy, and digital barriers make the process even harder.
4. **HOW TO RESUBMIT? / HOW TO APPEAL? / WHERE TO RAISE A GRIEVANCE?**
   - Many users don’t know how or where to resubmit, appeal, or raise a grievance.
5. **UNRESOLVED**
   - As a result, valid claims can remain unresolved or abandoned.

**Bottom banner:** Confusing rejections + Lack of guidance + Multiple barriers = Unresolved claims.

## Public page 5 — source page 6

### Brief About the Idea

*PDF text-layer extract. The heading overlaps in the original layout.*

- Saral Sahayak turns a confusing government rejection into clear, actionable steps.
- Example: “EPFO Claim Rejected – Name Mismatch” → AI explains what is wrong, what to correct, which document is needed, and how to resubmit.
- Users can upload, scan, type, or speak — with OCR, multilingual AI, STT & TTS.
- Goes beyond explanation by generating a ready-to-use appeal/resubmission draft.
- **PDF text-layer recovery of the visually clipped final bullet:** “EPFO alone settled 6.01 crore claims in FY 2024–25, showing the massive scale of the service we aim to make easier”. This full ending is available in extractable text but is not fully visible in the rendered slide. The statistical assertion is unsourced in the slide and not independently verified here.

## Public page 6 — source page 7

### Novelty

*Visual acceptance reviewer transcription of four sequential cards. The PDF text layer contains only the heading.*

1. **Integrate Multimodal AI**
   - Text + Image + Voice with OCR, STT & TTS in one accessible interface.
2. **Apply 5-Agent Intelligence**
   - Extract → Classify → Explain → Fix → Draft for precise, actionable guidance.
3. **Ensure Grounded Reliability**
   - Curated rejection knowledge converts generic AI responses into process-specific solutions.
4. **Scale High-Impact Inclusion**
   - Built for India’s multilingual population — 22+ voice languages, 36 text languages and 4B+ BHASHINI language inferences show the scale of the accessibility need.

The final card’s statistics are historical slide assertions, not independently verified figures or guarantees of this project's implemented language support.

## Public page 7 — source page 8

### Proposed Solution

*Visual acceptance reviewer transcription of the six-chevron process. The PDF text layer contains only the heading.*

1. **User input submission:** Users upload, scan, type, or speak their rejection details.
2. **AI analysis:** AI extracts and identifies the specific rejection reason.
3. **Clear explanation:** It explains the issue in simple, preferred language.
4. **Actionable guidance:** Provides a step-by-step fix with required documents and actions.
5. **Draft creation:** Generates a ready-to-use resubmission or appeal draft.
6. **Escalation support:** Guides users toward the appropriate grievance/escalation process when required.

## Public page 8 — source page 9

### Tech Stack

*Visual acceptance reviewer transcription of the mind map. The PDF text layer contains only the split heading. The table below represents the diagram's branches, not a replacement diagram.*

| Branch | Content |
| --- | --- |
| Output | Automated appeal/resubmission document generation |
| Frontend | Next.js, Streamlit |
| Backend | FastAPI, Python |
| AI | Vision-capable LLM, Multi-Agent Architecture |
| Knowledge Base | Curated JSON/CSV dataset |
| Accessibility | OCR, STT, TTS, Multilingual AI |

## Public page 9 — source page 10

### Wirefram/Mock Diagram (optional)

*Original heading spelling preserved. The visual reviewer confirmed this is an empty optional placeholder; no substantive wireframe or mock diagram is present.*

## Public page 10 — source page 11

### THANK YOU!

*Closing slide; PDF text-layer extract.*
