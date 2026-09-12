# Online claim failed because last four digits of bank account verification did not match seeded KYC (epfo-rr-120)

> Dataset record `epfo-rr-120`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Online claim failed because last four digits of bank account verification did not match seeded KYC

**Aliases:** Bank account last 4 digits not matching, Enter bank account digits verification failed, Account number mismatch at claim start, Cannot proceed for online claim bank verify

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax Form 31 online steps and member portal flow: claim wizard asks last 4 digits of bank account to verify against seeded KYC before proceeding.

## What it means

Distinct from NPCI not verified: member types wrong digits or seeded account differs from the bank they think they are using. No Track Claim ID exists yet.

## Root cause

Typo; multiple accounts confusion; bank KYC outdated vs passbook.

## How it is detected

Portal error at bank digit verification step; no claim ID generated.

## Fix

- Open Manage KYC and note the exact seeded account number.
- Enter the correct last 4 digits from that seeded account.
- If wrong account is seeded, update and verify bank KYC first, then claim.
- Do not repeatedly submit random digit guesses.

## Required documents

- Manage KYC bank screenshot
- Passbook/cheque of seeded account

## Who acts

member

## Prevention

- Keep seeded account number ready before starting claim wizard.

## Related records

- [epfo-rr-015](./epfo-rr-015.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-017](./epfo-rr-017.md)
- [epfo-rr-054](./epfo-rr-054.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, official, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://cleartax.in/s/epf-form-31
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://pfbalancecheck.com/epfo-claim-rejected-reason/
- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-120",
  "rejection_reason": "Online claim failed because last four digits of bank account verification did not match seeded KYC",
  "aliases": [
    "Bank account last 4 digits not matching",
    "Enter bank account digits verification failed",
    "Account number mismatch at claim start",
    "Cannot proceed for online claim bank verify"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax Form 31 online steps and member portal flow: claim wizard asks last 4 digits of bank account to verify against seeded KYC before proceeding.",
  "what_it_means": "Distinct from NPCI not verified: member types wrong digits or seeded account differs from the bank they think they are using. No Track Claim ID exists yet.",
  "root_cause": "Typo; multiple accounts confusion; bank KYC outdated vs passbook.",
  "how_detected": "Portal error at bank digit verification step; no claim ID generated.",
  "fix_steps": [
    "Open Manage KYC and note the exact seeded account number.",
    "Enter the correct last 4 digits from that seeded account.",
    "If wrong account is seeded, update and verify bank KYC first, then claim.",
    "Do not repeatedly submit random digit guesses."
  ],
  "required_documents": [
    "Manage KYC bank screenshot",
    "Passbook/cheque of seeded account"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep seeded account number ready before starting claim wizard."
  ],
  "related_reason_ids": [
    "epfo-rr-015",
    "epfo-rr-016",
    "epfo-rr-017",
    "epfo-rr-054"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html"
  ],
  "source_types": [
    "blog",
    "official",
    "news"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
