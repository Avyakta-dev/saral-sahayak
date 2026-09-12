# Form 31 illness advance for pregnancy or family member treatment documentation/eligibility failure (epfo-rr-094)

> Dataset record `epfo-rr-094`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 illness advance for pregnancy or family member treatment documentation/eligibility failure

**Aliases:** Pregnancy treatment PF advance rejected, Family illness Form 31 rejected, Wife medical treatment advance not allowed, Maternity related Form 31 rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Illness advances cover member and defined family in Form 31 guides (ClearTax/IndiaFilings). Pregnancy/childbirth treatment is commonly filed under illness/medical; success depends on family definition, amount caps, and certificates when asked.

## What it means

Rejections when patient is outside family for the scheme purpose, medical certificates missing on physical claims, amount exceeds illness caps, or wrong purpose used. Distinct from handicapped-equipment and EPS family pension.

## Root cause

Non-covered dependent; missing medical proof; over-claim; wrong purpose.

## How it is detected

Illness purpose with family member named. Certificate queries.

## Fix

- File under illness/medical with truthful family relationship declaration.
- Attach doctor certificate for physical claims; keep discharge summary for queries.
- Respect illness amount caps.
- Do not use as substitute for final settlement or unemployment advance.

## Required documents

- Doctor certificate
- Proof of relationship if asked
- Hospital estimate

## Who acts

member

## Prevention

- Confirm who counts as family under illness purpose help text.

## Related records

- [epfo-rr-087](./epfo-rr-087.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-053](./epfo-rr-053.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Pregnancy grouped under illness in secondary guides; not a separate official form code.

- https://cleartax.in/s/epf-form-31
- https://www.indiafilings.com/learn/epf-form-31
- https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-094",
  "rejection_reason": "Form 31 illness advance for pregnancy or family member treatment documentation/eligibility failure",
  "aliases": [
    "Pregnancy treatment PF advance rejected",
    "Family illness Form 31 rejected",
    "Wife medical treatment advance not allowed",
    "Maternity related Form 31 rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Illness advances cover member and defined family in Form 31 guides (ClearTax/IndiaFilings). Pregnancy/childbirth treatment is commonly filed under illness/medical; success depends on family definition, amount caps, and certificates when asked.",
  "what_it_means": "Rejections when patient is outside family for the scheme purpose, medical certificates missing on physical claims, amount exceeds illness caps, or wrong purpose used. Distinct from handicapped-equipment and EPS family pension.",
  "root_cause": "Non-covered dependent; missing medical proof; over-claim; wrong purpose.",
  "how_detected": "Illness purpose with family member named. Certificate queries.",
  "fix_steps": [
    "File under illness/medical with truthful family relationship declaration.",
    "Attach doctor certificate for physical claims; keep discharge summary for queries.",
    "Respect illness amount caps.",
    "Do not use as substitute for final settlement or unemployment advance."
  ],
  "required_documents": [
    "Doctor certificate",
    "Proof of relationship if asked",
    "Hospital estimate"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Confirm who counts as family under illness purpose help text."
  ],
  "related_reason_ids": [
    "epfo-rr-087",
    "epfo-rr-039",
    "epfo-rr-053"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf"
  ],
  "source_types": [
    "blog"
  ],
  "confidence": "medium",
  "notes": "Pregnancy grouped under illness in secondary guides; not a separate official form code.",
  "last_verified": "2026-09-12"
}
```
