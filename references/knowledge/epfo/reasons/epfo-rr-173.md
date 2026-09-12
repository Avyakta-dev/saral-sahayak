# Notary attestation used where gazetted or listed authority attestation is mandatory (epfo-rr-173)

> Dataset record `epfo-rr-173`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Notary attestation used where gazetted or listed authority attestation is mandatory

**Aliases:** Notary vs gazetted attestation, Notary not accepted PF claim, Need gazetted officer signature, Notarised affidavit rejected EPFO, Bank manager vs notary attestation

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Composite Claim Form, Form 20 Death PF Settlement, Form 10D Monthly Pension, Form 13 Transfer, International Worker Claim
- **Severity:** medium
- **Official/common message status:** Some members notarise affidavits assuming equivalence to gazetted attestation. EPFO form lists and JD closed-establishment paths often require specifically gazetted officers or other named categories; notary alone is insufficient for those slots.

## What it means

A notarised affidavit may still be useful as supporting text, but it does not replace the mandated attestor on the claim form. Sharpens 170.

## Root cause

Confusion between affidavit notarisation and form attestation; agent misadvice.

## How it is detected

RO rejects seal as notary public not on list.

## Fix

- Check whether the form field asks for employer, gazetted officer, or bank manager.
- Re-execute attestation before the correct category.
- Use notary only if the specific document type (affidavit) requires notarisation in addition to proper attestation.
- Resubmit physical claim.

## Required documents

- Re-attested forms
- Gazetted/bank manager attestation as applicable

## Who acts

member

## Prevention

- Read attestation instructions on the PDF form before visiting anyone.

## Related records

- [epfo-rr-170](./epfo-rr-170.md)
- [epfo-rr-026](./epfo-rr-026.md)
- [epfo-rr-050](./epfo-rr-050.md)
- [epfo-rr-030](./epfo-rr-030.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** circular, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Clarifies notary is not gazetted for EPFO lists.

- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-173",
  "rejection_reason": "Notary attestation used where gazetted or listed authority attestation is mandatory",
  "aliases": [
    "Notary vs gazetted attestation",
    "Notary not accepted PF claim",
    "Need gazetted officer signature",
    "Notarised affidavit rejected EPFO",
    "Bank manager vs notary attestation"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Composite Claim Form",
    "Form 20 Death PF Settlement",
    "Form 10D Monthly Pension",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Some members notarise affidavits assuming equivalence to gazetted attestation. EPFO form lists and JD closed-establishment paths often require specifically gazetted officers or other named categories; notary alone is insufficient for those slots.",
  "what_it_means": "A notarised affidavit may still be useful as supporting text, but it does not replace the mandated attestor on the claim form. Sharpens 170.",
  "root_cause": "Confusion between affidavit notarisation and form attestation; agent misadvice.",
  "how_detected": "RO rejects seal as notary public not on list.",
  "fix_steps": [
    "Check whether the form field asks for employer, gazetted officer, or bank manager.",
    "Re-execute attestation before the correct category.",
    "Use notary only if the specific document type (affidavit) requires notarisation in addition to proper attestation.",
    "Resubmit physical claim."
  ],
  "required_documents": [
    "Re-attested forms",
    "Gazetted/bank manager attestation as applicable"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Read attestation instructions on the PDF form before visiting anyone."
  ],
  "related_reason_ids": [
    "epfo-rr-170",
    "epfo-rr-026",
    "epfo-rr-050",
    "epfo-rr-030"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf"
  ],
  "source_types": [
    "circular",
    "official"
  ],
  "confidence": "high",
  "notes": "Clarifies notary is not gazetted for EPFO lists.",
  "last_verified": "2026-09-12"
}
```
