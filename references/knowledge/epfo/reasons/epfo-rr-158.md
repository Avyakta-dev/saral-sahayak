# Bank account holder name truncated on NPCI/NEFT validation causing false name mismatch (epfo-rr-158)

> Dataset record `epfo-rr-158`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Bank account holder name truncated on NPCI/NEFT validation causing false name mismatch

**Aliases:** Name truncated 35 characters bank KYC, NPCI name length mismatch EPFO, Long name bank validation failed, Account name cut off PF claim, NEFT name truncation reject

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Payment rails and validators may truncate legal names (industry reports cite about 35-50 character limits on some NPCI validation paths). EPFO then flags bank name mismatch even when Aadhaar and bank full legal names match offline. Related to 020 but truncation-specific.

## What it means

Members with long multi-part names fail automated match. Fix may need bank short-name update or RO manual acceptance with proofs — not necessarily JD on UAN.

## Root cause

Validator length limit; expanded vs initials; mismatch after truncation algorithm.

## How it is detected

Bank KYC fail despite visually matching names. Bank returns shortened beneficiary name.

## Fix

- Compare UAN name, Aadhaar name, and bank CBS name letter-by-letter.
- Ask bank to register a shorter primary name variant matching Aadhaar within validator limits, if bank policy allows.
- Alternatively seed another sole account where the printed name already matches within limits.
- If NPCI verified elsewhere but EPFO fails, EPFiGMS with passbook and Aadhaar for manual correlation.
- Do not randomly change UAN name away from Aadhaar.

## Required documents

- Bank passbook/statement showing full name
- Aadhaar
- Cheque image if requested

## Who acts

mixed

## Prevention

- At account opening, align bank short name with Aadhaar.

## Related records

- [epfo-rr-020](./epfo-rr-020.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-012](./epfo-rr-012.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Character-limit behaviour documented in NPCI validation industry reporting; apply carefully to EPFO.

- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-158",
  "rejection_reason": "Bank account holder name truncated on NPCI/NEFT validation causing false name mismatch",
  "aliases": [
    "Name truncated 35 characters bank KYC",
    "NPCI name length mismatch EPFO",
    "Long name bank validation failed",
    "Account name cut off PF claim",
    "NEFT name truncation reject"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Payment rails and validators may truncate legal names (industry reports cite about 35-50 character limits on some NPCI validation paths). EPFO then flags bank name mismatch even when Aadhaar and bank full legal names match offline. Related to 020 but truncation-specific.",
  "what_it_means": "Members with long multi-part names fail automated match. Fix may need bank short-name update or RO manual acceptance with proofs — not necessarily JD on UAN.",
  "root_cause": "Validator length limit; expanded vs initials; mismatch after truncation algorithm.",
  "how_detected": "Bank KYC fail despite visually matching names. Bank returns shortened beneficiary name.",
  "fix_steps": [
    "Compare UAN name, Aadhaar name, and bank CBS name letter-by-letter.",
    "Ask bank to register a shorter primary name variant matching Aadhaar within validator limits, if bank policy allows.",
    "Alternatively seed another sole account where the printed name already matches within limits.",
    "If NPCI verified elsewhere but EPFO fails, EPFiGMS with passbook and Aadhaar for manual correlation.",
    "Do not randomly change UAN name away from Aadhaar."
  ],
  "required_documents": [
    "Bank passbook/statement showing full name",
    "Aadhaar",
    "Cheque image if requested"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "At account opening, align bank short name with Aadhaar."
  ],
  "related_reason_ids": [
    "epfo-rr-020",
    "epfo-rr-016",
    "epfo-rr-001",
    "epfo-rr-012"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "news",
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Character-limit behaviour documented in NPCI validation industry reporting; apply carefully to EPFO.",
  "last_verified": "2026-09-12"
}
```
