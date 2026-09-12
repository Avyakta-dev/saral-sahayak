# OTP expired, portal session timeout, or claim not fully submitted (epfo-rr-054)

> Dataset record `epfo-rr-054`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** OTP expired, portal session timeout, or claim not fully submitted

**Aliases:** OTP expired, Session timeout, Claim not submitted, Captcha/OTP failure, OTP expired please retry, Session timeout claim not submitted, Claim submission incomplete

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** OCS process: authenticate using OTP to UIDAI-registered mobile to complete submission. If OTP is not completed, there is no claim to settle — members may think it was rejected.

## What it means

A half-submitted claim produces no acknowledgement number. Users interpret this as rejection. Causes: slow UIDAI, refreshing the page, entering UAN login OTP instead of Aadhaar OTP, session expiry.

## Root cause

Two-OTP confusion; network; UIDAI latency.

## How it is detected

No claim ID in Track Claim. Browser error.

## Fix

- Check Track Claim; if empty, nothing was filed.
- Use a stable connection; do not refresh after requesting OTP.
- Enter the Aadhaar/UIDAI OTP, not the login OTP.
- Retry off-peak. If chronic, use UMANG or physical CCF as fallback.

## Required documents

- Working Aadhaar mobile

## Who acts

member

## Prevention

- Keep the claim form filled in one sitting after KYC is already verified.

## Related records

- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-009](./epfo-rr-009.md)
- [epfo-rr-055](./epfo-rr-055.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-054",
  "rejection_reason": "OTP expired, portal session timeout, or claim not fully submitted",
  "aliases": [
    "OTP expired",
    "Session timeout",
    "Claim not submitted",
    "Captcha/OTP failure",
    "OTP expired please retry",
    "Session timeout claim not submitted",
    "Claim submission incomplete"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "OCS process: authenticate using OTP to UIDAI-registered mobile to complete submission. If OTP is not completed, there is no claim to settle — members may think it was rejected.",
  "what_it_means": "A half-submitted claim produces no acknowledgement number. Users interpret this as rejection. Causes: slow UIDAI, refreshing the page, entering UAN login OTP instead of Aadhaar OTP, session expiry.",
  "root_cause": "Two-OTP confusion; network; UIDAI latency.",
  "how_detected": "No claim ID in Track Claim. Browser error.",
  "fix_steps": [
    "Check Track Claim; if empty, nothing was filed.",
    "Use a stable connection; do not refresh after requesting OTP.",
    "Enter the Aadhaar/UIDAI OTP, not the login OTP.",
    "Retry off-peak. If chronic, use UMANG or physical CCF as fallback."
  ],
  "required_documents": [
    "Working Aadhaar mobile"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep the claim form filled in one sitting after KYC is already verified."
  ],
  "related_reason_ids": [
    "epfo-rr-008",
    "epfo-rr-009",
    "epfo-rr-055"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://cleartax.in/c/pf-withdrawal-online"
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
