# Child pension stopped or rejected because beneficiary crossed age limit without disablement exception (epfo-rr-118)

> Dataset record `epfo-rr-118`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Child pension stopped or rejected because beneficiary crossed age limit without disablement exception

**Aliases:** Child pension age limit exceeded, Son/daughter over 25 pension stopped, Family pension child ineligible age, Orphan child aged out of EPS

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** medium
- **Official/common message status:** EPS family pension explainers and Form 10D practice: child pension generally continues until a stated age (commonly 25 in secondary guides) unless permanently disabled.

## What it means

Parents continue filing or expect arrears after the child ages out. Distinct from orphan documentation gaps — here eligibility ended by age.

## Root cause

Child over age limit; no disablement certificate.

## How it is detected

Age vs scheme cut-off on Form 10D child category.

## Fix

- Confirm current age against scheme child-pension cut-off.
- If permanently disabled, submit disablement proof for continued pension.
- Otherwise stop child-pension claims; check other beneficiaries.
- Update family details rather than refiling rejected child claims.

## Required documents

- Birth proof
- Disablement certificate if claiming exception
- Prior PPO

## Who acts

mixed

## Prevention

- Track child age before each pension year.

## Related records

- [epfo-rr-108](./epfo-rr-108.md)
- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-111](./epfo-rr-111.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Age cut-off from secondary explainers; confirm Form 10D/EPS text.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-118",
  "rejection_reason": "Child pension stopped or rejected because beneficiary crossed age limit without disablement exception",
  "aliases": [
    "Child pension age limit exceeded",
    "Son/daughter over 25 pension stopped",
    "Family pension child ineligible age",
    "Orphan child aged out of EPS"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "medium",
  "official_status_or_message": "EPS family pension explainers and Form 10D practice: child pension generally continues until a stated age (commonly 25 in secondary guides) unless permanently disabled.",
  "what_it_means": "Parents continue filing or expect arrears after the child ages out. Distinct from orphan documentation gaps — here eligibility ended by age.",
  "root_cause": "Child over age limit; no disablement certificate.",
  "how_detected": "Age vs scheme cut-off on Form 10D child category.",
  "fix_steps": [
    "Confirm current age against scheme child-pension cut-off.",
    "If permanently disabled, submit disablement proof for continued pension.",
    "Otherwise stop child-pension claims; check other beneficiaries.",
    "Update family details rather than refiling rejected child claims."
  ],
  "required_documents": [
    "Birth proof",
    "Disablement certificate if claiming exception",
    "Prior PPO"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Track child age before each pension year."
  ],
  "related_reason_ids": [
    "epfo-rr-108",
    "epfo-rr-064",
    "epfo-rr-111"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "medium",
  "notes": "Age cut-off from secondary explainers; confirm Form 10D/EPS text.",
  "last_verified": "2026-09-12"
}
```
