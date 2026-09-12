# Form 31 cut in wages / non-receipt of wages for two months advance rejected (epfo-rr-091)

> Dataset record `epfo-rr-091`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 cut in wages / non-receipt of wages for two months advance rejected

**Aliases:** Cut in wages advance rejected, Salary not received two months Form 31, Non receipt of wages PF advance, Establishment not paying wages advance rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** ClearTax Form 31 special cases: employee has not received salary for more than 2 months continuously — up to 100% employee share; reason other than strike. Factory closure without compensation is a sibling special case.

## What it means

Claims under cut-in-pay / unpaid wages fail when wages were actually paid, the gap is under two months, strike is the cause, employer will not certify, or the wrong special purpose was selected. Distinct from unemployment-after-exit because the member may still be on rolls.

## Root cause

Gap under 2 months; strike exclusion; missing employer certificate; wrong purpose.

## How it is detected

Purpose cut in wages / non-receipt of wages. Employer certificate on physical.

## Fix

- Use this purpose only if wages unpaid over 2 months continuously for a non-strike reason.
- Obtain employer certificate for physical paths when required.
- If factory closed over 15 days without compensation, use factory-closure purpose instead.
- Cap to employee share if that is the published limit.

## Required documents

- Employer certificate of non-payment
- Self-declaration
- Wage slips showing gap if asked

## Who acts

mixed

## Prevention

- Do not use unpaid-wages purpose for ordinary cash needs while paid regularly.

## Related records

- [epfo-rr-092](./epfo-rr-092.md)
- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/s/epf-form-31
- [blog] https://www.indiafilings.com/learn/epf-form-31
- [blog] https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- [blog] https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-091",
  "rejection_reason": "Form 31 cut in wages / non-receipt of wages for two months advance rejected",
  "aliases": [
    "Cut in wages advance rejected",
    "Salary not received two months Form 31",
    "Non receipt of wages PF advance",
    "Establishment not paying wages advance rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax Form 31 special cases: employee has not received salary for more than 2 months continuously — up to 100% employee share; reason other than strike. Factory closure without compensation is a sibling special case.",
  "what_it_means": "Claims under cut-in-pay / unpaid wages fail when wages were actually paid, the gap is under two months, strike is the cause, employer will not certify, or the wrong special purpose was selected. Distinct from unemployment-after-exit because the member may still be on rolls.",
  "root_cause": "Gap under 2 months; strike exclusion; missing employer certificate; wrong purpose.",
  "how_detected": "Purpose cut in wages / non-receipt of wages. Employer certificate on physical.",
  "fix_steps": [
    "Use this purpose only if wages unpaid over 2 months continuously for a non-strike reason.",
    "Obtain employer certificate for physical paths when required.",
    "If factory closed over 15 days without compensation, use factory-closure purpose instead.",
    "Cap to employee share if that is the published limit."
  ],
  "required_documents": [
    "Employer certificate of non-payment",
    "Self-declaration",
    "Wage slips showing gap if asked"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Do not use unpaid-wages purpose for ordinary cash needs while paid regularly."
  ],
  "related_reason_ids": [
    "epfo-rr-092",
    "epfo-rr-090",
    "epfo-rr-039",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026"
  ],
  "source_types": [
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
