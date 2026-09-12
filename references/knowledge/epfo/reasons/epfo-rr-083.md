# Form 31 housing loan repayment advance rejected (agency certificate / tenure / amount) (epfo-rr-083)

> Dataset record `epfo-rr-083`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 housing loan repayment advance rejected (agency certificate / tenure / amount)

**Aliases:** Home loan repayment Form 31 rejected, Housing loan outstanding certificate missing, Loan repayment advance not eligible, EMI repayment from PF rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax Form 31: loan repayment historically ~10 years membership; amount least of 36x wages+DA, EPF balance, or outstanding principal+interest; agency certificate. Axis Max and labour-law Form 31 PDF repeat agency certificate. Online self-cert may replace paper for some housing heads per CCF circular; RO may still query.

## What it means

Repaying a housing loan is distinct from purchase/construction. Claims fail when membership is under the applicable tenure, the lender is not an eligible agency, outstanding certificate is missing when asked, or amount exceeds outstanding/EPF caps. Selecting purchase instead of repayment changes eligibility.

## Root cause

Wrong housing sub-purpose; short service; informal lender; amount greater than outstanding.

## How it is detected

Purpose equals loan repayment. Query for agency certificate. Service length check.

## Fix

- Select repayment purpose exactly, not purchase/construction.
- Obtain outstanding principal+interest certificate from HFC/bank if RO asks.
- Cap claim to least of scheme limit, eligible balance, and outstanding.
- If membership short under live rule, wait or use another eligible head.

## Required documents

- Agency outstanding certificate
- Loan sanction letter if asked
- Service History

## Who acts

member

## Prevention

- Keep loan statements ready before repayment advances.

## Related records

- [epfo-rr-082](./epfo-rr-082.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Tenure figures vary by scheme edition; cite portal.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** Composite Claim Forms introduction circular 2016-17 — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[blog]** Axis Max Life: EPF Form 31 eligibility — https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- **[blog]** Labour Law Advisor: Form 31 advance rules PDF — https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- **[blog]** IndiaFilings: EPF Form 31 — https://www.indiafilings.com/learn/epf-form-31

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-083",
  "rejection_reason": "Form 31 housing loan repayment advance rejected (agency certificate / tenure / amount)",
  "aliases": [
    "Home loan repayment Form 31 rejected",
    "Housing loan outstanding certificate missing",
    "Loan repayment advance not eligible",
    "EMI repayment from PF rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax Form 31: loan repayment historically ~10 years membership; amount least of 36x wages+DA, EPF balance, or outstanding principal+interest; agency certificate. Axis Max and labour-law Form 31 PDF repeat agency certificate. Online self-cert may replace paper for some housing heads per CCF circular; RO may still query.",
  "what_it_means": "Repaying a housing loan is distinct from purchase/construction. Claims fail when membership is under the applicable tenure, the lender is not an eligible agency, outstanding certificate is missing when asked, or amount exceeds outstanding/EPF caps. Selecting purchase instead of repayment changes eligibility.",
  "root_cause": "Wrong housing sub-purpose; short service; informal lender; amount greater than outstanding.",
  "how_detected": "Purpose equals loan repayment. Query for agency certificate. Service length check.",
  "fix_steps": [
    "Select repayment purpose exactly, not purchase/construction.",
    "Obtain outstanding principal+interest certificate from HFC/bank if RO asks.",
    "Cap claim to least of scheme limit, eligible balance, and outstanding.",
    "If membership short under live rule, wait or use another eligible head."
  ],
  "required_documents": [
    "Agency outstanding certificate",
    "Loan sanction letter if asked",
    "Service History"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep loan statements ready before repayment advances."
  ],
  "related_reason_ids": [
    "epfo-rr-082",
    "epfo-rr-039",
    "epfo-rr-040",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf"
  ],
  "source_types": [
    "blog",
    "circular"
  ],
  "confidence": "high",
  "notes": "Tenure figures vary by scheme edition; cite portal.",
  "last_verified": "2026-09-12"
}
```
