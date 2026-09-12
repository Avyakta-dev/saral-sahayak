# Foreign-language document without certified translation rejected (epfo-rr-172)

> Dataset record `epfo-rr-172`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Foreign-language document without certified translation rejected

**Aliases:** Translation missing foreign document, Non English death certificate rejected, Untranslated marriage certificate PF, Language of document not accepted, Certified translation required EPFO

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 20 Death PF Settlement, Form 10D Monthly Pension, Form 5IF EDLI Death Insurance, International Worker Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Death/family/IW claims sometimes include foreign civil documents. ROs commonly require English/Hindi versions or certified translations alongside originals. Untranslated enclosures are returned.

## What it means

The underlying event may be genuine; the file is incomplete without translation. Distinct from missing document entirely (048).

## Root cause

Foreign registrar certificates; overseas marriage docs; no apostille/translation as local RO practice demands.

## How it is detected

RO remark on language. Returned physical file.

## Fix

- Obtain certified translation into English or Hindi by an acceptable translator/notary as RO specifies.
- Attach original-language document + translation + translator attestation.
- For IW, confirm whether apostille/consular attestation is also needed.
- Resubmit once complete.

## Required documents

- Original foreign document
- Certified translation
- Translator/notary attestation

## Who acts

member

## Prevention

- Prepare translations before visiting RO for death/IW claims.

## Related records

- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-062](./epfo-rr-062.md)
- [epfo-rr-123](./epfo-rr-123.md)
- [epfo-rr-064](./epfo-rr-064.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** RO practice varies; certified translation is the usual remediation.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Form 20 PDF — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: death claim process — https://kustodian.life/resources/epf-death-claim-process-india
- **[blog]** KPMG: simplifying PF withdrawal for International Workers — https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf
- **[blog]** RTI Wiki: death claim without nominee — https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-172",
  "rejection_reason": "Foreign-language document without certified translation rejected",
  "aliases": [
    "Translation missing foreign document",
    "Non English death certificate rejected",
    "Untranslated marriage certificate PF",
    "Language of document not accepted",
    "Certified translation required EPFO"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 10D Monthly Pension",
    "Form 5IF EDLI Death Insurance",
    "International Worker Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Death/family/IW claims sometimes include foreign civil documents. ROs commonly require English/Hindi versions or certified translations alongside originals. Untranslated enclosures are returned.",
  "what_it_means": "The underlying event may be genuine; the file is incomplete without translation. Distinct from missing document entirely (048).",
  "root_cause": "Foreign registrar certificates; overseas marriage docs; no apostille/translation as local RO practice demands.",
  "how_detected": "RO remark on language. Returned physical file.",
  "fix_steps": [
    "Obtain certified translation into English or Hindi by an acceptable translator/notary as RO specifies.",
    "Attach original-language document + translation + translator attestation.",
    "For IW, confirm whether apostille/consular attestation is also needed.",
    "Resubmit once complete."
  ],
  "required_documents": [
    "Original foreign document",
    "Certified translation",
    "Translator/notary attestation"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Prepare translations before visiting RO for death/IW claims."
  ],
  "related_reason_ids": [
    "epfo-rr-048",
    "epfo-rr-062",
    "epfo-rr-123",
    "epfo-rr-064"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "RO practice varies; certified translation is the usual remediation.",
  "last_verified": "2026-09-12"
}
```
