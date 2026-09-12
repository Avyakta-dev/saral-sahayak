# Legal heir or succession certificate missing when there is no valid nomination (epfo-rr-063)

> Dataset record `epfo-rr-063`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Legal heir or succession certificate missing when there is no valid nomination

**Aliases:** Succession certificate required, Legal heir certificate not submitted, Heirship documents missing

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** Form 5IF: succession certificate in case of claim by the legal heir. MoS: legal heir or succession documents required in such cases.

## What it means

When nobody is a scheme-defined family nominee, EPFO will not split the PF on a private family settlement letter alone. Courts/revenue authorities issue succession or legal-heir certificates. Multiple heirs must generally consent. This is slow but is the lawful path; refiling without the certificate repeats the rejection.

## Root cause

No nomination; distant relatives applying; office insisting on court succession rather than a tehsildar heir certificate (practice varies — follow the deficiency note).

## How it is detected

No Form 2. Claimant not in family definition. Deficiency memo asking for succession.

## Fix

- Read the office note: legal-heir certificate vs court succession certificate.
- Obtain the asked document listing all heirs and shares.
- File a joint claim or get no-objection from other heirs as directed.
- Attach all heirs' KYC and a claimant bank account as instructed (sometimes a joint heir account).

## Required documents

- Succession certificate and/or legal heir certificate
- NOCs of other heirs if required
- KYC of claimant

## Who acts

member

## Prevention

- Valid e-signed nomination avoids this entire court path.

## Related records

- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-061](./epfo-rr-061.md)
- [epfo-rr-048](./epfo-rr-048.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india
- https://kustodian.life/resources/epf-death-claim-process-india

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-063",
  "rejection_reason": "Legal heir or succession certificate missing when there is no valid nomination",
  "aliases": [
    "Succession certificate required",
    "Legal heir certificate not submitted",
    "Heirship documents missing"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "Form 5IF: succession certificate in case of claim by the legal heir. MoS: legal heir or succession documents required in such cases.",
  "what_it_means": "When nobody is a scheme-defined family nominee, EPFO will not split the PF on a private family settlement letter alone. Courts/revenue authorities issue succession or legal-heir certificates. Multiple heirs must generally consent. This is slow but is the lawful path; refiling without the certificate repeats the rejection.",
  "root_cause": "No nomination; distant relatives applying; office insisting on court succession rather than a tehsildar heir certificate (practice varies — follow the deficiency note).",
  "how_detected": "No Form 2. Claimant not in family definition. Deficiency memo asking for succession.",
  "fix_steps": [
    "Read the office note: legal-heir certificate vs court succession certificate.",
    "Obtain the asked document listing all heirs and shares.",
    "File a joint claim or get no-objection from other heirs as directed.",
    "Attach all heirs' KYC and a claimant bank account as instructed (sometimes a joint heir account)."
  ],
  "required_documents": [
    "Succession certificate and/or legal heir certificate",
    "NOCs of other heirs if required",
    "KYC of claimant"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Valid e-signed nomination avoids this entire court path."
  ],
  "related_reason_ids": [
    "epfo-rr-060",
    "epfo-rr-061",
    "epfo-rr-048"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india",
    "https://kustodian.life/resources/epf-death-claim-process-india"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
