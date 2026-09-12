# Captcha or portal session expiry preventing claim submission completion (epfo-rr-174)

> Dataset record `epfo-rr-174`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Captcha or portal session expiry preventing claim submission completion

**Aliases:** Captcha failed EPFO claim, Session expired while filing claim, Portal timeout claim not submitted, Invalid captcha member portal, Login session ended mid claim

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer
- **Severity:** low
- **Official/common message status:** Member portal sessions and captchas routinely expire. Unlike OTP expiry already covered (054), captcha/session failures often leave no claim ID — members think they were rejected when nothing was filed.

## What it means

No backend reject exists yet. User must restart calmly; repeated frantic attempts can look like spam later.

## Root cause

Slow filling; multiple tabs; browser autofill; network drops.

## How it is detected

Error flash on submit; no claim acknowledgement number generated.

## Fix

- Use a single browser tab; disable aggressive autofill.
- Prepare data offline first; complete form quickly after login.
- If captcha fails, refresh once and retry; avoid dozens of attempts.
- Confirm Track Claim for a new ID before assuming rejection.
- Try alternate browser or wired network if session keeps dying.

## Required documents

_None recorded._

## Who acts

member

## Prevention

- File during off-peak hours with stable connectivity.

## Related records

- [epfo-rr-054](./epfo-rr-054.md)
- [epfo-rr-057](./epfo-rr-057.md)
- [epfo-rr-124](./epfo-rr-124.md)
- [epfo-rr-175](./epfo-rr-175.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** UX failure mode widely reported; low severity if no claim created.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** UMANG — https://web.umang.gov.in

### Secondary reporting (news, blog, forum)

- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[blog]** FinRight: 9 common EPF rejection reasons — https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-174",
  "rejection_reason": "Captcha or portal session expiry preventing claim submission completion",
  "aliases": [
    "Captcha failed EPFO claim",
    "Session expired while filing claim",
    "Portal timeout claim not submitted",
    "Invalid captcha member portal",
    "Login session ended mid claim"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer"
  ],
  "severity": "low",
  "official_status_or_message": "Member portal sessions and captchas routinely expire. Unlike OTP expiry already covered (054), captcha/session failures often leave no claim ID — members think they were rejected when nothing was filed.",
  "what_it_means": "No backend reject exists yet. User must restart calmly; repeated frantic attempts can look like spam later.",
  "root_cause": "Slow filling; multiple tabs; browser autofill; network drops.",
  "how_detected": "Error flash on submit; no claim acknowledgement number generated.",
  "fix_steps": [
    "Use a single browser tab; disable aggressive autofill.",
    "Prepare data offline first; complete form quickly after login.",
    "If captcha fails, refresh once and retry; avoid dozens of attempts.",
    "Confirm Track Claim for a new ID before assuming rejection.",
    "Try alternate browser or wired network if session keeps dying."
  ],
  "required_documents": [],
  "who_acts": "member",
  "prevention_tips": [
    "File during off-peak hours with stable connectivity."
  ],
  "related_reason_ids": [
    "epfo-rr-054",
    "epfo-rr-057",
    "epfo-rr-124",
    "epfo-rr-175"
  ],
  "source_urls": [
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://web.umang.gov.in",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "UX failure mode widely reported; low severity if no claim created.",
  "last_verified": "2026-09-12"
}
```
