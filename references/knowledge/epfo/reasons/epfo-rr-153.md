# Aadhaar Vault / reference-key or encrypted Aadhaar storage issue preventing seeding display (epfo-rr-153)

> Dataset record `epfo-rr-153`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Aadhaar Vault / reference-key or encrypted Aadhaar storage issue preventing seeding display

**Aliases:** Aadhaar Vault error EPFO, Aadhaar reference key mismatch, Encrypted Aadhaar not seeding, Aadhaar vault service unavailable KYC, Masked Aadhaar not accepted seed

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** EPFO stores Aadhaar via secure reference/vault patterns rather than displaying full Aadhaar. Portal glitches, vault service errors, or uploading masked-only PDFs without proper e-KYC can leave seeding incomplete while UI looks confusing.

## What it means

Member believes Aadhaar is seeded but Verified tick never appears, or claim-time UIDAI call fails. Distinct from Aadhaar already linked to another UAN (011).

## Root cause

Vault/API outage; incomplete OTP e-KYC; uploading photo of masked Aadhaar without UIDAI fetch; stale reference.

## How it is detected

KYC page errors mentioning vault/reference. Aadhaar row Pending despite uploads. Claim-time e-KYC fail.

## Fix

- Re-do Aadhaar seeding with UIDAI OTP e-KYC (not only PDF upload).
- Retry during non-peak hours if vault service errors appear.
- Ensure the Aadhaar number entered matches UIDAI; do not rely on partially masked uploads alone.
- If linked to another UAN, follow merge/delink path (011/046) instead.
- EPFiGMS with KYC screenshots if Verified never sets after successful OTP.

## Required documents

- Aadhaar number and linked mobile
- KYC page screenshots

## Who acts

member

## Prevention

- Always complete OTP-based e-KYC, not document upload alone.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-008](./epfo-rr-008.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-011](./epfo-rr-011.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Vault/reference behaviour inferred from Aadhaar Act compliance patterns and portal UX; medium confidence.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- [official] https://uidai.gov.in
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary (news / blog / forum)

- [blog] https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-153",
  "rejection_reason": "Aadhaar Vault / reference-key or encrypted Aadhaar storage issue preventing seeding display",
  "aliases": [
    "Aadhaar Vault error EPFO",
    "Aadhaar reference key mismatch",
    "Encrypted Aadhaar not seeding",
    "Aadhaar vault service unavailable KYC",
    "Masked Aadhaar not accepted seed"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "EPFO stores Aadhaar via secure reference/vault patterns rather than displaying full Aadhaar. Portal glitches, vault service errors, or uploading masked-only PDFs without proper e-KYC can leave seeding incomplete while UI looks confusing.",
  "what_it_means": "Member believes Aadhaar is seeded but Verified tick never appears, or claim-time UIDAI call fails. Distinct from Aadhaar already linked to another UAN (011).",
  "root_cause": "Vault/API outage; incomplete OTP e-KYC; uploading photo of masked Aadhaar without UIDAI fetch; stale reference.",
  "how_detected": "KYC page errors mentioning vault/reference. Aadhaar row Pending despite uploads. Claim-time e-KYC fail.",
  "fix_steps": [
    "Re-do Aadhaar seeding with UIDAI OTP e-KYC (not only PDF upload).",
    "Retry during non-peak hours if vault service errors appear.",
    "Ensure the Aadhaar number entered matches UIDAI; do not rely on partially masked uploads alone.",
    "If linked to another UAN, follow merge/delink path (011/046) instead.",
    "EPFiGMS with KYC screenshots if Verified never sets after successful OTP."
  ],
  "required_documents": [
    "Aadhaar number and linked mobile",
    "KYC page screenshots"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Always complete OTP-based e-KYC, not document upload alone."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-008",
    "epfo-rr-010",
    "epfo-rr-011"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://uidai.gov.in",
    "https://www.taxbuddy.com/blog/how-incorrect-kyc-details-affect-pf-withdrawal-approval",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Vault/reference behaviour inferred from Aadhaar Act compliance patterns and portal UX; medium confidence.",
  "last_verified": "2026-09-12"
}
```
