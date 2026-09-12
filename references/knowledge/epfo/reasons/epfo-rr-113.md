# Portal remark Member not eligible for this claim type due to life-status mismatch (epfo-rr-113)

> Dataset record `epfo-rr-113`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Portal remark Member not eligible for this claim type due to life-status mismatch

**Aliases:** Member not eligible for this claim type, Claim type not allowed for member, You are not eligible to raise this claim, Selected claim not available for UAN status, Member not eligible life status mismatch, Life status alive death claim blocked

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** high
- **Official/common message status:** PFBalanceCheck/Kustodian and portal UX: system hides or rejects claim types that conflict with employment status, age, or service band.

## What it means

Seen when Form 19 chosen while employed, Form 31 unemployment without DOE, Form 10D under age/service. Remark is generic; fix is match form to Service History.

## Root cause

Employment status vs form; age/service gates; profile flags.

## How it is detected

Eligibility toast/remark on claim dropdown or after submit.

## Fix

- Read Service History for employed vs exited, age, EPS months.
- Pick the form the portal enables for that status.
- Fix DOE/KYC/unblock first if those gate the dropdown.
- EPFiGMS only if eligible on paper but portal wrongly blocks.

## Required documents

- Service History screenshot
- Claim type screenshot

## Who acts

member

## Prevention

- Screenshot eligibility message before trying other forms.

## Related records

- [epfo-rr-034](./epfo-rr-034.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-045](./epfo-rr-045.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [blog] https://pfbalancecheck.com/epfo-claim-rejected-reason/
- [blog] https://kustodian.life/resources/epf-claim-rejected-reasons-guide

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-113",
  "rejection_reason": "Portal remark Member not eligible for this claim type due to life-status mismatch",
  "aliases": [
    "Member not eligible for this claim type",
    "Claim type not allowed for member",
    "You are not eligible to raise this claim",
    "Selected claim not available for UAN status",
    "Member not eligible life status mismatch",
    "Life status alive death claim blocked"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "PFBalanceCheck/Kustodian and portal UX: system hides or rejects claim types that conflict with employment status, age, or service band.",
  "what_it_means": "Seen when Form 19 chosen while employed, Form 31 unemployment without DOE, Form 10D under age/service. Remark is generic; fix is match form to Service History.",
  "root_cause": "Employment status vs form; age/service gates; profile flags.",
  "how_detected": "Eligibility toast/remark on claim dropdown or after submit.",
  "fix_steps": [
    "Read Service History for employed vs exited, age, EPS months.",
    "Pick the form the portal enables for that status.",
    "Fix DOE/KYC/unblock first if those gate the dropdown.",
    "EPFiGMS only if eligible on paper but portal wrongly blocks."
  ],
  "required_documents": [
    "Service History screenshot",
    "Claim type screenshot"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Screenshot eligibility message before trying other forms."
  ],
  "related_reason_ids": [
    "epfo-rr-034",
    "epfo-rr-039",
    "epfo-rr-043",
    "epfo-rr-045"
  ],
  "source_urls": [
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://kustodian.life/resources/epf-claim-rejected-reasons-guide",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
