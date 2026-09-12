# Bank account holder name does not match UAN/Aadhaar name (epfo-rr-020)

> Dataset record `epfo-rr-020`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Bank account holder name does not match UAN/Aadhaar name

**Aliases:** Name mismatch with bank, Bank name not matching, Account not in employee's name, Bank name mismatch with UAN, Account holder name differ, Beneficiary name not matching

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Remarks: 'Bank details incorrect' / name not matching bank records. Mint: name must match perfectly across EPFO, Aadhaar, and bank.

## What it means

NPCI and EPFO compare the account-holder name with the UAN/Aadhaar name. Initials, missing surname, or an account opened in a spouse's name fail. This can reject the claim or cause a later returned credit. Death-claim cheques must match the claimant, not the deceased.

## Root cause

Bank uses a different spelling; account opened before a legal name change; joint-account first holder is not the member.

## How it is detected

NPCI fail. Cheque name vs Aadhaar. Field-office cheque scrutiny.

## Fix

- Ask the bank to update the account name to match Aadhaar (bank's KYC process).
- Or seed a different account whose printed name already matches.
- Align UAN name to Aadhaar via Joint Declaration if UAN is the odd one out.
- Re-verify Bank KYC after the bank name change posts, then refile.

## Required documents

- Updated passbook/cheque with matching name
- Aadhaar
- Bank KYC modification form if the bank requires it

## Who acts

mixed

## Prevention

- Open PF-payout accounts using Aadhaar e-KYC so names match by construction.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-019](./epfo-rr-019.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- https://hrsoftwaredelhi.com/pf-withdrawal-process/
- https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-020",
  "rejection_reason": "Bank account holder name does not match UAN/Aadhaar name",
  "aliases": [
    "Name mismatch with bank",
    "Bank name not matching",
    "Account not in employee's name",
    "Bank name mismatch with UAN",
    "Account holder name differ",
    "Beneficiary name not matching"
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
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Remarks: 'Bank details incorrect' / name not matching bank records. Mint: name must match perfectly across EPFO, Aadhaar, and bank.",
  "what_it_means": "NPCI and EPFO compare the account-holder name with the UAN/Aadhaar name. Initials, missing surname, or an account opened in a spouse's name fail. This can reject the claim or cause a later returned credit. Death-claim cheques must match the claimant, not the deceased.",
  "root_cause": "Bank uses a different spelling; account opened before a legal name change; joint-account first holder is not the member.",
  "how_detected": "NPCI fail. Cheque name vs Aadhaar. Field-office cheque scrutiny.",
  "fix_steps": [
    "Ask the bank to update the account name to match Aadhaar (bank's KYC process).",
    "Or seed a different account whose printed name already matches.",
    "Align UAN name to Aadhaar via Joint Declaration if UAN is the odd one out.",
    "Re-verify Bank KYC after the bank name change posts, then refile."
  ],
  "required_documents": [
    "Updated passbook/cheque with matching name",
    "Aadhaar",
    "Bank KYC modification form if the bank requires it"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Open PF-payout accounts using Aadhaar e-KYC so names match by construction."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-016",
    "epfo-rr-019"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://hrsoftwaredelhi.com/pf-withdrawal-process/",
    "https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval"
  ],
  "source_types": [
    "news",
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
