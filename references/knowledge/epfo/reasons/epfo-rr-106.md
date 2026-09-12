# Cancelled cheque upload demanded or rejected despite NPCI-verified bank KYC (post-removal circular edge case) (epfo-rr-106)

> Dataset record `epfo-rr-106`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Cancelled cheque upload demanded or rejected despite NPCI-verified bank KYC (post-removal circular edge case)

**Aliases:** Cancelled cheque still required, Cheque upload rejected though bank verified, Passbook image asked after NPCI success, Circular removal of cheque upload not applied, Cancelled cheque still demanded, Cheque image upload no longer required, NPCI verified still asking cheque

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** EPFO circular on removal of cancelled-cheque image upload where NPCI verification succeeded; Times Now reporting cheque upload no longer required for large claim volumes. Mint still notes unclear cheque scans reject non-NPCI accounts.

## What it means

Edge cases: portal/RO still insists on cheque though Bank KYC is Verified; or bank is NOT NPCI-verified and cheque image is blurry. This record focuses on mismatch with removal circular when verification already succeeded.

## Root cause

Stale UI path; RO habit; bank actually not verified; wrong document quality when still required.

## How it is detected

Claim form asks cheque despite Verified bank KYC.

## Fix

- Confirm Manage KYC shows Bank as Verified (NPCI).
- If verified, proceed without cheque; if UI forces upload, use clear printed-name cheque and note verification in EPFiGMS if rejected solely on cheque.
- If not verified, fix NPCI verification first.
- Never upload third-party cheque.

## Required documents

- Screenshot Bank KYC Verified
- Clear cancelled cheque if still prompted

## Who acts

member

## Prevention

- Get NPCI verification done before claim season.

## Related records

- [epfo-rr-021](./epfo-rr-021.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-015](./epfo-rr-015.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** Circular removing cancelled-cheque image upload where NPCI verified — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[news]** Times Now: cancelled cheque upload no longer required — https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857
- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-106",
  "rejection_reason": "Cancelled cheque upload demanded or rejected despite NPCI-verified bank KYC (post-removal circular edge case)",
  "aliases": [
    "Cancelled cheque still required",
    "Cheque upload rejected though bank verified",
    "Passbook image asked after NPCI success",
    "Circular removal of cheque upload not applied",
    "Cancelled cheque still demanded",
    "Cheque image upload no longer required",
    "NPCI verified still asking cheque"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "EPFO circular on removal of cancelled-cheque image upload where NPCI verification succeeded; Times Now reporting cheque upload no longer required for large claim volumes. Mint still notes unclear cheque scans reject non-NPCI accounts.",
  "what_it_means": "Edge cases: portal/RO still insists on cheque though Bank KYC is Verified; or bank is NOT NPCI-verified and cheque image is blurry. This record focuses on mismatch with removal circular when verification already succeeded.",
  "root_cause": "Stale UI path; RO habit; bank actually not verified; wrong document quality when still required.",
  "how_detected": "Claim form asks cheque despite Verified bank KYC.",
  "fix_steps": [
    "Confirm Manage KYC shows Bank as Verified (NPCI).",
    "If verified, proceed without cheque; if UI forces upload, use clear printed-name cheque and note verification in EPFiGMS if rejected solely on cheque.",
    "If not verified, fix NPCI verification first.",
    "Never upload third-party cheque."
  ],
  "required_documents": [
    "Screenshot Bank KYC Verified",
    "Clear cancelled cheque if still prompted"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Get NPCI verification done before claim season."
  ],
  "related_reason_ids": [
    "epfo-rr-021",
    "epfo-rr-016",
    "epfo-rr-015"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "circular",
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
