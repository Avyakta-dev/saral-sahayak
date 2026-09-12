# Form 31 Special Circumstances purpose used without meeting unemployment/calamity/closure conditions (epfo-rr-121)

> Dataset record `epfo-rr-121`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 Special Circumstances purpose used without meeting unemployment/calamity/closure conditions

**Aliases:** Special circumstances advance rejected, Special circumstances without reason still rejected, Wrong special circumstances claim, Essential vs special circumstances mix-up

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** TaxGuru/KnowMoney on Oct 2025 CBT / EPFO 3.0: withdrawals grouped into Essential Needs, Housing Needs, and Special Circumstances; special circumstances reportedly eased documentation but still cover unemployment, calamity, lockout-type events. 25% retention still applies in explainers.

## What it means

Members pick Special Circumstances hoping for no-questions cash while still employed with regular wages and no calamity/closure. Claims reject for ineligibility/service/balance.

## Root cause

Misuse of special head; still contributing; amount breaches retention; service under 12 months.

## How it is detected

Purpose Special Circumstances. Remark not eligible / insufficient service / amount.

## Fix

- Read live help text for what Special Circumstances covers.
- If you need medical/marriage/education/housing, use those heads instead.
- If truly unemployed/calamity/closure, ensure DOE/facts match.
- Respect 25% retention and amount caps shown.

## Required documents

- Service History
- Purpose help-text screenshot
- Passbook eligible amount

## Who acts

member

## Prevention

- Do not treat Special Circumstances as undocumented ATM.

## Related records

- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-088](./epfo-rr-088.md)
- [epfo-rr-092](./epfo-rr-092.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 2026 three-head framework from secondary reporting; portal wins.

- https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html
- https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026
- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://cleartax.in/s/epf-form-31
- https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-121",
  "rejection_reason": "Form 31 Special Circumstances purpose used without meeting unemployment/calamity/closure conditions",
  "aliases": [
    "Special circumstances advance rejected",
    "Special circumstances without reason still rejected",
    "Wrong special circumstances claim",
    "Essential vs special circumstances mix-up"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "TaxGuru/KnowMoney on Oct 2025 CBT / EPFO 3.0: withdrawals grouped into Essential Needs, Housing Needs, and Special Circumstances; special circumstances reportedly eased documentation but still cover unemployment, calamity, lockout-type events. 25% retention still applies in explainers.",
  "what_it_means": "Members pick Special Circumstances hoping for no-questions cash while still employed with regular wages and no calamity/closure. Claims reject for ineligibility/service/balance.",
  "root_cause": "Misuse of special head; still contributing; amount breaches retention; service under 12 months.",
  "how_detected": "Purpose Special Circumstances. Remark not eligible / insufficient service / amount.",
  "fix_steps": [
    "Read live help text for what Special Circumstances covers.",
    "If you need medical/marriage/education/housing, use those heads instead.",
    "If truly unemployed/calamity/closure, ensure DOE/facts match.",
    "Respect 25% retention and amount caps shown."
  ],
  "required_documents": [
    "Service History",
    "Purpose help-text screenshot",
    "Passbook eligible amount"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Do not treat Special Circumstances as undocumented ATM."
  ],
  "related_reason_ids": [
    "epfo-rr-090",
    "epfo-rr-088",
    "epfo-rr-092",
    "epfo-rr-039",
    "epfo-rr-040"
  ],
  "source_urls": [
    "https://taxguru.in/corporate-law/epfos-pf-withdrawal-rules-claims-rejected.html",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://cleartax.in/s/epf-form-31",
    "https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1"
  ],
  "source_types": [
    "news",
    "blog"
  ],
  "confidence": "medium",
  "notes": "2026 three-head framework from secondary reporting; portal wins.",
  "last_verified": "2026-09-12"
}
```
