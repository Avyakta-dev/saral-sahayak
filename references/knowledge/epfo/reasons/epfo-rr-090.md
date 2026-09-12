# Form 31 unemployment / non-contribution advance rejected (waiting period or still contributing) (epfo-rr-090)

> Dataset record `epfo-rr-090`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 unemployment / non-contribution advance rejected (waiting period or still contributing)

**Aliases:** Unemployed for more than one month Form 31 rejected, Continuous unemployment advance rejected, Non receipt of contribution advance rejected, Insufficient service unemployment Form 31, PF and EPS being deposited by the employers, Unemployment advance rejected still contributing, Non-contribution period not met Form 31, Form 31 unemployment waiting not over

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** critical
- **Official/common message status:** Reddit r/epfoindia and ClearTax discuss Form 31 unemployment advances (continuous unemployment above one month / non-receipt of contribution). Members report rejection for insufficient service when waiting period not met, and PF and EPS being deposited by the employers when ECR still posts. Mint lists unemployment under special/exit-related access in Scheme 2026 explainers.

## What it means

This is not Form 19 final settlement. Unemployment advances require exit (DOE present) and satisfaction of the unemployment/non-contribution period the purpose states. Active ECR after exit, or filing too early, causes rejection. Fix path differs from Form 19 waiting-period rejects and from calamity/COVID.

## Root cause

DOE missing; filed before unemployment period; employer still depositing; wrong purpose vs Form 19.

## How it is detected

Track Claim remarks: insufficient service; PF/EPS being deposited; contribution after exit.

## Fix

- Confirm DOE is visible and no new covered job has started.
- Count unemployment/non-contribution days the purpose requires before filing.
- If ECR posts after exit, get employer clarification for wage-month timing or wait until contributions stop.
- If you need full settlement, use Form 19 after its waiting rules — do not force Form 31 unemployment as fake Form 19.

## Required documents

- Service History with DOE
- Passbook last contribution date
- Employer clarification if post-exit ECR

## Who acts

mixed

## Prevention

- Screenshot last ECR month before choosing unemployment purpose.

## Related records

- [epfo-rr-097](./epfo-rr-097.md)
- [epfo-rr-098](./epfo-rr-098.md)
- [epfo-rr-033](./epfo-rr-033.md)
- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-039](./epfo-rr-039.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** forum, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Forum remarks are real; exact statutory para labels vary by scheme edition.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary reporting (news, blog, forum)

- **[forum]** Reddit: Form 31 unemployment insufficient service — https://www.reddit.com/r/epfoindia/comments/1mdyhcm/epfo_claim_rejected_form_31/
- **[forum]** Reddit: PF and EPS being deposited by employers — https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/
- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[blog]** KnowMoney: EPFO 3.0 withdrawal rules 2026 — https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-090",
  "rejection_reason": "Form 31 unemployment / non-contribution advance rejected (waiting period or still contributing)",
  "aliases": [
    "Unemployed for more than one month Form 31 rejected",
    "Continuous unemployment advance rejected",
    "Non receipt of contribution advance rejected",
    "Insufficient service unemployment Form 31",
    "PF and EPS being deposited by the employers",
    "Unemployment advance rejected still contributing",
    "Non-contribution period not met Form 31",
    "Form 31 unemployment waiting not over"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "critical",
  "official_status_or_message": "Reddit r/epfoindia and ClearTax discuss Form 31 unemployment advances (continuous unemployment above one month / non-receipt of contribution). Members report rejection for insufficient service when waiting period not met, and PF and EPS being deposited by the employers when ECR still posts. Mint lists unemployment under special/exit-related access in Scheme 2026 explainers.",
  "what_it_means": "This is not Form 19 final settlement. Unemployment advances require exit (DOE present) and satisfaction of the unemployment/non-contribution period the purpose states. Active ECR after exit, or filing too early, causes rejection. Fix path differs from Form 19 waiting-period rejects and from calamity/COVID.",
  "root_cause": "DOE missing; filed before unemployment period; employer still depositing; wrong purpose vs Form 19.",
  "how_detected": "Track Claim remarks: insufficient service; PF/EPS being deposited; contribution after exit.",
  "fix_steps": [
    "Confirm DOE is visible and no new covered job has started.",
    "Count unemployment/non-contribution days the purpose requires before filing.",
    "If ECR posts after exit, get employer clarification for wage-month timing or wait until contributions stop.",
    "If you need full settlement, use Form 19 after its waiting rules — do not force Form 31 unemployment as fake Form 19."
  ],
  "required_documents": [
    "Service History with DOE",
    "Passbook last contribution date",
    "Employer clarification if post-exit ECR"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Screenshot last ECR month before choosing unemployment purpose."
  ],
  "related_reason_ids": [
    "epfo-rr-097",
    "epfo-rr-098",
    "epfo-rr-033",
    "epfo-rr-024",
    "epfo-rr-039"
  ],
  "source_urls": [
    "https://www.reddit.com/r/epfoindia/comments/1mdyhcm/epfo_claim_rejected_form_31/",
    "https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/",
    "https://cleartax.in/s/epf-form-31",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026"
  ],
  "source_types": [
    "forum",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "Forum remarks are real; exact statutory para labels vary by scheme edition.",
  "last_verified": "2026-09-12"
}
```
