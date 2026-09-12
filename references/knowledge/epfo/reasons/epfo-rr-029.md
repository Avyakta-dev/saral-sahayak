# Employer PF/EPS contribution not deposited or ECR not filed for relevant months (epfo-rr-029)

> Dataset record `epfo-rr-029`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer PF/EPS contribution not deposited or ECR not filed for relevant months

**Aliases:** Employer contribution pending, ECR not filed, Missing PF deposits, Contribution discrepancy, EPS contribution not available, Contribution not remitted, ECR not filed claim held, PF dues pending employer

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 5IF EDLI Death Insurance, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** MoS Labour reply (reported 2025–26): pension/claim rejections include irregularities in employer contributions, incorrect wage reporting, and gaps in contribution history. Reddit/practitioner reports also cite 'EPS contribution not available'.

## What it means

The passbook is the member's evidence of dues. If the employer deducted PF from salary but did not file ECR or pay, the claimed amount will not match EPFO's ledger. Pensionable service can fall below 10 years because months without EPS contribution do not count. EDLI calculations that use 12-month average wages also break. EPFO may reject or settle only the posted amount.

## Root cause

Employer default; contractor establishment not covered correctly; wage ceiling misreporting; months marked absent incorrectly.

## How it is detected

Member passbook gaps. Claim amount vs ledger. Inspection. Form 10D service <10 years unexpectedly.

## Fix

- Download month-wise passbook for every member ID and mark missing months.
- Write to HR/payroll demanding ECR filing and payment of arrears with interest/damages as applicable.
- If employer does not pay, file EPFiGMS and a complaint with the Regional PF Commissioner (enforcement), attaching payslips showing deduction.
- Do not expect a claim to create the missing contribution; the ledger must be funded first.
- After postings appear, refile.

## Required documents

- Payslips showing PF deduction
- Passbook screenshots of gaps
- Appointment letter
- Bank salary credits

## Who acts

mixed

## Prevention

- Check passbook every quarter.
- Treat missing ECR as a statutory default, not a 'portal glitch'.

## Related records

- [epfo-rr-042](./epfo-rr-042.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-067](./epfo-rr-067.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, blog, forum, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Government reply summarised by Outlook/Financial Express/ET Now. No invented circular number for the parliamentary reply.

- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/
- https://epfigms.gov.in/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-029",
  "rejection_reason": "Employer PF/EPS contribution not deposited or ECR not filed for relevant months",
  "aliases": [
    "Employer contribution pending",
    "ECR not filed",
    "Missing PF deposits",
    "Contribution discrepancy",
    "EPS contribution not available",
    "Contribution not remitted",
    "ECR not filed claim held",
    "PF dues pending employer"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 5IF EDLI Death Insurance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "MoS Labour reply (reported 2025–26): pension/claim rejections include irregularities in employer contributions, incorrect wage reporting, and gaps in contribution history. Reddit/practitioner reports also cite 'EPS contribution not available'.",
  "what_it_means": "The passbook is the member's evidence of dues. If the employer deducted PF from salary but did not file ECR or pay, the claimed amount will not match EPFO's ledger. Pensionable service can fall below 10 years because months without EPS contribution do not count. EDLI calculations that use 12-month average wages also break. EPFO may reject or settle only the posted amount.",
  "root_cause": "Employer default; contractor establishment not covered correctly; wage ceiling misreporting; months marked absent incorrectly.",
  "how_detected": "Member passbook gaps. Claim amount vs ledger. Inspection. Form 10D service <10 years unexpectedly.",
  "fix_steps": [
    "Download month-wise passbook for every member ID and mark missing months.",
    "Write to HR/payroll demanding ECR filing and payment of arrears with interest/damages as applicable.",
    "If employer does not pay, file EPFiGMS and a complaint with the Regional PF Commissioner (enforcement), attaching payslips showing deduction.",
    "Do not expect a claim to create the missing contribution; the ledger must be funded first.",
    "After postings appear, refile."
  ],
  "required_documents": [
    "Payslips showing PF deduction",
    "Passbook screenshots of gaps",
    "Appointment letter",
    "Bank salary credits"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Check passbook every quarter.",
    "Treat missing ECR as a statutory default, not a 'portal glitch'."
  ],
  "related_reason_ids": [
    "epfo-rr-042",
    "epfo-rr-037",
    "epfo-rr-067"
  ],
  "source_urls": [
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/",
    "https://epfigms.gov.in/"
  ],
  "source_types": [
    "news",
    "blog",
    "forum",
    "official"
  ],
  "confidence": "high",
  "notes": "Government reply summarised by Outlook/Financial Express/ET Now. No invented circular number for the parliamentary reply.",
  "last_verified": "2026-09-12"
}
```
