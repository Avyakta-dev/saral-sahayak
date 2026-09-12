# Form 31 housing purchase/construction/plot advance ineligible or ownership/service not met (epfo-rr-082)

> Dataset record `epfo-rr-082`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 housing purchase/construction/plot advance ineligible or ownership/service not met

**Aliases:** Housing advance rejected, Not eligible for house construction, Plot purchase Form 31 rejected, Insufficient service for housing withdrawal, House/flat purchase purpose not allowed

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax/Axis Max Form-31 guides: housing (land/plot/house/flat purchase or construction) historically required about 5 years membership; property in member, spouse, or joint names; amount capped (e.g. 24x wages for site, 36x for house, or balance/cost whichever least). TaxGuru/KnowMoney 2025-26 reporting places Housing Needs under revised ~12-month membership and 25% retention — live portal controls. Composite Claim Forms circular allowed self-certification without utilization certificates for many housing advances.

## What it means

A Form 31 housing claim fails when membership/service is short of the rule the portal applies, the amount exceeds the purpose cap, ownership is not member/spouse/joint, or housing was selected for another need. Plot vs construction vs ready flat have different historical limits. Scheme 2026 explainers describe a Housing Needs head with uniform 12 months and 25% retention; older FAQs cite 5 years. Remarks often say not eligible for the reason selected or insufficient member service.

## Root cause

Wrong purpose; short DOJ-based service; amount above wage multiple or available balance after retention; property in parents name; duplicate housing advance where only one allowed.

## How it is detected

Portal purpose vs service length. Passbook balance vs claimed amount. Ownership declaration query.

## Fix

- Confirm DOJ and membership months the portal counts in Service History.
- Compare claimed amount to live Form 31 housing limit and any 25% retention shown.
- Confirm property will be in member/spouse/joint name.
- If service is short, wait or pick another eligible purpose.
- Refile once after fixing; avoid same-day spam.

## Required documents

- Service History / DOJ proof
- Self-declaration of housing purpose
- Property papers if office asks

## Who acts

member

## Prevention

- Check housing eligibility on claim screen before entering amount.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)
- [epfo-rr-053](./epfo-rr-053.md)
- [epfo-rr-025](./epfo-rr-025.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog, news, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Historical 5-year vs 2026 12-month: medium confidence on 2026 details; portal wins.

- https://cleartax.in/s/epf-form-31
- https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html
- https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-082",
  "rejection_reason": "Form 31 housing purchase/construction/plot advance ineligible or ownership/service not met",
  "aliases": [
    "Housing advance rejected",
    "Not eligible for house construction",
    "Plot purchase Form 31 rejected",
    "Insufficient service for housing withdrawal",
    "House/flat purchase purpose not allowed"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax/Axis Max Form-31 guides: housing (land/plot/house/flat purchase or construction) historically required about 5 years membership; property in member, spouse, or joint names; amount capped (e.g. 24x wages for site, 36x for house, or balance/cost whichever least). TaxGuru/KnowMoney 2025-26 reporting places Housing Needs under revised ~12-month membership and 25% retention — live portal controls. Composite Claim Forms circular allowed self-certification without utilization certificates for many housing advances.",
  "what_it_means": "A Form 31 housing claim fails when membership/service is short of the rule the portal applies, the amount exceeds the purpose cap, ownership is not member/spouse/joint, or housing was selected for another need. Plot vs construction vs ready flat have different historical limits. Scheme 2026 explainers describe a Housing Needs head with uniform 12 months and 25% retention; older FAQs cite 5 years. Remarks often say not eligible for the reason selected or insufficient member service.",
  "root_cause": "Wrong purpose; short DOJ-based service; amount above wage multiple or available balance after retention; property in parents name; duplicate housing advance where only one allowed.",
  "how_detected": "Portal purpose vs service length. Passbook balance vs claimed amount. Ownership declaration query.",
  "fix_steps": [
    "Confirm DOJ and membership months the portal counts in Service History.",
    "Compare claimed amount to live Form 31 housing limit and any 25% retention shown.",
    "Confirm property will be in member/spouse/joint name.",
    "If service is short, wait or pick another eligible purpose.",
    "Refile once after fixing; avoid same-day spam."
  ],
  "required_documents": [
    "Service History / DOJ proof",
    "Self-declaration of housing purpose",
    "Property papers if office asks"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Check housing eligibility on claim screen before entering amount."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-040",
    "epfo-rr-053",
    "epfo-rr-025"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "official",
    "blog",
    "news",
    "circular"
  ],
  "confidence": "high",
  "notes": "Historical 5-year vs 2026 12-month: medium confidence on 2026 details; portal wins.",
  "last_verified": "2026-09-12"
}
```
