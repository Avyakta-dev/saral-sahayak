# NRI / FEMA bank account issue — resident account after non-resident status or NRE/foreign account used (epfo-rr-105)

> Dataset record `epfo-rr-105`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** NRI / FEMA bank account issue — resident account after non-resident status or NRE/foreign account used

**Aliases:** NRI PF claim bank rejected, NRE account not accepted for EPF, FEMA resident account still linked, Foreign bank account EPFO claim

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim, International Worker Claim, Composite Claim Form
- **Severity:** high
- **Official/common message status:** NRI Information guides: EPFO pays only to an Indian bank account; after becoming NRI the receiving account should be NRO; NRE or foreign accounts are not the proper credit path; continuing credits to a resident savings account after non-resident status is a FEMA problem.

## What it means

Claims fail NPCI/bank validation or get returned when seeded account is NRE, overseas, or a still-resident account the bank flags after status change. Distinct from ordinary name/IFSC mismatches.

## Root cause

NRE seeded; foreign account; resident account not redesignated NRO; passport/NRI status not aligned with bank KYC.

## How it is detected

Bank KYC failure; payment return; member declared NRI.

## Fix

- Seed an NRO (or correctly redesignated Indian account) in your name.
- Do not use NRE or foreign accounts for EPFO credit.
- Update bank KYC and get NPCI verification.
- For IW without Aadhaar, follow physical settlement path with passport/bank proofs.

## Required documents

- NRO passbook/cancelled cheque
- Passport / NRI status proof if asked
- Bank redesignation letter

## Who acts

member

## Prevention

- Redesignate to NRO before filing when you become NRI.

## Related records

- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-019](./epfo-rr-019.md)
- [epfo-rr-074](./epfo-rr-074.md)
- [epfo-rr-022](./epfo-rr-022.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** FEMA guidance from NRI explainers; EPFO still requires Indian account.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/International_workers.php
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf

### Secondary (news / blog / forum)

- [blog] https://nriinformation.com/returning-to-india/nri-provident-fund-guide
- [blog] https://nriinformation.com/nri-info/indian-pension-abroad

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-105",
  "rejection_reason": "NRI / FEMA bank account issue — resident account after non-resident status or NRE/foreign account used",
  "aliases": [
    "NRI PF claim bank rejected",
    "NRE account not accepted for EPF",
    "FEMA resident account still linked",
    "Foreign bank account EPFO claim"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "NRI Information guides: EPFO pays only to an Indian bank account; after becoming NRI the receiving account should be NRO; NRE or foreign accounts are not the proper credit path; continuing credits to a resident savings account after non-resident status is a FEMA problem.",
  "what_it_means": "Claims fail NPCI/bank validation or get returned when seeded account is NRE, overseas, or a still-resident account the bank flags after status change. Distinct from ordinary name/IFSC mismatches.",
  "root_cause": "NRE seeded; foreign account; resident account not redesignated NRO; passport/NRI status not aligned with bank KYC.",
  "how_detected": "Bank KYC failure; payment return; member declared NRI.",
  "fix_steps": [
    "Seed an NRO (or correctly redesignated Indian account) in your name.",
    "Do not use NRE or foreign accounts for EPFO credit.",
    "Update bank KYC and get NPCI verification.",
    "For IW without Aadhaar, follow physical settlement path with passport/bank proofs."
  ],
  "required_documents": [
    "NRO passbook/cancelled cheque",
    "Passport / NRI status proof if asked",
    "Bank redesignation letter"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Redesignate to NRO before filing when you become NRI."
  ],
  "related_reason_ids": [
    "epfo-rr-016",
    "epfo-rr-019",
    "epfo-rr-074",
    "epfo-rr-022"
  ],
  "source_urls": [
    "https://nriinformation.com/returning-to-india/nri-provident-fund-guide",
    "https://nriinformation.com/nri-info/indian-pension-abroad",
    "https://www.epfindia.gov.in/site_en/International_workers.php",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf"
  ],
  "source_types": [
    "blog",
    "official",
    "circular"
  ],
  "confidence": "high",
  "notes": "FEMA guidance from NRI explainers; EPFO still requires Indian account.",
  "last_verified": "2026-09-12"
}
```
