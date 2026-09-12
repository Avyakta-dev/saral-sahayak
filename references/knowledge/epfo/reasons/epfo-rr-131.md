# Form 31 housing plot/site purchase rejected separately from construction (ownership or cost cap) (epfo-rr-131)

> Dataset record `epfo-rr-131`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 housing plot/site purchase rejected separately from construction (ownership or cost cap)

**Aliases:** Site purchase Form 31 rejected, Plot purchase advance not eligible, Land acquisition PF advance rejected, Dwelling site Form 31 insufficient service

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** ClearTax/labour-law Form 31 tables give different caps for site/plot (often 24x wages) vs house construction/purchase (often 36x). Ownership must be member/spouse/joint.

## What it means

Members treat plot and construction as identical. Plot claims fail on the tighter cap, missing site declaration, or non-dwelling land. Distinct amount/doc path from construction row epfo-rr-082.

## Root cause

Amount using construction cap for plot; non-residential land; ownership; short service.

## How it is detected

Purpose site/plot purchase. Amount vs 24x style cap.

## Fix

- Select site/plot purpose if buying land only.
- Cap amount to site limit not construction limit.
- Ensure site will be used for dwelling and ownership rules met.
- If constructing immediately, follow construction purpose rules instead.

## Required documents

- Self-declaration
- Site documents if asked
- Service History

## Who acts

member

## Prevention

- Do not enter construction amount on a plot purpose.

## Related records

- [epfo-rr-082](./epfo-rr-082.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** Composite Claim Forms introduction circular 2016-17 — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[blog]** Labour Law Advisor: Form 31 advance rules PDF — https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- **[blog]** Axis Max Life: EPF Form 31 eligibility — https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-131",
  "rejection_reason": "Form 31 housing plot/site purchase rejected separately from construction (ownership or cost cap)",
  "aliases": [
    "Site purchase Form 31 rejected",
    "Plot purchase advance not eligible",
    "Land acquisition PF advance rejected",
    "Dwelling site Form 31 insufficient service"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax/labour-law Form 31 tables give different caps for site/plot (often 24x wages) vs house construction/purchase (often 36x). Ownership must be member/spouse/joint.",
  "what_it_means": "Members treat plot and construction as identical. Plot claims fail on the tighter cap, missing site declaration, or non-dwelling land. Distinct amount/doc path from construction row epfo-rr-082.",
  "root_cause": "Amount using construction cap for plot; non-residential land; ownership; short service.",
  "how_detected": "Purpose site/plot purchase. Amount vs 24x style cap.",
  "fix_steps": [
    "Select site/plot purpose if buying land only.",
    "Cap amount to site limit not construction limit.",
    "Ensure site will be used for dwelling and ownership rules met.",
    "If constructing immediately, follow construction purpose rules instead."
  ],
  "required_documents": [
    "Self-declaration",
    "Site documents if asked",
    "Service History"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Do not enter construction amount on a plot purpose."
  ],
  "related_reason_ids": [
    "epfo-rr-082",
    "epfo-rr-039",
    "epfo-rr-040"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf"
  ],
  "source_types": [
    "blog",
    "circular"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
