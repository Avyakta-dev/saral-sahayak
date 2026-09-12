# Form 14 financing of LIC policy rejected (eligibility, insurer, or balance) (epfo-rr-099)

> Dataset record `epfo-rr-099`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 14 financing of LIC policy rejected (eligibility, insurer, or balance)

**Aliases:** Form 14 rejected, LIC premium from PF not allowed, Finance insurance policy EPFO rejected, LIC policy financing from EPF failed

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 14 Financing of Life Insurance Policy, Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** News18/Mint/Zee: facility to finance LIC (not private insurers) from EPF via Form 14; typically need sufficient balance (often cited as about 2 years premium), policy in member own name, minimum membership (about 2 years in Zee explainer), annual premium mode; KYC must be in order.

## What it means

Form 14 is not a normal Form 31 cash-out. Rejections when policy is not LIC, policy in spouse name, EPF balance cannot cover required premium financing, membership short, or KYC/bank blocks remittance to LIC.

## Root cause

Non-LIC policy; third-party policy; insufficient PF; KYC failure; wrong form channel.

## How it is detected

Form 14 / LIC seeding flow errors. RO objection on insurer/balance.

## Fix

- Confirm policy is LIC and in your own name.
- Ensure EPF balance meets financing condition in EPFO/LIC instructions.
- Complete UAN KYC before submission.
- Submit Form 14 through prescribed process; do not expect ordinary Form 31 medical purpose to pay LIC premiums.

## Required documents

- LIC policy details
- Form 14
- KYC verified screenshots
- Premium due statement

## Who acts

member

## Prevention

- Use only as last resort; EPF is retirement savings.

## Related records

- [epfo-rr-015](./epfo-rr-015.md)
- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-043](./epfo-rr-043.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Secondary news summaries of scheme facility; confirm live Form 14 instructions on epfindia.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO official website — https://www.epfindia.gov.in

### Secondary reporting (news, blog, forum)

- **[news]** News18: Form 14 LIC premium from EPF — https://www.news18.com/business/savings-and-investments/no-money-for-lic-premium-epfo-lets-you-pay-it-directly-from-your-pf-account-ws-kl-9810317.html
- **[news]** Mint: EPFO members can pay LIC premium using EPF — https://www.livemint.com/money/personal-finance/epfo-members-can-pay-lic-premium-using-epf-money-details-here-11645255082822.html
- **[news]** Zee: finance LIC policy from PF / Form 14 — https://zeenews.india.com/photos/business/did-you-know-epfo-allows-you-to-finance-your-lic-policy-for-2-years-eligibility-money-amount-and-other-details-explained-2950269

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-099",
  "rejection_reason": "Form 14 financing of LIC policy rejected (eligibility, insurer, or balance)",
  "aliases": [
    "Form 14 rejected",
    "LIC premium from PF not allowed",
    "Finance insurance policy EPFO rejected",
    "LIC policy financing from EPF failed"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 14 Financing of Life Insurance Policy",
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "News18/Mint/Zee: facility to finance LIC (not private insurers) from EPF via Form 14; typically need sufficient balance (often cited as about 2 years premium), policy in member own name, minimum membership (about 2 years in Zee explainer), annual premium mode; KYC must be in order.",
  "what_it_means": "Form 14 is not a normal Form 31 cash-out. Rejections when policy is not LIC, policy in spouse name, EPF balance cannot cover required premium financing, membership short, or KYC/bank blocks remittance to LIC.",
  "root_cause": "Non-LIC policy; third-party policy; insufficient PF; KYC failure; wrong form channel.",
  "how_detected": "Form 14 / LIC seeding flow errors. RO objection on insurer/balance.",
  "fix_steps": [
    "Confirm policy is LIC and in your own name.",
    "Ensure EPF balance meets financing condition in EPFO/LIC instructions.",
    "Complete UAN KYC before submission.",
    "Submit Form 14 through prescribed process; do not expect ordinary Form 31 medical purpose to pay LIC premiums."
  ],
  "required_documents": [
    "LIC policy details",
    "Form 14",
    "KYC verified screenshots",
    "Premium due statement"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Use only as last resort; EPF is retirement savings."
  ],
  "related_reason_ids": [
    "epfo-rr-015",
    "epfo-rr-005",
    "epfo-rr-043"
  ],
  "source_urls": [
    "https://www.news18.com/business/savings-and-investments/no-money-for-lic-premium-epfo-lets-you-pay-it-directly-from-your-pf-account-ws-kl-9810317.html",
    "https://www.livemint.com/money/personal-finance/epfo-members-can-pay-lic-premium-using-epf-money-details-here-11645255082822.html",
    "https://zeenews.india.com/photos/business/did-you-know-epfo-allows-you-to-finance-your-lic-policy-for-2-years-eligibility-money-amount-and-other-details-explained-2950269",
    "https://www.epfindia.gov.in"
  ],
  "source_types": [
    "news",
    "official"
  ],
  "confidence": "medium",
  "notes": "Secondary news summaries of scheme facility; confirm live Form 14 instructions on epfindia.",
  "last_verified": "2026-09-12"
}
```
