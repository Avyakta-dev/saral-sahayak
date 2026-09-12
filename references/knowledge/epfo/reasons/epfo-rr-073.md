# Previous PF balances not transferred, leaving split corpus and incomplete service for settlement (epfo-rr-073)

> Dataset record `epfo-rr-073`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Previous PF balances not transferred, leaving split corpus and incomplete service for settlement

**Aliases:** Old PF not transferred, Unconsolidated accounts, Multiple member IDs untransferred

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** ClearTax: consolidate multiple EPF accounts through UAN then withdraw. FinRight: job changes without transfer create Annexure K / service gaps.

## What it means

You can sometimes withdraw only the last member ID, leaving older money stranded and EPS years short. Some offices reject a final settlement that would orphan related accounts; others settle only the current ID. Best practice is transfer-first then one settlement.

## Root cause

Never filed Form 13; Aadhaar conflict across UANs.

## How it is detected

Multiple passbooks. Settlement amount far below expected.

## Fix

- Transfer every old ID into the current UAN.
- Then file one Form 19/10C/10D.
- If an old ID cannot transfer (trust, closed office), claim that ID separately with the correct office after KYC, rather than expecting the last employer claim to pull it automatically.

## Required documents

- All member IDs
- Form 13
- Passbooks

## Who acts

member

## Prevention

- Form 13 at every job change is cheaper than archaeology at retirement.

## Related records

- [epfo-rr-069](./epfo-rr-069.md)
- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-037](./epfo-rr-037.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online
- **[blog]** FinRight: 9 common EPF rejection reasons — https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- **[blog]** Kustodian: Form 13 guide — https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-073",
  "rejection_reason": "Previous PF balances not transferred, leaving split corpus and incomplete service for settlement",
  "aliases": [
    "Old PF not transferred",
    "Unconsolidated accounts",
    "Multiple member IDs untransferred"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax: consolidate multiple EPF accounts through UAN then withdraw. FinRight: job changes without transfer create Annexure K / service gaps.",
  "what_it_means": "You can sometimes withdraw only the last member ID, leaving older money stranded and EPS years short. Some offices reject a final settlement that would orphan related accounts; others settle only the current ID. Best practice is transfer-first then one settlement.",
  "root_cause": "Never filed Form 13; Aadhaar conflict across UANs.",
  "how_detected": "Multiple passbooks. Settlement amount far below expected.",
  "fix_steps": [
    "Transfer every old ID into the current UAN.",
    "Then file one Form 19/10C/10D.",
    "If an old ID cannot transfer (trust, closed office), claim that ID separately with the correct office after KYC, rather than expecting the last employer claim to pull it automatically."
  ],
  "required_documents": [
    "All member IDs",
    "Form 13",
    "Passbooks"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Form 13 at every job change is cheaper than archaeology at retirement."
  ],
  "related_reason_ids": [
    "epfo-rr-069",
    "epfo-rr-046",
    "epfo-rr-037"
  ],
  "source_urls": [
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status"
  ],
  "source_types": [
    "blog"
  ],
  "confidence": "medium",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
