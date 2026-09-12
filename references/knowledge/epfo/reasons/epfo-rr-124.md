# E-sign failure at member claim or nomination submission (member-side, not employer DSC) (epfo-rr-124)

> Dataset record `epfo-rr-124`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** E-sign failure at member claim or nomination submission (member-side, not employer DSC)

**Aliases:** Member e-sign failed, Aadhaar e-sign not completed on claim, Digital signature failure member portal, Claim PDF not e-signed by member

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Zee e-nomination e-sign requirement and portal OTP/e-sign flows: member-side Aadhaar e-sign can fail independently of employer DSC issues.

## What it means

Claim or related e-nomination appears filed but is incomplete without member e-sign. Distinct from employer DSC expired.

## Root cause

UIDAI e-sign downtime; wrong Aadhaar mobile; browser/app abort.

## How it is detected

Status shows incomplete e-sign / not submitted.

## Fix

- Retry e-sign on stable network with Aadhaar-linked mobile.
- Complete e-nomination e-sign before death-sensitive planning.
- If employer DSC is the blocker on a different flow, route to employer.
- Use member portal if UMANG e-sign repeatedly fails.

## Required documents

- Screenshot e-sign error
- Aadhaar mobile access

## Who acts

member

## Prevention

- Do not assume Submit succeeded until Track Claim shows an ID.

## Related records

- [epfo-rr-056](./epfo-rr-056.md)
- [epfo-rr-054](./epfo-rr-054.md)
- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-028](./epfo-rr-028.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://web.umang.gov.in
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://cleartax.in/s/epf-form-31

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-124",
  "rejection_reason": "E-sign failure at member claim or nomination submission (member-side, not employer DSC)",
  "aliases": [
    "Member e-sign failed",
    "Aadhaar e-sign not completed on claim",
    "Digital signature failure member portal",
    "Claim PDF not e-signed by member"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Zee e-nomination e-sign requirement and portal OTP/e-sign flows: member-side Aadhaar e-sign can fail independently of employer DSC issues.",
  "what_it_means": "Claim or related e-nomination appears filed but is incomplete without member e-sign. Distinct from employer DSC expired.",
  "root_cause": "UIDAI e-sign downtime; wrong Aadhaar mobile; browser/app abort.",
  "how_detected": "Status shows incomplete e-sign / not submitted.",
  "fix_steps": [
    "Retry e-sign on stable network with Aadhaar-linked mobile.",
    "Complete e-nomination e-sign before death-sensitive planning.",
    "If employer DSC is the blocker on a different flow, route to employer.",
    "Use member portal if UMANG e-sign repeatedly fails."
  ],
  "required_documents": [
    "Screenshot e-sign error",
    "Aadhaar mobile access"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Do not assume Submit succeeded until Track Claim shows an ID."
  ],
  "related_reason_ids": [
    "epfo-rr-056",
    "epfo-rr-054",
    "epfo-rr-008",
    "epfo-rr-028"
  ],
  "source_urls": [
    "https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://web.umang.gov.in",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/s/epf-form-31"
  ],
  "source_types": [
    "news",
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
