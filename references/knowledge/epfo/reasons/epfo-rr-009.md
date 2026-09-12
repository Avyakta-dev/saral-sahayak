# Registered mobile number inactive, not Aadhaar-linked, or not receiving EPFO/UIDAI OTPs (epfo-rr-009)

> Dataset record `epfo-rr-009`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Registered mobile number inactive, not Aadhaar-linked, or not receiving EPFO/UIDAI OTPs

**Aliases:** Mobile number not working, UAN mobile mismatch, OTP not received on registered mobile

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** OCS FAQ requires the mobile used for activating UAN to be in working condition, and claim OTP to go to the UIDAI-registered mobile.

## What it means

Two mobiles can be in play: (1) UAN-registered mobile for login/password and some SMS alerts; (2) Aadhaar-registered mobile for e-KYC and online claim OTP. If either is dead, SIM reissued without number portability completed, or DND-blocked, the member cannot finish login, JD, e-nomination, or claims. Some members update only UAN mobile and then cannot get Aadhaar OTP.

## Root cause

SIM change without updating UIDAI and EPFO; dual-mobile confusion; operator filtering of OTPs.

## How it is detected

Login OTP never arrives; claim OTP never arrives; SMS alerts stop.

## Fix

- List both numbers: UAN mobile (portal profile) and Aadhaar mobile (UIDAI).
- Update UAN mobile via portal (Aadhaar OTP) or employer.
- Update Aadhaar mobile via UIDAI if that is the broken one.
- Disable DND for transactional SMS; retry OTP.
- If completely locked out, visit the regional EPFO office with Aadhaar and a request to update contact, or use employer helpdesk.

## Required documents

- Aadhaar
- Proof of new mobile if office requires it
- Employer request letter if portal self-service fails

## Who acts

mixed

## Prevention

- Use one active number for both Aadhaar and UAN.
- After MNP/SIM swap, test OTP the same day.

## Related records

- [epfo-rr-007](./epfo-rr-007.md)
- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-054](./epfo-rr-054.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://pfbalancecheck.com/epfo-claim-rejected-reason/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-009",
  "rejection_reason": "Registered mobile number inactive, not Aadhaar-linked, or not receiving EPFO/UIDAI OTPs",
  "aliases": [
    "Mobile number not working",
    "UAN mobile mismatch",
    "OTP not received on registered mobile"
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
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "OCS FAQ requires the mobile used for activating UAN to be in working condition, and claim OTP to go to the UIDAI-registered mobile.",
  "what_it_means": "Two mobiles can be in play: (1) UAN-registered mobile for login/password and some SMS alerts; (2) Aadhaar-registered mobile for e-KYC and online claim OTP. If either is dead, SIM reissued without number portability completed, or DND-blocked, the member cannot finish login, JD, e-nomination, or claims. Some members update only UAN mobile and then cannot get Aadhaar OTP.",
  "root_cause": "SIM change without updating UIDAI and EPFO; dual-mobile confusion; operator filtering of OTPs.",
  "how_detected": "Login OTP never arrives; claim OTP never arrives; SMS alerts stop.",
  "fix_steps": [
    "List both numbers: UAN mobile (portal profile) and Aadhaar mobile (UIDAI).",
    "Update UAN mobile via portal (Aadhaar OTP) or employer.",
    "Update Aadhaar mobile via UIDAI if that is the broken one.",
    "Disable DND for transactional SMS; retry OTP.",
    "If completely locked out, visit the regional EPFO office with Aadhaar and a request to update contact, or use employer helpdesk."
  ],
  "required_documents": [
    "Aadhaar",
    "Proof of new mobile if office requires it",
    "Employer request letter if portal self-service fails"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Use one active number for both Aadhaar and UAN.",
    "After MNP/SIM swap, test OTP the same day."
  ],
  "related_reason_ids": [
    "epfo-rr-007",
    "epfo-rr-008",
    "epfo-rr-054"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
