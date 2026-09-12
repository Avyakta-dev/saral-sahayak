# Form 31 factory closure / lockout advance rejected (epfo-rr-092)

> Dataset record `epfo-rr-092`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 factory closure / lockout advance rejected

**Aliases:** Factory closure advance rejected, Establishment closed Form 31, Lockout PF advance not allowed, Closure of establishment over 15 days advance

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** ClearTax: closure of establishment for over 15 days and employees unemployed without compensation — up to 100% employee share. CCF circular: no document required with composite claim for factory-closure advances when self-certifying.

## What it means

Factory-closure advances fail when closure/lockout duration is under the threshold, compensation was paid, establishment is not actually closed, or unemployment-after-exit was the correct purpose instead.

## Root cause

Closure under 15 days; compensation paid; wrong purpose; establishment still filing ECR normally.

## How it is detected

Purpose factory closure/lockout. ECR/establishment status.

## Fix

- Confirm closure/lockout over 15 days without compensation.
- Select factory closure / special circumstances purpose that matches.
- Online self-certification may suffice; respond if RO asks employer confirmation.
- If permanently exited, evaluate Form 19 separately.

## Required documents

- Self-declaration
- Employer/closure intimation if asked

## Who acts

mixed

## Prevention

- Do not confuse temporary unpaid leave with notified closure.

## Related records

- [epfo-rr-091](./epfo-rr-091.md)
- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-030](./epfo-rr-030.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://cleartax.in/s/epf-form-31
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf
- https://www.indiafilings.com/learn/epf-form-31
- https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-092",
  "rejection_reason": "Form 31 factory closure / lockout advance rejected",
  "aliases": [
    "Factory closure advance rejected",
    "Establishment closed Form 31",
    "Lockout PF advance not allowed",
    "Closure of establishment over 15 days advance"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "ClearTax: closure of establishment for over 15 days and employees unemployed without compensation — up to 100% employee share. CCF circular: no document required with composite claim for factory-closure advances when self-certifying.",
  "what_it_means": "Factory-closure advances fail when closure/lockout duration is under the threshold, compensation was paid, establishment is not actually closed, or unemployment-after-exit was the correct purpose instead.",
  "root_cause": "Closure under 15 days; compensation paid; wrong purpose; establishment still filing ECR normally.",
  "how_detected": "Purpose factory closure/lockout. ECR/establishment status.",
  "fix_steps": [
    "Confirm closure/lockout over 15 days without compensation.",
    "Select factory closure / special circumstances purpose that matches.",
    "Online self-certification may suffice; respond if RO asks employer confirmation.",
    "If permanently exited, evaluate Form 19 separately."
  ],
  "required_documents": [
    "Self-declaration",
    "Employer/closure intimation if asked"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Do not confuse temporary unpaid leave with notified closure."
  ],
  "related_reason_ids": [
    "epfo-rr-091",
    "epfo-rr-090",
    "epfo-rr-030"
  ],
  "source_urls": [
    "https://cleartax.in/s/epf-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://knowmoney.in/blog/epfo-3-withdrawal-rules-india-2026"
  ],
  "source_types": [
    "blog",
    "circular"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
