# Bank KYC not verified or NPCI account validation failed (epfo-rr-016)

> Dataset record `epfo-rr-016`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Bank KYC not verified or NPCI account validation failed

**Aliases:** Bank KYC not verified, NPCI verification failed, Bank details not verified, Bank account validation failed, Bank KYC not verified NPCI, Account validation failed, Bank details not verified on portal, NPCI validation failed, SMS: Bank KYC not verified

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim, Form 20 Death PF Settlement
- **Severity:** critical
- **Official/common message status:** Portal: 'KYC incomplete', 'Bank details not verified', 'Bank KYC not verified'. From April 2025, EPFO generally dropped cancelled-cheque upload when the bank/NPCI has already validated the account; unverified accounts may still need an image or get rejected.

## What it means

Seeding stores the number; verification means the bank or NPCI confirmed the account exists, is active, and the name matches. Unverified bank KYC is one of the top live rejection reasons. Members often see the account listed and assume it is approved. Reddit and practitioner guides in 2026 still report 'Bank KYC not verified' as a first-line remark.

## Root cause

NPCI name match failed; account is newly opened; IFSC wrong; joint account; bank has not responded to EPFO confirmation; or employer never approved bank KYC.

## How it is detected

Manage > KYC Bank row Pending/Failed. Claim remark. Cheque-upload prompt for non-NPCI accounts.

## Fix

- Check whether Bank KYC is Verified (not Pending).
- Confirm with the bank that the account is active, KYC-complete at the bank, and the name matches Aadhaar/UAN.
- Correct account number/IFSC and resubmit bank KYC; attach a clear cancelled cheque if prompted.
- If the employer must approve bank KYC, chase HR DSC approval.
- After Verified, wait a day for systems to sync, then refile once.

## Required documents

- Cancelled cheque with printed name
- Passbook first page
- Bank confirmation if NPCI keeps failing

## Who acts

mixed

## Prevention

- Prefer a bank that participates in NPCI account validation.
- Do not file while Bank KYC is Pending.
- Name on cheque must be printed, not handwritten.

## Related records

- [epfo-rr-015](./epfo-rr-015.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-020](./epfo-rr-020.md)
- [epfo-rr-021](./epfo-rr-021.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, news, blog, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Cheque-upload relaxation is from EPFO circular on removal of uploading image (2025-26). Non-NPCI accounts can still be asked for images (Mint 3 Jul 2026).

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf

### Secondary (news / blog / forum)

- [news] https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- [news] https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857
- [forum] https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- [blog] https://kustodian.life/resources/epf-claim-rejected-reasons-guide

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-016",
  "rejection_reason": "Bank KYC not verified or NPCI account validation failed",
  "aliases": [
    "Bank KYC not verified",
    "NPCI verification failed",
    "Bank details not verified",
    "Bank account validation failed",
    "Bank KYC not verified NPCI",
    "Account validation failed",
    "Bank details not verified on portal",
    "NPCI validation failed",
    "SMS: Bank KYC not verified"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "Form 20 Death PF Settlement"
  ],
  "severity": "critical",
  "official_status_or_message": "Portal: 'KYC incomplete', 'Bank details not verified', 'Bank KYC not verified'. From April 2025, EPFO generally dropped cancelled-cheque upload when the bank/NPCI has already validated the account; unverified accounts may still need an image or get rejected.",
  "what_it_means": "Seeding stores the number; verification means the bank or NPCI confirmed the account exists, is active, and the name matches. Unverified bank KYC is one of the top live rejection reasons. Members often see the account listed and assume it is approved. Reddit and practitioner guides in 2026 still report 'Bank KYC not verified' as a first-line remark.",
  "root_cause": "NPCI name match failed; account is newly opened; IFSC wrong; joint account; bank has not responded to EPFO confirmation; or employer never approved bank KYC.",
  "how_detected": "Manage > KYC Bank row Pending/Failed. Claim remark. Cheque-upload prompt for non-NPCI accounts.",
  "fix_steps": [
    "Check whether Bank KYC is Verified (not Pending).",
    "Confirm with the bank that the account is active, KYC-complete at the bank, and the name matches Aadhaar/UAN.",
    "Correct account number/IFSC and resubmit bank KYC; attach a clear cancelled cheque if prompted.",
    "If the employer must approve bank KYC, chase HR DSC approval.",
    "After Verified, wait a day for systems to sync, then refile once."
  ],
  "required_documents": [
    "Cancelled cheque with printed name",
    "Passbook first page",
    "Bank confirmation if NPCI keeps failing"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Prefer a bank that participates in NPCI account validation.",
    "Do not file while Bank KYC is Pending.",
    "Name on cheque must be printed, not handwritten."
  ],
  "related_reason_ids": [
    "epfo-rr-015",
    "epfo-rr-010",
    "epfo-rr-020",
    "epfo-rr-021"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://www.timesnownews.com/business-economy/personal-finance/epfo-processed-8-3-crore-claims-in-fy26-cancelled-cheque-upload-no-longer-required-article-155357857",
    "https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://kustodian.life/resources/epf-claim-rejected-reasons-guide"
  ],
  "source_types": [
    "official",
    "news",
    "blog",
    "forum"
  ],
  "confidence": "high",
  "notes": "Cheque-upload relaxation is from EPFO circular on removal of uploading image (2025-26). Non-NPCI accounts can still be asked for images (Mint 3 Jul 2026).",
  "last_verified": "2026-09-12"
}
```
