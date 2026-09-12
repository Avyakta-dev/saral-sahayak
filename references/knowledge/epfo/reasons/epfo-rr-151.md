# Aadhaar face authentication failure on UMANG blocking UAN activation or KYC refresh (epfo-rr-151)

> Dataset record `epfo-rr-151`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Aadhaar face authentication failure on UMANG blocking UAN activation or KYC refresh

**Aliases:** Face authentication failure EPFO, FAT failed UMANG UAN, Aadhaar Face RD authentication failed, Face scan not matching Aadhaar EPFO, UAN activation face auth error

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, International Worker Claim
- **Severity:** critical
- **Official/common message status:** EPFO circular/user manual on UMANG Face Authentication Technology (FAT) for UAN allotment/activation lists Face Authentication Failure as a defined error; retry or contact support. Portal UAN activation shifted toward UMANG FAT. Claims cannot proceed if UAN/KYC path is blocked by failed face match.

## What it means

Lighting, outdated Aadhaar photo, missing Face RD app, or demographic mismatch can fail FAT. Distinct from OTP failure (008) and from name mismatch after successful e-KYC (001).

## Root cause

Poor scan conditions; stale Aadhaar photograph; Aadhaar-UAN demographic mismatch halting process; app/version issues.

## How it is detected

UMANG error Face Authentication Failure. UAN remains inactive. Claim button unavailable.

## Fix

- Install/update UMANG and Aadhaar Face RD; retry in bright even light without mask/glasses glare.
- Confirm Aadhaar-linked mobile for OTP.
- If demographics mismatch, correct via Joint Declaration / Modify Basic Details before retrying FAT.
- If Aadhaar photo is outdated, update photo at UIDAI then retry.
- EPFiGMS with screenshots if repeated FAT failures after UIDAI update.

## Required documents

- Aadhaar
- Screenshot of FAT error
- UIDAI update acknowledgement if photo changed

## Who acts

member

## Prevention

- Keep Aadhaar photo reasonably current.
- Activate UAN well before needing a claim.

## Related records

- [epfo-rr-007](./epfo-rr-007.md)
- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-005](./epfo-rr-005.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Official FAT PDF on epfindia 2025-26 circulars folder.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** EPFO UAN allotment/activation via UMANG Face Authentication (FAT) manual 2025-26 — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf
- **[official]** UIDAI — https://uidai.gov.in
- **[official]** UMANG — https://web.umang.gov.in

### Secondary reporting (news, blog, forum)

- **[news]** TaxGuru: UAN activation via UMANG Face Authentication — https://taxguru.in/corporate-law/epfo-uan-activation-umang-app-face-authentication.html
- **[news]** Mint: EPFO account blocked / UAN / KYC pending fixes (UMANG) — https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-151",
  "rejection_reason": "Aadhaar face authentication failure on UMANG blocking UAN activation or KYC refresh",
  "aliases": [
    "Face authentication failure EPFO",
    "FAT failed UMANG UAN",
    "Aadhaar Face RD authentication failed",
    "Face scan not matching Aadhaar EPFO",
    "UAN activation face auth error"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "EPFO circular/user manual on UMANG Face Authentication Technology (FAT) for UAN allotment/activation lists Face Authentication Failure as a defined error; retry or contact support. Portal UAN activation shifted toward UMANG FAT. Claims cannot proceed if UAN/KYC path is blocked by failed face match.",
  "what_it_means": "Lighting, outdated Aadhaar photo, missing Face RD app, or demographic mismatch can fail FAT. Distinct from OTP failure (008) and from name mismatch after successful e-KYC (001).",
  "root_cause": "Poor scan conditions; stale Aadhaar photograph; Aadhaar-UAN demographic mismatch halting process; app/version issues.",
  "how_detected": "UMANG error Face Authentication Failure. UAN remains inactive. Claim button unavailable.",
  "fix_steps": [
    "Install/update UMANG and Aadhaar Face RD; retry in bright even light without mask/glasses glare.",
    "Confirm Aadhaar-linked mobile for OTP.",
    "If demographics mismatch, correct via Joint Declaration / Modify Basic Details before retrying FAT.",
    "If Aadhaar photo is outdated, update photo at UIDAI then retry.",
    "EPFiGMS with screenshots if repeated FAT failures after UIDAI update."
  ],
  "required_documents": [
    "Aadhaar",
    "Screenshot of FAT error",
    "UIDAI update acknowledgement if photo changed"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep Aadhaar photo reasonably current.",
    "Activate UAN well before needing a claim."
  ],
  "related_reason_ids": [
    "epfo-rr-007",
    "epfo-rr-008",
    "epfo-rr-001",
    "epfo-rr-005"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf",
    "https://taxguru.in/corporate-law/epfo-uan-activation-umang-app-face-authentication.html",
    "https://uidai.gov.in",
    "https://web.umang.gov.in",
    "https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html"
  ],
  "source_types": [
    "circular",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "Official FAT PDF on epfindia 2025-26 circulars folder.",
  "last_verified": "2026-09-12"
}
```
