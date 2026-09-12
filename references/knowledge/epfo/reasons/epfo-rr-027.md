# Employer rejected the online/physical claim because member details do not match establishment records (epfo-rr-027)

> Dataset record `epfo-rr-027`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer rejected the online/physical claim because member details do not match establishment records

**Aliases:** Rejected by employer, Member details do not match establishment records, Employer rejected claim, Signature of member does not match

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 13 Transfer, Composite Claim Form, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit
- **Severity:** high
- **Official/common message status:** Official MembersFAQ (OTCP): probable reasons for rejection of an online claim by the employer include (a) claim already forwarded and not rejected, (b) signed printout not received (after 15 days), (c) member details do not match establishment records, (d) member signature does not match office records.

## What it means

On transfer (Form 13) and some attested claims, the previous or present employer is a decision-maker. If HR's register has a different name, DOB, or joining date than the claim, they can reject. This is an employer-side rejection, visible in member login, and is not the same as EPFO field-office rejection.

## Root cause

Payroll vs Aadhaar mismatch sitting in HR files; old signature card; duplicate claim already sent.

## How it is detected

Track transfer/claim status: Rejected by previous/present employer with one of the FAQ reasons.

## Fix

- Read the employer's rejection reason in the portal.
- If details mismatch: align Form 11/HR records and UAN via Joint Declaration, then ask HR to re-approve.
- If a claim was already forwarded, track that earlier claim instead of filing another.
- If signature mismatch on physical forms, sign consistently with HR records or update HR's signature card.
- If employer is unresponsive, escalate to EPFiGMS and the Regional Office.

## Required documents

- Portal rejection screenshot
- HR records / appointment letter
- Updated KYC

## Who acts

mixed

## Prevention

- Keep HR master data identical to Aadhaar.
- Do not raise a second transfer while one is pending.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-032](./epfo-rr-032.md)
- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-068](./epfo-rr-068.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** MembersFAQ OTCP is the official list of employer rejection reasons. Do not invent additional codes.

- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php
- https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-027",
  "rejection_reason": "Employer rejected the online/physical claim because member details do not match establishment records",
  "aliases": [
    "Rejected by employer",
    "Member details do not match establishment records",
    "Employer rejected claim",
    "Signature of member does not match"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "Composite Claim Form",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit"
  ],
  "severity": "high",
  "official_status_or_message": "Official MembersFAQ (OTCP): probable reasons for rejection of an online claim by the employer include (a) claim already forwarded and not rejected, (b) signed printout not received (after 15 days), (c) member details do not match establishment records, (d) member signature does not match office records.",
  "what_it_means": "On transfer (Form 13) and some attested claims, the previous or present employer is a decision-maker. If HR's register has a different name, DOB, or joining date than the claim, they can reject. This is an employer-side rejection, visible in member login, and is not the same as EPFO field-office rejection.",
  "root_cause": "Payroll vs Aadhaar mismatch sitting in HR files; old signature card; duplicate claim already sent.",
  "how_detected": "Track transfer/claim status: Rejected by previous/present employer with one of the FAQ reasons.",
  "fix_steps": [
    "Read the employer's rejection reason in the portal.",
    "If details mismatch: align Form 11/HR records and UAN via Joint Declaration, then ask HR to re-approve.",
    "If a claim was already forwarded, track that earlier claim instead of filing another.",
    "If signature mismatch on physical forms, sign consistently with HR records or update HR's signature card.",
    "If employer is unresponsive, escalate to EPFiGMS and the Regional Office."
  ],
  "required_documents": [
    "Portal rejection screenshot",
    "HR records / appointment letter",
    "Updated KYC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Keep HR master data identical to Aadhaar.",
    "Do not raise a second transfer while one is pending."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-032",
    "epfo-rr-052",
    "epfo-rr-068"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "MembersFAQ OTCP is the official list of employer rejection reasons. Do not invent additional codes.",
  "last_verified": "2026-09-12"
}
```
