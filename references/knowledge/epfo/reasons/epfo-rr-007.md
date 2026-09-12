# UAN not activated or member portal credentials not usable (epfo-rr-007)

> Dataset record `epfo-rr-007`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** UAN not activated or member portal credentials not usable

**Aliases:** Inactive UAN, UAN not activated, Unable to login member portal, UAN not generated

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** critical
- **Official/common message status:** Official OCS FAQ: the member should have activated his/her Universal Account Number and the mobile number used for activating UAN should be in working condition.

## What it means

Activation means the member has claimed the UAN, set a password, and registered a mobile number. Unactivated UANs cannot file online claims, UMANG claims, e-nomination, or Joint Declaration. Some members have a UAN printed on payslips but never activated it; others lost the registered mobile. Composite Claim Form (Aadhaar) also requires an activated UAN.

## Root cause

Member never completed Activate UAN; mobile used at activation is dead; password forgotten and self-reset fails because KYC/mobile is stale; or employer never allotted/communicated UAN.

## How it is detected

Cannot log in. Activate UAN flow still available. OCS front-end blocks claim. Employer portal shows UAN unclaimed.

## Fix

- On the member portal choose Activate UAN; enter UAN, member ID, Aadhaar/PAN as asked, and a working mobile.
- If UAN is unknown, use Know Your UAN with Aadhaar/PAN/member ID on epfindia.gov.in.
- If the old mobile is dead, use the portal's mobile change after Aadhaar OTP, or get employer to update registered mobile.
- Reset password via Aadhaar OTP once Aadhaar is seeded.
- If no UAN exists (rare for current employees), employer must generate UAN and file ECR against it.
- Activate, complete KYC, then file the claim.

## Required documents

- UAN or member ID
- Aadhaar or PAN
- Working mobile number

## Who acts

mixed

## Prevention

- Activate UAN the week it is allotted.
- Keep the registered mobile alive or update it immediately on change.
- Store UAN and registered email securely.

## Related records

- [epfo-rr-009](./epfo-rr-009.md)
- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-054](./epfo-rr-054.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q2(a).

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- https://cleartax.in/c/pf-withdrawal-online
- https://hrsoftwaredelhi.com/pf-withdrawal-process/
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-007",
  "rejection_reason": "UAN not activated or member portal credentials not usable",
  "aliases": [
    "Inactive UAN",
    "UAN not activated",
    "Unable to login member portal",
    "UAN not generated"
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
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Official OCS FAQ: the member should have activated his/her Universal Account Number and the mobile number used for activating UAN should be in working condition.",
  "what_it_means": "Activation means the member has claimed the UAN, set a password, and registered a mobile number. Unactivated UANs cannot file online claims, UMANG claims, e-nomination, or Joint Declaration. Some members have a UAN printed on payslips but never activated it; others lost the registered mobile. Composite Claim Form (Aadhaar) also requires an activated UAN.",
  "root_cause": "Member never completed Activate UAN; mobile used at activation is dead; password forgotten and self-reset fails because KYC/mobile is stale; or employer never allotted/communicated UAN.",
  "how_detected": "Cannot log in. Activate UAN flow still available. OCS front-end blocks claim. Employer portal shows UAN unclaimed.",
  "fix_steps": [
    "On the member portal choose Activate UAN; enter UAN, member ID, Aadhaar/PAN as asked, and a working mobile.",
    "If UAN is unknown, use Know Your UAN with Aadhaar/PAN/member ID on epfindia.gov.in.",
    "If the old mobile is dead, use the portal's mobile change after Aadhaar OTP, or get employer to update registered mobile.",
    "Reset password via Aadhaar OTP once Aadhaar is seeded.",
    "If no UAN exists (rare for current employees), employer must generate UAN and file ECR against it.",
    "Activate, complete KYC, then file the claim."
  ],
  "required_documents": [
    "UAN or member ID",
    "Aadhaar or PAN",
    "Working mobile number"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Activate UAN the week it is allotted.",
    "Keep the registered mobile alive or update it immediately on change.",
    "Store UAN and registered email securely."
  ],
  "related_reason_ids": [
    "epfo-rr-009",
    "epfo-rr-005",
    "epfo-rr-054"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://hrsoftwaredelhi.com/pf-withdrawal-process/",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q2(a).",
  "last_verified": "2026-09-12"
}
```
