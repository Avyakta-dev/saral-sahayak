# Penny-drop bank account verification failed during EPFO bank KYC seeding (epfo-rr-159)

> Dataset record `epfo-rr-159`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Penny-drop bank account verification failed during EPFO bank KYC seeding

**Aliases:** Penny drop failed EPFO, Re 1 validation failed bank KYC, Account validation penny drop reject, IMPS verification failed PF bank seed, Penny drop name mismatch EPFO

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Automated bank validation (penny-drop style via NPCI rails) underpins EPFO bank KYC verification. Failures occur for dormant accounts, wrong IFSC, name mismatch, or unsupported rails. Circulars removing cheque-image upload still assume successful electronic validation.

## What it means

Without Verified bank KYC, online claims will not settle cleanly. Distinct from post-settlement NEFT return (022) and from cooperative coverage gaps (157).

## Root cause

Wrong account/IFSC; dormant/frozen; name mismatch; transient rail outage.

## How it is detected

Bank KYC Failed immediately after seeding attempt. Portal validation error.

## Fix

- Re-enter account number and IFSC from cheque leaf; avoid OCR typos.
- Ensure account is active sole-operated and name matches Aadhaar closely.
- Retry after bank confirms IMPS enabled.
- If persistent, change to another bank account and seed afresh.
- Upload cheque/passbook only if portal still asks for non-NPCI path.

## Required documents

- Cancelled cheque or passbook
- Bank activity proof if dormancy suspected

## Who acts

member

## Prevention

- Seed bank months before claim; confirm Verified tick.

## Related records

- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-017](./epfo-rr-017.md)
- [epfo-rr-020](./epfo-rr-020.md)
- [epfo-rr-157](./epfo-rr-157.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Penny-drop is the common industry term for the validation EPFO relies on via NPCI.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [news] https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857
- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-159",
  "rejection_reason": "Penny-drop bank account verification failed during EPFO bank KYC seeding",
  "aliases": [
    "Penny drop failed EPFO",
    "Re 1 validation failed bank KYC",
    "Account validation penny drop reject",
    "IMPS verification failed PF bank seed",
    "Penny drop name mismatch EPFO"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Automated bank validation (penny-drop style via NPCI rails) underpins EPFO bank KYC verification. Failures occur for dormant accounts, wrong IFSC, name mismatch, or unsupported rails. Circulars removing cheque-image upload still assume successful electronic validation.",
  "what_it_means": "Without Verified bank KYC, online claims will not settle cleanly. Distinct from post-settlement NEFT return (022) and from cooperative coverage gaps (157).",
  "root_cause": "Wrong account/IFSC; dormant/frozen; name mismatch; transient rail outage.",
  "how_detected": "Bank KYC Failed immediately after seeding attempt. Portal validation error.",
  "fix_steps": [
    "Re-enter account number and IFSC from cheque leaf; avoid OCR typos.",
    "Ensure account is active sole-operated and name matches Aadhaar closely.",
    "Retry after bank confirms IMPS enabled.",
    "If persistent, change to another bank account and seed afresh.",
    "Upload cheque/passbook only if portal still asks for non-NPCI path."
  ],
  "required_documents": [
    "Cancelled cheque or passbook",
    "Bank activity proof if dormancy suspected"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Seed bank months before claim; confirm Verified tick."
  ],
  "related_reason_ids": [
    "epfo-rr-016",
    "epfo-rr-017",
    "epfo-rr-020",
    "epfo-rr-157"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "high",
  "notes": "Penny-drop is the common industry term for the validation EPFO relies on via NPCI.",
  "last_verified": "2026-09-12"
}
```
