# PAN name or date of birth does not match UAN/Aadhaar (epfo-rr-014)

> Dataset record `epfo-rr-014`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** PAN name or date of birth does not match UAN/Aadhaar

**Aliases:** PAN demographic mismatch, PAN-Aadhaar mismatch, PAN KYC failed

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Appears as PAN KYC failed/rejected rather than a unique claim code. Distinct from 'PAN not seeded' (epfo-rr-006).

## What it means

PAN can be uploaded yet fail verification because Income-tax PAN data (name, DOB) does not match Aadhaar/UAN. Until PAN KYC is Verified, Form 19 with service <5 years remains at risk, and some members cannot complete the full KYC triad. This is a three-way identity problem, not a PF-eligibility problem.

## Root cause

PAN issued in a different spelling; DOB mismatch on PAN; PAN not linked to Aadhaar at Income Tax Department.

## How it is detected

Manage > KYC PAN = Failed. Income Tax PAN-Aadhaar link status.

## Fix

- Check PAN-Aadhaar linking status on the Income Tax e-filing portal.
- If PAN is legally wrong, file a PAN correction with the PAN issuing agency; if UAN is wrong, file JD.
- Re-upload PAN KYC after the source system matches.
- Then resubmit the claim.

## Required documents

- PAN
- Aadhaar
- PAN correction acknowledgement if applicable

## Who acts

member

## Prevention

- Link PAN-Aadhaar early.
- Use the same spelling on PAN, Aadhaar, and Form 11.

## Related records

- [epfo-rr-006](./epfo-rr-006.md)
- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-002](./epfo-rr-002.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, news, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** PAN-Aadhaar linking is an Income Tax Department process; EPFO consumes the result.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [news] https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-014",
  "rejection_reason": "PAN name or date of birth does not match UAN/Aadhaar",
  "aliases": [
    "PAN demographic mismatch",
    "PAN-Aadhaar mismatch",
    "PAN KYC failed"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Appears as PAN KYC failed/rejected rather than a unique claim code. Distinct from 'PAN not seeded' (epfo-rr-006).",
  "what_it_means": "PAN can be uploaded yet fail verification because Income-tax PAN data (name, DOB) does not match Aadhaar/UAN. Until PAN KYC is Verified, Form 19 with service <5 years remains at risk, and some members cannot complete the full KYC triad. This is a three-way identity problem, not a PF-eligibility problem.",
  "root_cause": "PAN issued in a different spelling; DOB mismatch on PAN; PAN not linked to Aadhaar at Income Tax Department.",
  "how_detected": "Manage > KYC PAN = Failed. Income Tax PAN-Aadhaar link status.",
  "fix_steps": [
    "Check PAN-Aadhaar linking status on the Income Tax e-filing portal.",
    "If PAN is legally wrong, file a PAN correction with the PAN issuing agency; if UAN is wrong, file JD.",
    "Re-upload PAN KYC after the source system matches.",
    "Then resubmit the claim."
  ],
  "required_documents": [
    "PAN",
    "Aadhaar",
    "PAN correction acknowledgement if applicable"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Link PAN-Aadhaar early.",
    "Use the same spelling on PAN, Aadhaar, and Form 11."
  ],
  "related_reason_ids": [
    "epfo-rr-006",
    "epfo-rr-001",
    "epfo-rr-002"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "medium",
  "notes": "PAN-Aadhaar linking is an Income Tax Department process; EPFO consumes the result.",
  "last_verified": "2026-09-12"
}
```
