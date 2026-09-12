# Second Form 31 withdrawal for the same purpose filed too soon / frequency limit exceeded (epfo-rr-179)

> Dataset record `epfo-rr-179`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Second Form 31 withdrawal for the same purpose filed too soon / frequency limit exceeded

**Aliases:** Second withdrawal same purpose too soon, Form 31 frequency limit, Marriage advance already availed, Housing advance only once, Repeat purpose Form 31 rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Many Form 31 purposes historically allow limited frequency (e.g. marriage advances limited times; housing often once). Portal remarks include not eligible for the reason selected even when service months look fine. Scheme 2026 explainers regroup purposes but frequency caps may still apply — verify live portal.

## What it means

A second marriage/housing/education claim can fail even with balance available. Distinct from amount-cap (040) and general purpose ineligibility (039).

## Root cause

Purpose already availed; cooling period; choosing same purpose code again.

## How it is detected

Portal eligibility engine. Prior settled Form 31 same purpose in history.

## Fix

- Check past Form 31 settlements for the same purpose.
- Select a different eligible purpose if rules allow, or wait until frequency rules permit.
- Do not disguise housing as renovation (or vice versa) to bypass caps — risks compliance flags.
- Refile only when eligible.

## Required documents

- Prior claim history screenshots
- Fresh purpose proofs if a new eligible purpose

## Who acts

member

## Prevention

- Track which Form 31 purposes you have already used.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-085](./epfo-rr-085.md)
- [epfo-rr-082](./epfo-rr-082.md)
- [epfo-rr-040](./epfo-rr-040.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, official, circular
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Frequency limits from historical Form 31 tables; 2026 regrouping medium confidence.

- https://cleartax.in/s/epf-form-31
- https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-179",
  "rejection_reason": "Second Form 31 withdrawal for the same purpose filed too soon / frequency limit exceeded",
  "aliases": [
    "Second withdrawal same purpose too soon",
    "Form 31 frequency limit",
    "Marriage advance already availed",
    "Housing advance only once",
    "Repeat purpose Form 31 rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Many Form 31 purposes historically allow limited frequency (e.g. marriage advances limited times; housing often once). Portal remarks include not eligible for the reason selected even when service months look fine. Scheme 2026 explainers regroup purposes but frequency caps may still apply — verify live portal.",
  "what_it_means": "A second marriage/housing/education claim can fail even with balance available. Distinct from amount-cap (040) and general purpose ineligibility (039).",
  "root_cause": "Purpose already availed; cooling period; choosing same purpose code again.",
  "how_detected": "Portal eligibility engine. Prior settled Form 31 same purpose in history.",
  "fix_steps": [
    "Check past Form 31 settlements for the same purpose.",
    "Select a different eligible purpose if rules allow, or wait until frequency rules permit.",
    "Do not disguise housing as renovation (or vice versa) to bypass caps — risks compliance flags.",
    "Refile only when eligible."
  ],
  "required_documents": [
    "Prior claim history screenshots",
    "Fresh purpose proofs if a new eligible purpose"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Track which Form 31 purposes you have already used."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-085",
    "epfo-rr-082",
    "epfo-rr-040"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf"
  ],
  "source_types": [
    "blog",
    "official",
    "circular"
  ],
  "confidence": "medium",
  "notes": "Frequency limits from historical Form 31 tables; 2026 regrouping medium confidence.",
  "last_verified": "2026-09-12"
}
```
