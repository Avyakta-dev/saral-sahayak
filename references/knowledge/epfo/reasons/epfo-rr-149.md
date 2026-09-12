# ECR revised or supplementary return filed after claim submission altering service or contribution data (epfo-rr-149)

> Dataset record `epfo-rr-149`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** ECR revised or supplementary return filed after claim submission altering service or contribution data

**Aliases:** ECR revision after claim, Supplementary ECR claim rejected, Contribution corrected post claim, Employer revised return claim hold, Re-filed ECR mismatch claim

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Employers sometimes revise ECR after a member claims — adding late contributions, correcting wages, or reversing rows. Backend revalidation then rejects or returns the claim for contribution-after-exit, amount mismatch, or service change (related to 097/098).

## What it means

The claim was valid on old data; new ECR changes eligibility. Member must wait for data to stabilise, clarify with employer, then refile once.

## Root cause

Payroll corrections; delayed deposits posted after DOE; employer fixing inspections via supplementary ECR.

## How it is detected

Passbook changes after claim date. Remark about contribution after exit or data mismatch. Employer admits revised return.

## Fix

- Freeze further unnecessary ECR tinkering with HR once claim is planned.
- If revision was required, wait until passbook reflects final figures.
- Reconcile DOE vs last contribution month; correct DOE via JD if needed.
- Refile claim once; attach explanation in EPFiGMS if auto-reject repeats.

## Required documents

- Before/after passbook
- Employer ECR revision acknowledgement
- DOE proof

## Who acts

mixed

## Prevention

- Employers should complete ECR corrections before advising members to claim.
- Members should screenshot passbook on claim day.

## Related records

- [epfo-rr-097](./epfo-rr-097.md)
- [epfo-rr-098](./epfo-rr-098.md)
- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-122](./epfo-rr-122.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, forum, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Extends post-exit contribution rejects to the ECR-revision timing edge.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [forum] https://www.reddit.com/r/epfoindia/comments/1lwzhcs/my_epfo_claim_got_rejected_form31_after_16_days/
- [news] https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-149",
  "rejection_reason": "ECR revised or supplementary return filed after claim submission altering service or contribution data",
  "aliases": [
    "ECR revision after claim",
    "Supplementary ECR claim rejected",
    "Contribution corrected post claim",
    "Employer revised return claim hold",
    "Re-filed ECR mismatch claim"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Employers sometimes revise ECR after a member claims — adding late contributions, correcting wages, or reversing rows. Backend revalidation then rejects or returns the claim for contribution-after-exit, amount mismatch, or service change (related to 097/098).",
  "what_it_means": "The claim was valid on old data; new ECR changes eligibility. Member must wait for data to stabilise, clarify with employer, then refile once.",
  "root_cause": "Payroll corrections; delayed deposits posted after DOE; employer fixing inspections via supplementary ECR.",
  "how_detected": "Passbook changes after claim date. Remark about contribution after exit or data mismatch. Employer admits revised return.",
  "fix_steps": [
    "Freeze further unnecessary ECR tinkering with HR once claim is planned.",
    "If revision was required, wait until passbook reflects final figures.",
    "Reconcile DOE vs last contribution month; correct DOE via JD if needed.",
    "Refile claim once; attach explanation in EPFiGMS if auto-reject repeats."
  ],
  "required_documents": [
    "Before/after passbook",
    "Employer ECR revision acknowledgement",
    "DOE proof"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Employers should complete ECR corrections before advising members to claim.",
    "Members should screenshot passbook on claim day."
  ],
  "related_reason_ids": [
    "epfo-rr-097",
    "epfo-rr-098",
    "epfo-rr-029",
    "epfo-rr-122"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.reddit.com/r/epfoindia/comments/1lwzhcs/my_epfo_claim_got_rejected_form31_after_16_days/",
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "forum",
    "news"
  ],
  "confidence": "medium",
  "notes": "Extends post-exit contribution rejects to the ECR-revision timing edge.",
  "last_verified": "2026-09-12"
}
```
