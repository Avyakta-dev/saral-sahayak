# Disablement / physically handicapped pension (Form 10D) eligibility or medical board proof inadequate (epfo-rr-111)

> Dataset record `epfo-rr-111`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Disablement / physically handicapped pension (Form 10D) eligibility or medical board proof inadequate

**Aliases:** Disablement pension rejected, Permanent disability Form 10D rejected, Medical board certificate missing pension, Handicapped pension EPS not approved

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10D Monthly Pension, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Which Claim Form / EPS framework provides disablement pension distinct from old-age pension; medical certification requirements apply.

## What it means

Form 10D disablement claims fail when disability is not certified as meeting scheme threshold, member is still in covered employment contrary to rules, or documents are incomplete. Different from Form 31 equipment advance.

## Root cause

Insufficient medical board proof; still employed; wrong form.

## How it is detected

Form 10D disablement category. Medical scrutiny.

## Fix

- Obtain medical certification standard your RO lists for disablement pension.
- Select disablement path, not ordinary old-age 10D.
- Equipment purchase needs remain Form 31 if seeking advance not pension.
- Keep EPS service history complete.

## Required documents

- Medical board / disability certificate
- Form 10D
- Service History

## Who acts

mixed

## Prevention

- Ask RO checklist before filing disablement pension.

## Related records

- [epfo-rr-093](./epfo-rr-093.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-048](./epfo-rr-048.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** RO checklist controls medical threshold.

- https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-111",
  "rejection_reason": "Disablement / physically handicapped pension (Form 10D) eligibility or medical board proof inadequate",
  "aliases": [
    "Disablement pension rejected",
    "Permanent disability Form 10D rejected",
    "Medical board certificate missing pension",
    "Handicapped pension EPS not approved"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Which Claim Form / EPS framework provides disablement pension distinct from old-age pension; medical certification requirements apply.",
  "what_it_means": "Form 10D disablement claims fail when disability is not certified as meeting scheme threshold, member is still in covered employment contrary to rules, or documents are incomplete. Different from Form 31 equipment advance.",
  "root_cause": "Insufficient medical board proof; still employed; wrong form.",
  "how_detected": "Form 10D disablement category. Medical scrutiny.",
  "fix_steps": [
    "Obtain medical certification standard your RO lists for disablement pension.",
    "Select disablement path, not ordinary old-age 10D.",
    "Equipment purchase needs remain Form 31 if seeking advance not pension.",
    "Keep EPS service history complete."
  ],
  "required_documents": [
    "Medical board / disability certificate",
    "Form 10D",
    "Service History"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Ask RO checklist before filing disablement pension."
  ],
  "related_reason_ids": [
    "epfo-rr-093",
    "epfo-rr-037",
    "epfo-rr-048"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "RO checklist controls medical threshold.",
  "last_verified": "2026-09-12"
}
```
