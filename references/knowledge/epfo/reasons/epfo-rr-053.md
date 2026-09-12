# Form 31 purpose documents or self-certification deficient (epfo-rr-053)

> Dataset record `epfo-rr-053`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 purpose documents or self-certification deficient

**Aliases:** Self-certification missing, Purpose proof not attached, Medical/housing documents missing, Purpose proof / self-certification deficient Form 31, Medical housing documents missing, Self declaration not acceptable

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 31 Partial Withdrawal/Advance
- **Severity:** low
- **Official/common message status:** ClearTax notes EPFO order dated 20.02.2017 allowing self-certification instead of multiple certificates for many advances. OCS FAQ also said online part-withdrawal may not require supporting documents. Some purposes or later scrutiny can still demand proof; uploading random extra PDFs can confuse the file.

## What it means

Most online Form 31 claims are self-certified. Rejection for 'documents' usually means either the portal asked for a specific file (cheque, medical declaration) and it was missing, or a field office selected the case for verification. Do not attach unrelated tenancy agreements to a medical advance.

## Root cause

Portal prompted an upload and user skipped; or user attached the wrong purpose proofs.

## How it is detected

Upload mandatory asterisk. FO query.

## Fix

- If the portal says no document required, do not upload extras.
- If it asks, upload only that file, readable, matching the purpose.
- For housing, property should be in member or spouse name as per current rule shown on screen.
- Self-certify truthfully; false self-certification is a compliance issue.

## Required documents

- Self-certification / OTP undertaking
- Only those files the portal lists

## Who acts

member

## Prevention

- Read the on-screen document list for that purpose code.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-021](./epfo-rr-021.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 20.02.2017 self-certification order cited by ClearTax; PDF not bundled in this dataset.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-053",
  "rejection_reason": "Form 31 purpose documents or self-certification deficient",
  "aliases": [
    "Self-certification missing",
    "Purpose proof not attached",
    "Medical/housing documents missing",
    "Purpose proof / self-certification deficient Form 31",
    "Medical housing documents missing",
    "Self declaration not acceptable"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance"
  ],
  "severity": "low",
  "official_status_or_message": "ClearTax notes EPFO order dated 20.02.2017 allowing self-certification instead of multiple certificates for many advances. OCS FAQ also said online part-withdrawal may not require supporting documents. Some purposes or later scrutiny can still demand proof; uploading random extra PDFs can confuse the file.",
  "what_it_means": "Most online Form 31 claims are self-certified. Rejection for 'documents' usually means either the portal asked for a specific file (cheque, medical declaration) and it was missing, or a field office selected the case for verification. Do not attach unrelated tenancy agreements to a medical advance.",
  "root_cause": "Portal prompted an upload and user skipped; or user attached the wrong purpose proofs.",
  "how_detected": "Upload mandatory asterisk. FO query.",
  "fix_steps": [
    "If the portal says no document required, do not upload extras.",
    "If it asks, upload only that file, readable, matching the purpose.",
    "For housing, property should be in member or spouse name as per current rule shown on screen.",
    "Self-certify truthfully; false self-certification is a compliance issue."
  ],
  "required_documents": [
    "Self-certification / OTP undertaking",
    "Only those files the portal lists"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Read the on-screen document list for that purpose code."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-021"
  ],
  "source_urls": [
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.taxbuddy.com/blog/understanding-partial-pf-withdrawal-using-form-31"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "medium",
  "notes": "20.02.2017 self-certification order cited by ClearTax; PDF not bundled in this dataset.",
  "last_verified": "2026-09-12"
}
```
