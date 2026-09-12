# UMANG shows claim rejected or failed while member portal shows different status (epfo-rr-130)

> Dataset record `epfo-rr-130`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** UMANG shows claim rejected or failed while member portal shows different status

**Aliases:** UMANG status mismatch, UMANG rejected portal under process, Claim on UMANG not reflecting on portal, Duplicate status UMANG vs EPFO website

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** PFBalanceCheck advises trusting Track Claim on member portal. UMANG may show Rejected while portal still Under process due to sync lag.

## What it means

Acting on the wrong channel creates duplicate claims. Distinct from pure UMANG sync failure when both agree.

## Root cause

App sync lag; cached status; dual submission paths.

## How it is detected

UMANG status differs from member portal Track Claim.

## Fix

- Treat unified member portal Track Claim as source of truth.
- Do not file a new claim from UMANG while portal still shows an open claim.
- If both show reject, read the portal remark and fix root cause.
- EPFiGMS if statuses diverge for weeks.

## Required documents

- Screenshots of both UMANG and portal status
- Claim IDs

## Who acts

member

## Prevention

- Prefer member portal for messy claims.

## Related records

- [epfo-rr-055](./epfo-rr-055.md)
- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-059](./epfo-rr-059.md)
- [epfo-rr-079](./epfo-rr-079.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://web.umang.gov.in
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://pfbalancecheck.com/epfo-claim-rejected-reason/
- https://kustodian.life/resources/epf-claim-rejected-reasons-guide
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-130",
  "rejection_reason": "UMANG shows claim rejected or failed while member portal shows different status",
  "aliases": [
    "UMANG status mismatch",
    "UMANG rejected portal under process",
    "Claim on UMANG not reflecting on portal",
    "Duplicate status UMANG vs EPFO website"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "PFBalanceCheck advises trusting Track Claim on member portal. UMANG may show Rejected while portal still Under process due to sync lag.",
  "what_it_means": "Acting on the wrong channel creates duplicate claims. Distinct from pure UMANG sync failure when both agree.",
  "root_cause": "App sync lag; cached status; dual submission paths.",
  "how_detected": "UMANG status differs from member portal Track Claim.",
  "fix_steps": [
    "Treat unified member portal Track Claim as source of truth.",
    "Do not file a new claim from UMANG while portal still shows an open claim.",
    "If both show reject, read the portal remark and fix root cause.",
    "EPFiGMS if statuses diverge for weeks."
  ],
  "required_documents": [
    "Screenshots of both UMANG and portal status",
    "Claim IDs"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Prefer member portal for messy claims."
  ],
  "related_reason_ids": [
    "epfo-rr-055",
    "epfo-rr-052",
    "epfo-rr-059",
    "epfo-rr-079"
  ],
  "source_urls": [
    "https://web.umang.gov.in",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://kustodian.life/resources/epf-claim-rejected-reasons-guide",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
