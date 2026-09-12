# Employer rejected online claim because signed printout was not received within 15 days (epfo-rr-032)

> Dataset record `epfo-rr-032`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer rejected online claim because signed printout was not received within 15 days

**Aliases:** Signed printout not received, Physical copy not submitted within 15 days, Employer option to reject after 15 days

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** Official MembersFAQ (OTCP): member should submit the duly signed printout immediately, not exceeding 15 days. The employer would have the option to reject the online claim application after 15 days if the signed copy is not received.

## What it means

This is specific to the older online transfer claim workflow that still expected a wet-ink printout to the employer. If the member filed online Form 13 but never handed HR the signed printout, HR can reject after 15 days. Newer Aadhaar-based transfers may not need this; if the portal still asks, the 15-day rule applies.

## Root cause

Member assumed fully paperless transfer; HR policy still requires the printout; delay beyond 15 days.

## How it is detected

Transfer status rejected by employer with the FAQ reason. Contact details of authorised signatories are under employer details in View Transfer Claim Status.

## Fix

- Read whether the current Form 13 flow still requires a printout (portal instructions).
- If yes, print, sign, and deliver to the attesting employer immediately after online submission.
- If already rejected, file a fresh transfer after coordinating with HR.
- If the employer never had DSC and the printout path is the only option, do not delay.

## Required documents

- Signed printout of the online transfer claim
- ID proof

## Who acts

mixed

## Prevention

- Same day as online Form 13, ask HR if a signed printout is still required.

## Related records

- [epfo-rr-027](./epfo-rr-027.md)
- [epfo-rr-068](./epfo-rr-068.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Quoted from official MembersFAQ OTCP. Some later digital flows may have reduced printout dependence; check live portal.

- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-032",
  "rejection_reason": "Employer rejected online claim because signed printout was not received within 15 days",
  "aliases": [
    "Signed printout not received",
    "Physical copy not submitted within 15 days",
    "Employer option to reject after 15 days"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "Official MembersFAQ (OTCP): member should submit the duly signed printout immediately, not exceeding 15 days. The employer would have the option to reject the online claim application after 15 days if the signed copy is not received.",
  "what_it_means": "This is specific to the older online transfer claim workflow that still expected a wet-ink printout to the employer. If the member filed online Form 13 but never handed HR the signed printout, HR can reject after 15 days. Newer Aadhaar-based transfers may not need this; if the portal still asks, the 15-day rule applies.",
  "root_cause": "Member assumed fully paperless transfer; HR policy still requires the printout; delay beyond 15 days.",
  "how_detected": "Transfer status rejected by employer with the FAQ reason. Contact details of authorised signatories are under employer details in View Transfer Claim Status.",
  "fix_steps": [
    "Read whether the current Form 13 flow still requires a printout (portal instructions).",
    "If yes, print, sign, and deliver to the attesting employer immediately after online submission.",
    "If already rejected, file a fresh transfer after coordinating with HR.",
    "If the employer never had DSC and the printout path is the only option, do not delay."
  ],
  "required_documents": [
    "Signed printout of the online transfer claim",
    "ID proof"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Same day as online Form 13, ask HR if a signed printout is still required."
  ],
  "related_reason_ids": [
    "epfo-rr-027",
    "epfo-rr-068"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php"
  ],
  "source_types": [
    "official"
  ],
  "confidence": "high",
  "notes": "Quoted from official MembersFAQ OTCP. Some later digital flows may have reduced printout dependence; check live portal.",
  "last_verified": "2026-09-12"
}
```
