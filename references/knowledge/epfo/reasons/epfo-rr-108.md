# Orphan pension (Form 10D) documentation or eligibility gaps (epfo-rr-108)

> Dataset record `epfo-rr-108`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Orphan pension (Form 10D) documentation or eligibility gaps

**Aliases:** Orphan pension rejected, Children pension without surviving parent failed, Form 10D orphan claim documents missing, Orphan EPS pension not approved

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension, Composite Claim Form
- **Severity:** high
- **Official/common message status:** EPFO Which Claim Form / Form 10D framework provides family pension including children; secondary explainers describe orphan pension when both parents deceased, with age limits and higher percentage than single-parent child pension. ET Now/Outlook cite incomplete family documents as top EPS rejection causes.

## What it means

Orphan pension claims fail when death certificates of both parents incomplete, guardianship for minors missing, children exceed age limits without disablement exception, or family details never updated. Distinct from widow pension and ordinary missing photos.

## Root cause

Missing dual death certificates; no guardian; age over limit; family details blank.

## How it is detected

Form 10D orphan/child category. Document scrutiny.

## Fix

- Submit death certificates of both parents as applicable.
- Appoint guardian with certificate for minors.
- Update family details / descriptive roll/photos as required.
- Confirm child age/disablement eligibility before filing.

## Required documents

- Death certificates of parents
- Birth proof of child
- Guardianship certificate
- Form 10D family docs

## Who acts

mixed

## Prevention

- Register children in family details while member is alive.

## Related records

- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-065](./epfo-rr-065.md)
- [epfo-rr-081](./epfo-rr-081.md)
- [epfo-rr-048](./epfo-rr-048.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Percentage/age figures from scheme explainers; confirm Form 10D instructions.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- **[official]** Form 10D PDF — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[news]** ET Now: EPS claim rejection reasons — https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- **[news]** Financial Express: why EPS claims get rejected — https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-108",
  "rejection_reason": "Orphan pension (Form 10D) documentation or eligibility gaps",
  "aliases": [
    "Orphan pension rejected",
    "Children pension without surviving parent failed",
    "Form 10D orphan claim documents missing",
    "Orphan EPS pension not approved"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "EPFO Which Claim Form / Form 10D framework provides family pension including children; secondary explainers describe orphan pension when both parents deceased, with age limits and higher percentage than single-parent child pension. ET Now/Outlook cite incomplete family documents as top EPS rejection causes.",
  "what_it_means": "Orphan pension claims fail when death certificates of both parents incomplete, guardianship for minors missing, children exceed age limits without disablement exception, or family details never updated. Distinct from widow pension and ordinary missing photos.",
  "root_cause": "Missing dual death certificates; no guardian; age over limit; family details blank.",
  "how_detected": "Form 10D orphan/child category. Document scrutiny.",
  "fix_steps": [
    "Submit death certificates of both parents as applicable.",
    "Appoint guardian with certificate for minors.",
    "Update family details / descriptive roll/photos as required.",
    "Confirm child age/disablement eligibility before filing."
  ],
  "required_documents": [
    "Death certificates of parents",
    "Birth proof of child",
    "Guardianship certificate",
    "Form 10D family docs"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Register children in family details while member is alive."
  ],
  "related_reason_ids": [
    "epfo-rr-064",
    "epfo-rr-065",
    "epfo-rr-081",
    "epfo-rr-048"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "medium",
  "notes": "Percentage/age figures from scheme explainers; confirm Form 10D instructions.",
  "last_verified": "2026-09-12"
}
```
