# Form 31 amount exceeds permitted limit or would breach the mandatory retained balance (epfo-rr-040)

> Dataset record `epfo-rr-040`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 amount exceeds permitted limit or would breach the mandatory retained balance

**Aliases:** Amount exceeds limit, 25 percent minimum balance, Advance more than eligible, 75 percent cap, Amount exceeds eligible limit, 25 percent minimum balance rule, Claim amount more than permitted, Retention balance breach Form 31

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Mint (3 Jul 2026) on EPF Scheme 2026: members must maintain 25% minimum balance, i.e. access at most 75% on partial withdrawal. ClearTax and Jagran Josh report the same. Historical Form 31 had purpose-specific rupee/wage multiples (e.g. 6 months' wages for medical, 90% for housing). The portal now typically auto-calculates eligible amount.

## What it means

Typing a round number larger than the eligible slice causes rejection or truncation. Under 2026 reporting, even if a purpose allows 'up to 100% of eligible', 25% of the corpus must remain. Members who try to drain the account via Form 31 while employed hit this cap.

## Root cause

Manual amount entry above system cap; not reading the computed eligible amount; confusing employee-share-only limits with total corpus.

## How it is detected

Amount field vs eligible amount. Rejection remark on excess. Portal warning.

## Fix

- Let the portal display eligible amount; do not override upward.
- For medical/education/housing, understand whether the cap is employee share, months of wages, or percent of balance.
- Refile within the cap. If you need the rest, you must actually exit and use Form 19 after eligibility, not stack Form 31s beyond rules.

## Required documents

- Passbook
- Portal eligible-amount screenshot

## Who acts

member

## Prevention

- Treat the auto-calculated amount as the legal maximum.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-034](./epfo-rr-034.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 25% retention is well reported for Scheme 2026 but gazette not fetched here. Historical purpose caps remain relevant if the portal still applies them. Offline review flag: portal-calculated amount is not independently established legal authority; do not promise a retention percentage from secondary reporting alone.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary (news / blog / forum)

- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1
- [blog] https://kustodian.life/resources/provident-fund/epf-scheme-2026-withdrawal-rules-changed
- [blog] https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-040",
  "rejection_reason": "Form 31 amount exceeds permitted limit or would breach the mandatory retained balance",
  "aliases": [
    "Amount exceeds limit",
    "25 percent minimum balance",
    "Advance more than eligible",
    "75 percent cap",
    "Amount exceeds eligible limit",
    "25 percent minimum balance rule",
    "Claim amount more than permitted",
    "Retention balance breach Form 31"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Mint (3 Jul 2026) on EPF Scheme 2026: members must maintain 25% minimum balance, i.e. access at most 75% on partial withdrawal. ClearTax and Jagran Josh report the same. Historical Form 31 had purpose-specific rupee/wage multiples (e.g. 6 months' wages for medical, 90% for housing). The portal now typically auto-calculates eligible amount.",
  "what_it_means": "Typing a round number larger than the eligible slice causes rejection or truncation. Under 2026 reporting, even if a purpose allows 'up to 100% of eligible', 25% of the corpus must remain. Members who try to drain the account via Form 31 while employed hit this cap.",
  "root_cause": "Manual amount entry above system cap; not reading the computed eligible amount; confusing employee-share-only limits with total corpus.",
  "how_detected": "Amount field vs eligible amount. Rejection remark on excess. Portal warning.",
  "fix_steps": [
    "Let the portal display eligible amount; do not override upward.",
    "For medical/education/housing, understand whether the cap is employee share, months of wages, or percent of balance.",
    "Refile within the cap. If you need the rest, you must actually exit and use Form 19 after eligibility, not stack Form 31s beyond rules."
  ],
  "required_documents": [
    "Passbook",
    "Portal eligible-amount screenshot"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Treat the auto-calculated amount as the legal maximum."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-034"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.jagranjosh.com/general-knowledge/epf-scheme-withdrawal-rules-2026-3day-settlement-limits-and-online-claim-1820010445-1",
    "https://kustodian.life/resources/provident-fund/epf-scheme-2026-withdrawal-rules-changed",
    "https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31"
  ],
  "source_types": [
    "news",
    "blog"
  ],
  "confidence": "medium",
  "notes": "25% retention is well reported for Scheme 2026 but gazette not fetched here. Historical purpose caps remain relevant if the portal still applies them. Offline review flag: portal-calculated amount is not independently established legal authority; do not promise a retention percentage from secondary reporting alone.",
  "last_verified": "2026-09-12"
}
```
