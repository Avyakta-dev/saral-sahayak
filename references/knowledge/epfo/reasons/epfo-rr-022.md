# Claim settled but payment returned because account is dormant, frozen, closed, or KYC-pending at bank (epfo-rr-022)

> Dataset record `epfo-rr-022`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claim settled but payment returned because account is dormant, frozen, closed, or KYC-pending at bank

**Aliases:** Settled but money not credited, NEFT returned, Payment bounced, Dormant account, Claim settled amount not credited, Settled but amount not credited, NEFT returned to EPFO, Payment failed after settlement, UTR returned account dormant, SMS: Payment returned by bank

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Not always labelled 'Rejected' on the portal; status may remain Settled while the bank returns the credit. ClearTax lists this under why withdrawal 'fails' after filing.

## What it means

EPFO may have approved and pushed NEFT, but the receiving bank rejects the credit (dormant, frozen for KYC, closed, name mismatch, or credit freeze). The member sees Settled and no money. Filing a second claim can create a duplicate-claim mess. The correct path is to trace the UTR, fix the account, and ask EPFO to re-initiate payment.

## Root cause

RBI dormant-account rules; bank KYC not updated; account closed after seeding; debit freeze; wrong IFSC causing return.

## How it is detected

No credit 3–7 days after Settled. Bank return memo. UTR in claim payment details. EPFiGMS.

## Fix

- Do not immediately file another Form 19/31.
- Note claim ID, settlement date, and UTR from Track Claim / payment details.
- Ask the bank to trace the inward NEFT and reactivate/unfreeze the account or confirm the return reason.
- Update EPFO bank KYC if the account number/IFSC must change; get it Verified.
- Raise EPFiGMS asking for re-payment of the returned amount to the corrected verified account, attaching bank letter and UTR.
- Follow up with the regional office if needed.

## Required documents

- Claim acknowledgement and UTR
- Bank letter stating return reason / that account is now active
- Updated cancelled cheque

## Who acts

mixed

## Prevention

- Do a small test credit to the account before a large PF claim.
- Complete bank KYC and use the account in the 30 days before claiming.
- Never seed a closed salary account.

## Related records

- [epfo-rr-017](./epfo-rr-017.md)
- [epfo-rr-018](./epfo-rr-018.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Operational payment-return pattern, not a statutory 'rejection code'. Secondary blogs document UTR/re-payment practice.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfigms.gov.in/
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://epfwala.com/pf-claim-status-shows-settled-but-amount-not-credited/
- [blog] https://righttoinformation.wiki/practical-guides/epfo-claim-settled-money-not-credited

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-022",
  "rejection_reason": "Claim settled but payment returned because account is dormant, frozen, closed, or KYC-pending at bank",
  "aliases": [
    "Settled but money not credited",
    "NEFT returned",
    "Payment bounced",
    "Dormant account",
    "Claim settled amount not credited",
    "Settled but amount not credited",
    "NEFT returned to EPFO",
    "Payment failed after settlement",
    "UTR returned account dormant",
    "SMS: Payment returned by bank"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Not always labelled 'Rejected' on the portal; status may remain Settled while the bank returns the credit. ClearTax lists this under why withdrawal 'fails' after filing.",
  "what_it_means": "EPFO may have approved and pushed NEFT, but the receiving bank rejects the credit (dormant, frozen for KYC, closed, name mismatch, or credit freeze). The member sees Settled and no money. Filing a second claim can create a duplicate-claim mess. The correct path is to trace the UTR, fix the account, and ask EPFO to re-initiate payment.",
  "root_cause": "RBI dormant-account rules; bank KYC not updated; account closed after seeding; debit freeze; wrong IFSC causing return.",
  "how_detected": "No credit 3–7 days after Settled. Bank return memo. UTR in claim payment details. EPFiGMS.",
  "fix_steps": [
    "Do not immediately file another Form 19/31.",
    "Note claim ID, settlement date, and UTR from Track Claim / payment details.",
    "Ask the bank to trace the inward NEFT and reactivate/unfreeze the account or confirm the return reason.",
    "Update EPFO bank KYC if the account number/IFSC must change; get it Verified.",
    "Raise EPFiGMS asking for re-payment of the returned amount to the corrected verified account, attaching bank letter and UTR.",
    "Follow up with the regional office if needed."
  ],
  "required_documents": [
    "Claim acknowledgement and UTR",
    "Bank letter stating return reason / that account is now active",
    "Updated cancelled cheque"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Do a small test credit to the account before a large PF claim.",
    "Complete bank KYC and use the account in the 30 days before claiming.",
    "Never seed a closed salary account."
  ],
  "related_reason_ids": [
    "epfo-rr-017",
    "epfo-rr-018",
    "epfo-rr-016",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://epfwala.com/pf-claim-status-shows-settled-but-amount-not-credited/",
    "https://righttoinformation.wiki/practical-guides/epfo-claim-settled-money-not-credited",
    "https://epfigms.gov.in/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "Operational payment-return pattern, not a statutory 'rejection code'. Secondary blogs document UTR/re-payment practice.",
  "last_verified": "2026-09-12"
}
```
