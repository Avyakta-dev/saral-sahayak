# VPF / excess voluntary contribution confusion causing claim or transfer friction (epfo-rr-100)

> Dataset record `epfo-rr-100`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** VPF / excess voluntary contribution confusion causing claim or transfer friction

**Aliases:** VPF not withdrawing separately, Voluntary PF excess claim rejected, VPF balance not shown separately for claim, Excess contribution above statutory claim issue

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Member explainers (ClearTax/Bajaj): VPF is additional employee PF contribution in the same EPF account — not a separate withdrawable product. Claims follow Form 19/31 rules on total EPF balance.

## What it means

Members try to withdraw only VPF while employed without a valid Form 31 purpose, or expect a VPF-only settlement. Portal rejects or shows ineligibility because statutory rules apply to the whole EPF account.

## Root cause

Belief VPF is separately cashable anytime; wrong form; odd employer coding.

## How it is detected

Member requests VPF-only; portal only offers standard claim types.

## Fix

- Treat VPF as part of EPF balance.
- While employed, withdraw only under valid Form 31 purpose/limit.
- After exit, Form 19 settles EPF including VPF (EPS still follows 10C/10D).
- For employer mis-posting into EPS vs EPF, see wage-ceiling record.

## Required documents

- Passbook showing VPF/employee share
- Claim purpose screenshot

## Who acts

member

## Prevention

- Do not search for a separate VPF withdrawal form.

## Related records

- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-102](./epfo-rr-102.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** No separate official VPF rejection code; pattern from product structure.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/s/pf-withdrawal-online
- [blog] https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules
- [blog] https://cleartax.in/s/epf-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-100",
  "rejection_reason": "VPF / excess voluntary contribution confusion causing claim or transfer friction",
  "aliases": [
    "VPF not withdrawing separately",
    "Voluntary PF excess claim rejected",
    "VPF balance not shown separately for claim",
    "Excess contribution above statutory claim issue"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Member explainers (ClearTax/Bajaj): VPF is additional employee PF contribution in the same EPF account — not a separate withdrawable product. Claims follow Form 19/31 rules on total EPF balance.",
  "what_it_means": "Members try to withdraw only VPF while employed without a valid Form 31 purpose, or expect a VPF-only settlement. Portal rejects or shows ineligibility because statutory rules apply to the whole EPF account.",
  "root_cause": "Belief VPF is separately cashable anytime; wrong form; odd employer coding.",
  "how_detected": "Member requests VPF-only; portal only offers standard claim types.",
  "fix_steps": [
    "Treat VPF as part of EPF balance.",
    "While employed, withdraw only under valid Form 31 purpose/limit.",
    "After exit, Form 19 settles EPF including VPF (EPS still follows 10C/10D).",
    "For employer mis-posting into EPS vs EPF, see wage-ceiling record."
  ],
  "required_documents": [
    "Passbook showing VPF/employee share",
    "Claim purpose screenshot"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Do not search for a separate VPF withdrawal form."
  ],
  "related_reason_ids": [
    "epfo-rr-039",
    "epfo-rr-043",
    "epfo-rr-102"
  ],
  "source_urls": [
    "https://cleartax.in/s/pf-withdrawal-online",
    "https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules",
    "https://cleartax.in/s/epf-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "medium",
  "notes": "No separate official VPF rejection code; pattern from product structure.",
  "last_verified": "2026-09-12"
}
```
