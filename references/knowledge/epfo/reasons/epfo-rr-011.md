# Aadhaar already linked to another UAN (epfo-rr-011)

> Dataset record `epfo-rr-011`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Aadhaar already linked to another UAN

**Aliases:** Aadhaar linked with different UAN, Duplicate UAN Aadhaar conflict, Cannot seed Aadhaar already used

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** high
- **Official/common message status:** Typically a seeding error on Manage > KYC rather than a post-claim remark. Members see that Aadhaar cannot be linked because it is already associated with another UAN.

## What it means

UIDAI number is unique; EPFO generally allows one Aadhaar–UAN pair. Job-changers sometimes get a second UAN instead of the employer linking the old one. Then Aadhaar is trapped on the first UAN, so KYC on the new UAN fails and claims/transfers on either side break. The durable fix is to merge/transfer member IDs into one UAN and deactivate the extra UAN, not to keep filing claims on both.

## Root cause

Employer generated a fresh UAN instead of tagging the existing one on Form 11; member did not disclose old UAN.

## How it is detected

Aadhaar seeding error; Know Your UAN returns two numbers; service history split.

## Fix

- Identify all UANs via Know Your UAN, old payslips, and passbooks.
- Keep the UAN that already has Aadhaar seeded as the surviving UAN where possible.
- Request the current employer to link old member IDs / file transfer (Form 13) into the surviving UAN.
- Use EPFO's UAN merge / multiple UAN functionality if available on the portal, or raise EPFiGMS for deactivation of the extra UAN.
- Do not attempt to change Aadhaar number casually; Aadhaar parameter changes are major under the JD SOP and allowed once.
- After a single UAN holds all member IDs and verified KYC, file the claim.

## Required documents

- All UAN numbers and member IDs
- Aadhaar
- Old and current payslips/passbooks
- Form 13 transfer acknowledgements

## Who acts

mixed

## Prevention

- Always give the existing UAN on Form 11 at a new job.
- Never tick 'no previous PF' if you had EPF before.

## Related records

- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-073](./epfo-rr-073.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** SOP treats Aadhaar number change as major, allowed once. Merge process UI labels vary; use official portal + EPFiGMS rather than agents.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary (news / blog / forum)

- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- [blog] https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-011",
  "rejection_reason": "Aadhaar already linked to another UAN",
  "aliases": [
    "Aadhaar linked with different UAN",
    "Duplicate UAN Aadhaar conflict",
    "Cannot seed Aadhaar already used"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Typically a seeding error on Manage > KYC rather than a post-claim remark. Members see that Aadhaar cannot be linked because it is already associated with another UAN.",
  "what_it_means": "UIDAI number is unique; EPFO generally allows one Aadhaar–UAN pair. Job-changers sometimes get a second UAN instead of the employer linking the old one. Then Aadhaar is trapped on the first UAN, so KYC on the new UAN fails and claims/transfers on either side break. The durable fix is to merge/transfer member IDs into one UAN and deactivate the extra UAN, not to keep filing claims on both.",
  "root_cause": "Employer generated a fresh UAN instead of tagging the existing one on Form 11; member did not disclose old UAN.",
  "how_detected": "Aadhaar seeding error; Know Your UAN returns two numbers; service history split.",
  "fix_steps": [
    "Identify all UANs via Know Your UAN, old payslips, and passbooks.",
    "Keep the UAN that already has Aadhaar seeded as the surviving UAN where possible.",
    "Request the current employer to link old member IDs / file transfer (Form 13) into the surviving UAN.",
    "Use EPFO's UAN merge / multiple UAN functionality if available on the portal, or raise EPFiGMS for deactivation of the extra UAN.",
    "Do not attempt to change Aadhaar number casually; Aadhaar parameter changes are major under the JD SOP and allowed once.",
    "After a single UAN holds all member IDs and verified KYC, file the claim."
  ],
  "required_documents": [
    "All UAN numbers and member IDs",
    "Aadhaar",
    "Old and current payslips/passbooks",
    "Form 13 transfer acknowledgements"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Always give the existing UAN on Form 11 at a new job.",
    "Never tick 'no previous PF' if you had EPF before."
  ],
  "related_reason_ids": [
    "epfo-rr-046",
    "epfo-rr-005",
    "epfo-rr-073"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "SOP treats Aadhaar number change as major, allowed once. Merge process UI labels vary; use official portal + EPFiGMS rather than agents.",
  "last_verified": "2026-09-12"
}
```
