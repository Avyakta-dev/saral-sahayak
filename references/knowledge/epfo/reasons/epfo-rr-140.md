# Form 5IF EDLI filed without or out of sequence with Form 20 PF death claim causing return (epfo-rr-140)

> Dataset record `epfo-rr-140`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 5IF EDLI filed without or out of sequence with Form 20 PF death claim causing return

**Aliases:** EDLI without Form 20, Form 5IF alone rejected, Death claim sequencing 20 and 5IF, File Form 20 first then 5IF, Composite death package incomplete

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 5IF EDLI Death Insurance, Form 20 Death PF Settlement, Form 10D Monthly Pension, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Which Claim Form matrix for death in service typically lists Form 20 (PF) AND Form 10D/10C AND Form 5IF (EDLI). Filing only insurance without the PF death settlement path, or mismatched claimant details across forms, leads to returns for want of complete death package.

## What it means

EDLI is not a standalone substitute for PF death settlement. Offices expect aligned claimant, bank, and death certificate across 20 and 5IF. Sequencing/completeness rejects differ from EDLI ineligibility (067).

## Root cause

Claimant filed only 5IF; different nominees on 20 vs 5IF; missing 10D when pension also due.

## How it is detected

Which-Claim-Form checklist at RO. Portal death-claim wizard incompleteness. Returned remark listing missing Form 20.

## Fix

- Open Which Claim Form for the death scenario (in service vs not; age; service length).
- File Form 20 and Form 5IF together with consistent claimant KYC/bank.
- Add Form 10D or 10C as the matrix requires.
- Reuse the same death certificate and nomination/legal-heir proofs across forms.
- Track each claim ID; do not assume 5IF approval implies 20 approval.

## Required documents

- Form 20 set
- Form 5IF set
- Form 10D/10C if applicable
- Death certificate
- Nominee/legal heir proofs

## Who acts

mixed

## Prevention

- Use the official death-claim matrix; prefer employer/RO helpdesk checklist.
- Align e-nomination before death when possible.

## Related records

- [epfo-rr-067](./epfo-rr-067.md)
- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-137](./epfo-rr-137.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Based on official Which Claim Form death package layout.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-death-claim-process-india
- [blog] https://kustodian.life/resources/provident-fund/form-5if-guide

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-140",
  "rejection_reason": "Form 5IF EDLI filed without or out of sequence with Form 20 PF death claim causing return",
  "aliases": [
    "EDLI without Form 20",
    "Form 5IF alone rejected",
    "Death claim sequencing 20 and 5IF",
    "File Form 20 first then 5IF",
    "Composite death package incomplete"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 5IF EDLI Death Insurance",
    "Form 20 Death PF Settlement",
    "Form 10D Monthly Pension",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Which Claim Form matrix for death in service typically lists Form 20 (PF) AND Form 10D/10C AND Form 5IF (EDLI). Filing only insurance without the PF death settlement path, or mismatched claimant details across forms, leads to returns for want of complete death package.",
  "what_it_means": "EDLI is not a standalone substitute for PF death settlement. Offices expect aligned claimant, bank, and death certificate across 20 and 5IF. Sequencing/completeness rejects differ from EDLI ineligibility (067).",
  "root_cause": "Claimant filed only 5IF; different nominees on 20 vs 5IF; missing 10D when pension also due.",
  "how_detected": "Which-Claim-Form checklist at RO. Portal death-claim wizard incompleteness. Returned remark listing missing Form 20.",
  "fix_steps": [
    "Open Which Claim Form for the death scenario (in service vs not; age; service length).",
    "File Form 20 and Form 5IF together with consistent claimant KYC/bank.",
    "Add Form 10D or 10C as the matrix requires.",
    "Reuse the same death certificate and nomination/legal-heir proofs across forms.",
    "Track each claim ID; do not assume 5IF approval implies 20 approval."
  ],
  "required_documents": [
    "Form 20 set",
    "Form 5IF set",
    "Form 10D/10C if applicable",
    "Death certificate",
    "Nominee/legal heir proofs"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Use the official death-claim matrix; prefer employer/RO helpdesk checklist.",
    "Align e-nomination before death when possible."
  ],
  "related_reason_ids": [
    "epfo-rr-067",
    "epfo-rr-048",
    "epfo-rr-060",
    "epfo-rr-137"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://kustodian.life/resources/provident-fund/form-5if-guide"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Based on official Which Claim Form death package layout.",
  "last_verified": "2026-09-12"
}
```
