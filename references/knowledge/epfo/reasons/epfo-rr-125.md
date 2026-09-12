# One-year continuous unemployment full-withdrawal expectation filed on wrong Form 31 purpose (epfo-rr-125)

> Dataset record `epfo-rr-125`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** One-year continuous unemployment full-withdrawal expectation filed on wrong Form 31 purpose

**Aliases:** One year continuous unemployment PF, Unemployed one year still Form 31 rejected, Full PF after one year unemployment wrong form, Non contributory period one year claim

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Form 19 PF Final Settlement, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** ClearTax and Bajaj discuss unemployment-linked full or large withdrawals via Form 19 after waiting rules; Form 31 has shorter unemployment advances. Members often conflate one-year unemployment folklore with a Form 31 purpose.

## What it means

Member remains on Form 31 expecting 100% after one year unemployment while the correct product is Form 19 after its conditions, or a specific unemployment advance with its own caps.

## Root cause

Wrong form; folklore one-year rule; DOE/waiting not met for Form 19.

## How it is detected

Purpose unemployment on Form 31 while seeking full corpus.

## Fix

- If seeking full EPF settlement after exit, use Form 19 when eligible.
- If using Form 31 unemployment advance, accept its amount caps and waiting days.
- Confirm DOE and contribution stoppage.
- Read live portal text for unemployment products.

## Required documents

- Service History with DOE
- Passbook
- Form selection screenshot

## Who acts

member

## Prevention

- Separate advance vs final settlement mentally before filing.

## Related records

- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-033](./epfo-rr-033.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-034](./epfo-rr-034.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** One-year folklore varies; rely on portal/Form 19 rules.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[blog]** Bajaj Finserv: EPF withdrawal rules — https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules
- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- **[blog]** Jagran Josh: EPF Scheme 2026 3-day settlement — https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-125",
  "rejection_reason": "One-year continuous unemployment full-withdrawal expectation filed on wrong Form 31 purpose",
  "aliases": [
    "One year continuous unemployment PF",
    "Unemployed one year still Form 31 rejected",
    "Full PF after one year unemployment wrong form",
    "Non contributory period one year claim"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Form 19 PF Final Settlement",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax and Bajaj discuss unemployment-linked full or large withdrawals via Form 19 after waiting rules; Form 31 has shorter unemployment advances. Members often conflate one-year unemployment folklore with a Form 31 purpose.",
  "what_it_means": "Member remains on Form 31 expecting 100% after one year unemployment while the correct product is Form 19 after its conditions, or a specific unemployment advance with its own caps.",
  "root_cause": "Wrong form; folklore one-year rule; DOE/waiting not met for Form 19.",
  "how_detected": "Purpose unemployment on Form 31 while seeking full corpus.",
  "fix_steps": [
    "If seeking full EPF settlement after exit, use Form 19 when eligible.",
    "If using Form 31 unemployment advance, accept its amount caps and waiting days.",
    "Confirm DOE and contribution stoppage.",
    "Read live portal text for unemployment products."
  ],
  "required_documents": [
    "Service History with DOE",
    "Passbook",
    "Form selection screenshot"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Separate advance vs final settlement mentally before filing."
  ],
  "related_reason_ids": [
    "epfo-rr-090",
    "epfo-rr-033",
    "epfo-rr-043",
    "epfo-rr-034"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "medium",
  "notes": "One-year folklore varies; rely on portal/Form 19 rules.",
  "last_verified": "2026-09-12"
}
```
