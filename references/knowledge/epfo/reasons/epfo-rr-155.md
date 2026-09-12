# Passport-only member blocked on Aadhaar-mandatory online path despite physical non-Aadhaar eligibility (epfo-rr-155)

> Dataset record `epfo-rr-155`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Passport-only member blocked on Aadhaar-mandatory online path despite physical non-Aadhaar eligibility

**Aliases:** Passport only no Aadhaar PF claim, Foreign passport member online claim blocked, Non Aadhaar physical claim required, IW passport settlement Aadhaar wall, Cannot seed Aadhaar passport holder

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** International Worker Claim, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Online Aadhaar-OTP claims fail for members without Aadhaar. Circular clarifications (e.g. 29.11.2024 lineage) allow physical settlement without Aadhaar seeding for specified IW/migrant classes with passport and bank verification; UAN remains mandatory. Related to 074/123 but focused on passport-only KYC posture.

## What it means

Hammering the online portal yields repeated Aadhaar errors. The correct path is physical Non-Aadhaar CCF / RO submission with passport — not inventing an Aadhaar.

## Root cause

Channel mismatch; employer forcing online-only HR process; unawareness of physical exemption classes.

## How it is detected

Online claim cannot start without Aadhaar seed. Portal errors on Aadhaar field.

## Fix

- Confirm you fall in a class allowed physical claim without Aadhaar seeding.
- Keep UAN active; prepare passport, visa/OCI as applicable, and bank verification.
- File Non-Aadhaar Composite Claim / physical forms with employer or authorised attestation as rules require.
- For balances above high-value thresholds, expect extra employer/RO identity confirmation.
- Quote the applicable physical-claim clarification in EPFiGMS if office demands Aadhaar wrongly.

## Required documents

- Passport
- UAN details
- Bank account proof in India as applicable
- Employer attestation / identity confirm

## Who acts

mixed

## Prevention

- IW employees should discuss exit settlement path with employer before leaving India.

## Related records

- [epfo-rr-074](./epfo-rr-074.md)
- [epfo-rr-123](./epfo-rr-123.md)
- [epfo-rr-049](./epfo-rr-049.md)
- [epfo-rr-075](./epfo-rr-075.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Anchored to physical claims without Aadhaar clarifications already in dataset sources.

- https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html
- https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html
- https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm
- https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf
- https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-155",
  "rejection_reason": "Passport-only member blocked on Aadhaar-mandatory online path despite physical non-Aadhaar eligibility",
  "aliases": [
    "Passport only no Aadhaar PF claim",
    "Foreign passport member online claim blocked",
    "Non Aadhaar physical claim required",
    "IW passport settlement Aadhaar wall",
    "Cannot seed Aadhaar passport holder"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "International Worker Claim",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Online Aadhaar-OTP claims fail for members without Aadhaar. Circular clarifications (e.g. 29.11.2024 lineage) allow physical settlement without Aadhaar seeding for specified IW/migrant classes with passport and bank verification; UAN remains mandatory. Related to 074/123 but focused on passport-only KYC posture.",
  "what_it_means": "Hammering the online portal yields repeated Aadhaar errors. The correct path is physical Non-Aadhaar CCF / RO submission with passport — not inventing an Aadhaar.",
  "root_cause": "Channel mismatch; employer forcing online-only HR process; unawareness of physical exemption classes.",
  "how_detected": "Online claim cannot start without Aadhaar seed. Portal errors on Aadhaar field.",
  "fix_steps": [
    "Confirm you fall in a class allowed physical claim without Aadhaar seeding.",
    "Keep UAN active; prepare passport, visa/OCI as applicable, and bank verification.",
    "File Non-Aadhaar Composite Claim / physical forms with employer or authorised attestation as rules require.",
    "For balances above high-value thresholds, expect extra employer/RO identity confirmation.",
    "Quote the applicable physical-claim clarification in EPFiGMS if office demands Aadhaar wrongly."
  ],
  "required_documents": [
    "Passport",
    "UAN details",
    "Bank account proof in India as applicable",
    "Employer attestation / identity confirm"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "IW employees should discuss exit settlement path with employer before leaving India."
  ],
  "related_reason_ids": [
    "epfo-rr-074",
    "epfo-rr-123",
    "epfo-rr-049",
    "epfo-rr-075"
  ],
  "source_urls": [
    "https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html",
    "https://www.staffnews.in/2024/12/settlement-of-physical-claims-without-seeding-of-aadhaar.html",
    "https://www.cnbctv18.com/personal-finance/epfo-relaxes-aadhaar-norms-for-select-employee-categories-key-details-19517361.htm",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "news",
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "Anchored to physical claims without Aadhaar clarifications already in dataset sources.",
  "last_verified": "2026-09-12"
}
```
