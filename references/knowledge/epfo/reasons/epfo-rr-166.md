# Death claim held for fraud checks — death certificate authenticity or claimant identity verification (epfo-rr-166)

> Dataset record `epfo-rr-166`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Death claim held for fraud checks — death certificate authenticity or claimant identity verification

**Aliases:** Death claim fraud verification, Death certificate authenticity check, Suspicious death claim EPFO, Claimant identity verification death PF, Form 20 additional fraud scrutiny

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension
- **Severity:** critical
- **Official/common message status:** Death settlements (PF, EDLI, family pension) attract extra document and identity checks. Fake death certificates and impostor claimants are known risk vectors; ROs may verify with civil registration, employer, and Aadhaar biometrics before release.

## What it means

Delays and document recalls are common even on genuine deaths. Distinct from simple missing death certificate (062) — here documents exist but are under verification.

## Root cause

Fraud risk scoring; mismatched demographics; employer unaware of death; certificate from questionable authority.

## How it is detected

RO query to municipal registrar. Extra affidavits sought. Long pending death claims.

## Fix

- Submit original/certified death certificate from competent registrar; avoid dubious agents.
- Provide claimant Aadhaar e-KYC, relationship proofs, and e-nomination printouts.
- Ask employer to confirm employment and death intimation in writing.
- Respond to RO verification letters quickly; track via EPFiGMS.
- Do not file conflicting claimant applications from multiple relatives simultaneously without legal clarity.

## Required documents

- Registrar-issued death certificate
- Relationship proofs
- Claimant KYC/bank
- Employer confirmation

## Who acts

mixed

## Prevention

- Members: complete e-signed e-nomination.
- Families: use official registrar certificates only.

## Related records

- [epfo-rr-062](./epfo-rr-062.md)
- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-163](./epfo-rr-163.md)
- [epfo-rr-066](./epfo-rr-066.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Fraud-check edge on top of missing-certificate record.

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://kustodian.life/resources/epf-death-claim-process-india
- https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india
- https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-166",
  "rejection_reason": "Death claim held for fraud checks — death certificate authenticity or claimant identity verification",
  "aliases": [
    "Death claim fraud verification",
    "Death certificate authenticity check",
    "Suspicious death claim EPFO",
    "Claimant identity verification death PF",
    "Form 20 additional fraud scrutiny"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension"
  ],
  "severity": "critical",
  "official_status_or_message": "Death settlements (PF, EDLI, family pension) attract extra document and identity checks. Fake death certificates and impostor claimants are known risk vectors; ROs may verify with civil registration, employer, and Aadhaar biometrics before release.",
  "what_it_means": "Delays and document recalls are common even on genuine deaths. Distinct from simple missing death certificate (062) — here documents exist but are under verification.",
  "root_cause": "Fraud risk scoring; mismatched demographics; employer unaware of death; certificate from questionable authority.",
  "how_detected": "RO query to municipal registrar. Extra affidavits sought. Long pending death claims.",
  "fix_steps": [
    "Submit original/certified death certificate from competent registrar; avoid dubious agents.",
    "Provide claimant Aadhaar e-KYC, relationship proofs, and e-nomination printouts.",
    "Ask employer to confirm employment and death intimation in writing.",
    "Respond to RO verification letters quickly; track via EPFiGMS.",
    "Do not file conflicting claimant applications from multiple relatives simultaneously without legal clarity."
  ],
  "required_documents": [
    "Registrar-issued death certificate",
    "Relationship proofs",
    "Claimant KYC/bank",
    "Employer confirmation"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Members: complete e-signed e-nomination.",
    "Families: use official registrar certificates only."
  ],
  "related_reason_ids": [
    "epfo-rr-062",
    "epfo-rr-060",
    "epfo-rr-163",
    "epfo-rr-066"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india",
    "https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "medium",
  "notes": "Fraud-check edge on top of missing-certificate record.",
  "last_verified": "2026-09-12"
}
```
