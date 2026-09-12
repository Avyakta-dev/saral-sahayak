# EDLI (Form 5IF) not payable because member did not die while in service (epfo-rr-067)

> Dataset record `epfo-rr-067`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** EDLI (Form 5IF) not payable because member did not die while in service

**Aliases:** Death not while in service, EDLI ineligible, Died after leaving job, EDLI only if death in service, EDLI not payable death after exit, Member not in service at death, Form 5IF rejected not in service

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 5IF EDLI Death Insurance
- **Severity:** critical
- **Official/common message status:** Official Form 5IF instructions: EDLI benefit is admissible to persons entitled to PF accumulations of the deceased member only if the member's death occurred while in service. Which-Claim-Form distinguishes died while in service vs died away from service (EDLI listed for in-service paths).

## What it means

EDLI is insurance linked to being an employee in a covered establishment at death, not a life cover that survives years of unemployment. If DOE is before date of death, Form 5IF is rejected even though Form 20 (PF) and Form 10D (if eligible) may still succeed. Weekend/holiday gaps between two jobs have been clarified by EPFO not to count as a break for EDLI in some 2025–26 reporting — genuine job-to-job continuity may still qualify. A blank DOE can also wrongly suggest the member was in service or the opposite; dates must be correct.

## Root cause

Member left job months earlier; DOE marked early; family filed 5IF because a blog said 'Rs 7 lakh insurance' without the in-service condition.

## How it is detected

Date of death vs DOE. Which-claim-form matrix. Form 5IF instruction 1.

## Fix

- Compare death certificate date with last DOE and last ECR.
- If death was after exit, do not refile 5IF; proceed with Form 20 and pension forms only.
- If death was during employment but DOE was wrongly pre-dated, correct DOE via death-case JD with employer/alternative attestation, then file 5IF.
- If two jobs with only a weekend in between, cite EPFO's break-not-counted clarification and last 12 months' wages certificate.
- Attach Form 5IF with 20 and 10D/10C as applicable so the office sees the full package.

## Required documents

- Death certificate
- Service History / last ECR
- Employer 12-month PF details if exempted trust
- Forms 20 and 10D/10C as applicable

## Who acts

mixed

## Prevention

- Families should use the official Which Claim Form wizard, not insurance-amount headlines.

## Related records

- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-031](./epfo-rr-031.md)
- [epfo-rr-043](./epfo-rr-043.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** In-service condition is official Form 5IF text. Rs 7 lakh ceiling and 35x wage formula are scheme parameters reported by ClearTax; verify current EDLI notification for amounts. Weekend-break clarification: ET 2025-26 article.

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- https://cleartax.in/s/edli
- https://economictimes.indiatimes.com/wealth/save/epfo-clarifies-edli-rules-weekends-holidays-between-two-jobs-not-to-be-counted-as-break-for-settling-insurance-claims/articleshow/126054764.cms
- https://kustodian.life/resources/provident-fund/edli-claim-process

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-067",
  "rejection_reason": "EDLI (Form 5IF) not payable because member did not die while in service",
  "aliases": [
    "Death not while in service",
    "EDLI ineligible",
    "Died after leaving job",
    "EDLI only if death in service",
    "EDLI not payable death after exit",
    "Member not in service at death",
    "Form 5IF rejected not in service"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 5IF EDLI Death Insurance"
  ],
  "severity": "critical",
  "official_status_or_message": "Official Form 5IF instructions: EDLI benefit is admissible to persons entitled to PF accumulations of the deceased member only if the member's death occurred while in service. Which-Claim-Form distinguishes died while in service vs died away from service (EDLI listed for in-service paths).",
  "what_it_means": "EDLI is insurance linked to being an employee in a covered establishment at death, not a life cover that survives years of unemployment. If DOE is before date of death, Form 5IF is rejected even though Form 20 (PF) and Form 10D (if eligible) may still succeed. Weekend/holiday gaps between two jobs have been clarified by EPFO not to count as a break for EDLI in some 2025–26 reporting — genuine job-to-job continuity may still qualify. A blank DOE can also wrongly suggest the member was in service or the opposite; dates must be correct.",
  "root_cause": "Member left job months earlier; DOE marked early; family filed 5IF because a blog said 'Rs 7 lakh insurance' without the in-service condition.",
  "how_detected": "Date of death vs DOE. Which-claim-form matrix. Form 5IF instruction 1.",
  "fix_steps": [
    "Compare death certificate date with last DOE and last ECR.",
    "If death was after exit, do not refile 5IF; proceed with Form 20 and pension forms only.",
    "If death was during employment but DOE was wrongly pre-dated, correct DOE via death-case JD with employer/alternative attestation, then file 5IF.",
    "If two jobs with only a weekend in between, cite EPFO's break-not-counted clarification and last 12 months' wages certificate.",
    "Attach Form 5IF with 20 and 10D/10C as applicable so the office sees the full package."
  ],
  "required_documents": [
    "Death certificate",
    "Service History / last ECR",
    "Employer 12-month PF details if exempted trust",
    "Forms 20 and 10D/10C as applicable"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Families should use the official Which Claim Form wizard, not insurance-amount headlines."
  ],
  "related_reason_ids": [
    "epfo-rr-024",
    "epfo-rr-031",
    "epfo-rr-043"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://cleartax.in/s/edli",
    "https://economictimes.indiatimes.com/wealth/save/epfo-clarifies-edli-rules-weekends-holidays-between-two-jobs-not-to-be-counted-as-break-for-settling-insurance-claims/articleshow/126054764.cms",
    "https://kustodian.life/resources/provident-fund/edli-claim-process"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "In-service condition is official Form 5IF text. Rs 7 lakh ceiling and 35x wage formula are scheme parameters reported by ClearTax; verify current EDLI notification for amounts. Weekend-break clarification: ET 2025-26 article.",
  "last_verified": "2026-09-12"
}
```
