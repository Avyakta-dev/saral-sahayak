# Required supporting documents not submitted (especially death, pension, and physical claims) (epfo-rr-048)

> Dataset record `epfo-rr-048`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Required supporting documents not submitted (especially death, pension, and physical claims)

**Aliases:** Non-submission of required documents, Missing documents, Documents not attached, Death certificate/legal heir not submitted

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, Composite Claim Form, Form 31 Partial Withdrawal/Advance, International Worker Claim, Form 19 PF Final Settlement
- **Severity:** high
- **Official/common message status:** MoS Labour: claims rejected for non-submission of death certificate, legal heir or succession documents, family details and nomination records. Form 5IF instructions list death certificate, guardianship certificate, succession certificate, cancelled cheque.

## What it means

Aadhaar online Form 19/31 often needs no extra PDF. Death, disablement, legal-heir, IW-without-Aadhaar, and some housing advances still need attachments. Missing one listed document = rejection, not a partial pay.

## Root cause

Assuming paperless applies to death claims; uploading unreadable images; omitting succession when there is no nomination.

## How it is detected

Form instruction checklist vs file. Deficiency letter.

## Fix

- Print the official instruction PDF for that form and tick every document.
- For death: death certificate, claimant KYC, cancelled cheque, nomination or succession/legal-heir, guardianship if minor.
- For IW physical: passport and bank proofs per 29.11.2024 circular.
- Resubmit a complete set; keep photocopies.

## Required documents

- As per the specific form instruction PDF
- Death certificate where applicable
- Succession/legal heir if no nominee

## Who acts

member

## Prevention

- Complete e-nomination while alive so death claims need fewer succession papers.

## Related records

- [epfo-rr-062](./epfo-rr-062.md)
- [epfo-rr-063](./epfo-rr-063.md)
- [epfo-rr-065](./epfo-rr-065.md)
- [epfo-rr-074](./epfo-rr-074.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Form 5IF instructions (EDLI death claim) — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- **[official]** Form 19 instructions (EPF Scheme) — https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf

### Secondary reporting (news, blog, forum)

- **[news]** Outlook Money: why EPFO rejects claims (MoS reply) — https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- **[news]** Financial Express: why EPS claims get rejected — https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-048",
  "rejection_reason": "Required supporting documents not submitted (especially death, pension, and physical claims)",
  "aliases": [
    "Non-submission of required documents",
    "Missing documents",
    "Documents not attached",
    "Death certificate/legal heir not submitted"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "Composite Claim Form",
    "Form 31 Partial Withdrawal/Advance",
    "International Worker Claim",
    "Form 19 PF Final Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "MoS Labour: claims rejected for non-submission of death certificate, legal heir or succession documents, family details and nomination records. Form 5IF instructions list death certificate, guardianship certificate, succession certificate, cancelled cheque.",
  "what_it_means": "Aadhaar online Form 19/31 often needs no extra PDF. Death, disablement, legal-heir, IW-without-Aadhaar, and some housing advances still need attachments. Missing one listed document = rejection, not a partial pay.",
  "root_cause": "Assuming paperless applies to death claims; uploading unreadable images; omitting succession when there is no nomination.",
  "how_detected": "Form instruction checklist vs file. Deficiency letter.",
  "fix_steps": [
    "Print the official instruction PDF for that form and tick every document.",
    "For death: death certificate, claimant KYC, cancelled cheque, nomination or succession/legal-heir, guardianship if minor.",
    "For IW physical: passport and bank proofs per 29.11.2024 circular.",
    "Resubmit a complete set; keep photocopies."
  ],
  "required_documents": [
    "As per the specific form instruction PDF",
    "Death certificate where applicable",
    "Succession/legal heir if no nominee"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Complete e-nomination while alive so death claims need fewer succession papers."
  ],
  "related_reason_ids": [
    "epfo-rr-062",
    "epfo-rr-063",
    "epfo-rr-065",
    "epfo-rr-074"
  ],
  "source_urls": [
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf"
  ],
  "source_types": [
    "news",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
