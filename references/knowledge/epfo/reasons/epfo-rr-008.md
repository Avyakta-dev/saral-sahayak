# Aadhaar OTP or UIDAI e-KYC authentication failed at claim submission (epfo-rr-008)

> Dataset record `epfo-rr-008`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Aadhaar OTP or UIDAI e-KYC authentication failed at claim submission

**Aliases:** Aadhaar OTP not received, e-KYC failed, UIDAI authentication failure, OTP based Aadhaar verification failed, Aadhaar OTP failed at claim, UIDAI e-KYC authentication failed, OTP not received from UIDAI, eKYC consent failed

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim, Form 13 Transfer
- **Severity:** high
- **Official/common message status:** Official OCS FAQ: members applying online are required to authenticate claim submission using OTP sent to their UIDAI registered mobile number giving consent to UIDAI to share their e-KYC (Aadhaar) credentials to EPFO.

## What it means

Even with Aadhaar seeded, the claim is not complete until UIDAI sends an OTP to the Aadhaar-registered mobile and the member consents to share e-KYC. Failures look like 'claim not submitted', session timeout, or a later rejection if a stale KYC snapshot was used. Common causes: Aadhaar mobile is a family member's number, DND, UIDAI outage, entering UAN-registered mobile instead of Aadhaar mobile, or biometric lock issues when using certain UIDAI flows.

## Root cause

UIDAI mobile not updated; OTP expiry; consent not completed; name/DOB fail the live UIDAI match even if old seeding succeeded.

## How it is detected

No OTP on Aadhaar mobile; 'invalid OTP'; claim acknowledgement never generated; e-KYC error on screen.

## Fix

- Check which mobile is registered on UIDAI (myAadhaar / enrolment slip), not merely the UAN mobile.
- Update Aadhaar mobile at an Aadhaar centre or via myAadhaar if eligible, then retry after UIDAI reflects the change.
- Unlock Aadhaar biometrics if locked, and ensure Aadhaar is not deactivated.
- Retry e-KYC at a low-traffic time; do not refresh mid-OTP.
- If live e-KYC now fails due to name/DOB, fix UAN via Joint Declaration first.
- As fallback, use Composite Claim Form (Non-Aadhaar) with employer attestation, or physical claim at the field office.

## Required documents

- Aadhaar
- Access to Aadhaar-registered mobile
- Fallback: physical composite claim + employer attestation

## Who acts

member

## Prevention

- Keep Aadhaar and UAN on the same mobile when possible.
- Test Aadhaar OTP (UMANG/myAadhaar) before filing a time-sensitive claim.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-009](./epfo-rr-009.md)
- [epfo-rr-054](./epfo-rr-054.md)
- [epfo-rr-049](./epfo-rr-049.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q11. No invented error code.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-008",
  "rejection_reason": "Aadhaar OTP or UIDAI e-KYC authentication failed at claim submission",
  "aliases": [
    "Aadhaar OTP not received",
    "e-KYC failed",
    "UIDAI authentication failure",
    "OTP based Aadhaar verification failed",
    "Aadhaar OTP failed at claim",
    "UIDAI e-KYC authentication failed",
    "OTP not received from UIDAI",
    "eKYC consent failed"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "Form 13 Transfer"
  ],
  "severity": "high",
  "official_status_or_message": "Official OCS FAQ: members applying online are required to authenticate claim submission using OTP sent to their UIDAI registered mobile number giving consent to UIDAI to share their e-KYC (Aadhaar) credentials to EPFO.",
  "what_it_means": "Even with Aadhaar seeded, the claim is not complete until UIDAI sends an OTP to the Aadhaar-registered mobile and the member consents to share e-KYC. Failures look like 'claim not submitted', session timeout, or a later rejection if a stale KYC snapshot was used. Common causes: Aadhaar mobile is a family member's number, DND, UIDAI outage, entering UAN-registered mobile instead of Aadhaar mobile, or biometric lock issues when using certain UIDAI flows.",
  "root_cause": "UIDAI mobile not updated; OTP expiry; consent not completed; name/DOB fail the live UIDAI match even if old seeding succeeded.",
  "how_detected": "No OTP on Aadhaar mobile; 'invalid OTP'; claim acknowledgement never generated; e-KYC error on screen.",
  "fix_steps": [
    "Check which mobile is registered on UIDAI (myAadhaar / enrolment slip), not merely the UAN mobile.",
    "Update Aadhaar mobile at an Aadhaar centre or via myAadhaar if eligible, then retry after UIDAI reflects the change.",
    "Unlock Aadhaar biometrics if locked, and ensure Aadhaar is not deactivated.",
    "Retry e-KYC at a low-traffic time; do not refresh mid-OTP.",
    "If live e-KYC now fails due to name/DOB, fix UAN via Joint Declaration first.",
    "As fallback, use Composite Claim Form (Non-Aadhaar) with employer attestation, or physical claim at the field office."
  ],
  "required_documents": [
    "Aadhaar",
    "Access to Aadhaar-registered mobile",
    "Fallback: physical composite claim + employer attestation"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep Aadhaar and UAN on the same mobile when possible.",
    "Test Aadhaar OTP (UMANG/myAadhaar) before filing a time-sensitive claim."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-009",
    "epfo-rr-054",
    "epfo-rr-049"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q11. No invented error code.",
  "last_verified": "2026-09-12"
}
```
