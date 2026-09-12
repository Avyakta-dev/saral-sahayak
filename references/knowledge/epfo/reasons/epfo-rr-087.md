# Form 31 medical/illness treatment advance rejected (self or family) (epfo-rr-087)

> Dataset record `epfo-rr-087`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 medical/illness treatment advance rejected (self or family)

**Aliases:** Medical advance rejected, Illness Form 31 not approved, Hospitalisation PF advance rejected, Treatment of family member advance rejected, Certificate C medical missing

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax/Axis Max/labour-law Form 31 guide: illness advance often has no minimum service; amount typically least of ~6 months basic+DA or employee share; employer and doctor certificates historically for offline; covers member and specified family. Online often accepts self-declaration; RO may seek medical proof for large amounts.

## What it means

Medical Form 31 fails when illness purpose was not selected, amount exceeds medical cap, family relationship is outside definition, or medical/employer certificates are demanded and missing on physical claims. Differs from housing/marriage because service floor is often nil but documents differ.

## Root cause

Wrong purpose; over-claim; missing Certificate C on physical; non-covered relative.

## How it is detected

Purpose illness/medical. Amount vs wage multiple. Physical document checklist.

## Fix

- Select illness/medical (or Essential Needs illness) explicitly.
- Cap amount to medical limit shown.
- For physical claims attach doctor and employer certificates when required.
- For online, self-declare truthfully; answer RO queries.

## Required documents

- Doctor certificate
- Employer certificate if physical
- Hospital estimate if asked

## Who acts

mixed

## Prevention

- Keep medical papers even for online self-cert in case of clarification.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)
- [epfo-rr-053](./epfo-rr-053.md)
- [epfo-rr-094](./epfo-rr-094.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/s/epf-form-31
- [blog] https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- [blog] https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- [blog] https://www.indiafilings.com/learn/epf-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-087",
  "rejection_reason": "Form 31 medical/illness treatment advance rejected (self or family)",
  "aliases": [
    "Medical advance rejected",
    "Illness Form 31 not approved",
    "Hospitalisation PF advance rejected",
    "Treatment of family member advance rejected",
    "Certificate C medical missing"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax/Axis Max/labour-law Form 31 guide: illness advance often has no minimum service; amount typically least of ~6 months basic+DA or employee share; employer and doctor certificates historically for offline; covers member and specified family. Online often accepts self-declaration; RO may seek medical proof for large amounts.",
  "what_it_means": "Medical Form 31 fails when illness purpose was not selected, amount exceeds medical cap, family relationship is outside definition, or medical/employer certificates are demanded and missing on physical claims. Differs from housing/marriage because service floor is often nil but documents differ.",
  "root_cause": "Wrong purpose; over-claim; missing Certificate C on physical; non-covered relative.",
  "how_detected": "Purpose illness/medical. Amount vs wage multiple. Physical document checklist.",
  "fix_steps": [
    "Select illness/medical (or Essential Needs illness) explicitly.",
    "Cap amount to medical limit shown.",
    "For physical claims attach doctor and employer certificates when required.",
    "For online, self-declare truthfully; answer RO queries."
  ],
  "required_documents": [
    "Doctor certificate",
    "Employer certificate if physical",
    "Hospital estimate if asked"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Keep medical papers even for online self-cert in case of clarification."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-040",
    "epfo-rr-053",
    "epfo-rr-094"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
