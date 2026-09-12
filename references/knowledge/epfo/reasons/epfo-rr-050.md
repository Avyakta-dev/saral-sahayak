# Missing claimant or employer signature / stamp on physical claim (epfo-rr-050)

> Dataset record `epfo-rr-050`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Missing claimant or employer signature / stamp on physical claim

**Aliases:** Missing signature, Unsigned form, Employer stamp missing, All pages not signed

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, Form 13 Transfer, International Worker Claim
- **Severity:** medium
- **Official/common message status:** Form 19 instructions: if downloaded from epfindia, all pages should be signed by claimant and employer. Form 5IF: missing signatures are a top return reason in practitioner guides; official form requires attestation.

## What it means

Wet-ink physical claims are still used for death, IW, closed establishments, and Non-Aadhaar CCF. Unsigned last pages, claimant signed but employer did not, or only first page signed, get returned.

## Root cause

Print-and-post without reading attestation block; digital photo of signature not accepted as wet ink.

## How it is detected

FO inward check.

## Fix

- Sign every page; get employer/alternative attestor stamp on the attestation block.
- For minors, guardian signs with guardianship proof.
- Resubmit the full set.

## Required documents

- Fully signed form set
- Attestation

## Who acts

mixed

## Prevention

- Use online Aadhaar claims to avoid wet signatures when eligible.

## Related records

- [epfo-rr-026](./epfo-rr-026.md)
- [epfo-rr-047](./epfo-rr-047.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/provident-fund/form-5if-guide

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-050",
  "rejection_reason": "Missing claimant or employer signature / stamp on physical claim",
  "aliases": [
    "Missing signature",
    "Unsigned form",
    "Employer stamp missing",
    "All pages not signed"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Form 19 instructions: if downloaded from epfindia, all pages should be signed by claimant and employer. Form 5IF: missing signatures are a top return reason in practitioner guides; official form requires attestation.",
  "what_it_means": "Wet-ink physical claims are still used for death, IW, closed establishments, and Non-Aadhaar CCF. Unsigned last pages, claimant signed but employer did not, or only first page signed, get returned.",
  "root_cause": "Print-and-post without reading attestation block; digital photo of signature not accepted as wet ink.",
  "how_detected": "FO inward check.",
  "fix_steps": [
    "Sign every page; get employer/alternative attestor stamp on the attestation block.",
    "For minors, guardian signs with guardianship proof.",
    "Resubmit the full set."
  ],
  "required_documents": [
    "Fully signed form set",
    "Attestation"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Use online Aadhaar claims to avoid wet signatures when eligible."
  ],
  "related_reason_ids": [
    "epfo-rr-026",
    "epfo-rr-047"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://kustodian.life/resources/provident-fund/form-5if-guide"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
