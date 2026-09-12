# Form 10D claimed before eligible age (normally 58, or 50 for reduced early pension) (epfo-rr-038)

> Dataset record `epfo-rr-038`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 10D claimed before eligible age (normally 58, or 50 for reduced early pension)

**Aliases:** Age not eligible for pension, Claimed pension before 58, Early pension not eligible, DOB makes member underage for 10D

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** Superannuation pension at 58; reduced early pension generally from 50 with about 4% reduction per year of anticipation. Wrong DOB can make a 58-year-old look 47. Family pension on death has different age logic.

## What it means

A healthy member aged 48 with 20 years' service still cannot start ordinary monthly pension. Filing 10D is rejected. Early pension (50–57) is optional and permanently reduced; taking it and then rejoining a covered job can suspend the pension. DOB mismatch (epfo-rr-002) often sits underneath this remark.

## Root cause

DOB error; confusion with PF withdrawal age; early-pension rules not read.

## How it is detected

DOB vs 50/58. Claim type 10D. Field office age check.

## Fix

- Verify DOB on UAN vs Aadhaar; correct via JD if UAN is wrong.
- If under 50, wait, or take Form 19 for PF and keep Scheme Certificate for later pension.
- If 50–57, apply only if you accept the reduced pension and understand re-employment rules.
- Family pension after death uses Form 10D as a survivor claim, not the member's age-58 rule — use death-claim path.

## Required documents

- Aadhaar/DOB proof
- Service History
- For early pension: understanding of reduction

## Who acts

member

## Prevention

- Do not file 10D on retirement from a private job at 45 unless disablement/death rules apply.

## Related records

- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-064](./epfo-rr-064.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Age 58/50 rules are standard EPS; reduction percentage is widely reported as 4% per year — verify current scheme text.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-038",
  "rejection_reason": "Form 10D claimed before eligible age (normally 58, or 50 for reduced early pension)",
  "aliases": [
    "Age not eligible for pension",
    "Claimed pension before 58",
    "Early pension not eligible",
    "DOB makes member underage for 10D"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "Superannuation pension at 58; reduced early pension generally from 50 with about 4% reduction per year of anticipation. Wrong DOB can make a 58-year-old look 47. Family pension on death has different age logic.",
  "what_it_means": "A healthy member aged 48 with 20 years' service still cannot start ordinary monthly pension. Filing 10D is rejected. Early pension (50–57) is optional and permanently reduced; taking it and then rejoining a covered job can suspend the pension. DOB mismatch (epfo-rr-002) often sits underneath this remark.",
  "root_cause": "DOB error; confusion with PF withdrawal age; early-pension rules not read.",
  "how_detected": "DOB vs 50/58. Claim type 10D. Field office age check.",
  "fix_steps": [
    "Verify DOB on UAN vs Aadhaar; correct via JD if UAN is wrong.",
    "If under 50, wait, or take Form 19 for PF and keep Scheme Certificate for later pension.",
    "If 50–57, apply only if you accept the reduced pension and understand re-employment rules.",
    "Family pension after death uses Form 10D as a survivor claim, not the member's age-58 rule — use death-claim path."
  ],
  "required_documents": [
    "Aadhaar/DOB proof",
    "Service History",
    "For early pension: understanding of reduction"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Do not file 10D on retirement from a private job at 45 unless disablement/death rules apply."
  ],
  "related_reason_ids": [
    "epfo-rr-002",
    "epfo-rr-037",
    "epfo-rr-064"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/"
  ],
  "source_types": [
    "blog",
    "official",
    "news"
  ],
  "confidence": "high",
  "notes": "Age 58/50 rules are standard EPS; reduction percentage is widely reported as 4% per year — verify current scheme text.",
  "last_verified": "2026-09-12"
}
```
