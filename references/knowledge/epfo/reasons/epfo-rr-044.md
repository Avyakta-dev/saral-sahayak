# Form 11 / EPS membership status discrepancy (EPS enrolled vs not enrolled) (epfo-rr-044)

> Dataset record `epfo-rr-044`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 11 / EPS membership status discrepancy (EPS enrolled vs not enrolled)

**Aliases:** EPS discrepancy, Form 11 error, Pension contribution mismatch, EPS membership status mismatch, Salary above 15000 at joining so no EPS

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 19 PF Final Settlement, Form 13 Transfer
- **Severity:** high
- **Official/common message status:** FinRight: Form 11 asks EPS membership; wrong status creates mismatch. New joiners with pay above the statutory pensionable wage ceiling at first covered employment may not have been enrolled in EPS (historical Rs 15,000 ceiling — confirm current ceiling). Passbook without EPS column vs a 10C claim is a typical fail.

## What it means

Not every EPF member is an EPS member. If Form 11 said 'existing EPS member' incorrectly, or the employer deducted EPS when they should not (or vice versa), the claim engine sees 'pension contribution mismatch'. High-salary joiners who never had EPS cannot file 10C/10D. Conversely, people who had EPS at a first low-wage job remain EPS members later.

## Root cause

Wrong Form 11 tick; wage-ceiling confusion; employer deducted only EPF 12%+3.67% without 8.33% EPS or the opposite.

## How it is detected

Form 11 vs first passbook EPS line. Claim 10C with zero EPS. 10D with no pensionable service.

## Fix

- Inspect the earliest passbook: is there an EPS/pension contribution column?
- Read the first offer letter wage vs the EPS wage ceiling then in force.
- If the ledger is wrong, employer must file ECR/3A correction, not the member via a claim.
- If you were never in EPS, do not file 10C/10D; file Form 19 only.
- If you were in EPS but a later employer stopped EPS wrongly, get that corrected for pension service.

## Required documents

- Form 11 copies
- First and subsequent passbooks
- Offer letters / wage proofs

## Who acts

mixed

## Prevention

- Fill Form 11 with the old UAN and honest EPS-member answer.
- Look at month-1 passbook immediately.

## Related records

- [epfo-rr-035](./epfo-rr-035.md)
- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-042](./epfo-rr-042.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, forum, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Wage ceiling and Form 11 logic are standard EPF practice; exact current ceiling should be verified on epfindia. No invented Form 11 'error code'.

- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://cleartax.in/c/pf-withdrawal-online

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-044",
  "rejection_reason": "Form 11 / EPS membership status discrepancy (EPS enrolled vs not enrolled)",
  "aliases": [
    "EPS discrepancy",
    "Form 11 error",
    "Pension contribution mismatch",
    "EPS membership status mismatch",
    "Salary above 15000 at joining so no EPS"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 19 PF Final Settlement",
    "Form 13 Transfer"
  ],
  "severity": "high",
  "official_status_or_message": "FinRight: Form 11 asks EPS membership; wrong status creates mismatch. New joiners with pay above the statutory pensionable wage ceiling at first covered employment may not have been enrolled in EPS (historical Rs 15,000 ceiling — confirm current ceiling). Passbook without EPS column vs a 10C claim is a typical fail.",
  "what_it_means": "Not every EPF member is an EPS member. If Form 11 said 'existing EPS member' incorrectly, or the employer deducted EPS when they should not (or vice versa), the claim engine sees 'pension contribution mismatch'. High-salary joiners who never had EPS cannot file 10C/10D. Conversely, people who had EPS at a first low-wage job remain EPS members later.",
  "root_cause": "Wrong Form 11 tick; wage-ceiling confusion; employer deducted only EPF 12%+3.67% without 8.33% EPS or the opposite.",
  "how_detected": "Form 11 vs first passbook EPS line. Claim 10C with zero EPS. 10D with no pensionable service.",
  "fix_steps": [
    "Inspect the earliest passbook: is there an EPS/pension contribution column?",
    "Read the first offer letter wage vs the EPS wage ceiling then in force.",
    "If the ledger is wrong, employer must file ECR/3A correction, not the member via a claim.",
    "If you were never in EPS, do not file 10C/10D; file Form 19 only.",
    "If you were in EPS but a later employer stopped EPS wrongly, get that corrected for pension service."
  ],
  "required_documents": [
    "Form 11 copies",
    "First and subsequent passbooks",
    "Offer letters / wage proofs"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Fill Form 11 with the old UAN and honest EPS-member answer.",
    "Look at month-1 passbook immediately."
  ],
  "related_reason_ids": [
    "epfo-rr-035",
    "epfo-rr-036",
    "epfo-rr-042"
  ],
  "source_urls": [
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "blog",
    "forum",
    "official"
  ],
  "confidence": "medium",
  "notes": "Wage ceiling and Form 11 logic are standard EPF practice; exact current ceiling should be verified on epfindia. No invented Form 11 'error code'.",
  "last_verified": "2026-09-12"
}
```
