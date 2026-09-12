# Physical claim attested by wrong authority — not on EPFO's accepted attestor list (epfo-rr-170)

> Dataset record `epfo-rr-170`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Physical claim attested by wrong authority — not on EPFO's accepted attestor list

**Aliases:** Wrong attestation authority, Attestation not accepted EPFO, Unauthorised attesting officer claim, Manager attestation invalid PF, Attestor not gazetted or listed

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Composite Claim Form, Form 19 PF Final Settlement, Form 20 Death PF Settlement, Form 10D Monthly Pension, Form 13 Transfer, International Worker Claim
- **Severity:** high
- **Official/common message status:** Non-Aadhaar / closed-establishment / physical flows require attestation by authorities listed in forms and JD SOP (gazetted officers, bank managers of claimant's account, MP/MLA, etc.). Attestation by random notaries, colleagues, or unlisted managers is rejected.

## What it means

Document looks stamped but fails list-check. Distinct from missing signature entirely (050) and from notary-vs-gazetted confusion detailed in 173.

## Root cause

Using convenient but unlisted attestor; bank manager of a different branch/account; expired gazetted credentials.

## How it is detected

RO scrutiny of attestation seal/name/designation against circular/form list.

## Fix

- Read the attestation list on the exact form/SOP you are using.
- Re-attest before an accepted authority (e.g. gazetted officer or bank manager of YOUR seeded account).
- For closed establishments, follow JD SOP closed-establishment attestors.
- Resubmit physical claim once; keep photocopy of attestor ID if RO practice asks.

## Required documents

- Freshly attested claim form
- Attestor designation proof if asked
- Closed-establishment proofs

## Who acts

member

## Prevention

- Never rely on workplace colleagues as attestors unless they are on the official list.

## Related records

- [epfo-rr-026](./epfo-rr-026.md)
- [epfo-rr-050](./epfo-rr-050.md)
- [epfo-rr-030](./epfo-rr-030.md)
- [epfo-rr-173](./epfo-rr-173.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** circular, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** JD SOP and CCF instructions enumerate acceptable attestors.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- [official] https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- [official] https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-170",
  "rejection_reason": "Physical claim attested by wrong authority — not on EPFO's accepted attestor list",
  "aliases": [
    "Wrong attestation authority",
    "Attestation not accepted EPFO",
    "Unauthorised attesting officer claim",
    "Manager attestation invalid PF",
    "Attestor not gazetted or listed"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Composite Claim Form",
    "Form 19 PF Final Settlement",
    "Form 20 Death PF Settlement",
    "Form 10D Monthly Pension",
    "Form 13 Transfer",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Non-Aadhaar / closed-establishment / physical flows require attestation by authorities listed in forms and JD SOP (gazetted officers, bank managers of claimant's account, MP/MLA, etc.). Attestation by random notaries, colleagues, or unlisted managers is rejected.",
  "what_it_means": "Document looks stamped but fails list-check. Distinct from missing signature entirely (050) and from notary-vs-gazetted confusion detailed in 173.",
  "root_cause": "Using convenient but unlisted attestor; bank manager of a different branch/account; expired gazetted credentials.",
  "how_detected": "RO scrutiny of attestation seal/name/designation against circular/form list.",
  "fix_steps": [
    "Read the attestation list on the exact form/SOP you are using.",
    "Re-attest before an accepted authority (e.g. gazetted officer or bank manager of YOUR seeded account).",
    "For closed establishments, follow JD SOP closed-establishment attestors.",
    "Resubmit physical claim once; keep photocopy of attestor ID if RO practice asks."
  ],
  "required_documents": [
    "Freshly attested claim form",
    "Attestor designation proof if asked",
    "Closed-establishment proofs"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never rely on workplace colleagues as attestors unless they are on the official list."
  ],
  "related_reason_ids": [
    "epfo-rr-026",
    "epfo-rr-050",
    "epfo-rr-030",
    "epfo-rr-173"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf"
  ],
  "source_types": [
    "circular",
    "official"
  ],
  "confidence": "high",
  "notes": "JD SOP and CCF instructions enumerate acceptable attestors.",
  "last_verified": "2026-09-12"
}
```
