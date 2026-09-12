# Form 31 marriage advance ineligible (service, relationship, frequency, or amount) (epfo-rr-085)

> Dataset record `epfo-rr-085`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 marriage advance ineligible (service, relationship, frequency, or amount)

**Aliases:** Marriage advance rejected, Not eligible for marriage withdrawal, Sister/daughter marriage Form 31 rejected, Marriage purpose claim limit exceeded

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax/Axis Max: marriage of self/son/daughter/brother/sister; historically ~7 years membership and up to 50% employee share; limited times. TaxGuru/KnowMoney: after Oct 2025 CBT, marriage withdrawals reported up to 5 times under Essential Needs with ~12 months service. CCF circular: no marriage card required; self-certification suffices for online/CCF Aadhaar paths.

## What it means

Marriage advances fail when membership is short, relationship is outside the scheme list, frequency caps are exhausted, amount exceeds employee-share percentage or newer Essential Needs cap, or marriage was selected only to unlock cash. Portal may say not eligible for the reason selected or insufficient member service.

## Root cause

Short service; wrong relative; frequency exhausted; amount too high; fake purpose.

## How it is detected

Purpose marriage. Service months. Prior marriage-advance count.

## Fix

- Confirm marriage is of self, child, or sibling as allowed.
- Check membership months against live rule (historical 7 years vs reported 12 months).
- Limit amount to portal max; keep retention if shown.
- Self-certify honestly; attach marriage card only if asked.
- If frequency exhausted, stop refiling same purpose.

## Required documents

- Self-declaration in Form 31
- Service History
- Prior claim list

## Who acts

member

## Prevention

- Count prior marriage advances before applying again.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)
- [epfo-rr-086](./epfo-rr-086.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Frequency 3 vs 5 and tenure 7y vs 12m: medium on 2026; portal wins.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** Composite Claim Forms introduction circular 2016-17 — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[blog]** Axis Max Life: EPF Form 31 eligibility — https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- **[news]** TaxGuru: EPFO PF withdrawal rules / why claims rejected (2026) — https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html
- **[blog]** KnowMoney: EPFO 3.0 withdrawal rules 2026 — https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026
- **[blog]** Shriram Life: Form 31 rules 2026 — https://www.shriramlife.com/blog/advice/form-31-in-epfo

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-085",
  "rejection_reason": "Form 31 marriage advance ineligible (service, relationship, frequency, or amount)",
  "aliases": [
    "Marriage advance rejected",
    "Not eligible for marriage withdrawal",
    "Sister/daughter marriage Form 31 rejected",
    "Marriage purpose claim limit exceeded"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax/Axis Max: marriage of self/son/daughter/brother/sister; historically ~7 years membership and up to 50% employee share; limited times. TaxGuru/KnowMoney: after Oct 2025 CBT, marriage withdrawals reported up to 5 times under Essential Needs with ~12 months service. CCF circular: no marriage card required; self-certification suffices for online/CCF Aadhaar paths.",
  "what_it_means": "Marriage advances fail when membership is short, relationship is outside the scheme list, frequency caps are exhausted, amount exceeds employee-share percentage or newer Essential Needs cap, or marriage was selected only to unlock cash. Portal may say not eligible for the reason selected or insufficient member service.",
  "root_cause": "Short service; wrong relative; frequency exhausted; amount too high; fake purpose.",
  "how_detected": "Purpose marriage. Service months. Prior marriage-advance count.",
  "fix_steps": [
    "Confirm marriage is of self, child, or sibling as allowed.",
    "Check membership months against live rule (historical 7 years vs reported 12 months).",
    "Limit amount to portal max; keep retention if shown.",
    "Self-certify honestly; attach marriage card only if asked.",
    "If frequency exhausted, stop refiling same purpose."
  ],
  "required_documents": [
    "Self-declaration in Form 31",
    "Service History",
    "Prior claim list"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Count prior marriage advances before applying again."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-040",
    "epfo-rr-086",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://www.shriramlife.com/blog/advice/form-31-in-epfo"
  ],
  "source_types": [
    "blog",
    "news",
    "circular"
  ],
  "confidence": "high",
  "notes": "Frequency 3 vs 5 and tenure 7y vs 12m: medium on 2026; portal wins.",
  "last_verified": "2026-09-12"
}
```
