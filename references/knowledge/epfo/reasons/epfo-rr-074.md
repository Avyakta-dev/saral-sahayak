# International worker or specified migrant class blocked for want of Aadhaar even though physical settlement without Aadhaar seeding is allowed (epfo-rr-074)

> Dataset record `epfo-rr-074`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** International worker or specified migrant class blocked for want of Aadhaar even though physical settlement without Aadhaar seeding is allowed

**Aliases:** IW Aadhaar mandatory wrongly applied, Physical claim without Aadhaar refused, NRI/IW cannot seed Aadhaar

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** International Worker Claim, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Composite Claim Form
- **Severity:** high
- **Official/common message status:** Circular WSU/2020/Claim settlement without UAN-clarification/8726 dated 29.11.2024: for (i) IWs who left India without Aadhaar, (ii) Indian workers who permanently migrated and took foreign citizenship without Aadhaar, (iii) Nepal/Bhutan workers not residing in India and without Aadhaar — UAN is still required but Aadhaar seeding is dispensed with. Physical claims with passport (or Nepal/Bhutan citizenship ID), bank verification in all cases, and employer identity confirmation if balance exceeds Rs 5 lakh; pay by NEFT. NRIs who can get Aadhaar (182-day rule not mandatory for NRIs) are steered to Aadhaar enrolment rather than the waiver.

## What it means

Field offices sometimes still refuse IW claims for no Aadhaar, contrary to HO. Online Aadhaar-OTP claims will not work for these members; the lawful path is physical. Conversely, ordinary Indian residents cannot use this waiver to skip Aadhaar.

## Root cause

Staff applying the 2020 Aadhaar-seeding circular without reading the 2024 carve-out; member trying UMANG without Aadhaar.

## How it is detected

Physical claim returned for Aadhaar. IW portal / CoC vs settlement mix-up.

## Fix

- Generate UAN if missing (still mandatory).
- Do not keep trying online e-KYC.
- Submit physical Form 19/10C (or applicable) with passport copy, bank details, and other KYC; employer confirmation if > Rs 5 lakh.
- Quote circular dated 29.11.2024 in a covering letter to the OIC.
- Ensure the bank account can receive NEFT (often an Indian account or as the office specifies).
- Nepal/Bhutan: attach citizenship identification certificate.

## Required documents

- UAN
- Passport (IW) or citizenship ID (Nepal/Bhutan)
- Physical claim forms
- Bank proof
- Employer confirmation if balance > Rs 5 lakh

## Who acts

mixed

## Prevention

- IWs who still have time in India may enrol Aadhaar to use the faster online path.
- Keep passport details consistent with UAN nationality field.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-075](./epfo-rr-075.md)
- [epfo-rr-026](./epfo-rr-026.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Circular number and date taken from TaxGuru/StaffNews reproduction of the HO letter. NRI Aadhaar enrolment note is in the same circular table.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/International_workers.php

### Secondary (news / blog / forum)

- [news] https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html
- [news] https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html
- [news] https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm
- [blog] https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-074",
  "rejection_reason": "International worker or specified migrant class blocked for want of Aadhaar even though physical settlement without Aadhaar seeding is allowed",
  "aliases": [
    "IW Aadhaar mandatory wrongly applied",
    "Physical claim without Aadhaar refused",
    "NRI/IW cannot seed Aadhaar"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "International Worker Claim",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "Circular WSU/2020/Claim settlement without UAN-clarification/8726 dated 29.11.2024: for (i) IWs who left India without Aadhaar, (ii) Indian workers who permanently migrated and took foreign citizenship without Aadhaar, (iii) Nepal/Bhutan workers not residing in India and without Aadhaar — UAN is still required but Aadhaar seeding is dispensed with. Physical claims with passport (or Nepal/Bhutan citizenship ID), bank verification in all cases, and employer identity confirmation if balance exceeds Rs 5 lakh; pay by NEFT. NRIs who can get Aadhaar (182-day rule not mandatory for NRIs) are steered to Aadhaar enrolment rather than the waiver.",
  "what_it_means": "Field offices sometimes still refuse IW claims for no Aadhaar, contrary to HO. Online Aadhaar-OTP claims will not work for these members; the lawful path is physical. Conversely, ordinary Indian residents cannot use this waiver to skip Aadhaar.",
  "root_cause": "Staff applying the 2020 Aadhaar-seeding circular without reading the 2024 carve-out; member trying UMANG without Aadhaar.",
  "how_detected": "Physical claim returned for Aadhaar. IW portal / CoC vs settlement mix-up.",
  "fix_steps": [
    "Generate UAN if missing (still mandatory).",
    "Do not keep trying online e-KYC.",
    "Submit physical Form 19/10C (or applicable) with passport copy, bank details, and other KYC; employer confirmation if > Rs 5 lakh.",
    "Quote circular dated 29.11.2024 in a covering letter to the OIC.",
    "Ensure the bank account can receive NEFT (often an Indian account or as the office specifies).",
    "Nepal/Bhutan: attach citizenship identification certificate."
  ],
  "required_documents": [
    "UAN",
    "Passport (IW) or citizenship ID (Nepal/Bhutan)",
    "Physical claim forms",
    "Bank proof",
    "Employer confirmation if balance > Rs 5 lakh"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "IWs who still have time in India may enrol Aadhaar to use the faster online path.",
    "Keep passport details consistent with UAN nationality field."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-075",
    "epfo-rr-026"
  ],
  "source_urls": [
    "https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html",
    "https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html",
    "https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf",
    "https://www.epfindia.gov.in/site_en/International_workers.php"
  ],
  "source_types": [
    "circular",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "Circular number and date taken from TaxGuru/StaffNews reproduction of the HO letter. NRI Aadhaar enrolment note is in the same circular table.",
  "last_verified": "2026-09-12"
}
```
