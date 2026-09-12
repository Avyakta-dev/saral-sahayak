# Form 31 advance purpose ineligible or minimum membership/service not met (epfo-rr-039)

> Dataset record `epfo-rr-039`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 advance purpose ineligible or minimum membership/service not met

**Aliases:** Not eligible for the reason selected, Form 31 purpose mismatch, Insufficient service for advance, 12 months membership not completed, Wrong withdrawal reason, Wrong reason selected in Form 31, Insufficient member service for advance, SMS: Not eligible for selected purpose

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** OCS FAQ Q5: Date of Joining should be available for Form 31. Historically, purposes had different service locks (e.g. longer waits for housing/marriage). EPF Scheme 2026 reporting (from 29 June 2026) describes a uniform 12-month membership for partial withdrawals grouped as Essential Needs, Housing Needs, and Special Circumstances. Older articles still mention 5–7 years for house/marriage. Live portal purpose list and eligibility flags control the claim.

## What it means

Form 31 is purpose-constrained. Selecting 'purchase of house' without enough membership, or 'lockdown/unemployment' while still on payroll, or education without eligible dependants, leads to rejection even if KYC is perfect. Under 2026 explainers, all partial categories need 12 months' membership and the portal calculates eligible amount including a 25% retention. Using Form 31 as a workaround for Form 19 while employed also fails.

## Root cause

Wrong purpose code; service below threshold; DOJ missing; selecting a purpose that requires documents the member cannot support.

## How it is detected

Claim dropdown eligibility. Remark: not eligible for reason selected. Amount vs limit.

## Fix

- Open Proceed for Online Claim and read which Form 31 purposes the portal enables for your UAN — disabled rows mean ineligible.
- Confirm DOJ and total membership months.
- Pick the purpose that matches facts (medical vs housing vs marriage vs special circumstances).
- Do not exceed the amount the portal computes.
- If you have left employment, use Form 19 rather than a fake Form 31 purpose.
- If Scheme 2026 changed a threshold, follow the portal, not a 2017 blog.

## Required documents

- Service History with DOJ
- Purpose-specific self-certification or proofs if asked
- KYC verified

## Who acts

member

## Prevention

- Read the purpose description before clicking.
- Keep 12 months' contributions posted before planning an advance.

## Related records

- [epfo-rr-040](./epfo-rr-040.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-025](./epfo-rr-025.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Pre-2026 purpose-wise service years varied; 2026 uniform 12-month rule is secondary-sourced. Confidence medium on exact 2026 purpose codes because official gazette text was not independently fetched (epfindia 403). Do not invent purpose codes. Offline review flag: withhold definitive 12-month/purpose-code entitlement until an authoritative current instrument is reviewed.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online
- **[blog]** TaxBuddy: Form 31 partial withdrawal — https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31
- **[blog]** Shriram Life: Form 31 rules 2026 — https://www.shriramlife.com/blog/advice/form-31-in-epfo
- **[blog]** Jagran Josh: EPF Scheme 2026 3-day settlement — https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1
- **[blog]** Kustodian: EPF Scheme 2026 withdrawal rules — https://kustodian.life/resources/provident-fund/epf-scheme-2026-withdrawal-rules-changed
- **[blog]** PensionBazaar: EPF withdrawal rules 2026 — https://www.pensionbazaar.com/epf/epf-withdrawal-rules/
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-039",
  "rejection_reason": "Form 31 advance purpose ineligible or minimum membership/service not met",
  "aliases": [
    "Not eligible for the reason selected",
    "Form 31 purpose mismatch",
    "Insufficient service for advance",
    "12 months membership not completed",
    "Wrong withdrawal reason",
    "Wrong reason selected in Form 31",
    "Insufficient member service for advance",
    "SMS: Not eligible for selected purpose"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "OCS FAQ Q5: Date of Joining should be available for Form 31. Historically, purposes had different service locks (e.g. longer waits for housing/marriage). EPF Scheme 2026 reporting (from 29 June 2026) describes a uniform 12-month membership for partial withdrawals grouped as Essential Needs, Housing Needs, and Special Circumstances. Older articles still mention 5–7 years for house/marriage. Live portal purpose list and eligibility flags control the claim.",
  "what_it_means": "Form 31 is purpose-constrained. Selecting 'purchase of house' without enough membership, or 'lockdown/unemployment' while still on payroll, or education without eligible dependants, leads to rejection even if KYC is perfect. Under 2026 explainers, all partial categories need 12 months' membership and the portal calculates eligible amount including a 25% retention. Using Form 31 as a workaround for Form 19 while employed also fails.",
  "root_cause": "Wrong purpose code; service below threshold; DOJ missing; selecting a purpose that requires documents the member cannot support.",
  "how_detected": "Claim dropdown eligibility. Remark: not eligible for reason selected. Amount vs limit.",
  "fix_steps": [
    "Open Proceed for Online Claim and read which Form 31 purposes the portal enables for your UAN — disabled rows mean ineligible.",
    "Confirm DOJ and total membership months.",
    "Pick the purpose that matches facts (medical vs housing vs marriage vs special circumstances).",
    "Do not exceed the amount the portal computes.",
    "If you have left employment, use Form 19 rather than a fake Form 31 purpose.",
    "If Scheme 2026 changed a threshold, follow the portal, not a 2017 blog."
  ],
  "required_documents": [
    "Service History with DOJ",
    "Purpose-specific self-certification or proofs if asked",
    "KYC verified"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Read the purpose description before clicking.",
    "Keep 12 months' contributions posted before planning an advance."
  ],
  "related_reason_ids": [
    "epfo-rr-040",
    "epfo-rr-043",
    "epfo-rr-025",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31",
    "https://www.shriramlife.com/blog/advice/form-31-in-epfo",
    "https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1",
    "https://kustodian.life/resources/provident-fund/epf-scheme-2026-withdrawal-rules-changed",
    "https://www.pensionbazaar.com/epf/epf-withdrawal-rules/",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "medium",
  "notes": "Pre-2026 purpose-wise service years varied; 2026 uniform 12-month rule is secondary-sourced. Confidence medium on exact 2026 purpose codes because official gazette text was not independently fetched (epfindia 403). Do not invent purpose codes. Offline review flag: withhold definitive 12-month/purpose-code entitlement until an authoritative current instrument is reviewed.",
  "last_verified": "2026-09-12"
}
```
