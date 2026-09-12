# Wrong claim form selected for the member's situation (epfo-rr-043)

> Dataset record `epfo-rr-043`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Wrong claim form selected for the member's situation

**Aliases:** Wrong form, Incorrect claim form, Form 19 vs 31 vs 10C mix-up, Wrong form / claim rejected due to wrong form, Wrong form selected 31 vs 19 vs 10C, Incorrect claim type, Please select correct claim form

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Outlook/MoS: incorrect claim form is a stated rejection cause. FinRight maps situations to forms. Official Which-Claim-Form page assigns 19/20/10C/10D/5IF by life event including death and service length.

## What it means

The portal dropdown lets people pick a form they are not eligible for. Classic errors: Form 31 while unemployed for full cash-out; Form 19 while employed; Form 10C after 10 years; Form 10D before 10 years or before age; using Form 19 instead of Form 20 after death. Composite forms combine 19+10C+31 and make this easier to get wrong if the member ticks everything.

## Root cause

UI confusion; composite claim defaults; death family using member forms; Scheme 2026 category rename confusion.

## How it is detected

Eligibility engine vs selected type. Which-claim-form matrix. Remark: wrong form.

## Fix

- Use this mapping: still employed + permitted purpose → Form 31; left job + unemployed/retired → Form 19 for PF; EPS <10 years → 10C withdrawal; EPS >=10 years and age eligible → 10D; death in service → 20 + 10D/10C + 5IF as applicable; job change → Form 13.
- Consult epfindia Which Claim Form page for death permutations (age 58, 10 years, in service vs away from service).
- Refile only the correct form after KYC is clean.

## Required documents

- Service History
- DOE/age/nominee facts

## Who acts

member

## Prevention

- Read Which Claim Form before clicking Proceed for Online Claim.

## Related records

- [epfo-rr-034](./epfo-rr-034.md)
- [epfo-rr-035](./epfo-rr-035.md)
- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-049](./epfo-rr-049.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [news] https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://pfbalancecheck.com/epfo-claim-rejected-reason/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-043",
  "rejection_reason": "Wrong claim form selected for the member's situation",
  "aliases": [
    "Wrong form",
    "Incorrect claim form",
    "Form 19 vs 31 vs 10C mix-up",
    "Wrong form / claim rejected due to wrong form",
    "Wrong form selected 31 vs 19 vs 10C",
    "Incorrect claim type",
    "Please select correct claim form"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Outlook/MoS: incorrect claim form is a stated rejection cause. FinRight maps situations to forms. Official Which-Claim-Form page assigns 19/20/10C/10D/5IF by life event including death and service length.",
  "what_it_means": "The portal dropdown lets people pick a form they are not eligible for. Classic errors: Form 31 while unemployed for full cash-out; Form 19 while employed; Form 10C after 10 years; Form 10D before 10 years or before age; using Form 19 instead of Form 20 after death. Composite forms combine 19+10C+31 and make this easier to get wrong if the member ticks everything.",
  "root_cause": "UI confusion; composite claim defaults; death family using member forms; Scheme 2026 category rename confusion.",
  "how_detected": "Eligibility engine vs selected type. Which-claim-form matrix. Remark: wrong form.",
  "fix_steps": [
    "Use this mapping: still employed + permitted purpose → Form 31; left job + unemployed/retired → Form 19 for PF; EPS <10 years → 10C withdrawal; EPS >=10 years and age eligible → 10D; death in service → 20 + 10D/10C + 5IF as applicable; job change → Form 13.",
    "Consult epfindia Which Claim Form page for death permutations (age 58, 10 years, in service vs away from service).",
    "Refile only the correct form after KYC is clean."
  ],
  "required_documents": [
    "Service History",
    "DOE/age/nominee facts"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Read Which Claim Form before clicking Proceed for Online Claim."
  ],
  "related_reason_ids": [
    "epfo-rr-034",
    "epfo-rr-035",
    "epfo-rr-036",
    "epfo-rr-039",
    "epfo-rr-049"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
