# Transfer settled but balance mismatch — amount debited at source not credited at destination (epfo-rr-144)

> Dataset record `epfo-rr-144`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Transfer settled but balance mismatch — amount debited at source not credited at destination

**Aliases:** Transfer amount deducted not credited, Form 13 settled money missing, PF transfer debit without credit, Annexure K internal rejection after debit, Re-credit transfer amount pending

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** Members report Form 13 status Settled or debited passbook at source while destination passbook never rises. Causes include EPS mismatch, internal rejection after debit, or wrong MID credit. Fix is re-credit at source then re-transfer — not filing Form 19 on a zeroed source.

## What it means

Money is in limbo inside EPFO accounting, not paid to the member. Duplicate transfers worsen it. Distinct from NEFT payment return after claim settlement (022).

## Root cause

EPS/DOJ mismatch at destination; wrong member ID; backend rejection after accounting debit; inter-RO coordination failure.

## How it is detected

Source passbook debit + destination unchanged. Transfer claim Settled. RO advising re-credit.

## Fix

- Screenshot source debit, destination passbook, and transfer claim ID/status.
- EPFiGMS to both source and destination ROs requesting re-credit or completion with amounts and dates.
- Ask destination to issue rejection/Annexure clarity so source can re-credit if needed.
- Do not file Form 19 on the emptied source MID until funds are located.
- Escalate via EPFiGMS reminders; RTI for file notings if months elapse.

## Required documents

- Source and destination passbook screenshots
- Transfer claim acknowledgement
- Service History

## Who acts

EPFO_office

## Prevention

- Align name/DOB/EPS flags on source and destination before transfer.
- Monitor both passbooks within weeks of settled transfer.

## Related records

- [epfo-rr-069](./epfo-rr-069.md)
- [epfo-rr-072](./epfo-rr-072.md)
- [epfo-rr-071](./epfo-rr-071.md)
- [epfo-rr-142](./epfo-rr-142.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, forum, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Widely reported operational failure mode; no single public rejection code.

- https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction
- https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix
- https://www.reddit.com/r/epfoindia/comments/1taoams/epfo_pf_transfer_stuck_for_4_years_amount/
- https://epfigms.gov.in/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-144",
  "rejection_reason": "Transfer settled but balance mismatch — amount debited at source not credited at destination",
  "aliases": [
    "Transfer amount deducted not credited",
    "Form 13 settled money missing",
    "PF transfer debit without credit",
    "Annexure K internal rejection after debit",
    "Re-credit transfer amount pending"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Members report Form 13 status Settled or debited passbook at source while destination passbook never rises. Causes include EPS mismatch, internal rejection after debit, or wrong MID credit. Fix is re-credit at source then re-transfer — not filing Form 19 on a zeroed source.",
  "what_it_means": "Money is in limbo inside EPFO accounting, not paid to the member. Duplicate transfers worsen it. Distinct from NEFT payment return after claim settlement (022).",
  "root_cause": "EPS/DOJ mismatch at destination; wrong member ID; backend rejection after accounting debit; inter-RO coordination failure.",
  "how_detected": "Source passbook debit + destination unchanged. Transfer claim Settled. RO advising re-credit.",
  "fix_steps": [
    "Screenshot source debit, destination passbook, and transfer claim ID/status.",
    "EPFiGMS to both source and destination ROs requesting re-credit or completion with amounts and dates.",
    "Ask destination to issue rejection/Annexure clarity so source can re-credit if needed.",
    "Do not file Form 19 on the emptied source MID until funds are located.",
    "Escalate via EPFiGMS reminders; RTI for file notings if months elapse."
  ],
  "required_documents": [
    "Source and destination passbook screenshots",
    "Transfer claim acknowledgement",
    "Service History"
  ],
  "who_acts": "EPFO_office",
  "prevention_tips": [
    "Align name/DOB/EPS flags on source and destination before transfer.",
    "Monitor both passbooks within weeks of settled transfer."
  ],
  "related_reason_ids": [
    "epfo-rr-069",
    "epfo-rr-072",
    "epfo-rr-071",
    "epfo-rr-142"
  ],
  "source_urls": [
    "https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix",
    "https://www.reddit.com/r/epfoindia/comments/1taoams/epfo_pf_transfer_stuck_for_4_years_amount/",
    "https://epfigms.gov.in/"
  ],
  "source_types": [
    "blog",
    "forum",
    "official"
  ],
  "confidence": "high",
  "notes": "Widely reported operational failure mode; no single public rejection code.",
  "last_verified": "2026-09-12"
}
```
