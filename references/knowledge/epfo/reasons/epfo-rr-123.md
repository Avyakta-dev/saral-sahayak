# International worker claim blocked for want of passport/bank attestation on physical non-Aadhaar path (epfo-rr-123)

> Dataset record `epfo-rr-123`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** International worker claim blocked for want of passport/bank attestation on physical non-Aadhaar path

**Aliases:** IW physical claim documents incomplete, Passport not attached IW claim, Bank verification letter missing international worker, Mission attestation required IW

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** International Worker Claim, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Composite Claim Form
- **Severity:** high
- **Official/common message status:** CNBC/KPMG/TaxGuru IW notes: specified classes may settle physically without Aadhaar seeding but still need UAN, passport, and bank verification; employer identity confirm may apply above balance thresholds.

## What it means

Even when Aadhaar is correctly waived, claims fail because passport copy, bank attestation, or employer attestations on Non-Aadhaar CCF are missing.

## Root cause

Missing passport; missing bank letter; incomplete Non-Aadhaar CCF; no employer confirm when required.

## How it is detected

Physical IW claim returned for documents.

## Fix

- Assemble Non-Aadhaar CCF with passport and bank proofs per physical IW guidance.
- Obtain employer attestation where form requires.
- Do not loop on Aadhaar OTP if you are in the exempted class.
- Track via RO/EPFiGMS with document checklist.

## Required documents

- Passport
- Bank verification / NRO proof
- Non-Aadhaar CCF
- Employer attestation if required

## Who acts

mixed

## Prevention

- Use physical IW checklist before leaving India if possible.

## Related records

- [epfo-rr-074](./epfo-rr-074.md)
- [epfo-rr-075](./epfo-rr-075.md)
- [epfo-rr-105](./epfo-rr-105.md)
- [epfo-rr-048](./epfo-rr-048.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html
- https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html
- https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm
- https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf
- https://www.epfindia.gov.in/site_en/International_workers.php

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-123",
  "rejection_reason": "International worker claim blocked for want of passport/bank attestation on physical non-Aadhaar path",
  "aliases": [
    "IW physical claim documents incomplete",
    "Passport not attached IW claim",
    "Bank verification letter missing international worker",
    "Mission attestation required IW"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "International Worker Claim",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "CNBC/KPMG/TaxGuru IW notes: specified classes may settle physically without Aadhaar seeding but still need UAN, passport, and bank verification; employer identity confirm may apply above balance thresholds.",
  "what_it_means": "Even when Aadhaar is correctly waived, claims fail because passport copy, bank attestation, or employer attestations on Non-Aadhaar CCF are missing.",
  "root_cause": "Missing passport; missing bank letter; incomplete Non-Aadhaar CCF; no employer confirm when required.",
  "how_detected": "Physical IW claim returned for documents.",
  "fix_steps": [
    "Assemble Non-Aadhaar CCF with passport and bank proofs per physical IW guidance.",
    "Obtain employer attestation where form requires.",
    "Do not loop on Aadhaar OTP if you are in the exempted class.",
    "Track via RO/EPFiGMS with document checklist."
  ],
  "required_documents": [
    "Passport",
    "Bank verification / NRO proof",
    "Non-Aadhaar CCF",
    "Employer attestation if required"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Use physical IW checklist before leaving India if possible."
  ],
  "related_reason_ids": [
    "epfo-rr-074",
    "epfo-rr-075",
    "epfo-rr-105",
    "epfo-rr-048"
  ],
  "source_urls": [
    "https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html",
    "https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html",
    "https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf",
    "https://www.epfindia.gov.in/site_en/International_workers.php"
  ],
  "source_types": [
    "news",
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
