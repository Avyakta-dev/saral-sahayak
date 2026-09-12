# UAN activation attempted on member portal after shift to UMANG Face Authentication only (epfo-rr-181)

> Dataset record `epfo-rr-181`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** UAN activation attempted on member portal after shift to UMANG Face Authentication only

**Aliases:** UAN activation removed from portal, Activate UAN only on UMANG, Portal UAN activation discontinued, Must use UMANG face auth for UAN, Cannot activate UAN on website anymore

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer
- **Severity:** high
- **Official/common message status:** 2025-26 EPFO communications and news (Business Today, Mint) state UAN allotment/activation moved to UMANG with Aadhaar Face Authentication; website activation paths discontinued. Members hitting dead portal links believe claims are rejected when UAN was never activated.

## What it means

Root blocker is channel change for activation, not claim eligibility. Activate via UMANG FAT, then claim on portal/app.

## Root cause

Policy/channel shift; outdated blog instructions telling users to activate on website.

## How it is detected

Portal activation option missing/errors. UMANG FAT required. Claim requires activated UAN.

## Fix

- Install UMANG + Aadhaar Face RD.
- Complete UAN activation/allotment via FAT flows per official manual.
- Set portal password after activation if needed; seed KYC.
- Then file claim on member portal.
- If FAT fails, follow face-auth fix path (151).

## Required documents

- Aadhaar and linked mobile
- UMANG access

## Who acts

member

## Prevention

- Ignore outdated tutorials that only show website activation.

## Related records

- [epfo-rr-007](./epfo-rr-007.md)
- [epfo-rr-151](./epfo-rr-151.md)
- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-008](./epfo-rr-008.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 2025-26 channel shift; cite FAT circular and contemporary news. Offline review flag: older portal Activate-UAN steps in epfo-rr-007 may be stale for the same member journey; do not treat either record alone as current-policy proof.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf
- [official] https://web.umang.gov.in

### Secondary (news / blog / forum)

- [news] https://taxguru.in/corporate-law/epfo-uan-activation-umang-app-face-authentication.html
- [news] https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html
- [news] https://www.businesstoday.in/personal-finance/news/story/epfo-revamps-unified-member-portal-uan-activation-shifts-to-umang-what-it-means-for-subscribers-540985-2026-07-04

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-181",
  "rejection_reason": "UAN activation attempted on member portal after shift to UMANG Face Authentication only",
  "aliases": [
    "UAN activation removed from portal",
    "Activate UAN only on UMANG",
    "Portal UAN activation discontinued",
    "Must use UMANG face auth for UAN",
    "Cannot activate UAN on website anymore"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer"
  ],
  "severity": "high",
  "official_status_or_message": "2025-26 EPFO communications and news (Business Today, Mint) state UAN allotment/activation moved to UMANG with Aadhaar Face Authentication; website activation paths discontinued. Members hitting dead portal links believe claims are rejected when UAN was never activated.",
  "what_it_means": "Root blocker is channel change for activation, not claim eligibility. Activate via UMANG FAT, then claim on portal/app.",
  "root_cause": "Policy/channel shift; outdated blog instructions telling users to activate on website.",
  "how_detected": "Portal activation option missing/errors. UMANG FAT required. Claim requires activated UAN.",
  "fix_steps": [
    "Install UMANG + Aadhaar Face RD.",
    "Complete UAN activation/allotment via FAT flows per official manual.",
    "Set portal password after activation if needed; seed KYC.",
    "Then file claim on member portal.",
    "If FAT fails, follow face-auth fix path (151)."
  ],
  "required_documents": [
    "Aadhaar and linked mobile",
    "UMANG access"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Ignore outdated tutorials that only show website activation."
  ],
  "related_reason_ids": [
    "epfo-rr-007",
    "epfo-rr-151",
    "epfo-rr-005",
    "epfo-rr-008"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/AllotmentAndActivationOfUAN_UMANGAppUsingFAT.pdf",
    "https://taxguru.in/corporate-law/epfo-uan-activation-umang-app-face-authentication.html",
    "https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html",
    "https://www.businesstoday.in/personal-finance/news/story/epfo-revamps-unified-member-portal-uan-activation-shifts-to-umang-what-it-means-for-subscribers-540985-2026-07-04",
    "https://web.umang.gov.in"
  ],
  "source_types": [
    "circular",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "2025-26 channel shift; cite FAT circular and contemporary news. Offline review flag: older portal Activate-UAN steps in epfo-rr-007 may be stale for the same member journey; do not treat either record alone as current-policy proof.",
  "last_verified": "2026-09-12"
}
```
