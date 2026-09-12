# Invalid or outdated IFSC after bank merger or branch change (epfo-rr-018)

> Dataset record `epfo-rr-018`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Invalid or outdated IFSC after bank merger or branch change

**Aliases:** IFSC invalid, Old IFSC after merger, Signature or IFSC changes, Allahabad Bank IFSC into Indian Bank

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Mint (Jul 2026) lists 'Signature or IFSC Changes' after mergers (e.g. Allahabad Bank into Indian Bank) as a top rejection reason. Portal: 'IFSC invalid' / 'Bank details incorrect'.

## What it means

IFSC identifies the paying branch in NEFT. After mergers, branch closures, or CBS migrations, the old IFSC is retired. EPFO still holding the old code will fail NPCI validation or the bank will return the credit. Members must update KYC with the new IFSC before claiming; updating only at the bank is not enough.

## Root cause

Bank merger; branch merger; member moved cities but kept old IFSC; copied IFSC from Google instead of the passbook.

## How it is detected

RBI/IFSC lookup vs passbook. Claim remark. Returned NEFT with 'invalid IFSC'.

## Fix

- Read the IFSC printed on the latest cheque book or passbook, not a third-party website.
- Confirm with the branch after any merger.
- Update Bank KYC on the member portal with the new IFSC and wait for Verified.
- Then resubmit the claim.

## Required documents

- Latest cancelled cheque or passbook showing current IFSC
- Bank merger communication if available

## Who acts

mixed

## Prevention

- After any bank merger SMS, update EPFO KYC within days.
- Recheck IFSC before every claim.

## Related records

- [epfo-rr-015](./epfo-rr-015.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-022](./epfo-rr-022.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Mint 3 July 2026 explicitly uses the Allahabad Bank → Indian Bank example.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- **[blog]** FinRight: 9 common EPF rejection reasons — https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-018",
  "rejection_reason": "Invalid or outdated IFSC after bank merger or branch change",
  "aliases": [
    "IFSC invalid",
    "Old IFSC after merger",
    "Signature or IFSC changes",
    "Allahabad Bank IFSC into Indian Bank"
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
  "official_status_or_message": "Mint (Jul 2026) lists 'Signature or IFSC Changes' after mergers (e.g. Allahabad Bank into Indian Bank) as a top rejection reason. Portal: 'IFSC invalid' / 'Bank details incorrect'.",
  "what_it_means": "IFSC identifies the paying branch in NEFT. After mergers, branch closures, or CBS migrations, the old IFSC is retired. EPFO still holding the old code will fail NPCI validation or the bank will return the credit. Members must update KYC with the new IFSC before claiming; updating only at the bank is not enough.",
  "root_cause": "Bank merger; branch merger; member moved cities but kept old IFSC; copied IFSC from Google instead of the passbook.",
  "how_detected": "RBI/IFSC lookup vs passbook. Claim remark. Returned NEFT with 'invalid IFSC'.",
  "fix_steps": [
    "Read the IFSC printed on the latest cheque book or passbook, not a third-party website.",
    "Confirm with the branch after any merger.",
    "Update Bank KYC on the member portal with the new IFSC and wait for Verified.",
    "Then resubmit the claim."
  ],
  "required_documents": [
    "Latest cancelled cheque or passbook showing current IFSC",
    "Bank merger communication if available"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "After any bank merger SMS, update EPFO KYC within days.",
    "Recheck IFSC before every claim."
  ],
  "related_reason_ids": [
    "epfo-rr-015",
    "epfo-rr-016",
    "epfo-rr-022"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "news",
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Mint 3 July 2026 explicitly uses the Allahabad Bank → Indian Bank example.",
  "last_verified": "2026-09-12"
}
```
