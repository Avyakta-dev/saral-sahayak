# Multiple member IDs under one UAN — only partial balance transferred leaving residual MID unclaimed (epfo-rr-142)

> Dataset record `epfo-rr-142`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Multiple member IDs under one UAN — only partial balance transferred leaving residual MID unclaimed

**Aliases:** Partial transfer multiple member IDs, Old member ID balance still left, One Member One EPF Account incomplete, Transfer covered only latest MID, Residual PF in previous member ID

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** UAN can hold many member IDs. Auto-transfer and One Member-One EPF Account flows often move the most recent previous MID; older MIDs may remain. Members who then settle only the current MID discover residual balances. Transfer claims may be rejected or unused for older MIDs until separately filed.

## What it means

A successful transfer of MID-B to MID-C does not empty MID-A. Later Form 19 on C alone leaves A stranded. Distinct from balance mismatch debit-without-credit (144) and from multiple UANs (046).

## Root cause

Assuming auto-transfer consolidates all history; selecting only one source MID; ignoring passbook tabs.

## How it is detected

Passbook shows multiple MIDs with balances. Service History list. Transfer claim source dropdown.

## Fix

- List every member ID under the UAN and balances on each passbook.
- File Form 13 / One Member-One EPF Account for each residual source MID into the active MID.
- After all balances consolidate, file settlement/advance once.
- If a claim already paid only the latest MID, transfer remaining MIDs then claim residual separately.
- EPFiGMS if employer attestation stuck on an old closed establishment MID.

## Required documents

- Screenshots of all MID passbooks
- Service History
- Transfer claim IDs

## Who acts

member

## Prevention

- After each job change, verify all old MIDs show zero after transfer.
- Do not file Form 19 until residual MIDs are consolidated or consciously claimed.

## Related records

- [epfo-rr-073](./epfo-rr-073.md)
- [epfo-rr-127](./epfo-rr-127.md)
- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-144](./epfo-rr-144.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Forum/RTI guides document residual MID pattern extensively.

- https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix
- https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html
- https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-142",
  "rejection_reason": "Multiple member IDs under one UAN — only partial balance transferred leaving residual MID unclaimed",
  "aliases": [
    "Partial transfer multiple member IDs",
    "Old member ID balance still left",
    "One Member One EPF Account incomplete",
    "Transfer covered only latest MID",
    "Residual PF in previous member ID"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "UAN can hold many member IDs. Auto-transfer and One Member-One EPF Account flows often move the most recent previous MID; older MIDs may remain. Members who then settle only the current MID discover residual balances. Transfer claims may be rejected or unused for older MIDs until separately filed.",
  "what_it_means": "A successful transfer of MID-B to MID-C does not empty MID-A. Later Form 19 on C alone leaves A stranded. Distinct from balance mismatch debit-without-credit (144) and from multiple UANs (046).",
  "root_cause": "Assuming auto-transfer consolidates all history; selecting only one source MID; ignoring passbook tabs.",
  "how_detected": "Passbook shows multiple MIDs with balances. Service History list. Transfer claim source dropdown.",
  "fix_steps": [
    "List every member ID under the UAN and balances on each passbook.",
    "File Form 13 / One Member-One EPF Account for each residual source MID into the active MID.",
    "After all balances consolidate, file settlement/advance once.",
    "If a claim already paid only the latest MID, transfer remaining MIDs then claim residual separately.",
    "EPFiGMS if employer attestation stuck on an old closed establishment MID."
  ],
  "required_documents": [
    "Screenshots of all MID passbooks",
    "Service History",
    "Transfer claim IDs"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "After each job change, verify all old MIDs show zero after transfer.",
    "Do not file Form 19 until residual MIDs are consolidated or consciously claimed."
  ],
  "related_reason_ids": [
    "epfo-rr-073",
    "epfo-rr-127",
    "epfo-rr-046",
    "epfo-rr-144"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html",
    "https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "Forum/RTI guides document residual MID pattern extensively.",
  "last_verified": "2026-09-12"
}
```
