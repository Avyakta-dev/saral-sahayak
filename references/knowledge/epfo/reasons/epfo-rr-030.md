# Establishment closed, untraceable, or no authorised officer to attest or approve KYC (epfo-rr-030)

> Dataset record `epfo-rr-030`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Establishment closed, untraceable, or no authorised officer to attest or approve KYC

**Aliases:** Closed establishment, Employer untraceable, Company shut down, No authorised signatory

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** high
- **Official/common message status:** Form 19/5IF instructions and JD SOP Table-5 provide an alternative attestation list when the establishment is closed. Inoperative-account SOP: if establishment is marked closed, some member requests go directly to the Dealing Assistant.

## What it means

Startups, contractors, and MSMEs that shut down leave members unable to get DOE, KYC approval, or physical attestation. Online Aadhaar claims still work if KYC was already verified; if not, the member must use closed-establishment procedures at the Regional Office rather than waiting for a defunct HR team.

## Root cause

Establishment closure without compliance handover; not marked closed in EPFO so requests still sit in a dead employer login.

## How it is detected

Employer login abandoned. Phone disconnected. Establishment status on EPFO. KYC pending forever.

## Fix

- Check establishment status on epfindia (establishment search) and whether it is marked closed.
- If KYC is already verified, file Aadhaar-based online claims yourself.
- For DOE/JD, use SOP closed-establishment path: physical JD Annexure-II attested by magistrate, gazetted officer, bank manager of claimant's account, MP/MLA, postmaster, panchayat head, etc.
- Submit at the jurisdictional Regional Office with employment proofs.
- Raise EPFiGMS. For inoperative accounts, use the inoperative unblocking request which can skip a closed employer.

## Required documents

- Physical JD/claim
- Alternative official attestation
- Appointment/relieving/payslips
- Aadhaar and bank proof

## Who acts

mixed

## Prevention

- Verify KYC and e-nomination while the employer still exists.
- Download passbooks before the company disappears.

## Related records

- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-026](./epfo-rr-026.md)
- [epfo-rr-045](./epfo-rr-045.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** SOP 6.9 Table-5 and 6.14 list of attesting authorities.

- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/Circular_SOP_WSU_02082024.pdf
- https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-030",
  "rejection_reason": "Establishment closed, untraceable, or no authorised officer to attest or approve KYC",
  "aliases": [
    "Closed establishment",
    "Employer untraceable",
    "Company shut down",
    "No authorised signatory"
  ],
  "category": "Employer_Related",
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
  "official_status_or_message": "Form 19/5IF instructions and JD SOP Table-5 provide an alternative attestation list when the establishment is closed. Inoperative-account SOP: if establishment is marked closed, some member requests go directly to the Dealing Assistant.",
  "what_it_means": "Startups, contractors, and MSMEs that shut down leave members unable to get DOE, KYC approval, or physical attestation. Online Aadhaar claims still work if KYC was already verified; if not, the member must use closed-establishment procedures at the Regional Office rather than waiting for a defunct HR team.",
  "root_cause": "Establishment closure without compliance handover; not marked closed in EPFO so requests still sit in a dead employer login.",
  "how_detected": "Employer login abandoned. Phone disconnected. Establishment status on EPFO. KYC pending forever.",
  "fix_steps": [
    "Check establishment status on epfindia (establishment search) and whether it is marked closed.",
    "If KYC is already verified, file Aadhaar-based online claims yourself.",
    "For DOE/JD, use SOP closed-establishment path: physical JD Annexure-II attested by magistrate, gazetted officer, bank manager of claimant's account, MP/MLA, postmaster, panchayat head, etc.",
    "Submit at the jurisdictional Regional Office with employment proofs.",
    "Raise EPFiGMS. For inoperative accounts, use the inoperative unblocking request which can skip a closed employer."
  ],
  "required_documents": [
    "Physical JD/claim",
    "Alternative official attestation",
    "Appointment/relieving/payslips",
    "Aadhaar and bank proof"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Verify KYC and e-nomination while the employer still exists.",
    "Download passbooks before the company disappears."
  ],
  "related_reason_ids": [
    "epfo-rr-013",
    "epfo-rr-024",
    "epfo-rr-026",
    "epfo-rr-045"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/Circular_SOP_WSU_02082024.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html"
  ],
  "source_types": [
    "official",
    "circular"
  ],
  "confidence": "high",
  "notes": "SOP 6.9 Table-5 and 6.14 list of attesting authorities.",
  "last_verified": "2026-09-12"
}
```
