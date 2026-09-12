# Form 10D descriptive roll, joint photographs, or family identification documents missing (epfo-rr-081)

> Dataset record `epfo-rr-081`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 10D descriptive roll, joint photographs, or family identification documents missing

**Aliases:** Descriptive roll missing, Joint photos not attached, Passport photos of family missing, Form 10D offline documents

## Classification

- **Category:** Other
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** medium
- **Official/common message status:** Form 10D offline/death path commonly requires a descriptive roll, joint member-spouse photos, family photos/signatures, and children's DOB proofs. Kustodian 10D guide lists these as standard offline attachments. Online 10D with clean KYC may skip some scans; death/offline cases still fail without them.

## What it means

Pension identification is for a lifetime payment plus survivor benefits. Offices use photos and descriptive rolls the way banks use signatures. Missing the set looks like an incomplete claim (epfo-rr-048) but is specific to 10D.

## Root cause

Member filed online-style 10D for a death case that still needs the paper identification set.

## How it is detected

FO deficiency on 10D file.

## Fix

- Download current Form 10D and its instruction/descriptive roll annexure from epfindia.
- Attach joint photos, family descriptive roll, Aadhaar of all, children's DOB proofs.
- Match spouse name to family details (epfo-rr-064).
- Resubmit to the office that maintains the account.

## Required documents

- Form 10D
- Descriptive roll
- Joint photographs
- Family Aadhaar and DOB proofs

## Who acts

member

## Prevention

- A year before 58, assemble a pension document folder including photos.

## Related records

- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-023](./epfo-rr-023.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official, news
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Photo/descriptive-roll practice is longstanding for EPS; exact current online vs offline split should be checked on the live form PDF.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-081",
  "rejection_reason": "Form 10D descriptive roll, joint photographs, or family identification documents missing",
  "aliases": [
    "Descriptive roll missing",
    "Joint photos not attached",
    "Passport photos of family missing",
    "Form 10D offline documents"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "medium",
  "official_status_or_message": "Form 10D offline/death path commonly requires a descriptive roll, joint member-spouse photos, family photos/signatures, and children's DOB proofs. Kustodian 10D guide lists these as standard offline attachments. Online 10D with clean KYC may skip some scans; death/offline cases still fail without them.",
  "what_it_means": "Pension identification is for a lifetime payment plus survivor benefits. Offices use photos and descriptive rolls the way banks use signatures. Missing the set looks like an incomplete claim (epfo-rr-048) but is specific to 10D.",
  "root_cause": "Member filed online-style 10D for a death case that still needs the paper identification set.",
  "how_detected": "FO deficiency on 10D file.",
  "fix_steps": [
    "Download current Form 10D and its instruction/descriptive roll annexure from epfindia.",
    "Attach joint photos, family descriptive roll, Aadhaar of all, children's DOB proofs.",
    "Match spouse name to family details (epfo-rr-064).",
    "Resubmit to the office that maintains the account."
  ],
  "required_documents": [
    "Form 10D",
    "Descriptive roll",
    "Joint photographs",
    "Family Aadhaar and DOB proofs"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "A year before 58, assemble a pension document folder including photos."
  ],
  "related_reason_ids": [
    "epfo-rr-064",
    "epfo-rr-048",
    "epfo-rr-023"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/"
  ],
  "source_types": [
    "blog",
    "official",
    "news"
  ],
  "confidence": "medium",
  "notes": "Photo/descriptive-roll practice is longstanding for EPS; exact current online vs offline split should be checked on the live form PDF.",
  "last_verified": "2026-09-12"
}
```
