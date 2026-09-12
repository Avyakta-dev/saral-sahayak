# UMANG app claim failed to sync or duplicated against the member portal (epfo-rr-055)

> Dataset record `epfo-rr-055`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** UMANG app claim failed to sync or duplicated against the member portal

**Aliases:** UMANG claim failed, UMANG not reflecting, Raise claim on UMANG rejected

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 31 Partial Withdrawal/Advance
- **Severity:** medium
- **Official/common message status:** EPFO services on UMANG allow Raise Claim with UAN and Aadhaar OTP. There is no separate law for UMANG rejections — they are the same KYC/eligibility rules plus app/sync failures.

## What it means

UMANG is another front end to the same claim engine. Failures: outdated app, UAN not linked in UMANG, OTP mismatch, or a claim already filed on the web portal. Status may show on one channel and not the other for a day.

## Root cause

Dual filing; app cache; Aadhaar not linked in UMANG profile.

## How it is detected

UMANG error toast. Portal Track Claim empty or duplicate.

## Fix

- Update UMANG; link UAN under EPFO services.
- Check the web member portal Track Claim before retrying.
- Use only one channel. If UMANG fails validation, fix KYC on the web portal first (KYC screens are richer there).
- Note the UMANG reference if generated.

## Required documents

- UAN
- Aadhaar OTP
- Updated UMANG app

## Who acts

member

## Prevention

- Prefer the unified member portal for complex cases (overlap, 10D, death). Use UMANG for straightforward verified-KYC Form 31/19.

## Related records

- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-054](./epfo-rr-054.md)
- [epfo-rr-007](./epfo-rr-007.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** UMANG is an official GoI app front-end; rejection reasons are not uniquely documented beyond the same OCS rules.

- https://cleartax.in/c/pf-withdrawal-online
- https://web.umang.gov.in
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-055",
  "rejection_reason": "UMANG app claim failed to sync or duplicated against the member portal",
  "aliases": [
    "UMANG claim failed",
    "UMANG not reflecting",
    "Raise claim on UMANG rejected"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 31 Partial Withdrawal/Advance"
  ],
  "severity": "medium",
  "official_status_or_message": "EPFO services on UMANG allow Raise Claim with UAN and Aadhaar OTP. There is no separate law for UMANG rejections — they are the same KYC/eligibility rules plus app/sync failures.",
  "what_it_means": "UMANG is another front end to the same claim engine. Failures: outdated app, UAN not linked in UMANG, OTP mismatch, or a claim already filed on the web portal. Status may show on one channel and not the other for a day.",
  "root_cause": "Dual filing; app cache; Aadhaar not linked in UMANG profile.",
  "how_detected": "UMANG error toast. Portal Track Claim empty or duplicate.",
  "fix_steps": [
    "Update UMANG; link UAN under EPFO services.",
    "Check the web member portal Track Claim before retrying.",
    "Use only one channel. If UMANG fails validation, fix KYC on the web portal first (KYC screens are richer there).",
    "Note the UMANG reference if generated."
  ],
  "required_documents": [
    "UAN",
    "Aadhaar OTP",
    "Updated UMANG app"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Prefer the unified member portal for complex cases (overlap, 10D, death). Use UMANG for straightforward verified-KYC Form 31/19."
  ],
  "related_reason_ids": [
    "epfo-rr-052",
    "epfo-rr-054",
    "epfo-rr-007"
  ],
  "source_urls": [
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://web.umang.gov.in",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "medium",
  "notes": "UMANG is an official GoI app front-end; rejection reasons are not uniquely documented beyond the same OCS rules.",
  "last_verified": "2026-09-12"
}
```
