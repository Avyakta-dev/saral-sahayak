# Inspection para or compliance proceeding against establishment holding member claims (epfo-rr-150)

> Dataset record `epfo-rr-150`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Inspection para or compliance proceeding against establishment holding member claims

**Aliases:** Inspection para claim withheld, Compliance case PF claim pending, Establishment under inspection claims blocked, Inquiry proceeding claim hold, Enforcement file blocking settlement

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 19 PF Final Settlement, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** When RO enforcement/inspection paras, coverage disputes, or inquiry proceedings run against an establishment, individual claims may be kept pending or returned until the para is closed or member-level clearance is given. Members see vague pending remarks rather than a published code.

## What it means

Not a KYC failure — a compliance cloud on the employer. Distinct from ordinary contribution default (029) and from member-level fraud flags.

## Root cause

Unpaid dues, coverage dispute, fake-employee suspicions, or inspection observations linked to the establishment code.

## How it is detected

EPFiGMS reply mentioning inspection/compliance. Employer PF consultant disclosure. Long multi-member pendency at same code.

## Fix

- Ask employer compliance team whether any inspection para/coverage dispute is open.
- EPFiGMS requesting member-level settlement despite establishment proceedings if contributions for the member are intact.
- Provide personal KYC and contribution proof to distinguish the member from disputed population.
- Consider transfer to a clean active MID if still employed elsewhere, once legally permissible.
- Escalate through EPFiGMS/CPGRAMS with claim ID if employer is non-cooperative.

## Required documents

- Passbook contribution proof
- KYC verified screenshots
- Employment proofs
- EPFiGMS printouts

## Who acts

mixed

## Prevention

- Prefer establishments with clean compliance history when possible.
- Keep personal passbook downloads periodically.

## Related records

- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-076](./epfo-rr-076.md)
- [epfo-rr-165](./epfo-rr-165.md)
- [epfo-rr-079](./epfo-rr-079.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Operational hold pattern; do not invent section numbers beyond commonly referenced inquiry contexts.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfigms.gov.in/
- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- [official] https://www.epfindia.gov.in

### Secondary (news / blog / forum)

- [blog] https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html
- [news] https://www.business-standard.com/finance/personal-finance/epfo-issues-new-rules-for-inoperative-inactive-accounts-to-combat-fraud-124080600360_1.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-150",
  "rejection_reason": "Inspection para or compliance proceeding against establishment holding member claims",
  "aliases": [
    "Inspection para claim withheld",
    "Compliance case PF claim pending",
    "Establishment under inspection claims blocked",
    "Inquiry proceeding claim hold",
    "Enforcement file blocking settlement"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "When RO enforcement/inspection paras, coverage disputes, or inquiry proceedings run against an establishment, individual claims may be kept pending or returned until the para is closed or member-level clearance is given. Members see vague pending remarks rather than a published code.",
  "what_it_means": "Not a KYC failure — a compliance cloud on the employer. Distinct from ordinary contribution default (029) and from member-level fraud flags.",
  "root_cause": "Unpaid dues, coverage dispute, fake-employee suspicions, or inspection observations linked to the establishment code.",
  "how_detected": "EPFiGMS reply mentioning inspection/compliance. Employer PF consultant disclosure. Long multi-member pendency at same code.",
  "fix_steps": [
    "Ask employer compliance team whether any inspection para/coverage dispute is open.",
    "EPFiGMS requesting member-level settlement despite establishment proceedings if contributions for the member are intact.",
    "Provide personal KYC and contribution proof to distinguish the member from disputed population.",
    "Consider transfer to a clean active MID if still employed elsewhere, once legally permissible.",
    "Escalate through EPFiGMS/CPGRAMS with claim ID if employer is non-cooperative."
  ],
  "required_documents": [
    "Passbook contribution proof",
    "KYC verified screenshots",
    "Employment proofs",
    "EPFiGMS printouts"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Prefer establishments with clean compliance history when possible.",
    "Keep personal passbook downloads periodically."
  ],
  "related_reason_ids": [
    "epfo-rr-029",
    "epfo-rr-076",
    "epfo-rr-165",
    "epfo-rr-079"
  ],
  "source_urls": [
    "https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html",
    "https://epfigms.gov.in/",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in",
    "https://www.business-standard.com/finance/personal-finance/epfo-issues-new-rules-for-inoperative-inactive-accounts-to-combat-fraud-124080600360_1.html"
  ],
  "source_types": [
    "blog",
    "official",
    "news"
  ],
  "confidence": "medium",
  "notes": "Operational hold pattern; do not invent section numbers beyond commonly referenced inquiry contexts.",
  "last_verified": "2026-09-12"
}
```
