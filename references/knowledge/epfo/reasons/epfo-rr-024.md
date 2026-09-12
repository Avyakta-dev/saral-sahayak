# Date of exit (DOE) not updated by employer in EPFO service history (epfo-rr-024)

> Dataset record `epfo-rr-024`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Date of exit (DOE) not updated by employer in EPFO service history

**Aliases:** Date of exit not updated, Missing employer exit date, DOE not marked, Exit date missing, Still showing as employed, Date of exit not updated by employer, DOE missing Form 19 blocked, Exit date not marked in service history, SMS: Date of exit not updated, Please update date of leaving

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** Official OCS FAQ for Form 19: Date of Joining and Date of Exit of Member should be available in the EPFO Database. Mint: for Form 19, if the employer has not updated date of exit, the system blocks final settlement. Portal: 'Date of exit not updated'.

## What it means

Without a date of leaving on the last member ID, EPFO treats the member as still in employment. Form 19 and Form 10C online claims are then ineligible. This is repeatedly described as the single most common blocker for full withdrawal. Date of exit is also a Joint Declaration parameter (reason of leaving and date of leaving). Some 2025–2026 help guides describe a self-certification / Mark Exit path when the employer is unresponsive; members should confirm the current portal label because the official JD SOP still routes date-of-leaving changes through the employer or closed-establishment attestation.

## Root cause

HR skipped exit in the employer portal at Full & Final; company closed; contractor payroll never filed exit; wrong member ID still active.

## How it is detected

View > Service History: Date of Exit blank on the last employment. Online claim form greyed out. Claim remark.

## Fix

- Check Service History for every member ID; note which one has a blank exit date.
- Ask the last employer to mark Date of Exit and reason of leaving in the employer unified portal (this is part of FNF).
- If the employer is unresponsive, use the member portal Joint Declaration for Date of Leaving / Reason of Leaving with relieving letter, FNF, or last payslip; or the Mark Exit / self-certification option if shown.
- If the establishment is closed, file physical JD attested by an authorised official at the jurisdictional office (SOP closed-establishment process).
- Confirm the exit date is visible in Service History and that it is at least the waiting period before Form 19 (see epfo-rr-033).
- Then file Form 19/10C.

## Required documents

- Relieving letter or experience certificate
- Last salary slip or FNF letter
- Resignation/termination letter
- JD proofs per SOP Annexure for Date of Leaving

## Who acts

mixed

## Prevention

- Do not complete FNF without a screenshot of Service History showing DOE.
- Keep relieving letter PDF forever.
- Check DOE the week you resign, not two months later.

## Related records

- [epfo-rr-025](./epfo-rr-025.md)
- [epfo-rr-033](./epfo-rr-033.md)
- [epfo-rr-034](./epfo-rr-034.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-030](./epfo-rr-030.md)
- [epfo-rr-041](./epfo-rr-041.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q3(a). JD SOP parameters 8–9. Self-certification of exit is reported in 2025–26 secondary guides; treat portal UI as source of truth.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- https://cleartax.in/c/pf-withdrawal-online
- https://hrsoftwaredelhi.com/pf-withdrawal-process/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-024",
  "rejection_reason": "Date of exit (DOE) not updated by employer in EPFO service history",
  "aliases": [
    "Date of exit not updated",
    "Missing employer exit date",
    "DOE not marked",
    "Exit date missing",
    "Still showing as employed",
    "Date of exit not updated by employer",
    "DOE missing Form 19 blocked",
    "Exit date not marked in service history",
    "SMS: Date of exit not updated",
    "Please update date of leaving"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Official OCS FAQ for Form 19: Date of Joining and Date of Exit of Member should be available in the EPFO Database. Mint: for Form 19, if the employer has not updated date of exit, the system blocks final settlement. Portal: 'Date of exit not updated'.",
  "what_it_means": "Without a date of leaving on the last member ID, EPFO treats the member as still in employment. Form 19 and Form 10C online claims are then ineligible. This is repeatedly described as the single most common blocker for full withdrawal. Date of exit is also a Joint Declaration parameter (reason of leaving and date of leaving). Some 2025–2026 help guides describe a self-certification / Mark Exit path when the employer is unresponsive; members should confirm the current portal label because the official JD SOP still routes date-of-leaving changes through the employer or closed-establishment attestation.",
  "root_cause": "HR skipped exit in the employer portal at Full & Final; company closed; contractor payroll never filed exit; wrong member ID still active.",
  "how_detected": "View > Service History: Date of Exit blank on the last employment. Online claim form greyed out. Claim remark.",
  "fix_steps": [
    "Check Service History for every member ID; note which one has a blank exit date.",
    "Ask the last employer to mark Date of Exit and reason of leaving in the employer unified portal (this is part of FNF).",
    "If the employer is unresponsive, use the member portal Joint Declaration for Date of Leaving / Reason of Leaving with relieving letter, FNF, or last payslip; or the Mark Exit / self-certification option if shown.",
    "If the establishment is closed, file physical JD attested by an authorised official at the jurisdictional office (SOP closed-establishment process).",
    "Confirm the exit date is visible in Service History and that it is at least the waiting period before Form 19 (see epfo-rr-033).",
    "Then file Form 19/10C."
  ],
  "required_documents": [
    "Relieving letter or experience certificate",
    "Last salary slip or FNF letter",
    "Resignation/termination letter",
    "JD proofs per SOP Annexure for Date of Leaving"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Do not complete FNF without a screenshot of Service History showing DOE.",
    "Keep relieving letter PDF forever.",
    "Check DOE the week you resign, not two months later."
  ],
  "related_reason_ids": [
    "epfo-rr-025",
    "epfo-rr-033",
    "epfo-rr-034",
    "epfo-rr-013",
    "epfo-rr-030",
    "epfo-rr-041"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://hrsoftwaredelhi.com/pf-withdrawal-process/"
  ],
  "source_types": [
    "official",
    "circular",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q3(a). JD SOP parameters 8–9. Self-certification of exit is reported in 2025–26 secondary guides; treat portal UI as source of truth.",
  "last_verified": "2026-09-12"
}
```
