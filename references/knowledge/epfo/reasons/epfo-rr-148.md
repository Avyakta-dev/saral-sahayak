# Regional Office bifurcation or jurisdiction remapping mid-claim sending file to wrong RO (epfo-rr-148)

> Dataset record `epfo-rr-148`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Regional Office bifurcation or jurisdiction remapping mid-claim sending file to wrong RO

**Aliases:** RO bifurcation claim stuck, Jurisdiction changed Regional Office, Claim forwarded wrong RO after bifurcation, Establishment remapped new RO, PF office division claim pending

## Classification

- **Category:** Other
- **Affected claim types:** Form 19 PF Final Settlement, Form 13 Transfer, Form 10D Monthly Pension, Form 20 Death PF Settlement, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** When EPFO splits or reassigns establishment jurisdiction across Regional/District Offices, in-flight claims and physical files can sit in the old RO queue or show vague pending remarks. Related to jurisdiction mismatch (080, 117) but specifically triggered by remapping events.

## What it means

Member did nothing wrong; the file needs re-acknowledgement at the new RO. Refiling duplicates without checking jurisdiction worsens queues.

## Root cause

Establishment code moved; physical claim posted to old address; portal still showing old office initially.

## How it is detected

EPFiGMS replies citing new RO. Establishment search shows changed office. Long pending with under process.

## Fix

- Look up current jurisdictional office for the establishment code on epfindia.gov.in.
- EPFiGMS asking confirmation of file movement and new claim desk.
- For physical claims, resubmit only if RO instructs — quote old acknowledgement.
- Avoid same-day duplicate online claims.
- Escalate if both ROs disclaim the file.

## Required documents

- Claim acknowledgement
- Establishment code
- Screenshots of jurisdiction info

## Who acts

EPFO_office

## Prevention

- Before physical filing, verify latest RO for the establishment code.

## Related records

- [epfo-rr-080](./epfo-rr-080.md)
- [epfo-rr-117](./epfo-rr-117.md)
- [epfo-rr-114](./epfo-rr-114.md)
- [epfo-rr-079](./epfo-rr-079.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Operational jurisdiction remapping pattern; no single circular number invented.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in
- [official] https://epfigms.gov.in/
- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [blog] https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-148",
  "rejection_reason": "Regional Office bifurcation or jurisdiction remapping mid-claim sending file to wrong RO",
  "aliases": [
    "RO bifurcation claim stuck",
    "Jurisdiction changed Regional Office",
    "Claim forwarded wrong RO after bifurcation",
    "Establishment remapped new RO",
    "PF office division claim pending"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 13 Transfer",
    "Form 10D Monthly Pension",
    "Form 20 Death PF Settlement",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "When EPFO splits or reassigns establishment jurisdiction across Regional/District Offices, in-flight claims and physical files can sit in the old RO queue or show vague pending remarks. Related to jurisdiction mismatch (080, 117) but specifically triggered by remapping events.",
  "what_it_means": "Member did nothing wrong; the file needs re-acknowledgement at the new RO. Refiling duplicates without checking jurisdiction worsens queues.",
  "root_cause": "Establishment code moved; physical claim posted to old address; portal still showing old office initially.",
  "how_detected": "EPFiGMS replies citing new RO. Establishment search shows changed office. Long pending with under process.",
  "fix_steps": [
    "Look up current jurisdictional office for the establishment code on epfindia.gov.in.",
    "EPFiGMS asking confirmation of file movement and new claim desk.",
    "For physical claims, resubmit only if RO instructs — quote old acknowledgement.",
    "Avoid same-day duplicate online claims.",
    "Escalate if both ROs disclaim the file."
  ],
  "required_documents": [
    "Claim acknowledgement",
    "Establishment code",
    "Screenshots of jurisdiction info"
  ],
  "who_acts": "EPFO_office",
  "prevention_tips": [
    "Before physical filing, verify latest RO for the establishment code."
  ],
  "related_reason_ids": [
    "epfo-rr-080",
    "epfo-rr-117",
    "epfo-rr-114",
    "epfo-rr-079"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in",
    "https://epfigms.gov.in/",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Operational jurisdiction remapping pattern; no single circular number invented.",
  "last_verified": "2026-09-12"
}
```
