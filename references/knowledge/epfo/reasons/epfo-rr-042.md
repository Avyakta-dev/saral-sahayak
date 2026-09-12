# Service history gaps, missing EPS months, or incomplete contribution record (epfo-rr-042)

> Dataset record `epfo-rr-042`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Service history gaps, missing EPS months, or incomplete contribution record

**Aliases:** Service record incomplete, EPS contribution not available, Non-contributory period, Missing service history, Gaps in contribution history

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 19 PF Final Settlement, Form 13 Transfer, Form 5IF EDLI Death Insurance
- **Severity:** high
- **Official/common message status:** Government reply on EPS rejections: contribution-related discrepancies, incorrect wage reporting, gaps in contribution history. Form 10D guides: non-contributory/absent periods can drop calculated service below 10 years.

## What it means

Pensionable service is not calendar time at the company; it is months with EPS contribution. Unpaid leave marked without contribution, missing ECR, and broken transfers create holes. Claims that need a service-length test (10C, 10D, some 31s, EDLI averages) then fail or underpay.

## Root cause

Employer default; wrong wage ceiling so EPS not deducted; untransferred old accounts; software not counting certain months.

## How it is detected

Passbook months vs tenure. Annexure K holes. 10D service engine.

## Fix

- Build a spreadsheet of tenure vs posted EPS months.
- Have employers file missing ECR/revised returns; use 3A correction where applicable.
- Transfer old accounts so history consolidates.
- For closed employers, submit appointment/payslip evidence to the Regional Office to reconstruct.
- Refile once the ledger matches reality.

## Required documents

- All passbooks
- Payslips
- Form 3A/ECR
- Appointment letters

## Who acts

mixed

## Prevention

- Reconcile passbook yearly.
- Transfer PF within months of switching jobs.

## Related records

- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-069](./epfo-rr-069.md)
- [epfo-rr-044](./epfo-rr-044.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, blog, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary (news / blog / forum)

- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- [news] https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- [news] https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- [blog] https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- [forum] https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/
- [news] https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-042",
  "rejection_reason": "Service history gaps, missing EPS months, or incomplete contribution record",
  "aliases": [
    "Service record incomplete",
    "EPS contribution not available",
    "Non-contributory period",
    "Missing service history",
    "Gaps in contribution history"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 19 PF Final Settlement",
    "Form 13 Transfer",
    "Form 5IF EDLI Death Insurance"
  ],
  "severity": "high",
  "official_status_or_message": "Government reply on EPS rejections: contribution-related discrepancies, incorrect wage reporting, gaps in contribution history. Form 10D guides: non-contributory/absent periods can drop calculated service below 10 years.",
  "what_it_means": "Pensionable service is not calendar time at the company; it is months with EPS contribution. Unpaid leave marked without contribution, missing ECR, and broken transfers create holes. Claims that need a service-length test (10C, 10D, some 31s, EDLI averages) then fail or underpay.",
  "root_cause": "Employer default; wrong wage ceiling so EPS not deducted; untransferred old accounts; software not counting certain months.",
  "how_detected": "Passbook months vs tenure. Annexure K holes. 10D service engine.",
  "fix_steps": [
    "Build a spreadsheet of tenure vs posted EPS months.",
    "Have employers file missing ECR/revised returns; use 3A correction where applicable.",
    "Transfer old accounts so history consolidates.",
    "For closed employers, submit appointment/payslip evidence to the Regional Office to reconstruct.",
    "Refile once the ledger matches reality."
  ],
  "required_documents": [
    "All passbooks",
    "Payslips",
    "Form 3A/ECR",
    "Appointment letters"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Reconcile passbook yearly.",
    "Transfer PF within months of switching jobs."
  ],
  "related_reason_ids": [
    "epfo-rr-029",
    "epfo-rr-037",
    "epfo-rr-069",
    "epfo-rr-044"
  ],
  "source_urls": [
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/",
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html"
  ],
  "source_types": [
    "news",
    "blog",
    "forum"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
