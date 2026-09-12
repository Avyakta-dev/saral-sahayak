# Employer attestation missing on physical or Non-Aadhaar composite claim (epfo-rr-026)

> Dataset record `epfo-rr-026`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer attestation missing on physical or Non-Aadhaar composite claim

**Aliases:** Employer attestation not done, Claim not attested, Non-Aadhaar form without employer signature

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Composite Claim Form, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 13 Transfer, International Worker Claim
- **Severity:** high
- **Official/common message status:** Composite Claim Form (Aadhaar) may be submitted without employer attestation if UAN is activated and Aadhaar+bank are seeded. Composite Claim Form (Non-Aadhaar) and most physical death/EDLI/IW claims require employer attestation. Form 19 instructions: application should be submitted through the last employer.

## What it means

Online Aadhaar-OTP claims replaced employer signature for most live members. Physical and Non-Aadhaar routes still need the last employer's stamp and authorised signatory. Death claims (Forms 20, 10D, 5IF) are classically employer-attested. International workers using the 29.11.2024 physical path also go through employer confirmation above a balance threshold.

## Root cause

Member used Non-Aadhaar CCF without HR stamp; downloaded Form 19 and posted it unsigned by employer; closed company with no authorised officer.

## How it is detected

Field office returns the physical form. MembersFAQ: employer may reject if signed printout not received.

## Fix

- If Aadhaar and bank are seeded and UAN activated, prefer online claim or CCF (Aadhaar) which does not need employer attestation.
- Otherwise get the last employer's authorised signatory to attest every page.
- If the establishment is closed, use the alternative attesting officials listed on form instructions / JD SOP (gazetted officer, bank manager of the claimant's account, MP/MLA, etc.).
- Resubmit to the jurisdictional Regional Office.

## Required documents

- Composite Claim Form Aadhaar or Non-Aadhaar as applicable
- Employer stamp and signature or alternative attestation
- KYC copies

## Who acts

mixed

## Prevention

- Use the Aadhaar online path to avoid attestation.
- If you must go physical, sit with HR and get the stamp before leaving the city.

## Related records

- [epfo-rr-049](./epfo-rr-049.md)
- [epfo-rr-050](./epfo-rr-050.md)
- [epfo-rr-030](./epfo-rr-030.md)
- [epfo-rr-074](./epfo-rr-074.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** CCF circular 2016-17 and CCF Aadhaar instructions are the official split.

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.paisabazaar.com/saving-schemes/epf-composite-claim-form/
- https://cleartax.in/c/pf-withdrawal-online

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-026",
  "rejection_reason": "Employer attestation missing on physical or Non-Aadhaar composite claim",
  "aliases": [
    "Employer attestation not done",
    "Claim not attested",
    "Non-Aadhaar form without employer signature"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Composite Claim Form",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Composite Claim Form (Aadhaar) may be submitted without employer attestation if UAN is activated and Aadhaar+bank are seeded. Composite Claim Form (Non-Aadhaar) and most physical death/EDLI/IW claims require employer attestation. Form 19 instructions: application should be submitted through the last employer.",
  "what_it_means": "Online Aadhaar-OTP claims replaced employer signature for most live members. Physical and Non-Aadhaar routes still need the last employer's stamp and authorised signatory. Death claims (Forms 20, 10D, 5IF) are classically employer-attested. International workers using the 29.11.2024 physical path also go through employer confirmation above a balance threshold.",
  "root_cause": "Member used Non-Aadhaar CCF without HR stamp; downloaded Form 19 and posted it unsigned by employer; closed company with no authorised officer.",
  "how_detected": "Field office returns the physical form. MembersFAQ: employer may reject if signed printout not received.",
  "fix_steps": [
    "If Aadhaar and bank are seeded and UAN activated, prefer online claim or CCF (Aadhaar) which does not need employer attestation.",
    "Otherwise get the last employer's authorised signatory to attest every page.",
    "If the establishment is closed, use the alternative attesting officials listed on form instructions / JD SOP (gazetted officer, bank manager of the claimant's account, MP/MLA, etc.).",
    "Resubmit to the jurisdictional Regional Office."
  ],
  "required_documents": [
    "Composite Claim Form Aadhaar or Non-Aadhaar as applicable",
    "Employer stamp and signature or alternative attestation",
    "KYC copies"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Use the Aadhaar online path to avoid attestation.",
    "If you must go physical, sit with HR and get the stamp before leaving the city."
  ],
  "related_reason_ids": [
    "epfo-rr-049",
    "epfo-rr-050",
    "epfo-rr-030",
    "epfo-rr-074"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.paisabazaar.com/saving-schemes/epf-composite-claim-form/",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "CCF circular 2016-17 and CCF Aadhaar instructions are the official split.",
  "last_verified": "2026-09-12"
}
```
