# UPI-only / VPA-centric account without usable account-number+IFSC for EPFO NEFT credit (epfo-rr-156)

> Dataset record `epfo-rr-156`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** UPI-only / VPA-centric account without usable account-number+IFSC for EPFO NEFT credit

**Aliases:** UPI only account PF claim, VPA not accepted EPFO bank KYC, Need IFSC account number not UPI, BHIM UPI PF withdrawal not live, Cannot seed UPI ID for claim

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** EPFO bank KYC historically requires account number + IFSC for NPCI/NEFT validation. UPI-based PF withdrawal features discussed under EPFO 3.0 style upgrades are not a substitute for seeded bank account on classic claims. Attempting to rely on VPA-only fintech accounts without IFSC fails seeding.

## What it means

Members with app-only wallets/UPI handles must link or open a bank account that exposes account number and IFSC. Distinct from NPCI validation fail on a normal account (016).

## Root cause

No IFSC; PPI/wallet restrictions; premature expectation of UPI PF payout.

## How it is detected

Bank KYC form requires IFSC. Seeding errors. Payment rails NEFT-only.

## Fix

- Open/use a savings account with classic account number and IFSC in member's name.
- Seed that account and wait for NPCI Verified.
- Do not enter UPI VPA in account-number field.
- Refile claim after bank KYC Verified.

## Required documents

- Bank passbook/cheque with IFSC
- Aadhaar-matched name account

## Who acts

member

## Prevention

- Keep a seeded NEFT-capable sole savings account before claiming.

## Related records

- [epfo-rr-015](./epfo-rr-015.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-105](./epfo-rr-105.md)
- [epfo-rr-020](./epfo-rr-020.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, news, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** UPI PF payout not assumed live; record warns against VPA-only seeding.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://dailyfinancial.in/epfo-3-0-testing-is-done-but-still-not-live-whats-stopping-upi-and-atm-based-pf-withdrawals-from-launching-right-now/
- https://cleartax.in/c/pf-withdrawal-online

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-156",
  "rejection_reason": "UPI-only / VPA-centric account without usable account-number+IFSC for EPFO NEFT credit",
  "aliases": [
    "UPI only account PF claim",
    "VPA not accepted EPFO bank KYC",
    "Need IFSC account number not UPI",
    "BHIM UPI PF withdrawal not live",
    "Cannot seed UPI ID for claim"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "EPFO bank KYC historically requires account number + IFSC for NPCI/NEFT validation. UPI-based PF withdrawal features discussed under EPFO 3.0 style upgrades are not a substitute for seeded bank account on classic claims. Attempting to rely on VPA-only fintech accounts without IFSC fails seeding.",
  "what_it_means": "Members with app-only wallets/UPI handles must link or open a bank account that exposes account number and IFSC. Distinct from NPCI validation fail on a normal account (016).",
  "root_cause": "No IFSC; PPI/wallet restrictions; premature expectation of UPI PF payout.",
  "how_detected": "Bank KYC form requires IFSC. Seeding errors. Payment rails NEFT-only.",
  "fix_steps": [
    "Open/use a savings account with classic account number and IFSC in member's name.",
    "Seed that account and wait for NPCI Verified.",
    "Do not enter UPI VPA in account-number field.",
    "Refile claim after bank KYC Verified."
  ],
  "required_documents": [
    "Bank passbook/cheque with IFSC",
    "Aadhaar-matched name account"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep a seeded NEFT-capable sole savings account before claiming."
  ],
  "related_reason_ids": [
    "epfo-rr-015",
    "epfo-rr-016",
    "epfo-rr-105",
    "epfo-rr-020"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_RemovalOfUploadingImage.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://dailyfinancial.in/epfo-3-0-testing-is-done-but-still-not-live-whats-stopping-upi-and-atm-based-pf-withdrawals-from-launching-right-now/",
    "https://cleartax.in/c/pf-withdrawal-online"
  ],
  "source_types": [
    "official",
    "circular",
    "news",
    "blog"
  ],
  "confidence": "medium",
  "notes": "UPI PF payout not assumed live; record warns against VPA-only seeding.",
  "last_verified": "2026-09-12"
}
```
