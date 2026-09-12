# Wrong Composite Claim Form used (Aadhaar vs Non-Aadhaar) or CCF filed without meeting seeding conditions (epfo-rr-049)

> Dataset record `epfo-rr-049`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Wrong Composite Claim Form used (Aadhaar vs Non-Aadhaar) or CCF filed without meeting seeding conditions

**Aliases:** CCF Aadhaar without seeding, Non-Aadhaar form used when Aadhaar seeded, Composite claim form incorrect

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Composite Claim Form, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 31 Partial Withdrawal/Advance
- **Severity:** medium
- **Official/common message status:** Official CCF (Aadhaar) instructions: use only if UAN activated and Aadhaar + bank seeded; can be submitted without employer attestation. Non-Aadhaar CCF requires employer attestation. Mixing the two is a documentary reject.

## What it means

Two composite PDFs exist. Using the Aadhaar CCF without seeded Aadhaar/bank, or using Non-Aadhaar and skipping employer stamp, returns the claim. Online portal claims already are the digital CCF; mailing a redundant paper CCF while an online claim is pending creates duplicates.

## Root cause

Google-downloaded old form; cyber-cafe filling the wrong PDF.

## How it is detected

Field office form-type check. Missing attestation on Non-Aadhaar CCF.

## Fix

- If UAN is activated and Aadhaar+bank verified, prefer online claim; if paper needed, use CCF (Aadhaar) only.
- If Aadhaar is not seeded, use CCF (Non-Aadhaar) with last employer attestation, or seed Aadhaar and go online.
- Do not file paper CCF and online claim together (epfo-rr-052).

## Required documents

- Correct CCF PDF
- Employer attestation if Non-Aadhaar
- KYC copies

## Who acts

mixed

## Prevention

- Download forms only from epfindia.gov.in.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-026](./epfo-rr-026.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Composite_Claim_Forms_31792.pdf (2016-17) introduced the two CCFs.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://www.paisabazaar.com/saving-schemes/epf-composite-claim-form/
- [blog] https://cleartax.in/c/pf-withdrawal-online

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-049",
  "rejection_reason": "Wrong Composite Claim Form used (Aadhaar vs Non-Aadhaar) or CCF filed without meeting seeding conditions",
  "aliases": [
    "CCF Aadhaar without seeding",
    "Non-Aadhaar form used when Aadhaar seeded",
    "Composite claim form incorrect"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Composite Claim Form",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 31 Partial Withdrawal/Advance"
  ],
  "severity": "medium",
  "official_status_or_message": "Official CCF (Aadhaar) instructions: use only if UAN activated and Aadhaar + bank seeded; can be submitted without employer attestation. Non-Aadhaar CCF requires employer attestation. Mixing the two is a documentary reject.",
  "what_it_means": "Two composite PDFs exist. Using the Aadhaar CCF without seeded Aadhaar/bank, or using Non-Aadhaar and skipping employer stamp, returns the claim. Online portal claims already are the digital CCF; mailing a redundant paper CCF while an online claim is pending creates duplicates.",
  "root_cause": "Google-downloaded old form; cyber-cafe filling the wrong PDF.",
  "how_detected": "Field office form-type check. Missing attestation on Non-Aadhaar CCF.",
  "fix_steps": [
    "If UAN is activated and Aadhaar+bank verified, prefer online claim; if paper needed, use CCF (Aadhaar) only.",
    "If Aadhaar is not seeded, use CCF (Non-Aadhaar) with last employer attestation, or seed Aadhaar and go online.",
    "Do not file paper CCF and online claim together (epfo-rr-052)."
  ],
  "required_documents": [
    "Correct CCF PDF",
    "Employer attestation if Non-Aadhaar",
    "KYC copies"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Download forms only from epfindia.gov.in."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-026",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://www.paisabazaar.com/saving-schemes/epf-composite-claim-form/",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "official",
    "circular",
    "blog"
  ],
  "confidence": "high",
  "notes": "Composite_Claim_Forms_31792.pdf (2016-17) introduced the two CCFs.",
  "last_verified": "2026-09-12"
}
```
