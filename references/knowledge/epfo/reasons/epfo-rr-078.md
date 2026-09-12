# PAN missing or Form 15G/15H issues causing TDS problems on taxable (service < 5 years) Form 19 (epfo-rr-078)

> Dataset record `epfo-rr-078`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** PAN missing or Form 15G/15H issues causing TDS problems on taxable (service < 5 years) Form 19

**Aliases:** TDS at higher rate, PAN not linked TDS, Form 15G not considered, Taxable withdrawal

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 19 PF Final Settlement, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** OCS FAQ requires PAN seeding for Form 19 if service < 5 years. ClearTax: if service < 5 years and amount above threshold, TDS (commonly described as 10% with PAN, much higher without). Form 15G/15H may be used when income is below taxable limit. This may not always appear as 'Rejected' — it can appear as a reduced credit — but missing PAN can also block the claim (epfo-rr-006).

## What it means

Members think the claim 'failed' because the credit is far below passbook (TDS). Others are actually rejected for no PAN. Continuous service of 5 years (including transferred service) generally makes withdrawal tax-exempt under current IT explanations — verify with a tax professional.

## Root cause

Service <5 years; PAN not seeded; 15G not submitted where the process still allows it.

## How it is detected

PAN KYC missing. Settlement advice shows TDS. Credit shortfall.

## Fix

- Seed PAN (epfo-rr-006) before Form 19 if service <5 years.
- If the office/process still accepts Form 15G/15H, submit it with PAN when eligible; do not assume the 2010s paper 15G process still exists on the online flow.
- If TDS was rightly deducted, claim credit in the income-tax return; that is not an EPFO re-claim.
- If service with transfers is actually >=5 years, ensure transfers posted so the tax engine sees continuity.

## Required documents

- PAN
- Form 15G/15H if applicable
- Transfer history to prove 5-year continuity

## Who acts

member

## Prevention

- Plan taxable vs tax-free withdrawal with service years in mind.

## Related records

- [epfo-rr-006](./epfo-rr-006.md)
- [epfo-rr-014](./epfo-rr-014.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** TDS rates change with Finance Acts. Educational only, not tax advice. 5-year continuity including transferred accounts is the usual IT explanation.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-078",
  "rejection_reason": "PAN missing or Form 15G/15H issues causing TDS problems on taxable (service < 5 years) Form 19",
  "aliases": [
    "TDS at higher rate",
    "PAN not linked TDS",
    "Form 15G not considered",
    "Taxable withdrawal"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "OCS FAQ requires PAN seeding for Form 19 if service < 5 years. ClearTax: if service < 5 years and amount above threshold, TDS (commonly described as 10% with PAN, much higher without). Form 15G/15H may be used when income is below taxable limit. This may not always appear as 'Rejected' — it can appear as a reduced credit — but missing PAN can also block the claim (epfo-rr-006).",
  "what_it_means": "Members think the claim 'failed' because the credit is far below passbook (TDS). Others are actually rejected for no PAN. Continuous service of 5 years (including transferred service) generally makes withdrawal tax-exempt under current IT explanations — verify with a tax professional.",
  "root_cause": "Service <5 years; PAN not seeded; 15G not submitted where the process still allows it.",
  "how_detected": "PAN KYC missing. Settlement advice shows TDS. Credit shortfall.",
  "fix_steps": [
    "Seed PAN (epfo-rr-006) before Form 19 if service <5 years.",
    "If the office/process still accepts Form 15G/15H, submit it with PAN when eligible; do not assume the 2010s paper 15G process still exists on the online flow.",
    "If TDS was rightly deducted, claim credit in the income-tax return; that is not an EPFO re-claim.",
    "If service with transfers is actually >=5 years, ensure transfers posted so the tax engine sees continuity."
  ],
  "required_documents": [
    "PAN",
    "Form 15G/15H if applicable",
    "Transfer history to prove 5-year continuity"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Plan taxable vs tax-free withdrawal with service years in mind."
  ],
  "related_reason_ids": [
    "epfo-rr-006",
    "epfo-rr-014"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "TDS rates change with Finance Acts. Educational only, not tax advice. 5-year continuity including transferred accounts is the usual IT explanation.",
  "last_verified": "2026-09-12"
}
```
