# No valid nomination on record (Form 2 / e-nomination absent or incomplete) (epfo-rr-060)

> Dataset record `epfo-rr-060`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** No valid nomination on record (Form 2 / e-nomination absent or incomplete)

**Aliases:** No nomination, Nomination not found, Form 2 missing, e-nomination not valid, Nomination not available, e-Nomination not e-signed, No valid Form 2 on record

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, Form 19 PF Final Settlement
- **Severity:** high
- **Official/common message status:** Form 5IF instructions: claimants are (1) nominees under EPF Scheme, else (2) family as defined (excluding certain major sons/married daughters), else (3) legal heirs. Outlook/MoS: fill e-nomination to avoid delay. Unsigned e-nomination is not valid (epfo-rr-056).

## What it means

Without a completed nomination, EPFO cannot pay the named person automatically. The family must prove they fall under the scheme's 'family' definition or produce succession/legal-heir documents. This is the root delay in many death claims, not a finding that no one is entitled.

## Root cause

Member never filed Form 2 or e-nomination; signed paper nomination lost; e-sign skipped.

## How it is detected

No nomination in member profile. Death claim scrutiny. Form-2 not on record for JD-after-death either.

## Fix

- Prevention (member alive): file and e-sign e-nomination.
- After death: ask EPFO/employer for any paper Form 2 on file.
- If none, file as family members under the scheme definition with death certificate, relationship proofs, and consent of all eligible persons as required.
- If no family, obtain succession certificate / legal heir certificate (epfo-rr-063).
- Complete claimant KYC and bank in the claimant's name.

## Required documents

- Death certificate
- Form 2 if any
- Family relationship proofs
- Succession/legal heir if applicable

## Who acts

mixed

## Prevention

- E-sign e-nomination after every life event.
- Share nominee details with the spouse.

## Related records

- [epfo-rr-056](./epfo-rr-056.md)
- [epfo-rr-061](./epfo-rr-061.md)
- [epfo-rr-063](./epfo-rr-063.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html
- https://kustodian.life/resources/epf-death-claim-process-india

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-060",
  "rejection_reason": "No valid nomination on record (Form 2 / e-nomination absent or incomplete)",
  "aliases": [
    "No nomination",
    "Nomination not found",
    "Form 2 missing",
    "e-nomination not valid",
    "Nomination not available",
    "e-Nomination not e-signed",
    "No valid Form 2 on record"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "Form 19 PF Final Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "Form 5IF instructions: claimants are (1) nominees under EPF Scheme, else (2) family as defined (excluding certain major sons/married daughters), else (3) legal heirs. Outlook/MoS: fill e-nomination to avoid delay. Unsigned e-nomination is not valid (epfo-rr-056).",
  "what_it_means": "Without a completed nomination, EPFO cannot pay the named person automatically. The family must prove they fall under the scheme's 'family' definition or produce succession/legal-heir documents. This is the root delay in many death claims, not a finding that no one is entitled.",
  "root_cause": "Member never filed Form 2 or e-nomination; signed paper nomination lost; e-sign skipped.",
  "how_detected": "No nomination in member profile. Death claim scrutiny. Form-2 not on record for JD-after-death either.",
  "fix_steps": [
    "Prevention (member alive): file and e-sign e-nomination.",
    "After death: ask EPFO/employer for any paper Form 2 on file.",
    "If none, file as family members under the scheme definition with death certificate, relationship proofs, and consent of all eligible persons as required.",
    "If no family, obtain succession certificate / legal heir certificate (epfo-rr-063).",
    "Complete claimant KYC and bank in the claimant's name."
  ],
  "required_documents": [
    "Death certificate",
    "Form 2 if any",
    "Family relationship proofs",
    "Succession/legal heir if applicable"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "E-sign e-nomination after every life event.",
    "Share nominee details with the spouse."
  ],
  "related_reason_ids": [
    "epfo-rr-056",
    "epfo-rr-061",
    "epfo-rr-063"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html",
    "https://kustodian.life/resources/epf-death-claim-process-india"
  ],
  "source_types": [
    "official",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
