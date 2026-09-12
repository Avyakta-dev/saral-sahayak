# Full orphan Form 10D pension rejected — both-parents death proof or orphan rate documentation gaps (epfo-rr-134)

> Dataset record `epfo-rr-134`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Full orphan Form 10D pension rejected — both-parents death proof or orphan rate documentation gaps

**Aliases:** Orphan pension both parents death certificate missing, Orphan rate not applied, Full orphan Form 10D rejected, Guardian claiming orphan pension docs deficient, Second parent death not recorded

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** EPS orphan pension generally applies when both parents are deceased; orphan rate is higher than ordinary child pension (commonly summarised as about 75% of member pension per orphan, up to two at a time). Claims need death certificates of member and surviving spouse/parent as applicable, plus guardianship for minors.

## What it means

Ordinary child pension (with living widow) is not the same as orphan pension. Offices reject or under-rate claims when only the member's death certificate is filed, when the second parent's death is unproven, or when guardian KYC/bank is incomplete. Distinct from age-25 stoppage (118) and from incomplete orphan docs partly covered in 108.

## Root cause

Missing second death certificate; treating child-with-widow case as orphan; guardian not recognised; bank in unrelated adult name without guardianship order.

## How it is detected

Form 10D orphan checkbox/family matrix. Dual death certificate scrutiny. Guardianship certificate check.

## Fix

- Establish that both parents are deceased with registered death certificates.
- File Form 10D as orphan pension with guardian details for minors.
- Produce court/natural guardianship and seed bank KYC as RO instructs.
- If one parent still living, claim child pension with widow/widower package instead.
- EPFiGMS if rate applied is ordinary child rate despite proven orphan status.

## Required documents

- Death certificates of both parents
- Birth certificates of orphans
- Guardianship certificate
- Guardian Aadhaar and bank KYC

## Who acts

mixed

## Prevention

- Keep family details updated so RO can see surviving spouse status.
- Do not confuse Form 20 PF settlement with Form 10D orphan pension.

## Related records

- [epfo-rr-108](./epfo-rr-108.md)
- [epfo-rr-065](./epfo-rr-065.md)
- [epfo-rr-132](./epfo-rr-132.md)
- [epfo-rr-118](./epfo-rr-118.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Percentages from secondary EPS explainers; confirm against scheme text at RO.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Form 10D PDF — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[blog]** Wealthpedia: EPS family pension rules 2026 — https://www.wealthpedia.in/eps-family-pension/
- **[blog]** RTI Wiki: death claim without nominee — https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-134",
  "rejection_reason": "Full orphan Form 10D pension rejected — both-parents death proof or orphan rate documentation gaps",
  "aliases": [
    "Orphan pension both parents death certificate missing",
    "Orphan rate not applied",
    "Full orphan Form 10D rejected",
    "Guardian claiming orphan pension docs deficient",
    "Second parent death not recorded"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "EPS orphan pension generally applies when both parents are deceased; orphan rate is higher than ordinary child pension (commonly summarised as about 75% of member pension per orphan, up to two at a time). Claims need death certificates of member and surviving spouse/parent as applicable, plus guardianship for minors.",
  "what_it_means": "Ordinary child pension (with living widow) is not the same as orphan pension. Offices reject or under-rate claims when only the member's death certificate is filed, when the second parent's death is unproven, or when guardian KYC/bank is incomplete. Distinct from age-25 stoppage (118) and from incomplete orphan docs partly covered in 108.",
  "root_cause": "Missing second death certificate; treating child-with-widow case as orphan; guardian not recognised; bank in unrelated adult name without guardianship order.",
  "how_detected": "Form 10D orphan checkbox/family matrix. Dual death certificate scrutiny. Guardianship certificate check.",
  "fix_steps": [
    "Establish that both parents are deceased with registered death certificates.",
    "File Form 10D as orphan pension with guardian details for minors.",
    "Produce court/natural guardianship and seed bank KYC as RO instructs.",
    "If one parent still living, claim child pension with widow/widower package instead.",
    "EPFiGMS if rate applied is ordinary child rate despite proven orphan status."
  ],
  "required_documents": [
    "Death certificates of both parents",
    "Birth certificates of orphans",
    "Guardianship certificate",
    "Guardian Aadhaar and bank KYC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Keep family details updated so RO can see surviving spouse status.",
    "Do not confuse Form 20 PF settlement with Form 10D orphan pension."
  ],
  "related_reason_ids": [
    "epfo-rr-108",
    "epfo-rr-065",
    "epfo-rr-132",
    "epfo-rr-118"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.wealthpedia.in/eps-family-pension/",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Percentages from secondary EPS explainers; confirm against scheme text at RO.",
  "last_verified": "2026-09-12"
}
```
