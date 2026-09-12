# Father's or mother's name mismatch in UAN versus Aadhaar (epfo-rr-003)

> Dataset record `epfo-rr-003`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Father's or mother's name mismatch in UAN versus Aadhaar

**Aliases:** Father name mismatch, Parent name discrepancy, Husband name vs father name, Relationship parameter mismatch

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** high
- **Official/common message status:** Often bundled into 'member details mismatch' or flagged during Joint Declaration / KYC. Mint (Jul 2026) lists father's name as a demographic field that must match across EPFO, Aadhaar, and bank records.

## What it means

EPFO stores a parent/spouse relationship field (father or mother or husband depending on how Form 2/11 was filled). Aadhaar also has a parent/husband field. If UAN shows father's name while Aadhaar shows husband (or different spelling, missing surname, initials), UIDAI match or field-office scrutiny can reject the claim. Married women are frequently affected because some employers recorded husband's name in the 'father/husband' box while Aadhaar still shows the father, or vice versa. Death claims and nominations also use this field to identify the member.

## Root cause

Form 2/11 'father or husband' ambiguity, data entry of initials, and the JD SOP treating father/mother name as a distinct parameter (major if expanded or phonetically changed). Relationship (father vs mother) is a separate minor parameter.

## How it is detected

Personal Details vs Aadhaar parent/husband name. JD request remarks. Death-claim file noting.

## Fix

- Confirm whether UAN stores father, mother, or husband, and compare with Aadhaar.
- File Joint Declaration for Father/Mother Name and/or Relationship. Expanding a name or inserting a name for the first time is a major change.
- Attach Aadhaar plus parent-name proofs from SOP Annexure-C (passport of parent, ration/PDS card, birth certificate, government marriage certificate, etc.).
- Employer e-approves; EPFO processes per minor/major matrix.
- For married-name/relationship issues, also update marital status if needed in the same JD (SOP says basic identity fields should be corrected in one go).
- Resubmit claim after the profile shows the corrected parent name.

## Required documents

- Aadhaar showing parent/husband name
- Parent passport or birth certificate or ration card
- Government-issued marriage certificate if husband name is involved

## Who acts

mixed

## Prevention

- On Form 11/2, copy the parent name exactly as on Aadhaar.
- Do not mix husband and father fields.
- Correct parent name before first claim, not after rejection.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-064](./epfo-rr-064.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** SOP parameters 4 (Father/Mother Name) and 5 (Relationship). Father name change frequency allowed: 1.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary (news / blog / forum)

- [news] https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- [news] https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-003",
  "rejection_reason": "Father's or mother's name mismatch in UAN versus Aadhaar",
  "aliases": [
    "Father name mismatch",
    "Parent name discrepancy",
    "Husband name vs father name",
    "Relationship parameter mismatch"
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
  "severity": "high",
  "official_status_or_message": "Often bundled into 'member details mismatch' or flagged during Joint Declaration / KYC. Mint (Jul 2026) lists father's name as a demographic field that must match across EPFO, Aadhaar, and bank records.",
  "what_it_means": "EPFO stores a parent/spouse relationship field (father or mother or husband depending on how Form 2/11 was filled). Aadhaar also has a parent/husband field. If UAN shows father's name while Aadhaar shows husband (or different spelling, missing surname, initials), UIDAI match or field-office scrutiny can reject the claim. Married women are frequently affected because some employers recorded husband's name in the 'father/husband' box while Aadhaar still shows the father, or vice versa. Death claims and nominations also use this field to identify the member.",
  "root_cause": "Form 2/11 'father or husband' ambiguity, data entry of initials, and the JD SOP treating father/mother name as a distinct parameter (major if expanded or phonetically changed). Relationship (father vs mother) is a separate minor parameter.",
  "how_detected": "Personal Details vs Aadhaar parent/husband name. JD request remarks. Death-claim file noting.",
  "fix_steps": [
    "Confirm whether UAN stores father, mother, or husband, and compare with Aadhaar.",
    "File Joint Declaration for Father/Mother Name and/or Relationship. Expanding a name or inserting a name for the first time is a major change.",
    "Attach Aadhaar plus parent-name proofs from SOP Annexure-C (passport of parent, ration/PDS card, birth certificate, government marriage certificate, etc.).",
    "Employer e-approves; EPFO processes per minor/major matrix.",
    "For married-name/relationship issues, also update marital status if needed in the same JD (SOP says basic identity fields should be corrected in one go).",
    "Resubmit claim after the profile shows the corrected parent name."
  ],
  "required_documents": [
    "Aadhaar showing parent/husband name",
    "Parent passport or birth certificate or ration card",
    "Government-issued marriage certificate if husband name is involved"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "On Form 11/2, copy the parent name exactly as on Aadhaar.",
    "Do not mix husband and father fields.",
    "Correct parent name before first claim, not after rejection."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-013",
    "epfo-rr-064"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "high",
  "notes": "SOP parameters 4 (Father/Mother Name) and 5 (Relationship). Father name change frequency allowed: 1.",
  "last_verified": "2026-09-12"
}
```
