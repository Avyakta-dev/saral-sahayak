# DigiLocker-fetched KYC document rejected or not accepted as EPFO seeding proof (epfo-rr-154)

> Dataset record `epfo-rr-154`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** DigiLocker-fetched KYC document rejected or not accepted as EPFO seeding proof

**Aliases:** DigiLocker KYC rejected EPFO, DigiLocker Aadhaar not seeding, Issued document DigiLocker PF claim, DigiLocker PAN upload failed EPFO, eAadhaar DigiLocker not verified

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Members increasingly pull e-Aadhaar/PAN from DigiLocker. EPFO online claims still centre on UIDAI OTP e-KYC and employer-verified KYC rows. DigiLocker PDFs alone may not flip KYC to Verified if OTP e-KYC or employer approval is skipped.

## What it means

Uploading a DigiLocker PDF is not always equivalent to successful seeding. Fix path is portal e-KYC plus employer verify, not more PDF uploads.

## Root cause

Wrong channel; expired DigiLocker share link; expecting DigiLocker to replace UIDAI OTP.

## How it is detected

KYC remains Pending after DigiLocker upload. Claim remark KYC not verified.

## Fix

- Use Manage > KYC Aadhaar seeding with OTP to UIDAI.
- Seed PAN/bank through portal flows; get employer digital approval where required.
- Use DigiLocker copies only as supporting PDFs for physical/JD cases when asked.
- Refile claim after Verified ticks appear.

## Required documents

- Aadhaar via OTP e-KYC
- PAN
- Bank KYC

## Who acts

member

## Prevention

- Treat DigiLocker as document wallet, not as EPFO verification itself.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-006](./epfo-rr-006.md)
- [epfo-rr-016](./epfo-rr-016.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** DigiLocker is widely used by members; EPFO still keys off OTP e-KYC per OCS FAQ.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://uidai.gov.in
- https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval
- https://cleartax.in/c/pf-withdrawal-online

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-154",
  "rejection_reason": "DigiLocker-fetched KYC document rejected or not accepted as EPFO seeding proof",
  "aliases": [
    "DigiLocker KYC rejected EPFO",
    "DigiLocker Aadhaar not seeding",
    "Issued document DigiLocker PF claim",
    "DigiLocker PAN upload failed EPFO",
    "eAadhaar DigiLocker not verified"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Members increasingly pull e-Aadhaar/PAN from DigiLocker. EPFO online claims still centre on UIDAI OTP e-KYC and employer-verified KYC rows. DigiLocker PDFs alone may not flip KYC to Verified if OTP e-KYC or employer approval is skipped.",
  "what_it_means": "Uploading a DigiLocker PDF is not always equivalent to successful seeding. Fix path is portal e-KYC plus employer verify, not more PDF uploads.",
  "root_cause": "Wrong channel; expired DigiLocker share link; expecting DigiLocker to replace UIDAI OTP.",
  "how_detected": "KYC remains Pending after DigiLocker upload. Claim remark KYC not verified.",
  "fix_steps": [
    "Use Manage > KYC Aadhaar seeding with OTP to UIDAI.",
    "Seed PAN/bank through portal flows; get employer digital approval where required.",
    "Use DigiLocker copies only as supporting PDFs for physical/JD cases when asked.",
    "Refile claim after Verified ticks appear."
  ],
  "required_documents": [
    "Aadhaar via OTP e-KYC",
    "PAN",
    "Bank KYC"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Treat DigiLocker as document wallet, not as EPFO verification itself."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-010",
    "epfo-rr-006",
    "epfo-rr-016"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://uidai.gov.in",
    "https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "DigiLocker is widely used by members; EPFO still keys off OTP e-KYC per OCS FAQ.",
  "last_verified": "2026-09-12"
}
```
