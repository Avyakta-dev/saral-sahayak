# Legacy biometric (fingerprint) mismatch at Aadhaar authentication for claim or KYC (epfo-rr-152)

> Dataset record `epfo-rr-152`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Legacy biometric (fingerprint) mismatch at Aadhaar authentication for claim or KYC

**Aliases:** Fingerprint biometric mismatch EPFO, Aadhaar biometric failed PF claim, Biometric authentication not matching, Fingerprint not verified UIDAI EPFO, Biosensor failure Aadhaar eKYC

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 20 Death PF Settlement, Composite Claim Form, International Worker Claim
- **Severity:** high
- **Official/common message status:** Where fingerprint-based Aadhaar auth is still used (CSC/office or older flows), biometric mismatch from worn fingerprints, sensor quality, or demographic lock issues blocks e-KYC. Face auth on UMANG is the modern alternative path for many UAN services.

## What it means

Members with manual-labour worn fingerprints fail repeatedly at centres. Fix is alternate auth (OTP/face) or UIDAI biometric update — not JD name change.

## Root cause

Poor fingerprint quality; wet/dry fingers; outdated biometric templates; device failure.

## How it is detected

Centre/portal message biometric authentication failed. Multiple failed UIDAI attempts.

## Fix

- Retry OTP-based e-KYC on member portal if available for the journey.
- Use UMANG Face Authentication path for UAN activation/KYC refresh where enabled.
- Update biometrics/photo at UIDAI Aadhaar centre.
- For IW/physical exceptions, use passport path per physical non-Aadhaar clarifications when eligible.
- Avoid exhausting UIDAI lockouts; space attempts.

## Required documents

- Aadhaar
- UIDAI biometric update slip if done
- Passport if using non-Aadhaar physical path

## Who acts

member

## Prevention

- Prefer OTP/face over fingerprint when EPFO offers it.
- Update Aadhaar biometrics if fingerprints routinely fail elsewhere.

## Related records

- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-151](./epfo-rr-151.md)
- [epfo-rr-074](./epfo-rr-074.md)
- [epfo-rr-005](./epfo-rr-005.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Legacy biometric path; FAT circular positions face as preferred smartphone path.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** UIDAI — https://uidai.gov.in
- **[circular]** EPFO UAN allotment/activation via UMANG Face Authentication (FAT) manual 2025-26 — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** UMANG — https://web.umang.gov.in

### Secondary reporting (news, blog, forum)

- **[news]** TaxGuru: physical claims without Aadhaar 29 Nov 2024 — https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-152",
  "rejection_reason": "Legacy biometric (fingerprint) mismatch at Aadhaar authentication for claim or KYC",
  "aliases": [
    "Fingerprint biometric mismatch EPFO",
    "Aadhaar biometric failed PF claim",
    "Biometric authentication not matching",
    "Fingerprint not verified UIDAI EPFO",
    "Biosensor failure Aadhaar eKYC"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 20 Death PF Settlement",
    "Composite Claim Form",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Where fingerprint-based Aadhaar auth is still used (CSC/office or older flows), biometric mismatch from worn fingerprints, sensor quality, or demographic lock issues blocks e-KYC. Face auth on UMANG is the modern alternative path for many UAN services.",
  "what_it_means": "Members with manual-labour worn fingerprints fail repeatedly at centres. Fix is alternate auth (OTP/face) or UIDAI biometric update — not JD name change.",
  "root_cause": "Poor fingerprint quality; wet/dry fingers; outdated biometric templates; device failure.",
  "how_detected": "Centre/portal message biometric authentication failed. Multiple failed UIDAI attempts.",
  "fix_steps": [
    "Retry OTP-based e-KYC on member portal if available for the journey.",
    "Use UMANG Face Authentication path for UAN activation/KYC refresh where enabled.",
    "Update biometrics/photo at UIDAI Aadhaar centre.",
    "For IW/physical exceptions, use passport path per physical non-Aadhaar clarifications when eligible.",
    "Avoid exhausting UIDAI lockouts; space attempts."
  ],
  "required_documents": [
    "Aadhaar",
    "UIDAI biometric update slip if done",
    "Passport if using non-Aadhaar physical path"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Prefer OTP/face over fingerprint when EPFO offers it.",
    "Update Aadhaar biometrics if fingerprints routinely fail elsewhere."
  ],
  "related_reason_ids": [
    "epfo-rr-008",
    "epfo-rr-151",
    "epfo-rr-074",
    "epfo-rr-005"
  ],
  "source_urls": [
    "https://uidai.gov.in",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://taxguru.in/corporate-law/epfo-clarifies-physical-claim-settlement-seeding-aadhaar.html",
    "https://web.umang.gov.in"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "medium",
  "notes": "Legacy biometric path; FAT circular positions face as preferred smartphone path.",
  "last_verified": "2026-09-12"
}
```
