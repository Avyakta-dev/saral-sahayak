# Fake, non-existent, or shell employer establishment triggering claim/compliance block (epfo-rr-165)

> Dataset record `epfo-rr-165`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Fake, non-existent, or shell employer establishment triggering claim/compliance block

**Aliases:** Fake employer PF claim, Shell establishment code reject, Non existent company UAN claim, Fraudulent establishment contributions, Coverage dispute fake employer

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** EPFO and news reports on fraud emphasise scrutiny of suspicious establishments and inoperative/high-risk accounts. Claims tied to codes under coverage fraud investigation are withheld or rejected pending inquiry.

## What it means

If contributions were booked under a bogus employer, settlement is not routine. Member may need to cooperate with inquiry; balances can be frozen.

## Root cause

Identity fraud rings; sold establishment codes; member unwittingly hired by non-compliant entity.

## How it is detected

Establishment flagged. Inspection paras. Police/EPFO fraud references in EPFiGMS replies.

## Fix

- Gather appointment letters, salary proofs, identity KYC to show genuine employment if applicable.
- Cooperate with RO investigation; do not use agents promising release fees.
- EPFiGMS and, if needed, legal advice for genuine workers caught in shell-company cases.
- Avoid further claims until RO clears the member ID.

## Required documents

- Employment proofs
- Salary bank credits
- KYC
- Any RO notices

## Who acts

mixed

## Prevention

- Verify establishment PF code and ECR filing when joining.

## Related records

- [epfo-rr-150](./epfo-rr-150.md)
- [epfo-rr-076](./epfo-rr-076.md)
- [epfo-rr-030](./epfo-rr-030.md)
- [epfo-rr-166](./epfo-rr-166.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** news, circular, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Fraud typology; outcomes are case-specific.

- https://www.business-standard.com/finance/personal-finance/epfo-issues-new-rules-for-inoperative-inactive-accounts-to-combat-fraud-124080600360_1.html
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/Circular_SOP_WSU_02082024.pdf
- https://epfigms.gov.in/
- https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html
- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-165",
  "rejection_reason": "Fake, non-existent, or shell employer establishment triggering claim/compliance block",
  "aliases": [
    "Fake employer PF claim",
    "Shell establishment code reject",
    "Non existent company UAN claim",
    "Fraudulent establishment contributions",
    "Coverage dispute fake employer"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "EPFO and news reports on fraud emphasise scrutiny of suspicious establishments and inoperative/high-risk accounts. Claims tied to codes under coverage fraud investigation are withheld or rejected pending inquiry.",
  "what_it_means": "If contributions were booked under a bogus employer, settlement is not routine. Member may need to cooperate with inquiry; balances can be frozen.",
  "root_cause": "Identity fraud rings; sold establishment codes; member unwittingly hired by non-compliant entity.",
  "how_detected": "Establishment flagged. Inspection paras. Police/EPFO fraud references in EPFiGMS replies.",
  "fix_steps": [
    "Gather appointment letters, salary proofs, identity KYC to show genuine employment if applicable.",
    "Cooperate with RO investigation; do not use agents promising release fees.",
    "EPFiGMS and, if needed, legal advice for genuine workers caught in shell-company cases.",
    "Avoid further claims until RO clears the member ID."
  ],
  "required_documents": [
    "Employment proofs",
    "Salary bank credits",
    "KYC",
    "Any RO notices"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Verify establishment PF code and ECR filing when joining."
  ],
  "related_reason_ids": [
    "epfo-rr-150",
    "epfo-rr-076",
    "epfo-rr-030",
    "epfo-rr-166"
  ],
  "source_urls": [
    "https://www.business-standard.com/finance/personal-finance/epfo-issues-new-rules-for-inoperative-inactive-accounts-to-combat-fraud-124080600360_1.html",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/Circular_SOP_WSU_02082024.pdf",
    "https://epfigms.gov.in/",
    "https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do"
  ],
  "source_types": [
    "news",
    "circular",
    "official"
  ],
  "confidence": "medium",
  "notes": "Fraud typology; outcomes are case-specific.",
  "last_verified": "2026-09-12"
}
```
