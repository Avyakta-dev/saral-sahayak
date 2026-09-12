# Transferor (source) Regional Office verification pending or failed (epfo-rr-072)

> Dataset record `epfo-rr-072`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Transferor (source) Regional Office verification pending or failed

**Aliases:** Source office pending, Transferor office query, Old PF office not releasing transfer

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** After employer attestation, the source office must verify and release. HO has told source offices to verify all details for error-free transfer (25/04/2025 circular cited 20/05/2025). Pending at source looks like rejection to members.

## What it means

Different Regional Offices hold old member IDs. If that office has contribution mismatches, exempted-trust issues, or staff backlog, Form 13 stalls. EPFiGMS against the source office is the lever.

## Root cause

Backlog; mismatch; office jurisdictional error.

## How it is detected

Track transfer: pending at source RO. Claim history.

## Fix

- Identify the source office from member ID prefix / Track Claim.
- Raise EPFiGMS selecting that office, attach KYC and employment proofs.
- If >20 days, escalate on EPFiGMS and consider CPGRAMS.
- Correct any mismatch the source office emails you about; do not just refile.

## Required documents

- Transfer claim ID
- Old passbook
- KYC

## Who acts

mixed

## Prevention

- Transfer while both employers and both offices still have live data, soon after joining.

## Related records

- [epfo-rr-068](./epfo-rr-068.md)
- [epfo-rr-069](./epfo-rr-069.md)
- [epfo-rr-079](./epfo-rr-079.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO OTCP Members FAQ (employer rejection reasons, 15-day printout) — https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- **[official]** EPFiGMS grievance portal — https://epfigms.gov.in/

### Secondary reporting (news, blog, forum)

- **[news]** StaffNews: full text overlap circular 20 May 2025 — https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html
- **[blog]** Kustodian: Form 13 guide — https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-072",
  "rejection_reason": "Transferor (source) Regional Office verification pending or failed",
  "aliases": [
    "Source office pending",
    "Transferor office query",
    "Old PF office not releasing transfer"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "After employer attestation, the source office must verify and release. HO has told source offices to verify all details for error-free transfer (25/04/2025 circular cited 20/05/2025). Pending at source looks like rejection to members.",
  "what_it_means": "Different Regional Offices hold old member IDs. If that office has contribution mismatches, exempted-trust issues, or staff backlog, Form 13 stalls. EPFiGMS against the source office is the lever.",
  "root_cause": "Backlog; mismatch; office jurisdictional error.",
  "how_detected": "Track transfer: pending at source RO. Claim history.",
  "fix_steps": [
    "Identify the source office from member ID prefix / Track Claim.",
    "Raise EPFiGMS selecting that office, attach KYC and employment proofs.",
    "If >20 days, escalate on EPFiGMS and consider CPGRAMS.",
    "Correct any mismatch the source office emails you about; do not just refile."
  ],
  "required_documents": [
    "Transfer claim ID",
    "Old passbook",
    "KYC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Transfer while both employers and both offices still have live data, soon after joining."
  ],
  "related_reason_ids": [
    "epfo-rr-068",
    "epfo-rr-069",
    "epfo-rr-079"
  ],
  "source_urls": [
    "https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://epfigms.gov.in/",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status"
  ],
  "source_types": [
    "circular",
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
