# Bank account and IFSC not seeded in EPFO database (epfo-rr-015)

> Dataset record `epfo-rr-015`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Bank account and IFSC not seeded in EPFO database

**Aliases:** Bank details not seeded, Bank account not linked, IFSC not available in UAN, Bank KYC not uploaded, Bank account not linked to UAN, Add bank details before claim, IFSC not seeded, SMS: Bank details not available

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** critical
- **Official/common message status:** Official OCS FAQ: Member's Bank Account along with IFSC code should be seeded in EPFO database. Without seeded bank details, online claims cannot be paid by NEFT.

## What it means

EPFO pays claims by electronic credit to the bank account stored against the UAN. If no account number and IFSC are seeded, the online claim is blocked at eligibility or rejected later. This is distinct from a seeded-but-unverified account. Composite Claim Form (Aadhaar) also requires bank seeding. Death and EDLI payments go to the claimant's account, which must likewise be captured on the form or KYC.

## Root cause

Member never uploaded bank KYC; employer never approved it; or member wanted a different account than the seeded one (OCS FAQ says change the account first, do not file online against a stale account).

## How it is detected

Manage > KYC shows Bank as blank/not uploaded. Online claim bank-verify step fails. OCS eligibility gate.

## Fix

- Log in to the member portal > Manage > KYC > add savings account number, IFSC, and bank name exactly as on the passbook.
- If the portal asks for a cancelled cheque or passbook image (typically when NPCI cannot auto-verify), upload a clear scan with printed name, account number, and IFSC.
- Wait until Bank KYC status is Verified, then use that same account on the claim screen (enter last 4 digits to verify).
- To use a different account, update KYC first; do not file the online claim against the old account.
- For death/EDLI, put the claimant's own account (not the deceased's) and attach a cancelled cheque of the claimant.
- Resubmit the claim only after Verified status.

## Required documents

- Bank passbook or cancelled cheque with name, account number, IFSC
- Aadhaar-linked mobile for OTP

## Who acts

member

## Prevention

- Seed bank KYC the same week you activate UAN.
- Use a sole-operated savings account in your name.
- Re-verify IFSC after any bank merger.

## Related records

- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-017](./epfo-rr-017.md)
- [epfo-rr-018](./epfo-rr-018.md)
- [epfo-rr-021](./epfo-rr-021.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q2(c) and Q8 (do not file online if you want a different bank account; change KYC first).

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-015",
  "rejection_reason": "Bank account and IFSC not seeded in EPFO database",
  "aliases": [
    "Bank details not seeded",
    "Bank account not linked",
    "IFSC not available in UAN",
    "Bank KYC not uploaded",
    "Bank account not linked to UAN",
    "Add bank details before claim",
    "IFSC not seeded",
    "SMS: Bank details not available"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Official OCS FAQ: Member's Bank Account along with IFSC code should be seeded in EPFO database. Without seeded bank details, online claims cannot be paid by NEFT.",
  "what_it_means": "EPFO pays claims by electronic credit to the bank account stored against the UAN. If no account number and IFSC are seeded, the online claim is blocked at eligibility or rejected later. This is distinct from a seeded-but-unverified account. Composite Claim Form (Aadhaar) also requires bank seeding. Death and EDLI payments go to the claimant's account, which must likewise be captured on the form or KYC.",
  "root_cause": "Member never uploaded bank KYC; employer never approved it; or member wanted a different account than the seeded one (OCS FAQ says change the account first, do not file online against a stale account).",
  "how_detected": "Manage > KYC shows Bank as blank/not uploaded. Online claim bank-verify step fails. OCS eligibility gate.",
  "fix_steps": [
    "Log in to the member portal > Manage > KYC > add savings account number, IFSC, and bank name exactly as on the passbook.",
    "If the portal asks for a cancelled cheque or passbook image (typically when NPCI cannot auto-verify), upload a clear scan with printed name, account number, and IFSC.",
    "Wait until Bank KYC status is Verified, then use that same account on the claim screen (enter last 4 digits to verify).",
    "To use a different account, update KYC first; do not file the online claim against the old account.",
    "For death/EDLI, put the claimant's own account (not the deceased's) and attach a cancelled cheque of the claimant.",
    "Resubmit the claim only after Verified status."
  ],
  "required_documents": [
    "Bank passbook or cancelled cheque with name, account number, IFSC",
    "Aadhaar-linked mobile for OTP"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Seed bank KYC the same week you activate UAN.",
    "Use a sole-operated savings account in your name.",
    "Re-verify IFSC after any bank merger."
  ],
  "related_reason_ids": [
    "epfo-rr-016",
    "epfo-rr-017",
    "epfo-rr-018",
    "epfo-rr-021"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q2(c) and Q8 (do not file online if you want a different bank account; change KYC first).",
  "last_verified": "2026-09-12"
}
```
