# Date of birth mismatch across UAN, Aadhaar, and PAN (epfo-rr-002)

> Dataset record `epfo-rr-002`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Date of birth mismatch across UAN, Aadhaar, and PAN

**Aliases:** DOB differs from Aadhaar, DOB not matching, Date of birth mismatch, DOB discrepancy, DOB mismatch Aadhaar, Wrong date of birth on UAN, DOB not matching Aadhaar, Date of birth discrepancy PAN Aadhaar UAN, SMS: DOB mismatch claim rejected

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** high
- **Official/common message status:** Commonly shown as: 'DOB differs from Aadhaar', 'DOB not matching', or grouped under demographic/member details mismatch. Pension (Form 10D) additionally depends on correct DOB for age 50/58 eligibility.

## What it means

EPFO treats date of birth as a core identity and eligibility field. A one-day error, DD-MM swapped with MM-DD, or a year that differs from Aadhaar/PAN will fail e-KYC matching and can also make the member appear too young for pension or still below retirement. The Joint Declaration SOP classifies DOB change of more than 3 years as a major correction (higher approving authority) and 3 years or less as minor. Pension claims are especially sensitive because superannuation pension is tied to age 58, reduced early pension to age 50–57, and service rounding. A wrong DOB can also affect whether the member is treated as an International Worker or as a minor nominee guardian case.

## Root cause

Legacy employer records, Form 11 data-entry errors, school-certificate vs Aadhaar conflicts, or PAN DOB not matching UIDAI. Online claims authenticate against Aadhaar demographics. Historical EPFO circulars (referenced in the JD SOP) tightly controlled DOB changes because they affect EPS pensionable age.

## How it is detected

Compare View Personal Details DOB with Aadhaar and PAN. Claim remark. Form 10D age-eligibility check. Field office scrutiny of school/birth certificates vs UAN.

## Fix

- Note UAN DOB, Aadhaar DOB, and PAN DOB. Decide which document set is legally correct.
- If UAN is wrong and deviation is <=3 years, file online Joint Declaration (minor DOB change) with Aadhaar plus another DOB proof (birth certificate, school marksheet, passport, PAN).
- If deviation is >3 years, file a major JD with at least three prescribed proofs; approval is at a higher EPFO authority.
- Get employer digital approval; for closed establishments use physical JD with authorised attestation.
- DOB can generally be changed only once under Table 6 of SOP JD/2022/1; treat this as a one-shot correction.
- After approval, re-check Personal Details, then resubmit the claim.

## Required documents

- Aadhaar
- Birth certificate issued by Registrar of Births and Deaths (preferred)
- School leaving/SSC marksheet with DOB
- Passport and/or PAN
- Medical certificate + court-authenticated affidavit only if other proofs are absent (SOP list)

## Who acts

mixed

## Prevention

- Enter DOB from Aadhaar on Form 11 at joining.
- Do not 'adjust' DOB to appear older/younger for any benefit.
- Verify DOB in service history before filing Form 10D.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-014](./epfo-rr-014.md)
- [epfo-rr-038](./epfo-rr-038.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** SOP JD/2022/1 Table 2: DOB >3 years = major; <=3 years = minor. Frequency of DOB change allowed: 1.

- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-002",
  "rejection_reason": "Date of birth mismatch across UAN, Aadhaar, and PAN",
  "aliases": [
    "DOB differs from Aadhaar",
    "DOB not matching",
    "Date of birth mismatch",
    "DOB discrepancy",
    "DOB mismatch Aadhaar",
    "Wrong date of birth on UAN",
    "DOB not matching Aadhaar",
    "Date of birth discrepancy PAN Aadhaar UAN",
    "SMS: DOB mismatch claim rejected"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Commonly shown as: 'DOB differs from Aadhaar', 'DOB not matching', or grouped under demographic/member details mismatch. Pension (Form 10D) additionally depends on correct DOB for age 50/58 eligibility.",
  "what_it_means": "EPFO treats date of birth as a core identity and eligibility field. A one-day error, DD-MM swapped with MM-DD, or a year that differs from Aadhaar/PAN will fail e-KYC matching and can also make the member appear too young for pension or still below retirement. The Joint Declaration SOP classifies DOB change of more than 3 years as a major correction (higher approving authority) and 3 years or less as minor. Pension claims are especially sensitive because superannuation pension is tied to age 58, reduced early pension to age 50–57, and service rounding. A wrong DOB can also affect whether the member is treated as an International Worker or as a minor nominee guardian case.",
  "root_cause": "Legacy employer records, Form 11 data-entry errors, school-certificate vs Aadhaar conflicts, or PAN DOB not matching UIDAI. Online claims authenticate against Aadhaar demographics. Historical EPFO circulars (referenced in the JD SOP) tightly controlled DOB changes because they affect EPS pensionable age.",
  "how_detected": "Compare View Personal Details DOB with Aadhaar and PAN. Claim remark. Form 10D age-eligibility check. Field office scrutiny of school/birth certificates vs UAN.",
  "fix_steps": [
    "Note UAN DOB, Aadhaar DOB, and PAN DOB. Decide which document set is legally correct.",
    "If UAN is wrong and deviation is <=3 years, file online Joint Declaration (minor DOB change) with Aadhaar plus another DOB proof (birth certificate, school marksheet, passport, PAN).",
    "If deviation is >3 years, file a major JD with at least three prescribed proofs; approval is at a higher EPFO authority.",
    "Get employer digital approval; for closed establishments use physical JD with authorised attestation.",
    "DOB can generally be changed only once under Table 6 of SOP JD/2022/1; treat this as a one-shot correction.",
    "After approval, re-check Personal Details, then resubmit the claim."
  ],
  "required_documents": [
    "Aadhaar",
    "Birth certificate issued by Registrar of Births and Deaths (preferred)",
    "School leaving/SSC marksheet with DOB",
    "Passport and/or PAN",
    "Medical certificate + court-authenticated affidavit only if other proofs are absent (SOP list)"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Enter DOB from Aadhaar on Form 11 at joining.",
    "Do not 'adjust' DOB to appear older/younger for any benefit.",
    "Verify DOB in service history before filing Form 10D."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-013",
    "epfo-rr-014",
    "epfo-rr-038"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "official",
    "circular",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "SOP JD/2022/1 Table 2: DOB >3 years = major; <=3 years = minor. Frequency of DOB change allowed: 1.",
  "last_verified": "2026-09-12"
}
```
