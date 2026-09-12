# Unclear cancelled cheque or passbook image for non-NPCI-verified accounts (epfo-rr-021)

> Dataset record `epfo-rr-021`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Unclear cancelled cheque or passbook image for non-NPCI-verified accounts

**Aliases:** Blurry cheque scan, Cheque has no printed name, Passbook image rejected, Unclear cheque / passbook scan

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Mint (Jul 2026): if the bank account is not NPCI-verified, the system prompts a cheque upload; no printed name or a blurry image causes automatic rejection. A 2025-26 EPFO circular removed image upload where bank/NPCI validation already succeeded.

## What it means

Image quality is a rejection reason only for the residual population whose accounts cannot be auto-validated. Handwritten names on cheques, cropped IFSC, dark photos, and password-protected PDFs all fail. Once NPCI verification is green, members generally should not upload extra images.

## Root cause

Non-NPCI bank or failed auto-validation plus a poor scan.

## How it is detected

Upload validation at claim time. Dealing assistant cannot read name/IFSC.

## Fix

- Prefer getting the account NPCI-verified so no image is needed.
- If an image is required: colour scan or well-lit photo of a cancelled cheque with printed name, MICR, IFSC, and account number fully visible.
- Do not cover the name with the 'CANCELLED' mark.
- Use passbook first page with bank stamp and photo if cheque has no name.
- Refile after Bank KYC shows Verified.

## Required documents

- Cancelled cheque with printed name or stamped passbook first page

## Who acts

member

## Prevention

- Request cheques with printed names from the bank.
- Avoid uploading screenshots of net-banking.

## Related records

- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-015](./epfo-rr-015.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Image requirement is now conditional. Circular_RemovalOfUploadingImage.pdf is the official 2025-26 instrument.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf

### Secondary (news / blog / forum)

- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- [news] https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857
- [blog] https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-021",
  "rejection_reason": "Unclear cancelled cheque or passbook image for non-NPCI-verified accounts",
  "aliases": [
    "Blurry cheque scan",
    "Cheque has no printed name",
    "Passbook image rejected",
    "Unclear cheque / passbook scan"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Mint (Jul 2026): if the bank account is not NPCI-verified, the system prompts a cheque upload; no printed name or a blurry image causes automatic rejection. A 2025-26 EPFO circular removed image upload where bank/NPCI validation already succeeded.",
  "what_it_means": "Image quality is a rejection reason only for the residual population whose accounts cannot be auto-validated. Handwritten names on cheques, cropped IFSC, dark photos, and password-protected PDFs all fail. Once NPCI verification is green, members generally should not upload extra images.",
  "root_cause": "Non-NPCI bank or failed auto-validation plus a poor scan.",
  "how_detected": "Upload validation at claim time. Dealing assistant cannot read name/IFSC.",
  "fix_steps": [
    "Prefer getting the account NPCI-verified so no image is needed.",
    "If an image is required: colour scan or well-lit photo of a cancelled cheque with printed name, MICR, IFSC, and account number fully visible.",
    "Do not cover the name with the 'CANCELLED' mark.",
    "Use passbook first page with bank stamp and photo if cheque has no name.",
    "Refile after Bank KYC shows Verified."
  ],
  "required_documents": [
    "Cancelled cheque with printed name or stamped passbook first page"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Request cheques with printed names from the bank.",
    "Avoid uploading screenshots of net-banking."
  ],
  "related_reason_ids": [
    "epfo-rr-016",
    "epfo-rr-015"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "Image requirement is now conditional. Circular_RemovalOfUploadingImage.pdf is the official 2025-26 instrument.",
  "last_verified": "2026-09-12"
}
```
