# Browser PDF or image upload exceeds size/type limits on claim or KYC forms (epfo-rr-177)

> Dataset record `epfo-rr-177`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Browser PDF or image upload exceeds size/type limits on claim or KYC forms

**Aliases:** PDF upload size limit EPFO, File too large claim document, Upload failed invalid format, Image size exceeded KYC, Attachment too big member portal

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim, Composite Claim Form, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement
- **Severity:** low
- **Official/common message status:** Portal uploads for cheques, proofs, and enclosures enforce size/type constraints. Oversized phone photos or multi-page unscanned PDFs fail silently or with generic upload errors, leaving claim incomplete.

## What it means

Not an eligibility reject — technical enclosure failure. Compress and retry. Distinct from unclear cheque content (021).

## Root cause

10+ MB photos; HEIC format; corrupt PDF; browser plugin blocking.

## How it is detected

Upload error toast. Document slot empty after submit. Remark documents missing though user tried.

## Fix

- Compress images to portal-accepted size (often a few hundred KB to about 2MB); use JPG/PDF.
- Convert HEIC to JPG; ensure PDF is not password-protected.
- Retry upload before final submit; verify thumbnail/preview appears.
- Try alternate browser if upload spinner never finishes.

## Required documents

- Compressed cheque/proof files

## Who acts

member

## Prevention

- Scan at 150-200 dpi instead of raw phone 12MP uploads.

## Related records

- [epfo-rr-021](./epfo-rr-021.md)
- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-053](./epfo-rr-053.md)
- [epfo-rr-106](./epfo-rr-106.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Generic web-upload constraint; exact MB limit varies by screen.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf

### Secondary (news / blog / forum)

- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-177",
  "rejection_reason": "Browser PDF or image upload exceeds size/type limits on claim or KYC forms",
  "aliases": [
    "PDF upload size limit EPFO",
    "File too large claim document",
    "Upload failed invalid format",
    "Image size exceeded KYC",
    "Attachment too big member portal"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement"
  ],
  "severity": "low",
  "official_status_or_message": "Portal uploads for cheques, proofs, and enclosures enforce size/type constraints. Oversized phone photos or multi-page unscanned PDFs fail silently or with generic upload errors, leaving claim incomplete.",
  "what_it_means": "Not an eligibility reject — technical enclosure failure. Compress and retry. Distinct from unclear cheque content (021).",
  "root_cause": "10+ MB photos; HEIC format; corrupt PDF; browser plugin blocking.",
  "how_detected": "Upload error toast. Document slot empty after submit. Remark documents missing though user tried.",
  "fix_steps": [
    "Compress images to portal-accepted size (often a few hundred KB to about 2MB); use JPG/PDF.",
    "Convert HEIC to JPG; ensure PDF is not password-protected.",
    "Retry upload before final submit; verify thumbnail/preview appears.",
    "Try alternate browser if upload spinner never finishes."
  ],
  "required_documents": [
    "Compressed cheque/proof files"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Scan at 150-200 dpi instead of raw phone 12MP uploads."
  ],
  "related_reason_ids": [
    "epfo-rr-021",
    "epfo-rr-048",
    "epfo-rr-053",
    "epfo-rr-106"
  ],
  "source_urls": [
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "medium",
  "notes": "Generic web-upload constraint; exact MB limit varies by screen.",
  "last_verified": "2026-09-12"
}
```
