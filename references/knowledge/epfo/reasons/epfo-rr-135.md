# Family/orphan pension credit blocked after guardian change without EPFO update (epfo-rr-135)

> Dataset record `epfo-rr-135`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Family/orphan pension credit blocked after guardian change without EPFO update

**Aliases:** Guardian changed pension not credited, New guardian bank KYC pending pension, Change of guardian Form 10D, Minor pension account holder change rejected, Guardianship succession not updated EPFO

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** medium
- **Official/common message status:** Minor family/orphan pensions are paid through a recognised guardian's bank details until majority. Changing guardian (death of guardian, court order, natural guardian switch) without updating EPFO/PPO records leads to returned credits or suspended pension similar to bank-change rejects.

## What it means

A mid-stream guardian change is an administrative update, not a fresh entitlement claim. Credits bounce when the old guardian account is closed or when the new guardian has no seeded KYC. Distinct from initial missing guardianship (065).

## Root cause

PPO still points to old guardian account; no RO intimation of court order; new guardian Aadhaar/bank unverified.

## How it is detected

NEFT return on pension credit. Life-certificate/guardian mismatch. RO pension desk query.

## Fix

- File guardian-change application at jurisdictional RO with court order or supporting proof.
- Seed new guardian Aadhaar and bank; get Verified status.
- Request PPO amendment and re-credit of returned amounts — do not file duplicate Form 10D as a new orphan claim.
- Track via EPFiGMS quoting PPO and UAN of deceased member.

## Required documents

- Court guardianship order or natural guardian proof
- Death certificate of previous guardian if applicable
- New guardian Aadhaar and bank proof
- PPO copy

## Who acts

mixed

## Prevention

- Notify RO before closing the old guardian bank account.
- Keep minor's birth certificate and prior PPO paperwork together.

## Related records

- [epfo-rr-065](./epfo-rr-065.md)
- [epfo-rr-022](./epfo-rr-022.md)
- [epfo-rr-115](./epfo-rr-115.md)
- [epfo-rr-134](./epfo-rr-134.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Operational edge widely seen in pension desks; scheme text does not publish a portal code.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Form 10D PDF — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- **[official]** EPFiGMS grievance portal — https://epfigms.gov.in/
- **[official]** Jeevan Pramaan (life certificate) — https://jeevanpramaan.gov.in

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[blog]** RTI Wiki: death claim without nominee — https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-135",
  "rejection_reason": "Family/orphan pension credit blocked after guardian change without EPFO update",
  "aliases": [
    "Guardian changed pension not credited",
    "New guardian bank KYC pending pension",
    "Change of guardian Form 10D",
    "Minor pension account holder change rejected",
    "Guardianship succession not updated EPFO"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "medium",
  "official_status_or_message": "Minor family/orphan pensions are paid through a recognised guardian's bank details until majority. Changing guardian (death of guardian, court order, natural guardian switch) without updating EPFO/PPO records leads to returned credits or suspended pension similar to bank-change rejects.",
  "what_it_means": "A mid-stream guardian change is an administrative update, not a fresh entitlement claim. Credits bounce when the old guardian account is closed or when the new guardian has no seeded KYC. Distinct from initial missing guardianship (065).",
  "root_cause": "PPO still points to old guardian account; no RO intimation of court order; new guardian Aadhaar/bank unverified.",
  "how_detected": "NEFT return on pension credit. Life-certificate/guardian mismatch. RO pension desk query.",
  "fix_steps": [
    "File guardian-change application at jurisdictional RO with court order or supporting proof.",
    "Seed new guardian Aadhaar and bank; get Verified status.",
    "Request PPO amendment and re-credit of returned amounts — do not file duplicate Form 10D as a new orphan claim.",
    "Track via EPFiGMS quoting PPO and UAN of deceased member."
  ],
  "required_documents": [
    "Court guardianship order or natural guardian proof",
    "Death certificate of previous guardian if applicable",
    "New guardian Aadhaar and bank proof",
    "PPO copy"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Notify RO before closing the old guardian bank account.",
    "Keep minor's birth certificate and prior PPO paperwork together."
  ],
  "related_reason_ids": [
    "epfo-rr-065",
    "epfo-rr-022",
    "epfo-rr-115",
    "epfo-rr-134"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://epfigms.gov.in/",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india",
    "https://jeevanpramaan.gov.in"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Operational edge widely seen in pension desks; scheme text does not publish a portal code.",
  "last_verified": "2026-09-12"
}
```
