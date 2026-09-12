# Claim stuck Under process indefinitely without settlement or clear reject remark (epfo-rr-114)

> Dataset record `epfo-rr-114`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claim stuck Under process indefinitely without settlement or clear reject remark

**Aliases:** Under process for months, Claim pending indefinitely, No update on Track Claim, Status under process forever, Under process indefinitely, Claim stuck no update, Pending at field office long time

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 13 Transfer, Form 20 Death PF Settlement, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** PFBalanceCheck distinguishes Under Process vs Settled vs Rejected. CitizenNest/RTI Wiki describe escalating parked files via EPFiGMS when no defect is named.

## What it means

Not a final rejection but functionally blocks the member. Causes include RO backlog, silent employer attestation wait, fraud-scrutiny flags, or backend validation loops. Fix is escalation with claim ID, not blind refile.

## Root cause

Backlog; silent attestation wait; scrutiny flag; portal sync lag.

## How it is detected

Track Claim remains Under process beyond published timelines.

## Fix

- Screenshot claim ID, dates, and status weekly.
- Ask employer whether attestation/DSC pending.
- File EPFiGMS naming claim ID and asking for specific defect or decision.
- Escalate EPFiGMS/CPGRAMS if silent; do not file duplicate claim.

## Required documents

- Track Claim screenshots
- Employer attestation status if any
- EPFiGMS registration number

## Who acts

mixed

## Prevention

- Diary published settlement timeline when you file.

## Related records

- [epfo-rr-058](./epfo-rr-058.md)
- [epfo-rr-079](./epfo-rr-079.md)
- [epfo-rr-076](./epfo-rr-076.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://pfbalancecheck.com/epfo-claim-rejected-reason/
- https://www.citizennest.com/guide/pf-claim-rejected-fix
- https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india
- https://epfigms.gov.in/
- https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-114",
  "rejection_reason": "Claim stuck Under process indefinitely without settlement or clear reject remark",
  "aliases": [
    "Under process for months",
    "Claim pending indefinitely",
    "No update on Track Claim",
    "Status under process forever",
    "Under process indefinitely",
    "Claim stuck no update",
    "Pending at field office long time"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "PFBalanceCheck distinguishes Under Process vs Settled vs Rejected. CitizenNest/RTI Wiki describe escalating parked files via EPFiGMS when no defect is named.",
  "what_it_means": "Not a final rejection but functionally blocks the member. Causes include RO backlog, silent employer attestation wait, fraud-scrutiny flags, or backend validation loops. Fix is escalation with claim ID, not blind refile.",
  "root_cause": "Backlog; silent attestation wait; scrutiny flag; portal sync lag.",
  "how_detected": "Track Claim remains Under process beyond published timelines.",
  "fix_steps": [
    "Screenshot claim ID, dates, and status weekly.",
    "Ask employer whether attestation/DSC pending.",
    "File EPFiGMS naming claim ID and asking for specific defect or decision.",
    "Escalate EPFiGMS/CPGRAMS if silent; do not file duplicate claim."
  ],
  "required_documents": [
    "Track Claim screenshots",
    "Employer attestation status if any",
    "EPFiGMS registration number"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Diary published settlement timeline when you file."
  ],
  "related_reason_ids": [
    "epfo-rr-058",
    "epfo-rr-079",
    "epfo-rr-076",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.citizennest.com/guide/pf-claim-rejected-fix",
    "https://righttoinformation.wiki/pf-withdrawal-claim-rejected-without-reason-epfo-india",
    "https://epfigms.gov.in/",
    "https://taxguru.in/corporate-law/standard-operating-procedure-sop-settlement-claims-epfo.html"
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
