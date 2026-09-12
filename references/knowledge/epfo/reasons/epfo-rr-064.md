# Family details missing for widow/widower or child pension (Form 10D death/family pension) (epfo-rr-064)

> Dataset record `epfo-rr-064`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Family details missing for widow/widower or child pension (Form 10D death/family pension)

**Aliases:** Spouse name not in EPF database, Family details not updated, Widow pension logic failed, Child DOB missing

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** Form 10D guides: if spouse's name is not in the EPF database the claim fails because widow-pension logic requires it. MoS: complete e-nomination and family details online. Offline 10D asks for descriptive roll and joint photos of family.

## What it means

EPS family pension is not a discretionary payment to whoever produces a death certificate. The spouse and eligible children (generally until 25) must be identifiable in EPFO records or proved now with marriage/birth certificates. Missing spouse name is a top 10D rejection.

## Root cause

Member never added family; marriage after joining not updated; children's DOB absent.

## How it is detected

Family details blank. Form 10D descriptive roll incomplete.

## Fix

- If member is alive, add family via e-nomination/profile before retirement.
- After death, submit marriage certificate, spouse Aadhaar, joint photos, children's birth certificates with Form 10D descriptive roll.
- Use SOP death-of-member JD path if basic profile must be corrected with nominee consent.
- Ensure pension bank account is single or joint with spouse (epfo-rr-023).

## Required documents

- Marriage certificate
- Spouse and children Aadhaar
- Birth certificates of children
- Descriptive roll / joint photographs as per Form 10D

## Who acts

mixed

## Prevention

- Add spouse the month you marry. Add children at birth.

## Related records

- [epfo-rr-023](./epfo-rr-023.md)
- [epfo-rr-038](./epfo-rr-038.md)
- [epfo-rr-060](./epfo-rr-060.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[news]** Financial Express: why EPS claims get rejected — https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- **[news]** ET Now: EPS claim rejection reasons — https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- **[news]** Outlook Money: why EPFO rejects claims (MoS reply) — https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-064",
  "rejection_reason": "Family details missing for widow/widower or child pension (Form 10D death/family pension)",
  "aliases": [
    "Spouse name not in EPF database",
    "Family details not updated",
    "Widow pension logic failed",
    "Child DOB missing"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "Form 10D guides: if spouse's name is not in the EPF database the claim fails because widow-pension logic requires it. MoS: complete e-nomination and family details online. Offline 10D asks for descriptive roll and joint photos of family.",
  "what_it_means": "EPS family pension is not a discretionary payment to whoever produces a death certificate. The spouse and eligible children (generally until 25) must be identifiable in EPFO records or proved now with marriage/birth certificates. Missing spouse name is a top 10D rejection.",
  "root_cause": "Member never added family; marriage after joining not updated; children's DOB absent.",
  "how_detected": "Family details blank. Form 10D descriptive roll incomplete.",
  "fix_steps": [
    "If member is alive, add family via e-nomination/profile before retirement.",
    "After death, submit marriage certificate, spouse Aadhaar, joint photos, children's birth certificates with Form 10D descriptive roll.",
    "Use SOP death-of-member JD path if basic profile must be corrected with nominee consent.",
    "Ensure pension bank account is single or joint with spouse (epfo-rr-023)."
  ],
  "required_documents": [
    "Marriage certificate",
    "Spouse and children Aadhaar",
    "Birth certificates of children",
    "Descriptive roll / joint photographs as per Form 10D"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Add spouse the month you marry. Add children at birth."
  ],
  "related_reason_ids": [
    "epfo-rr-023",
    "epfo-rr-038",
    "epfo-rr-060"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
