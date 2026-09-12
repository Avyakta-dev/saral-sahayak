# Claim returned for clarification rather than finally rejected (epfo-rr-058)

> Dataset record `epfo-rr-058`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claim returned for clarification rather than finally rejected

**Aliases:** Returned, Clarification sought, Query raised, Returned by FO

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** medium
- **Official/common message status:** JD SOP and claim processing distinguish Return (send back for correction) from Rejection. MembersFAQ also uses return/reject language for employer actions. A returned claim is not a denial of benefit.

## What it means

The file is incomplete. If the member treats 'Returned' as 'Rejected' and files a brand-new claim, the original query dies unanswered. The correct move is to answer the query or upload the asked document on the same file if the portal allows, else refile with the missing item included.

## Root cause

Deficiency in documents or identity; EO verification needed.

## How it is detected

Status Returned / Query. SMS. EPFiGMS.

## Fix

- Read whether status is Rejected vs Returned vs Under Process.
- Supply exactly the document/clarification asked.
- If the portal cannot accept a reply, visit/post to the Regional Office quoting the claim ID.
- Only start a new claim if the office says the old one is closed.

## Required documents

- The specific clarification/document requested
- Claim ID

## Who acts

mixed

## Prevention

- Enable SMS on the form.
- Check status every 3–4 days during processing.

## Related records

- [epfo-rr-047](./epfo-rr-047.md)
- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-079](./epfo-rr-079.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf

### Secondary (news / blog / forum)

- [blog] https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html
- [blog] https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-058",
  "rejection_reason": "Claim returned for clarification rather than finally rejected",
  "aliases": [
    "Returned",
    "Clarification sought",
    "Query raised",
    "Returned by FO"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "JD SOP and claim processing distinguish Return (send back for correction) from Rejection. MembersFAQ also uses return/reject language for employer actions. A returned claim is not a denial of benefit.",
  "what_it_means": "The file is incomplete. If the member treats 'Returned' as 'Rejected' and files a brand-new claim, the original query dies unanswered. The correct move is to answer the query or upload the asked document on the same file if the portal allows, else refile with the missing item included.",
  "root_cause": "Deficiency in documents or identity; EO verification needed.",
  "how_detected": "Status Returned / Query. SMS. EPFiGMS.",
  "fix_steps": [
    "Read whether status is Rejected vs Returned vs Under Process.",
    "Supply exactly the document/clarification asked.",
    "If the portal cannot accept a reply, visit/post to the Regional Office quoting the claim ID.",
    "Only start a new claim if the office says the old one is closed."
  ],
  "required_documents": [
    "The specific clarification/document requested",
    "Claim ID"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Enable SMS on the form.",
    "Check status every 3–4 days during processing."
  ],
  "related_reason_ids": [
    "epfo-rr-047",
    "epfo-rr-048",
    "epfo-rr-079"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html",
    "https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
