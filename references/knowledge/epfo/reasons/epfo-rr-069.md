# Annexure K or complete transfer/service history missing (epfo-rr-069)

> Dataset record `epfo-rr-069`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Annexure K or complete transfer/service history missing

**Aliases:** Annexure K missing, Transfer history incomplete, Service record incomplete / Annexure K missing

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, Form 10D Monthly Pension, Form 10C Pension Withdrawal Benefit, Form 19 PF Final Settlement
- **Severity:** high
- **Official/common message status:** FinRight: Annexure K records employment and PF history; gaps after job changes without transfer cause settlement rejection. Annexure K is now often viewable online via passbook/transfer status.

## What it means

Annexure K is the transfer-sheet of past member IDs, contributions, and service that the new account inherits. Without it, EPFO cannot see total service for pension or the full PF corpus. Old paper-era transfers sometimes never generated electronic Annexure K.

## Root cause

Form 13 never filed; trust-to-EPFO transfer incomplete; office did not upload Annexure K.

## How it is detected

Service History missing old employer. Passbook without past balances. Claim remark about incomplete service.

## Fix

- File Form 13 for every leftover member ID.
- Download Annexure K from transfer/passbook tools if offered; else ask the source Regional Office.
- Raise EPFiGMS attaching old passbooks and employment proofs if the employer is gone.
- Only after history is whole, file 10D/19.

## Required documents

- Old member IDs and passbooks
- Form 13 acknowledgements
- Employment proofs

## Who acts

mixed

## Prevention

- Never leave a previous PF untransferred at job change.

## Related records

- [epfo-rr-073](./epfo-rr-073.md)
- [epfo-rr-042](./epfo-rr-042.md)
- [epfo-rr-031](./epfo-rr-031.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Annexure K is a well-known EPFO transfer artefact; no numeric rejection code.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary reporting (news, blog, forum)

- **[blog]** FinRight: 9 common EPF rejection reasons — https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- **[blog]** Kustodian: Form 13 guide — https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- **[news]** Mint: EPF transfer errors before resigning — https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html
- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-069",
  "rejection_reason": "Annexure K or complete transfer/service history missing",
  "aliases": [
    "Annexure K missing",
    "Transfer history incomplete",
    "Service record incomplete / Annexure K missing"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "Form 10D Monthly Pension",
    "Form 10C Pension Withdrawal Benefit",
    "Form 19 PF Final Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "FinRight: Annexure K records employment and PF history; gaps after job changes without transfer cause settlement rejection. Annexure K is now often viewable online via passbook/transfer status.",
  "what_it_means": "Annexure K is the transfer-sheet of past member IDs, contributions, and service that the new account inherits. Without it, EPFO cannot see total service for pension or the full PF corpus. Old paper-era transfers sometimes never generated electronic Annexure K.",
  "root_cause": "Form 13 never filed; trust-to-EPFO transfer incomplete; office did not upload Annexure K.",
  "how_detected": "Service History missing old employer. Passbook without past balances. Claim remark about incomplete service.",
  "fix_steps": [
    "File Form 13 for every leftover member ID.",
    "Download Annexure K from transfer/passbook tools if offered; else ask the source Regional Office.",
    "Raise EPFiGMS attaching old passbooks and employment proofs if the employer is gone.",
    "Only after history is whole, file 10D/19."
  ],
  "required_documents": [
    "Old member IDs and passbooks",
    "Form 13 acknowledgements",
    "Employment proofs"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Never leave a previous PF untransferred at job change."
  ],
  "related_reason_ids": [
    "epfo-rr-073",
    "epfo-rr-042",
    "epfo-rr-031"
  ],
  "source_urls": [
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "blog",
    "news"
  ],
  "confidence": "medium",
  "notes": "Annexure K is a well-known EPFO transfer artefact; no numeric rejection code.",
  "last_verified": "2026-09-12"
}
```
