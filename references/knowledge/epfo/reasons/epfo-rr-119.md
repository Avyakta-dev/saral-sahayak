# Scheme Certificate not issued or lost blocking later Form 10D recognition of past service (epfo-rr-119)

> Dataset record `epfo-rr-119`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Scheme Certificate not issued or lost blocking later Form 10D recognition of past service

**Aliases:** Scheme certificate not generated, Scheme certificate missing for pension, 10C scheme certificate pending, Past EPS service not recognised without certificate

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** high
- **Official/common message status:** OCS FAQ: after about 10 years pensionable service, cash 10C is wrong — member should take Scheme Certificate or later Form 10D. Kustodian/FE: missing past service/certificate issues delay pension.

## What it means

Members who left with 10+ years without Scheme Certificate find Form 10D under-counts service. Fix is obtain/reissue certificate or correct service via transfers — not force 10C cash.

## Root cause

Never filed certificate; office did not generate; lost paper; service split across UANs.

## How it is detected

Form 10D service short despite member history. 10C certificate status pending.

## Fix

- If service >=10 years, file Form 10C for Scheme Certificate not withdrawal benefit if still needed.
- Complete transfers so all EPS months sit under one UAN.
- Chase RO/EPFiGMS for certificate generation or service rectification.
- Then file Form 10D at eligible age.

## Required documents

- Prior 10C acknowledgement
- Service History all MIDs
- Annexure K if any

## Who acts

mixed

## Prevention

- When leaving with 10+ EPS years, take Scheme Certificate immediately.

## Related records

- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-069](./epfo-rr-069.md)
- [epfo-rr-046](./epfo-rr-046.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[news]** Financial Express: why EPS claims get rejected — https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- **[blog]** Kustodian: EPF claim rejected because of EPS (2026) — https://kustodian.life/resources/epf-claim-rejected-because-of-eps-top-reasons-and-proven-fixes-india-2026-guide

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-119",
  "rejection_reason": "Scheme Certificate not issued or lost blocking later Form 10D recognition of past service",
  "aliases": [
    "Scheme certificate not generated",
    "Scheme certificate missing for pension",
    "10C scheme certificate pending",
    "Past EPS service not recognised without certificate"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "OCS FAQ: after about 10 years pensionable service, cash 10C is wrong — member should take Scheme Certificate or later Form 10D. Kustodian/FE: missing past service/certificate issues delay pension.",
  "what_it_means": "Members who left with 10+ years without Scheme Certificate find Form 10D under-counts service. Fix is obtain/reissue certificate or correct service via transfers — not force 10C cash.",
  "root_cause": "Never filed certificate; office did not generate; lost paper; service split across UANs.",
  "how_detected": "Form 10D service short despite member history. 10C certificate status pending.",
  "fix_steps": [
    "If service >=10 years, file Form 10C for Scheme Certificate not withdrawal benefit if still needed.",
    "Complete transfers so all EPS months sit under one UAN.",
    "Chase RO/EPFiGMS for certificate generation or service rectification.",
    "Then file Form 10D at eligible age."
  ],
  "required_documents": [
    "Prior 10C acknowledgement",
    "Service History all MIDs",
    "Annexure K if any"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "When leaving with 10+ EPS years, take Scheme Certificate immediately."
  ],
  "related_reason_ids": [
    "epfo-rr-036",
    "epfo-rr-037",
    "epfo-rr-069",
    "epfo-rr-046"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://kustodian.life/resources/epf-claim-rejected-because-of-eps-top-reasons-and-proven-fixes-india-2026-guide"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
