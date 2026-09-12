# Death certificate missing, unreadable, or particulars not matching UAN records (epfo-rr-062)

> Dataset record `epfo-rr-062`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Death certificate missing, unreadable, or particulars not matching UAN records

**Aliases:** Death certificate not submitted, Death certificate mismatch, Date of death not matching, Death certificate not matching, Death certificate particulars mismatch, Unreadable death certificate

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension
- **Severity:** critical
- **Official/common message status:** Form 5IF documents to be enclosed: (1) Death Certificate of the member. MoS lists non-submission of death certificate as a rejection cause.

## What it means

The death certificate is the foundational fact for Forms 20, 10D (family pension), and 5IF. Name spellings on the municipal certificate that differ from UAN/Aadhaar trigger a mismatch loop similar to live KYC. Date of death determines whether death was 'in service' for EDLI and which scheme rates apply.

## Root cause

Certificate not attached; poor scan; name 'Sunita Devi Sharma' vs UAN 'Sunita Sharma'; hospital certificate instead of municipal death certificate.

## How it is detected

Document checklist. Name comparison. Date vs DOE for EDLI in-service test.

## Fix

- Obtain the official death certificate from the Registrar of Births and Deaths.
- If names differ, add an affidavit and supporting IDs; you may need a JD on the deceased's profile signed by nominee (SOP 6.9–6.10) before the death claim proceeds.
- Ensure date of death is consistent across all three forms (20, 10D, 5IF).
- Upload a clear scan; resubmit.

## Required documents

- Municipal death certificate
- Deceased Aadhaar/UAN
- Affidavit if name variants

## Who acts

mixed

## Prevention

- Keep the member's Aadhaar name identical to all IDs so the death certificate will match.

## Related records

- [epfo-rr-066](./epfo-rr-066.md)
- [epfo-rr-067](./epfo-rr-067.md)
- [epfo-rr-013](./epfo-rr-013.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- https://kustodian.life/resources/epf-death-claim-process-india

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-062",
  "rejection_reason": "Death certificate missing, unreadable, or particulars not matching UAN records",
  "aliases": [
    "Death certificate not submitted",
    "Death certificate mismatch",
    "Date of death not matching",
    "Death certificate not matching",
    "Death certificate particulars mismatch",
    "Unreadable death certificate"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension"
  ],
  "severity": "critical",
  "official_status_or_message": "Form 5IF documents to be enclosed: (1) Death Certificate of the member. MoS lists non-submission of death certificate as a rejection cause.",
  "what_it_means": "The death certificate is the foundational fact for Forms 20, 10D (family pension), and 5IF. Name spellings on the municipal certificate that differ from UAN/Aadhaar trigger a mismatch loop similar to live KYC. Date of death determines whether death was 'in service' for EDLI and which scheme rates apply.",
  "root_cause": "Certificate not attached; poor scan; name 'Sunita Devi Sharma' vs UAN 'Sunita Sharma'; hospital certificate instead of municipal death certificate.",
  "how_detected": "Document checklist. Name comparison. Date vs DOE for EDLI in-service test.",
  "fix_steps": [
    "Obtain the official death certificate from the Registrar of Births and Deaths.",
    "If names differ, add an affidavit and supporting IDs; you may need a JD on the deceased's profile signed by nominee (SOP 6.9–6.10) before the death claim proceeds.",
    "Ensure date of death is consistent across all three forms (20, 10D, 5IF).",
    "Upload a clear scan; resubmit."
  ],
  "required_documents": [
    "Municipal death certificate",
    "Deceased Aadhaar/UAN",
    "Affidavit if name variants"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Keep the member's Aadhaar name identical to all IDs so the death certificate will match."
  ],
  "related_reason_ids": [
    "epfo-rr-066",
    "epfo-rr-067",
    "epfo-rr-013"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
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
