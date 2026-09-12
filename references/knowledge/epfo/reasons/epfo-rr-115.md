# Bank account changed after claim submission causing payment failure or re-validation reject (epfo-rr-115)

> Dataset record `epfo-rr-115`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Bank account changed after claim submission causing payment failure or re-validation reject

**Aliases:** Bank changed after claim filed, IFSC updated mid-claim, New account not used for settlement, Payment to old account failed after KYC change

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Mint/PFBalanceCheck bank-rejection patterns and settled-but-not-credited guides: payment uses bank details validated for that claim.

## What it means

Member updates bank after filing hoping to redirect payment; claim may reject on re-validation or settle to old account and bounce.

## Root cause

Mid-claim KYC bank edit; old account closed; IFSC merger during processing.

## How it is detected

Payment return after bank change; remark about bank details.

## Fix

- Do not change bank KYC while a claim is Under process unless RO instructs.
- If account must change, get reject/clarification then refile with verified new bank.
- For settled-but-returned, request re-payment after correcting bank.
- Ensure new bank is sole-name and NPCI verified before refile.

## Required documents

- Bank KYC screenshots before/after
- UTR if payment returned
- Track Claim status

## Who acts

member

## Prevention

- Finalize bank KYC before submitting any claim.

## Related records

- [epfo-rr-022](./epfo-rr-022.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-017](./epfo-rr-017.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, blog, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- https://pfbalancecheck.com/epfo-claim-rejected-reason/
- https://epfwala.com/pf-claim-status-shows-settled-but-amount-not-credited/
- https://righttoinformation.wiki/practical-guides/epfo-claim-settled-money-not-credited
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-115",
  "rejection_reason": "Bank account changed after claim submission causing payment failure or re-validation reject",
  "aliases": [
    "Bank changed after claim filed",
    "IFSC updated mid-claim",
    "New account not used for settlement",
    "Payment to old account failed after KYC change"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Mint/PFBalanceCheck bank-rejection patterns and settled-but-not-credited guides: payment uses bank details validated for that claim.",
  "what_it_means": "Member updates bank after filing hoping to redirect payment; claim may reject on re-validation or settle to old account and bounce.",
  "root_cause": "Mid-claim KYC bank edit; old account closed; IFSC merger during processing.",
  "how_detected": "Payment return after bank change; remark about bank details.",
  "fix_steps": [
    "Do not change bank KYC while a claim is Under process unless RO instructs.",
    "If account must change, get reject/clarification then refile with verified new bank.",
    "For settled-but-returned, request re-payment after correcting bank.",
    "Ensure new bank is sole-name and NPCI verified before refile."
  ],
  "required_documents": [
    "Bank KYC screenshots before/after",
    "UTR if payment returned",
    "Track Claim status"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Finalize bank KYC before submitting any claim."
  ],
  "related_reason_ids": [
    "epfo-rr-022",
    "epfo-rr-016",
    "epfo-rr-017",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://epfwala.com/pf-claim-status-shows-settled-but-amount-not-credited/",
    "https://righttoinformation.wiki/practical-guides/epfo-claim-settled-money-not-credited",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf"
  ],
  "source_types": [
    "news",
    "blog",
    "circular"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
