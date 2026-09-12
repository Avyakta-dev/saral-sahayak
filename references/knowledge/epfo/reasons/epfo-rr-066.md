# Deceased member's KYC or name does not match Aadhaar, blocking death claim (epfo-rr-066)

> Dataset record `epfo-rr-066`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Deceased member's KYC or name does not match Aadhaar, blocking death claim

**Aliases:** Deceased name mismatch, Death claim stuck on member KYC, Sunita Sharma vs Sunita Devi Sharma

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** Same demographic match rules apply to the deceased's UAN. SOP 6.9–6.10: if the member is dead, JD is signed by Form-2 nominee(s); all nominees' consent if more than one; if no nomination, a family member/legal heir with others' consent. Nominee Aadhaar may be saved if member had no Aadhaar.

## What it means

Families discover the spelling error only after death, when the member cannot OTP. The claim is paused until a death-case Joint Declaration corrects the profile. This is slower than a live JD because of consent and attestation rules.

## Root cause

Lifelong name mismatch never fixed; Aadhaar not seeded while alive.

## How it is detected

Death claim KYC match fail. Forum/news cases of one extra word in the name.

## Fix

- Do not keep refiling Form 20.
- File a death-case Joint Declaration with nominee signatures/consent, death certificate, Aadhaar of deceased and claimant, and supporting IDs (SOP).
- If establishment is closed, use alternative attestation.
- After the UAN name matches, file 20/10D/5IF as a set.

## Required documents

- Death certificate
- Nominee consent / Form 2
- Aadhaar of deceased and claimant
- JD Annexure-II if closed establishment

## Who acts

mixed

## Prevention

- Fix name mismatch while the member is alive — this is the single best death-claim prevention step.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-062](./epfo-rr-062.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** SOP 6.9 case 'Member is dead' and 6.10 no-Aadhaar deceased.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf

### Secondary (news / blog / forum)

- [news] https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- [blog] https://kustodian.life/resources/epf-claim-rejected-name-aadhaar-dob-mismatch-fix-guide-2025

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-066",
  "rejection_reason": "Deceased member's KYC or name does not match Aadhaar, blocking death claim",
  "aliases": [
    "Deceased name mismatch",
    "Death claim stuck on member KYC",
    "Sunita Sharma vs Sunita Devi Sharma"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "Same demographic match rules apply to the deceased's UAN. SOP 6.9–6.10: if the member is dead, JD is signed by Form-2 nominee(s); all nominees' consent if more than one; if no nomination, a family member/legal heir with others' consent. Nominee Aadhaar may be saved if member had no Aadhaar.",
  "what_it_means": "Families discover the spelling error only after death, when the member cannot OTP. The claim is paused until a death-case Joint Declaration corrects the profile. This is slower than a live JD because of consent and attestation rules.",
  "root_cause": "Lifelong name mismatch never fixed; Aadhaar not seeded while alive.",
  "how_detected": "Death claim KYC match fail. Forum/news cases of one extra word in the name.",
  "fix_steps": [
    "Do not keep refiling Form 20.",
    "File a death-case Joint Declaration with nominee signatures/consent, death certificate, Aadhaar of deceased and claimant, and supporting IDs (SOP).",
    "If establishment is closed, use alternative attestation.",
    "After the UAN name matches, file 20/10D/5IF as a set."
  ],
  "required_documents": [
    "Death certificate",
    "Nominee consent / Form 2",
    "Aadhaar of deceased and claimant",
    "JD Annexure-II if closed establishment"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Fix name mismatch while the member is alive — this is the single best death-claim prevention step."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-013",
    "epfo-rr-062"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://kustodian.life/resources/epf-claim-rejected-name-aadhaar-dob-mismatch-fix-guide-2025",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "SOP 6.9 case 'Member is dead' and 6.10 no-Aadhaar deceased.",
  "last_verified": "2026-09-12"
}
```
