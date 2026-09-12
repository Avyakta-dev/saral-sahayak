# Mobile app vs web portal claim channel conflict or divergent submission state (epfo-rr-176)

> Dataset record `epfo-rr-176`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Mobile app vs web portal claim channel conflict or divergent submission state

**Aliases:** UMANG vs portal claim conflict, App claim not reflecting on website, Filed on app rejected on portal, Duplicate claim app and web, Channel mismatch mobile web EPFO

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** UMANG and member portal share backend eligibility but can show divergent statuses (already partly in 055/130). Filing on both channels creates duplicate-in-process rejects.

## What it means

Pick one channel. If app shows failed and web shows in process, do not file again — reconcile statuses first.

## Root cause

Double submission; sync lag; using app while web session still open mid-flow.

## How it is detected

Two claim IDs. Mismatched status screenshots. Duplicate remark.

## Fix

- List all claim IDs from UMANG and portal Track Claim.
- Wait for terminal status on existing IDs; do not triple-file.
- Prefer member portal for complex service-history cases.
- EPFiGMS if statuses remain contradictory after 48-72 hours.

## Required documents

- Screenshots from both channels
- Claim IDs

## Who acts

member

## Prevention

- Use only one channel per claim attempt.

## Related records

- [epfo-rr-055](./epfo-rr-055.md)
- [epfo-rr-130](./epfo-rr-130.md)
- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-057](./epfo-rr-057.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Combines known UMANG sync issues into an explicit channel-conflict reason.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** UMANG — https://web.umang.gov.in
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[news]** Mint: EPFO account blocked / UAN / KYC pending fixes (UMANG) — https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-176",
  "rejection_reason": "Mobile app vs web portal claim channel conflict or divergent submission state",
  "aliases": [
    "UMANG vs portal claim conflict",
    "App claim not reflecting on website",
    "Filed on app rejected on portal",
    "Duplicate claim app and web",
    "Channel mismatch mobile web EPFO"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "UMANG and member portal share backend eligibility but can show divergent statuses (already partly in 055/130). Filing on both channels creates duplicate-in-process rejects.",
  "what_it_means": "Pick one channel. If app shows failed and web shows in process, do not file again — reconcile statuses first.",
  "root_cause": "Double submission; sync lag; using app while web session still open mid-flow.",
  "how_detected": "Two claim IDs. Mismatched status screenshots. Duplicate remark.",
  "fix_steps": [
    "List all claim IDs from UMANG and portal Track Claim.",
    "Wait for terminal status on existing IDs; do not triple-file.",
    "Prefer member portal for complex service-history cases.",
    "EPFiGMS if statuses remain contradictory after 48-72 hours."
  ],
  "required_documents": [
    "Screenshots from both channels",
    "Claim IDs"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Use only one channel per claim attempt."
  ],
  "related_reason_ids": [
    "epfo-rr-055",
    "epfo-rr-130",
    "epfo-rr-052",
    "epfo-rr-057"
  ],
  "source_urls": [
    "https://web.umang.gov.in",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.livemint.com/money/personal-finance/epfo-members-account-blocked-uan-no-access-passbook-kyc-pending-common-issues-how-fix-it-provident-fund-portal-umang-app-11785514948903.html",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "Combines known UMANG sync issues into an explicit channel-conflict reason.",
  "last_verified": "2026-09-12"
}
```
