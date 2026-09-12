# Gender mismatch between UAN profile and Aadhaar (epfo-rr-004)

> Dataset record `epfo-rr-004`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Gender mismatch between UAN profile and Aadhaar

**Aliases:** Gender not matching, Sex mismatch in member profile, Male/Female/Others discrepancy

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** medium
- **Official/common message status:** Usually part of demographic/member details mismatch rather than a unique published code. Gender is parameter 2 in SOP JD/2022/1 (minor change, generally once).

## What it means

If UAN gender does not match Aadhaar gender, e-KYC and some claim validations fail. This is less common than name/DOB errors but appears in data-entry from Form 11 (wrong tick) and in cases of legal gender change not updated on both Aadhaar and UAN. Family pension logic (widow/widower) also depends on gender/relationship data being consistent.

## Root cause

Incorrect gender marked at UAN generation or employer onboarding; Aadhaar later different; or legal gender update done only on one ID.

## How it is detected

Personal Details vs Aadhaar. KYC/e-KYC failure. JD workflow.

## Fix

- Confirm Aadhaar gender is correct; update UIDAI first if Aadhaar is wrong.
- File Joint Declaration for Gender (minor). SOP lists gender change as allowed once.
- Attach Aadhaar (mandatory) plus another photo ID from Annexure-A.
- Employer approves; after EPFO posts the change, resubmit the claim.

## Required documents

- Aadhaar
- Passport or other photo ID from SOP Annexure-A

## Who acts

mixed

## Prevention

- Tick gender on Form 11 exactly as Aadhaar.
- After a legal gender change, update Aadhaar then UAN together.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-013](./epfo-rr-013.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Gender classified as minor in SOP Table 2; frequency 1.

- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- https://pfbalancecheck.com/epfo-claim-rejected-reason/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-004",
  "rejection_reason": "Gender mismatch between UAN profile and Aadhaar",
  "aliases": [
    "Gender not matching",
    "Sex mismatch in member profile",
    "Male/Female/Others discrepancy"
  ],
  "category": "KYC_Identity",
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
  "official_status_or_message": "Usually part of demographic/member details mismatch rather than a unique published code. Gender is parameter 2 in SOP JD/2022/1 (minor change, generally once).",
  "what_it_means": "If UAN gender does not match Aadhaar gender, e-KYC and some claim validations fail. This is less common than name/DOB errors but appears in data-entry from Form 11 (wrong tick) and in cases of legal gender change not updated on both Aadhaar and UAN. Family pension logic (widow/widower) also depends on gender/relationship data being consistent.",
  "root_cause": "Incorrect gender marked at UAN generation or employer onboarding; Aadhaar later different; or legal gender update done only on one ID.",
  "how_detected": "Personal Details vs Aadhaar. KYC/e-KYC failure. JD workflow.",
  "fix_steps": [
    "Confirm Aadhaar gender is correct; update UIDAI first if Aadhaar is wrong.",
    "File Joint Declaration for Gender (minor). SOP lists gender change as allowed once.",
    "Attach Aadhaar (mandatory) plus another photo ID from Annexure-A.",
    "Employer approves; after EPFO posts the change, resubmit the claim."
  ],
  "required_documents": [
    "Aadhaar",
    "Passport or other photo ID from SOP Annexure-A"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Tick gender on Form 11 exactly as Aadhaar.",
    "After a legal gender change, update Aadhaar then UAN together."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-013"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "Gender classified as minor in SOP Table 2; frequency 1.",
  "last_verified": "2026-09-12"
}
```
