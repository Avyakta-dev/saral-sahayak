# Multiple UANs not merged; service and EPS split across accounts (epfo-rr-046)

> Dataset record `epfo-rr-046`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Multiple UANs not merged; service and EPS split across accounts

**Aliases:** Multiple UAN, Duplicate UAN, UAN merge pending, Split records, Multiple UAN merge required, Duplicate UAN claim blocked, Aadhaar linked different UAN

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 13 Transfer, Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Practitioners and EPFO communications encourage one UAN lifelong. Split UANs cause Aadhaar-seeding conflicts, incomplete EPS service, and transfer failures. Pension Division circular E-597451/4406 dated 29.01.2024 is cited in the 20 May 2025 overlap circular regarding EPS entitlement of members having multiple account numbers.

## What it means

Each new UAN restarts identity and service. Aadhaar can usually seed to only one. Claims on the 'new' UAN miss old money; claims on the 'old' UAN miss KYC. 10D service is undercounted. The fix is merge/transfer into one UAN, not two parallel claims.

## Root cause

New employer generated a UAN ignoring Form 11 old UAN; member lost old UAN.

## How it is detected

Know Your UAN returns two numbers. Aadhaar seeding error. Two passbooks.

## Fix

- List all UANs and member IDs.
- Transfer (Form 13) all member IDs into the surviving UAN (usually the Aadhaar-seeded one).
- Request deactivation of the extra UAN via EPFiGMS if the portal merge tool needs office help.
- Only then file 19/10C/10D so service is complete.

## Required documents

- All UAN letters/payslips
- Aadhaar
- Form 13 acknowledgements

## Who acts

mixed

## Prevention

- Always declare existing UAN on Form 11.
- Never click 'no previous PF' if you had EPF.

## Related records

- [epfo-rr-011](./epfo-rr-011.md)
- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-073](./epfo-rr-073.md)
- [epfo-rr-041](./epfo-rr-041.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Pension Division circular E-597451/4406 dated 29/01/2024 is referenced by the 20 May 2025 WSU circular (not independently fetched).

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [news] https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html
- [blog] https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- [blog] https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-046",
  "rejection_reason": "Multiple UANs not merged; service and EPS split across accounts",
  "aliases": [
    "Multiple UAN",
    "Duplicate UAN",
    "UAN merge pending",
    "Split records",
    "Multiple UAN merge required",
    "Duplicate UAN claim blocked",
    "Aadhaar linked different UAN"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 13 Transfer",
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Practitioners and EPFO communications encourage one UAN lifelong. Split UANs cause Aadhaar-seeding conflicts, incomplete EPS service, and transfer failures. Pension Division circular E-597451/4406 dated 29.01.2024 is cited in the 20 May 2025 overlap circular regarding EPS entitlement of members having multiple account numbers.",
  "what_it_means": "Each new UAN restarts identity and service. Aadhaar can usually seed to only one. Claims on the 'new' UAN miss old money; claims on the 'old' UAN miss KYC. 10D service is undercounted. The fix is merge/transfer into one UAN, not two parallel claims.",
  "root_cause": "New employer generated a UAN ignoring Form 11 old UAN; member lost old UAN.",
  "how_detected": "Know Your UAN returns two numbers. Aadhaar seeding error. Two passbooks.",
  "fix_steps": [
    "List all UANs and member IDs.",
    "Transfer (Form 13) all member IDs into the surviving UAN (usually the Aadhaar-seeded one).",
    "Request deactivation of the extra UAN via EPFiGMS if the portal merge tool needs office help.",
    "Only then file 19/10C/10D so service is complete."
  ],
  "required_documents": [
    "All UAN letters/payslips",
    "Aadhaar",
    "Form 13 acknowledgements"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Always declare existing UAN on Form 11.",
    "Never click 'no previous PF' if you had EPF."
  ],
  "related_reason_ids": [
    "epfo-rr-011",
    "epfo-rr-037",
    "epfo-rr-073",
    "epfo-rr-041"
  ],
  "source_urls": [
    "https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html",
    "https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "circular",
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "Pension Division circular E-597451/4406 dated 29/01/2024 is referenced by the 20 May 2025 WSU circular (not independently fetched).",
  "last_verified": "2026-09-12"
}
```
