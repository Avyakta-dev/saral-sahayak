# Form 31 advance for purchase of equipment by physically handicapped member rejected (epfo-rr-093)

> Dataset record `epfo-rr-093`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 advance for purchase of equipment by physically handicapped member rejected

**Aliases:** Physically handicapped equipment advance rejected, Disability assistive device Form 31, Handicapped member PF advance not eligible, Equipment purchase disability PF rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** ClearTax documents table lists physically handicapped purpose needing doctor certificate. IndiaFilings/Axis Max mention disability/assistive equipment advances under Form 31 with medical certification.

## What it means

This purpose is for purchasing equipment required because of physical handicap, not a generic medical hospitalisation advance. Rejection when disability certificate missing, equipment unrelated, amount exceeds cap, or medical purpose selected instead.

## Root cause

Missing disability/doctor certificate; wrong purpose; amount.

## How it is detected

Purpose physically handicapped / equipment. Document checklist.

## Fix

- Select handicapped-equipment purpose, not generic illness, if that is the need.
- Attach doctor/disability certificate as required.
- Claim only equipment-related eligible amount.
- For monthly disablement pension use Form 10D path, not Form 31.

## Required documents

- Doctor/disability certificate
- Equipment quotation if asked
- Self-declaration

## Who acts

member

## Prevention

- Keep disability certificate updated before filing.

## Related records

- [epfo-rr-087](./epfo-rr-087.md)
- [epfo-rr-111](./epfo-rr-111.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Exact para details from secondary Form 31 tables; verify live scheme text.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/s/epf-form-31
- [blog] https://www.indiafilings.com/learn/epf-form-31
- [blog] https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-093",
  "rejection_reason": "Form 31 advance for purchase of equipment by physically handicapped member rejected",
  "aliases": [
    "Physically handicapped equipment advance rejected",
    "Disability assistive device Form 31",
    "Handicapped member PF advance not eligible",
    "Equipment purchase disability PF rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax documents table lists physically handicapped purpose needing doctor certificate. IndiaFilings/Axis Max mention disability/assistive equipment advances under Form 31 with medical certification.",
  "what_it_means": "This purpose is for purchasing equipment required because of physical handicap, not a generic medical hospitalisation advance. Rejection when disability certificate missing, equipment unrelated, amount exceeds cap, or medical purpose selected instead.",
  "root_cause": "Missing disability/doctor certificate; wrong purpose; amount.",
  "how_detected": "Purpose physically handicapped / equipment. Document checklist.",
  "fix_steps": [
    "Select handicapped-equipment purpose, not generic illness, if that is the need.",
    "Attach doctor/disability certificate as required.",
    "Claim only equipment-related eligible amount.",
    "For monthly disablement pension use Form 10D path, not Form 31."
  ],
  "required_documents": [
    "Doctor/disability certificate",
    "Equipment quotation if asked",
    "Self-declaration"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Keep disability certificate updated before filing."
  ],
  "related_reason_ids": [
    "epfo-rr-087",
    "epfo-rr-111",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "medium",
  "notes": "Exact para details from secondary Form 31 tables; verify live scheme text.",
  "last_verified": "2026-09-12"
}
```
