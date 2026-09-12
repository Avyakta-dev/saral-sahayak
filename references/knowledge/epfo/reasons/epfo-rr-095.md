# Form 31 advance within one year of retirement (90% pre-retirement) rejected (epfo-rr-095)

> Dataset record `epfo-rr-095`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 advance within one year of retirement (90% pre-retirement) rejected

**Aliases:** 90 percent withdrawal before retirement rejected, Within one year of retirement Form 31, Pre-retirement advance not eligible, Age 54 Form 31 rejected

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** ClearTax: before retirement — up to 90% of corpus after age about 54 and within one year of retirement/superannuation. Axis Max and other explainers echo this head.

## What it means

Fails when member age/DOB does not show eligibility, retirement is not within the one-year window, amount over 90%, or Form 19 was correct after exit. DOB mismatch often underlies age rejects.

## Root cause

Age/DOB wrong; not within 1 year of retirement; over-claim.

## How it is detected

Purpose pre-retirement / 90%. DOB vs claimed retirement date.

## Fix

- Verify DOB on UAN matches Aadhaar.
- Use this purpose only inside the portal pre-retirement window.
- Cap at 90% or live portal max.
- If already exited, prefer Form 19.

## Required documents

- Service History
- DOB proof
- Employer retirement intimation if asked

## Who acts

member

## Prevention

- Fix DOB before filing age-gated advances.

## Related records

- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-038](./epfo-rr-038.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-040](./epfo-rr-040.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/s/epf-form-31
- [blog] https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31
- [blog] https://www.indiafilings.com/learn/epf-form-31
- [blog] https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-095",
  "rejection_reason": "Form 31 advance within one year of retirement (90% pre-retirement) rejected",
  "aliases": [
    "90 percent withdrawal before retirement rejected",
    "Within one year of retirement Form 31",
    "Pre-retirement advance not eligible",
    "Age 54 Form 31 rejected"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax: before retirement — up to 90% of corpus after age about 54 and within one year of retirement/superannuation. Axis Max and other explainers echo this head.",
  "what_it_means": "Fails when member age/DOB does not show eligibility, retirement is not within the one-year window, amount over 90%, or Form 19 was correct after exit. DOB mismatch often underlies age rejects.",
  "root_cause": "Age/DOB wrong; not within 1 year of retirement; over-claim.",
  "how_detected": "Purpose pre-retirement / 90%. DOB vs claimed retirement date.",
  "fix_steps": [
    "Verify DOB on UAN matches Aadhaar.",
    "Use this purpose only inside the portal pre-retirement window.",
    "Cap at 90% or live portal max.",
    "If already exited, prefer Form 19."
  ],
  "required_documents": [
    "Service History",
    "DOB proof",
    "Employer retirement intimation if asked"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Fix DOB before filing age-gated advances."
  ],
  "related_reason_ids": [
    "epfo-rr-002",
    "epfo-rr-038",
    "epfo-rr-039",
    "epfo-rr-040"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.axismaxlife.com/blog/retirement-planning/epf-withdrawal-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules"
  ],
  "source_types": [
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
