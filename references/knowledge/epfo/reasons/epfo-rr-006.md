# PAN not seeded for PF final settlement when service is less than five years (epfo-rr-006)

> Dataset record `epfo-rr-006`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** PAN not seeded for PF final settlement when service is less than five years

**Aliases:** PAN not linked, PAN KYC pending, PAN required for Form 19, PAN not verified

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Official OCS FAQ: Permanent Account Number (PAN) should be seeded in EPFO database for PF Final Settlement Claims in case his/her service is less than 5 years.

## What it means

For Form 19 final settlement, if total continuous EPF service is under five years, the withdrawal is generally taxable and EPFO requires PAN in the database so TDS can be applied at the correct rate. If PAN is missing, the claim can be rejected or processed with much higher TDS (commonly reported as maximum marginal rate / ~30% when PAN is not available, versus 10% if PAN is seeded and amount exceeds the TDS threshold). Even when service is over five years, unverified PAN can still block some KYC-complete checks. PAN name/DOB must also match Aadhaar/UAN or seeding itself fails.

## Root cause

PAN never uploaded; employer did not approve PAN KYC; PAN-Aadhaar linking not done with Income Tax; or PAN demographics differ from UAN.

## How it is detected

Manage > KYC PAN status not Verified. OCS eligibility check when Form 19 selected and service <5 years. TDS deduction in settlement advice.

## Fix

- Seed PAN under Manage > KYC with name exactly as on PAN.
- Ensure PAN is linked with Aadhaar on the Income Tax portal if required for verification.
- If PAN name/DOB differ from UAN, correct UAN via JD or get PAN corrected with NSDL/UTIITSL first.
- Wait for Verified status; then resubmit Form 19.
- If income is below taxable limit, also understand Form 15G/15H with the bank/EPFO tax process (see epfo-rr-078); that does not replace PAN seeding.

## Required documents

- PAN card or e-PAN
- Aadhaar (for PAN-Aadhaar link)
- Employer KYC approval if prompted

## Who acts

member

## Prevention

- Seed PAN along with Aadhaar and bank at first job.
- Do not wait until a taxable Form 19 to upload PAN.

## Related records

- [epfo-rr-014](./epfo-rr-014.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-078](./epfo-rr-078.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q2(d). Exact TDS percentages are Income-tax rules and can change; verify current TDS circulars. This dataset does not invent an EPFO rejection code.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO OCS FAQ eligibility (Oct 2017) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-006",
  "rejection_reason": "PAN not seeded for PF final settlement when service is less than five years",
  "aliases": [
    "PAN not linked",
    "PAN KYC pending",
    "PAN required for Form 19",
    "PAN not verified"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Official OCS FAQ: Permanent Account Number (PAN) should be seeded in EPFO database for PF Final Settlement Claims in case his/her service is less than 5 years.",
  "what_it_means": "For Form 19 final settlement, if total continuous EPF service is under five years, the withdrawal is generally taxable and EPFO requires PAN in the database so TDS can be applied at the correct rate. If PAN is missing, the claim can be rejected or processed with much higher TDS (commonly reported as maximum marginal rate / ~30% when PAN is not available, versus 10% if PAN is seeded and amount exceeds the TDS threshold). Even when service is over five years, unverified PAN can still block some KYC-complete checks. PAN name/DOB must also match Aadhaar/UAN or seeding itself fails.",
  "root_cause": "PAN never uploaded; employer did not approve PAN KYC; PAN-Aadhaar linking not done with Income Tax; or PAN demographics differ from UAN.",
  "how_detected": "Manage > KYC PAN status not Verified. OCS eligibility check when Form 19 selected and service <5 years. TDS deduction in settlement advice.",
  "fix_steps": [
    "Seed PAN under Manage > KYC with name exactly as on PAN.",
    "Ensure PAN is linked with Aadhaar on the Income Tax portal if required for verification.",
    "If PAN name/DOB differ from UAN, correct UAN via JD or get PAN corrected with NSDL/UTIITSL first.",
    "Wait for Verified status; then resubmit Form 19.",
    "If income is below taxable limit, also understand Form 15G/15H with the bank/EPFO tax process (see epfo-rr-078); that does not replace PAN seeding."
  ],
  "required_documents": [
    "PAN card or e-PAN",
    "Aadhaar (for PAN-Aadhaar link)",
    "Employer KYC approval if prompted"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Seed PAN along with Aadhaar and bank at first job.",
    "Do not wait until a taxable Form 19 to upload PAN."
  ],
  "related_reason_ids": [
    "epfo-rr-014",
    "epfo-rr-010",
    "epfo-rr-078"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q2(d). Exact TDS percentages are Income-tax rules and can change; verify current TDS circulars. This dataset does not invent an EPFO rejection code.",
  "last_verified": "2026-09-12"
}
```
