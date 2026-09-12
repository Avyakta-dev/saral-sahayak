# Aadhaar not seeded or not verified against UAN (epfo-rr-005)

> Dataset record `epfo-rr-005`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Aadhaar not seeded or not verified against UAN

**Aliases:** Aadhaar not linked, Aadhaar not verified, KYC pending Aadhaar, Aadhaar seeding pending, UAN not linked with Aadhaar, Aadhaar not seeded with UAN, Aadhaar KYC pending, Link Aadhaar before claim, Aadhaar seeding mandatory for online claim, SMS: KYC Pending Aadhaar

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance
- **Severity:** critical
- **Official/common message status:** Official OCS FAQ: member's Aadhaar details should be seeded in EPFO database and the member should avail OTP-based facility for verifying e-KYC from UIDAI while submitting the claim. Portal remarks: 'KYC pending', 'Aadhaar not verified'.

## What it means

Seeding means the 12-digit Aadhaar number is stored against the UAN and UIDAI has confirmed a demographic match. Without verified Aadhaar, the member generally cannot file Aadhaar-based online claims on the member portal or UMANG, and cannot use Composite Claim Form (Aadhaar) without employer attestation. Physical/non-Aadhaar routes still exist but are slower and need employer attestation. Limited classes of members (certain international workers, some Nepal/Bhutan workers, some foreign-citizen former Indian workers) may settle physical claims without Aadhaar under circular dated 29.11.2024, but a UAN is still mandatory.

## Root cause

Member never seeded Aadhaar; seeding failed demographic match; employer never digitally approved KYC; or Aadhaar mobile not available for OTP.

## How it is detected

Manage > KYC shows Aadhaar as Not uploaded / Pending / Failed rather than Verified. Online claim menu may be disabled or submission fails at OTP.

## Fix

- Login to unified member portal > Manage > KYC > enter Aadhaar number and name exactly as printed on Aadhaar.
- Complete UIDAI OTP authentication so status becomes Verified (green).
- If the portal requires employer approval, ask HR to digitally approve Aadhaar KYC; follow up until status is Verified, not merely uploaded.
- If name/DOB prevent seeding, first complete Joint Declaration (see related reasons), then seed.
- If Aadhaar is linked to another UAN, complete UAN merge/delink first (epfo-rr-011, epfo-rr-046).
- International workers who left India without Aadhaar should not keep retrying online seeding; use the physical-claim exemption circular instead (epfo-rr-074).
- Only after Verified status, file the claim.

## Required documents

- Aadhaar/e-Aadhaar
- Aadhaar-registered mobile for OTP
- Employer digital approval if the portal still routes KYC to employer

## Who acts

mixed

## Prevention

- Seed Aadhaar immediately after UAN allotment, not at resignation.
- Keep the Aadhaar mobile number active.
- Confirm Verified status, not just that the number is displayed.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-011](./epfo-rr-011.md)
- [epfo-rr-049](./epfo-rr-049.md)
- [epfo-rr-074](./epfo-rr-074.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q2(b) is the primary official requirement. 29.11.2024 circular WSU/2020/Claim settlement without UAN-clarification/8726 is the Aadhaar-seed waiver for specified IW/NRI classes only.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html
- https://cleartax.in/c/pf-withdrawal-online
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-005",
  "rejection_reason": "Aadhaar not seeded or not verified against UAN",
  "aliases": [
    "Aadhaar not linked",
    "Aadhaar not verified",
    "KYC pending Aadhaar",
    "Aadhaar seeding pending",
    "UAN not linked with Aadhaar",
    "Aadhaar not seeded with UAN",
    "Aadhaar KYC pending",
    "Link Aadhaar before claim",
    "Aadhaar seeding mandatory for online claim",
    "SMS: KYC Pending Aadhaar"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance"
  ],
  "severity": "critical",
  "official_status_or_message": "Official OCS FAQ: member's Aadhaar details should be seeded in EPFO database and the member should avail OTP-based facility for verifying e-KYC from UIDAI while submitting the claim. Portal remarks: 'KYC pending', 'Aadhaar not verified'.",
  "what_it_means": "Seeding means the 12-digit Aadhaar number is stored against the UAN and UIDAI has confirmed a demographic match. Without verified Aadhaar, the member generally cannot file Aadhaar-based online claims on the member portal or UMANG, and cannot use Composite Claim Form (Aadhaar) without employer attestation. Physical/non-Aadhaar routes still exist but are slower and need employer attestation. Limited classes of members (certain international workers, some Nepal/Bhutan workers, some foreign-citizen former Indian workers) may settle physical claims without Aadhaar under circular dated 29.11.2024, but a UAN is still mandatory.",
  "root_cause": "Member never seeded Aadhaar; seeding failed demographic match; employer never digitally approved KYC; or Aadhaar mobile not available for OTP.",
  "how_detected": "Manage > KYC shows Aadhaar as Not uploaded / Pending / Failed rather than Verified. Online claim menu may be disabled or submission fails at OTP.",
  "fix_steps": [
    "Login to unified member portal > Manage > KYC > enter Aadhaar number and name exactly as printed on Aadhaar.",
    "Complete UIDAI OTP authentication so status becomes Verified (green).",
    "If the portal requires employer approval, ask HR to digitally approve Aadhaar KYC; follow up until status is Verified, not merely uploaded.",
    "If name/DOB prevent seeding, first complete Joint Declaration (see related reasons), then seed.",
    "If Aadhaar is linked to another UAN, complete UAN merge/delink first (epfo-rr-011, epfo-rr-046).",
    "International workers who left India without Aadhaar should not keep retrying online seeding; use the physical-claim exemption circular instead (epfo-rr-074).",
    "Only after Verified status, file the claim."
  ],
  "required_documents": [
    "Aadhaar/e-Aadhaar",
    "Aadhaar-registered mobile for OTP",
    "Employer digital approval if the portal still routes KYC to employer"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Seed Aadhaar immediately after UAN allotment, not at resignation.",
    "Keep the Aadhaar mobile number active.",
    "Confirm Verified status, not just that the number is displayed."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-008",
    "epfo-rr-010",
    "epfo-rr-011",
    "epfo-rr-049",
    "epfo-rr-074"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q2(b) is the primary official requirement. 29.11.2024 circular WSU/2020/Claim settlement without UAN-clarification/8726 is the Aadhaar-seed waiver for specified IW/NRI classes only.",
  "last_verified": "2026-09-12"
}
```
