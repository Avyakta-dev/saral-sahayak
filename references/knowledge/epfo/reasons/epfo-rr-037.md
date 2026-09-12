# Form 10D monthly pension claimed with less than 10 years' eligible service (epfo-rr-037)

> Dataset record `epfo-rr-037`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 10D monthly pension claimed with less than 10 years' eligible service

**Aliases:** Service less than 10 years for pension, Form 10D rejected service short, Pensionable service deficit, Service gaps making service <10 years

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** critical
- **Official/common message status:** EPS-95: monthly pension generally requires 10 years' eligible service (9 years 6 months rounded up). Disablement pension is a documented exception even without 10 years. Form 10D guides list service gaps / non-contributory periods as a top rejection reason because the system calculates under 10 years.

## What it means

If EPFO's ledger shows 9 years 2 months of pensionable service, Form 10D fails and the member should have used Form 10C withdrawal (if otherwise eligible) instead. Gaps from unmarked absent days, missing ECR, unmerged UANs, or untransferred old accounts cause this. Members who 'know' they worked 12 years but whose passbook shows 8 will be rejected until history is rebuilt.

## Root cause

Missing EPS contributions; unmerged UANs; employer marked absent; service not transferred; DOB/DOE errors.

## How it is detected

Service History total <10. Form 10D eligibility engine. PPO not generated.

## Fix

- Export full service history and passbooks for every member ID/UAN.
- Restore missing months via employer ECR/3A corrections and Joint Declaration for DOJ/DOE.
- Merge multiple UANs and complete Form 13 so Annexure K is complete.
- If true service is under 10 years (and under 9.5), file Form 10C withdrawal benefit instead, not 10D.
- Disablement cases: follow disablement pension rules with medical evidence rather than superannuation 10D.

## Required documents

- All passbooks
- Appointment letters across jobs
- Form 3A / ECR proofs
- Medical board certificate for disablement pension

## Who acts

mixed

## Prevention

- Track EPS years annually after age 45.
- Never leave old PF untransferred if you care about pension.

## Related records

- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-042](./epfo-rr-042.md)
- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-029](./epfo-rr-029.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official, news, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 10-year rule is scheme-level; 9.5 rounding is OCS FAQ. Disablement exception is in Form 10D explainers.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[news]** Financial Express: why EPS claims get rejected — https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- **[forum]** Reddit r/epfoindia: EPS contribution not available — https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-037",
  "rejection_reason": "Form 10D monthly pension claimed with less than 10 years' eligible service",
  "aliases": [
    "Service less than 10 years for pension",
    "Form 10D rejected service short",
    "Pensionable service deficit",
    "Service gaps making service <10 years"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "critical",
  "official_status_or_message": "EPS-95: monthly pension generally requires 10 years' eligible service (9 years 6 months rounded up). Disablement pension is a documented exception even without 10 years. Form 10D guides list service gaps / non-contributory periods as a top rejection reason because the system calculates under 10 years.",
  "what_it_means": "If EPFO's ledger shows 9 years 2 months of pensionable service, Form 10D fails and the member should have used Form 10C withdrawal (if otherwise eligible) instead. Gaps from unmarked absent days, missing ECR, unmerged UANs, or untransferred old accounts cause this. Members who 'know' they worked 12 years but whose passbook shows 8 will be rejected until history is rebuilt.",
  "root_cause": "Missing EPS contributions; unmerged UANs; employer marked absent; service not transferred; DOB/DOE errors.",
  "how_detected": "Service History total <10. Form 10D eligibility engine. PPO not generated.",
  "fix_steps": [
    "Export full service history and passbooks for every member ID/UAN.",
    "Restore missing months via employer ECR/3A corrections and Joint Declaration for DOJ/DOE.",
    "Merge multiple UANs and complete Form 13 so Annexure K is complete.",
    "If true service is under 10 years (and under 9.5), file Form 10C withdrawal benefit instead, not 10D.",
    "Disablement cases: follow disablement pension rules with medical evidence rather than superannuation 10D."
  ],
  "required_documents": [
    "All passbooks",
    "Appointment letters across jobs",
    "Form 3A / ECR proofs",
    "Medical board certificate for disablement pension"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Track EPS years annually after age 45.",
    "Never leave old PF untransferred if you care about pension."
  ],
  "related_reason_ids": [
    "epfo-rr-036",
    "epfo-rr-042",
    "epfo-rr-046",
    "epfo-rr-029"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/"
  ],
  "source_types": [
    "blog",
    "official",
    "news",
    "forum"
  ],
  "confidence": "high",
  "notes": "10-year rule is scheme-level; 9.5 rounding is OCS FAQ. Disablement exception is in Form 10D explainers.",
  "last_verified": "2026-09-12"
}
```
