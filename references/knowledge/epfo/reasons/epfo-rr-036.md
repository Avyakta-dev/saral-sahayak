# Form 10C cash withdrawal filed when pensionable service is 10 years or more (Scheme Certificate / Form 10D required) (epfo-rr-036)

> Dataset record `epfo-rr-036`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 10C cash withdrawal filed when pensionable service is 10 years or more (Scheme Certificate / Form 10D required)

**Aliases:** Service 10 years or more, Cannot withdraw pension cash, Should take scheme certificate, Form 10C rejected because eligible for pension, Service 10 years Form 10C not allowed, Take scheme certificate not withdrawal benefit, Pensionable service >=10 Form 10C cash blocked

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** OCS FAQ Q4: Form 10C withdrawal benefit only if total service more than 6 months and less than 9.5 years. 9.5 years is rounded to 10 years of pensionable service. Beyond that, member is entitled to monthly pension (Form 10D) or a Scheme Certificate via 10C (certificate, not cash). Mint/Kustodian: lump sum 10C only if service < 10 years.

## What it means

EPS is a pension scheme. After 10 years (including the 6-month rounding from 9 years 6 months), India does not let you cash out the pension corpus as if it were PF. Filing 10C for 'withdrawal benefit' is rejected. The correct products are Scheme Certificate (preserve service until 58) or Form 10D at eligible age. This is one of the most painful 'wrong form' rejections because the member expected a second lumpsum alongside Form 19.

## Root cause

Composite claim auto-including 10C; misunderstanding that 'pension contribution' is withdrawable like PF; service history crossing 10 years after transfers.

## How it is detected

Service >= 9.5/10 years. Portal may still show 10C; field office rejects. Remark: EPS not eligible for withdrawal / apply for pension.

## Fix

- Sum pensionable service across all UANs/member IDs after transfers.
- If >=10 years (or 9 years 6 months rounded up), file Form 19 for PF only, and Form 10C only if you need a Scheme Certificate, or wait and file Form 10D at age 58 (or reduced pension from 50).
- Do not keep refiling 10C for cash.
- If service is wrongly inflated by overlap, get dates corrected rather than abandoning a genuine pension.

## Required documents

- Service History / Annexure K
- Passbook EPS columns
- Scheme Certificate option understanding

## Who acts

member

## Prevention

- Before exit, compute EPS years. If close to 10, consider staying employed a few months rather than destroying pension eligibility by a bad 10C attempt — actually once you have 10 years you should keep the pension, not cash out.

## Related records

- [epfo-rr-037](./epfo-rr-037.md)
- [epfo-rr-038](./epfo-rr-038.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-044](./epfo-rr-044.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 9.5-year threshold is official OCS FAQ wording.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- https://cleartax.in/c/pf-withdrawal-online

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-036",
  "rejection_reason": "Form 10C cash withdrawal filed when pensionable service is 10 years or more (Scheme Certificate / Form 10D required)",
  "aliases": [
    "Service 10 years or more",
    "Cannot withdraw pension cash",
    "Should take scheme certificate",
    "Form 10C rejected because eligible for pension",
    "Service 10 years Form 10C not allowed",
    "Take scheme certificate not withdrawal benefit",
    "Pensionable service >=10 Form 10C cash blocked"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "OCS FAQ Q4: Form 10C withdrawal benefit only if total service more than 6 months and less than 9.5 years. 9.5 years is rounded to 10 years of pensionable service. Beyond that, member is entitled to monthly pension (Form 10D) or a Scheme Certificate via 10C (certificate, not cash). Mint/Kustodian: lump sum 10C only if service < 10 years.",
  "what_it_means": "EPS is a pension scheme. After 10 years (including the 6-month rounding from 9 years 6 months), India does not let you cash out the pension corpus as if it were PF. Filing 10C for 'withdrawal benefit' is rejected. The correct products are Scheme Certificate (preserve service until 58) or Form 10D at eligible age. This is one of the most painful 'wrong form' rejections because the member expected a second lumpsum alongside Form 19.",
  "root_cause": "Composite claim auto-including 10C; misunderstanding that 'pension contribution' is withdrawable like PF; service history crossing 10 years after transfers.",
  "how_detected": "Service >= 9.5/10 years. Portal may still show 10C; field office rejects. Remark: EPS not eligible for withdrawal / apply for pension.",
  "fix_steps": [
    "Sum pensionable service across all UANs/member IDs after transfers.",
    "If >=10 years (or 9 years 6 months rounded up), file Form 19 for PF only, and Form 10C only if you need a Scheme Certificate, or wait and file Form 10D at age 58 (or reduced pension from 50).",
    "Do not keep refiling 10C for cash.",
    "If service is wrongly inflated by overlap, get dates corrected rather than abandoning a genuine pension."
  ],
  "required_documents": [
    "Service History / Annexure K",
    "Passbook EPS columns",
    "Scheme Certificate option understanding"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Before exit, compute EPS years. If close to 10, consider staying employed a few months rather than destroying pension eligibility by a bad 10C attempt — actually once you have 10 years you should keep the pension, not cash out."
  ],
  "related_reason_ids": [
    "epfo-rr-037",
    "epfo-rr-038",
    "epfo-rr-043",
    "epfo-rr-044"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "9.5-year threshold is official OCS FAQ wording.",
  "last_verified": "2026-09-12"
}
```
