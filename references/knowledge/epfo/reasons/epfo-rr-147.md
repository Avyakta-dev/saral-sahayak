# Establishment code change, merger, or amalgamation leaving member ID mapped to obsolete code (epfo-rr-147)

> Dataset record `epfo-rr-147`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Establishment code change, merger, or amalgamation leaving member ID mapped to obsolete code

**Aliases:** Establishment merger PF claim stuck, Old establishment code claim rejected, Amalgamation member ID not migrated, Company merger PF transfer issue, Establishment code changed Form 5A

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 13 Transfer, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Mergers/amalgamations require establishment profile/Form 5A and RO updates. Members stranded on pre-merger codes face attestation, DSC, and jurisdiction failures. Exemption SOPs also require notifying legal-status changes.

## What it means

HR of the surviving company may not control the old code's DSC; claims bounce for want of employer action on a defunct login. Distinct from fully closed untraceable establishment (030).

## Root cause

Legal merger without PF code migration; branch/subcode not linked; Form 5A outdated.

## How it is detected

Employer portal code differs from member MID prefix. RO jurisdiction notes. DSC login failure on old code.

## Fix

- Identify pre- and post-merger establishment codes from salary slips/MID.
- Ask surviving employer's PF team to complete Form 5A / RO intimations and migrate or attest.
- If old code still active for compliance, request that authorised signatory approve KYC/claims.
- For transfers, file Form 13 toward the live code after mapping is fixed.
- EPFiGMS to jurisdictional RO quoting merger and both codes.

## Required documents

- Merger/amalgamation proof
- Salary slips showing PF code
- Service History
- RO correspondence if any

## Who acts

employer

## Prevention

- During M&A, insist HR publishes the surviving PF code and UAN instructions.
- Verify MID prefix after organisational change.

## Related records

- [epfo-rr-030](./epfo-rr-030.md)
- [epfo-rr-028](./epfo-rr-028.md)
- [epfo-rr-080](./epfo-rr-080.md)
- [epfo-rr-148](./epfo-rr-148.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, circular, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Tied to Form 5A / legal-status change duties; secondary M&A claim friction reports.

- https://www.epfindia.gov.in
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_Exemption_06102023.pdf
- https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php
- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-147",
  "rejection_reason": "Establishment code change, merger, or amalgamation leaving member ID mapped to obsolete code",
  "aliases": [
    "Establishment merger PF claim stuck",
    "Old establishment code claim rejected",
    "Amalgamation member ID not migrated",
    "Company merger PF transfer issue",
    "Establishment code changed Form 5A"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 13 Transfer",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Mergers/amalgamations require establishment profile/Form 5A and RO updates. Members stranded on pre-merger codes face attestation, DSC, and jurisdiction failures. Exemption SOPs also require notifying legal-status changes.",
  "what_it_means": "HR of the surviving company may not control the old code's DSC; claims bounce for want of employer action on a defunct login. Distinct from fully closed untraceable establishment (030).",
  "root_cause": "Legal merger without PF code migration; branch/subcode not linked; Form 5A outdated.",
  "how_detected": "Employer portal code differs from member MID prefix. RO jurisdiction notes. DSC login failure on old code.",
  "fix_steps": [
    "Identify pre- and post-merger establishment codes from salary slips/MID.",
    "Ask surviving employer's PF team to complete Form 5A / RO intimations and migrate or attest.",
    "If old code still active for compliance, request that authorised signatory approve KYC/claims.",
    "For transfers, file Form 13 toward the live code after mapping is fixed.",
    "EPFiGMS to jurisdictional RO quoting merger and both codes."
  ],
  "required_documents": [
    "Merger/amalgamation proof",
    "Salary slips showing PF code",
    "Service History",
    "RO correspondence if any"
  ],
  "who_acts": "employer",
  "prevention_tips": [
    "During M&A, insist HR publishes the surviving PF code and UAN instructions.",
    "Verify MID prefix after organisational change."
  ],
  "related_reason_ids": [
    "epfo-rr-030",
    "epfo-rr-028",
    "epfo-rr-080",
    "epfo-rr-148"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_Exemption_06102023.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "medium",
  "notes": "Tied to Form 5A / legal-status change duties; secondary M&A claim friction reports.",
  "last_verified": "2026-09-12"
}
```
