# Employer digital signature (DSC) or e-sign missing, expired, or not registered (epfo-rr-028)

> Dataset record `epfo-rr-028`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer digital signature (DSC) or e-sign missing, expired, or not registered

**Aliases:** DSC expired, Employer e-sign not available, Digital signature not registered, Cannot approve KYC without DSC, Employer DSC expired, e-sign pending employer

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim, Form 20 Death PF Settlement
- **Severity:** high
- **Official/common message status:** JD SOP 6.15(iii): employer should have an active e-sign and be the person defined under section 2(e) of the EPF & MP Act. EPFO publishes a DSC FAQ for employers. Without a valid DSC/e-sign, KYC approvals, JD, and Form 13 attestations sit in the employer's login.

## What it means

The member cannot finish KYC verification, Joint Declaration, or some transfers if the establishment's DSC token expired or was never registered. Claims then fail for 'KYC pending' even though the employee did everything. This is an infrastructure failure at the employer, not a member eligibility failure.

## Root cause

DSC validity (typically 1–3 years) lapsed; authorised signatory left; e-sign credentials not mapped; exempted trust using a different workflow.

## How it is detected

Employer portal errors on approve. KYC stuck Pending for weeks. HR admits DSC expired.

## Fix

- Ask HR/compliance to check DSC expiry and re-register/renew on the EPFO employer portal (see official DSC FAQ).
- Map the new authorised signatory under section 2(e).
- Once DSC is live, ask them to clear the KYC/JD/transfer queue.
- If the company cannot or will not renew, take physical CCF/JD to the field office and raise EPFiGMS naming the establishment.

## Required documents

- Employer DSC/e-sign
- Authorised signatory board resolution if needed
- Member KYC documents for physical fallback

## Who acts

employer

## Prevention

- Employers should diary DSC expiry 60 days ahead.
- Members should screenshot KYC status at joining while HR systems still work.

## Related records

- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-068](./epfo-rr-068.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Official DSC FAQ PDF: Faq_dsc.pdf (2020-21). SOP requires active e-sign.

- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2020-2021/Faq_dsc.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php
- https://orbitcareers.com/uan-kyc-pending-for-employer-approval/
- https://jurigram.com/blog/labour-law/epf-withdrawal-rules-online-process-tax

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-028",
  "rejection_reason": "Employer digital signature (DSC) or e-sign missing, expired, or not registered",
  "aliases": [
    "DSC expired",
    "Employer e-sign not available",
    "Digital signature not registered",
    "Cannot approve KYC without DSC",
    "Employer DSC expired",
    "e-sign pending employer"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "Form 20 Death PF Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "JD SOP 6.15(iii): employer should have an active e-sign and be the person defined under section 2(e) of the EPF & MP Act. EPFO publishes a DSC FAQ for employers. Without a valid DSC/e-sign, KYC approvals, JD, and Form 13 attestations sit in the employer's login.",
  "what_it_means": "The member cannot finish KYC verification, Joint Declaration, or some transfers if the establishment's DSC token expired or was never registered. Claims then fail for 'KYC pending' even though the employee did everything. This is an infrastructure failure at the employer, not a member eligibility failure.",
  "root_cause": "DSC validity (typically 1–3 years) lapsed; authorised signatory left; e-sign credentials not mapped; exempted trust using a different workflow.",
  "how_detected": "Employer portal errors on approve. KYC stuck Pending for weeks. HR admits DSC expired.",
  "fix_steps": [
    "Ask HR/compliance to check DSC expiry and re-register/renew on the EPFO employer portal (see official DSC FAQ).",
    "Map the new authorised signatory under section 2(e).",
    "Once DSC is live, ask them to clear the KYC/JD/transfer queue.",
    "If the company cannot or will not renew, take physical CCF/JD to the field office and raise EPFiGMS naming the establishment."
  ],
  "required_documents": [
    "Employer DSC/e-sign",
    "Authorised signatory board resolution if needed",
    "Member KYC documents for physical fallback"
  ],
  "who_acts": "employer",
  "prevention_tips": [
    "Employers should diary DSC expiry 60 days ahead.",
    "Members should screenshot KYC status at joining while HR systems still work."
  ],
  "related_reason_ids": [
    "epfo-rr-010",
    "epfo-rr-013",
    "epfo-rr-068"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2020-2021/Faq_dsc.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php",
    "https://orbitcareers.com/uan-kyc-pending-for-employer-approval/",
    "https://jurigram.com/blog/labour-law/epf-withdrawal-rules-online-process-tax"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "Official DSC FAQ PDF: Faq_dsc.pdf (2020-21). SOP requires active e-sign.",
  "last_verified": "2026-09-12"
}
```
