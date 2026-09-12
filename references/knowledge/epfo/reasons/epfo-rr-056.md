# e-Nomination filed but PDF not e-signed, so nomination is incomplete (epfo-rr-056)

> Dataset record `epfo-rr-056`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** e-Nomination filed but PDF not e-signed, so nomination is incomplete

**Aliases:** e-nomination not e-signed, Nomination PDF not digitally signed, e-nomination incomplete

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, Form 19 PF Final Settlement
- **Severity:** high
- **Official/common message status:** EPFO e-nomination guidance (reported by Zee and help sites): e-nominations that are only filed and whose PDF is not e-signed will not be considered on the member's death. E-nomination becomes complete only when the PDF is e-signed.

## What it means

Members tick nominees and download a PDF but never complete Aadhaar e-sign. The portal may show a draft. On death, the family is treated as if there were no nomination, triggering succession certificates and delays. This also affects who can sign a Joint Declaration after death (SOP uses Form-2 nominees).

## Root cause

User dropped off before e-sign OTP; thought download equalled filing.

## How it is detected

Manage > e-Nomination status not 'e-signed/active'. Death claim with no valid nomination.

## Fix

- While the member is alive: complete e-Nomination and e-sign the PDF with Aadhaar OTP; confirm status is active.
- After death, if unsigned, treat as no nomination: legal heirs, succession, family definition under the scheme (epfo-rr-060, epfo-rr-063).
- Do not assume a downloaded PDF without e-sign is valid.

## Required documents

- Aadhaar OTP for e-sign
- Nominee Aadhaar/relationship details

## Who acts

member

## Prevention

- Every year, verify e-nomination status is e-signed.
- Re-do nomination after marriage/childbirth and e-sign again.

## Related records

- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-061](./epfo-rr-061.md)
- [epfo-rr-063](./epfo-rr-063.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Zee quotes EPFO eNomination document language on unsigned PDFs.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [news] https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html
- [news] https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- [blog] https://kustodian.life/resources/epf-death-claim-process-india

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-056",
  "rejection_reason": "e-Nomination filed but PDF not e-signed, so nomination is incomplete",
  "aliases": [
    "e-nomination not e-signed",
    "Nomination PDF not digitally signed",
    "e-nomination incomplete"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "Form 19 PF Final Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "EPFO e-nomination guidance (reported by Zee and help sites): e-nominations that are only filed and whose PDF is not e-signed will not be considered on the member's death. E-nomination becomes complete only when the PDF is e-signed.",
  "what_it_means": "Members tick nominees and download a PDF but never complete Aadhaar e-sign. The portal may show a draft. On death, the family is treated as if there were no nomination, triggering succession certificates and delays. This also affects who can sign a Joint Declaration after death (SOP uses Form-2 nominees).",
  "root_cause": "User dropped off before e-sign OTP; thought download equalled filing.",
  "how_detected": "Manage > e-Nomination status not 'e-signed/active'. Death claim with no valid nomination.",
  "fix_steps": [
    "While the member is alive: complete e-Nomination and e-sign the PDF with Aadhaar OTP; confirm status is active.",
    "After death, if unsigned, treat as no nomination: legal heirs, succession, family definition under the scheme (epfo-rr-060, epfo-rr-063).",
    "Do not assume a downloaded PDF without e-sign is valid."
  ],
  "required_documents": [
    "Aadhaar OTP for e-sign",
    "Nominee Aadhaar/relationship details"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Every year, verify e-nomination status is e-signed.",
    "Re-do nomination after marriage/childbirth and e-sign again."
  ],
  "related_reason_ids": [
    "epfo-rr-060",
    "epfo-rr-061",
    "epfo-rr-063"
  ],
  "source_urls": [
    "https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://kustodian.life/resources/epf-death-claim-process-india"
  ],
  "source_types": [
    "news",
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Zee quotes EPFO eNomination document language on unsigned PDFs.",
  "last_verified": "2026-09-12"
}
```
