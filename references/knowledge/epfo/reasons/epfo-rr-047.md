# Incomplete or incorrectly filled claim application (epfo-rr-047)

> Dataset record `epfo-rr-047`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Incomplete or incorrectly filled claim application

**Aliases:** Incomplete form, Incorrect or incomplete claim applications, Details missing on form, Wrongly filled bank or service fields

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, Form 13 Transfer, International Worker Claim
- **Severity:** medium
- **Official/common message status:** MoS Labour (Outlook/Financial Express/ET Now): most EPS/EPF rejections happen due to incorrect or incomplete claim applications — missing service records, bank details, or personal information — rather than policy changes.

## What it means

Physical and even online forms with blank mandatory fields, contradictory dates, or skipped declarations are returned. Online flows reduce this but still require bank last-4 verification, undertaking, and purpose fields. Death forms with blank relationship or wage fields are frequent. This is the residual 'hygiene' rejection after KYC is fine.

## Root cause

Rushed filing; offline PDF filled by a cafe operator; UMANG dropping optional-but-needed fields.

## How it is detected

Field office deficiency memo. Portal validation. Parliamentary list of rejection causes.

## Fix

- Use the official current PDF or portal, not a pirated old form.
- Fill every mandatory field; match UAN, bank, dates to KYC.
- For death/EDLI, complete wage/PF-balance fields only from passbook, not guesses.
- Tick the undertaking and authenticate OTP.
- Refile a complete form rather than arguing about the old deficient one.

## Required documents

- Complete current-version form
- KYC copies
- Passbook

## Who acts

member

## Prevention

- Preview the form before submit.
- Do not let agents fill names differently from Aadhaar.

## Related records

- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-050](./epfo-rr-050.md)
- [epfo-rr-043](./epfo-rr-043.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Government reply as reported by multiple national outlets.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf

### Secondary (news / blog / forum)

- [news] https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- [news] https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-047",
  "rejection_reason": "Incomplete or incorrectly filled claim application",
  "aliases": [
    "Incomplete form",
    "Incorrect or incomplete claim applications",
    "Details missing on form",
    "Wrongly filled bank or service fields"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "MoS Labour (Outlook/Financial Express/ET Now): most EPS/EPF rejections happen due to incorrect or incomplete claim applications — missing service records, bank details, or personal information — rather than policy changes.",
  "what_it_means": "Physical and even online forms with blank mandatory fields, contradictory dates, or skipped declarations are returned. Online flows reduce this but still require bank last-4 verification, undertaking, and purpose fields. Death forms with blank relationship or wage fields are frequent. This is the residual 'hygiene' rejection after KYC is fine.",
  "root_cause": "Rushed filing; offline PDF filled by a cafe operator; UMANG dropping optional-but-needed fields.",
  "how_detected": "Field office deficiency memo. Portal validation. Parliamentary list of rejection causes.",
  "fix_steps": [
    "Use the official current PDF or portal, not a pirated old form.",
    "Fill every mandatory field; match UAN, bank, dates to KYC.",
    "For death/EDLI, complete wage/PF-balance fields only from passbook, not guesses.",
    "Tick the undertaking and authenticate OTP.",
    "Refile a complete form rather than arguing about the old deficient one."
  ],
  "required_documents": [
    "Complete current-version form",
    "KYC copies",
    "Passbook"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Preview the form before submit.",
    "Do not let agents fill names differently from Aadhaar."
  ],
  "related_reason_ids": [
    "epfo-rr-048",
    "epfo-rr-050",
    "epfo-rr-043"
  ],
  "source_urls": [
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf"
  ],
  "source_types": [
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "Government reply as reported by multiple national outlets.",
  "last_verified": "2026-09-12"
}
```
