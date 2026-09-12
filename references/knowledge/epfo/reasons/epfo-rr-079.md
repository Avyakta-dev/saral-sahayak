# Vague portal remark such as 'Verification pending' or 'Contact employer' without a specific defect (epfo-rr-079)

> Dataset record `epfo-rr-079`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Vague portal remark such as 'Verification pending' or 'Contact employer' without a specific defect

**Aliases:** Verification pending, Contact employer, Discrepancies found, Rejected without reason, Verification pending vague remark, Contact employer without defect named, Discrepancies found please contact RO, SMS: Claim under process contact office

## Classification

- **Category:** Other
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** medium
- **Official/common message status:** Citizen-facing articles document opaque remarks. Citizen Charter (as reported) targets settlement of complete claims in 20 days. EPFiGMS and RTI can force a written reason. This is not a legal ground of rejection; it is a communication failure that hides a real ground (KYC, DOE, overlap, inoperative flag, etc.).

## What it means

Do not refile blindly. Extract the file noting. Often the hidden issue is employer approval, EO inspection, or inoperative extra scrutiny.

## Root cause

Workflow parked at a desk; template remark; inspection pending.

## How it is detected

Track Claim one-liner. No SMS detail.

## Fix

- Screenshot the exact words, claim ID, date.
- Ask employer if anything is pending in their login.
- File EPFiGMS with UAN, claim ID, remark, and ask for the specific scheme provision and defect.
- If unanswered, escalate on EPFiGMS, then CPGRAMS; RTI for file noting is a documented last resort.
- When the real defect is named, fix that related reason and refile if the claim was actually closed.

## Required documents

- Claim ID screenshot
- EPFiGMS registration number

## Who acts

mixed

## Prevention

- Clean KYC and DOE so officers have no reason to park the file.

## Related records

- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-076](./epfo-rr-076.md)
- [epfo-rr-058](./epfo-rr-058.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, official, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 20-day charter is widely cited; confirm current Citizen Charter on epfindia. RTI is lawful process, not a 'hack'.

- https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india
- https://epfigms.gov.in/
- https://righttoinformation.wiki/epfo-claim-rejected-pending-uan-kyc-complaint-india
- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-079",
  "rejection_reason": "Vague portal remark such as 'Verification pending' or 'Contact employer' without a specific defect",
  "aliases": [
    "Verification pending",
    "Contact employer",
    "Discrepancies found",
    "Rejected without reason",
    "Verification pending vague remark",
    "Contact employer without defect named",
    "Discrepancies found please contact RO",
    "SMS: Claim under process contact office"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Citizen-facing articles document opaque remarks. Citizen Charter (as reported) targets settlement of complete claims in 20 days. EPFiGMS and RTI can force a written reason. This is not a legal ground of rejection; it is a communication failure that hides a real ground (KYC, DOE, overlap, inoperative flag, etc.).",
  "what_it_means": "Do not refile blindly. Extract the file noting. Often the hidden issue is employer approval, EO inspection, or inoperative extra scrutiny.",
  "root_cause": "Workflow parked at a desk; template remark; inspection pending.",
  "how_detected": "Track Claim one-liner. No SMS detail.",
  "fix_steps": [
    "Screenshot the exact words, claim ID, date.",
    "Ask employer if anything is pending in their login.",
    "File EPFiGMS with UAN, claim ID, remark, and ask for the specific scheme provision and defect.",
    "If unanswered, escalate on EPFiGMS, then CPGRAMS; RTI for file noting is a documented last resort.",
    "When the real defect is named, fix that related reason and refile if the claim was actually closed."
  ],
  "required_documents": [
    "Claim ID screenshot",
    "EPFiGMS registration number"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Clean KYC and DOE so officers have no reason to park the file."
  ],
  "related_reason_ids": [
    "epfo-rr-010",
    "epfo-rr-024",
    "epfo-rr-076",
    "epfo-rr-058"
  ],
  "source_urls": [
    "https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india",
    "https://epfigms.gov.in/",
    "https://righttoinformation.wiki/epfo-claim-rejected-pending-uan-kyc-complaint-india",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do"
  ],
  "source_types": [
    "blog",
    "official",
    "news"
  ],
  "confidence": "medium",
  "notes": "20-day charter is widely cited; confirm current Citizen Charter on epfindia. RTI is lawful process, not a 'hack'.",
  "last_verified": "2026-09-12"
}
```
