# Incorrect bank account number entered in KYC or claim (epfo-rr-017)

> Dataset record `epfo-rr-017`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Incorrect bank account number entered in KYC or claim

**Aliases:** Wrong account number, Bank account number mismatch, Invalid bank account, One digit wrong in account number

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Common remarks: 'Bank details incorrect', 'Invalid bank account'. A single wrong digit is enough.

## What it means

EPFO credits NEFT to the exact account number stored. A transposed digit either fails validation (rejection) or, worse, credits the wrong person if the number happens to exist. At claim time the portal asks you to re-enter last 4 digits as a check; mismatch there also stops submission. Death claims using the deceased's old account instead of the nominee's account are a frequent variant.

## Root cause

Typing from memory; omitting leading zeros; copying an old salary account that was closed; mixing two family accounts.

## How it is detected

Claim bank-verify step. NPCI validation fail. Settlement returned by bank. Passbook vs KYC comparison.

## Fix

- Copy the account number from a recent passbook or cheque, including leading zeros.
- Update Manage > KYC bank details; re-verify last 4 digits on the claim screen.
- If a previous claim was 'settled' but returned, do not file a duplicate until EPFO re-initiates payment against the corrected account (see epfo-rr-022).
- For death claims, use the claimant's account as on the cancelled cheque attached to Form 20/5IF/10D.

## Required documents

- Passbook or cancelled cheque
- Bank statement showing account number

## Who acts

member

## Prevention

- Never type account numbers from memory.
- Screenshot KYC after saving and compare with cheque.

## Related records

- [epfo-rr-018](./epfo-rr-018.md)
- [epfo-rr-022](./epfo-rr-022.md)
- [epfo-rr-015](./epfo-rr-015.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf

### Secondary (news / blog / forum)

- [blog] https://pfbalancecheck.com/epfo-claim-rejected-reason/
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- [blog] https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-017",
  "rejection_reason": "Incorrect bank account number entered in KYC or claim",
  "aliases": [
    "Wrong account number",
    "Bank account number mismatch",
    "Invalid bank account",
    "One digit wrong in account number"
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
  "official_status_or_message": "Common remarks: 'Bank details incorrect', 'Invalid bank account'. A single wrong digit is enough.",
  "what_it_means": "EPFO credits NEFT to the exact account number stored. A transposed digit either fails validation (rejection) or, worse, credits the wrong person if the number happens to exist. At claim time the portal asks you to re-enter last 4 digits as a check; mismatch there also stops submission. Death claims using the deceased's old account instead of the nominee's account are a frequent variant.",
  "root_cause": "Typing from memory; omitting leading zeros; copying an old salary account that was closed; mixing two family accounts.",
  "how_detected": "Claim bank-verify step. NPCI validation fail. Settlement returned by bank. Passbook vs KYC comparison.",
  "fix_steps": [
    "Copy the account number from a recent passbook or cheque, including leading zeros.",
    "Update Manage > KYC bank details; re-verify last 4 digits on the claim screen.",
    "If a previous claim was 'settled' but returned, do not file a duplicate until EPFO re-initiates payment against the corrected account (see epfo-rr-022).",
    "For death claims, use the claimant's account as on the cancelled cheque attached to Form 20/5IF/10D."
  ],
  "required_documents": [
    "Passbook or cancelled cheque",
    "Bank statement showing account number"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never type account numbers from memory.",
    "Screenshot KYC after saving and compare with cheque."
  ],
  "related_reason_ids": [
    "epfo-rr-018",
    "epfo-rr-022",
    "epfo-rr-015"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
