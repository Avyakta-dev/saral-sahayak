# Form 19 filed while member is still in PF-covered employment (epfo-rr-034)

> Dataset record `epfo-rr-034`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 19 filed while member is still in PF-covered employment

**Aliases:** Still employed, Member working presently under establishment coverable under PF Act, Out of service reason selected while active, Wrongly claimed final settlement while working, Still showing as employed, Out of service selected while working, Cannot file Form 19 while in service, Presently employed in covered establishment

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** OCS FAQ Q3(b): Member should not be working presently under any establishment coverable under PF Act. ClearTax: applying Form 31 but selecting 'Out of Service' (or the reverse) is a typical error.

## What it means

Final settlement is for exit/retirement/unemployment, not for cash-out while on payroll of a covered employer. If a new employer has already allotted a member ID, or the old DOE is blank, the system treats you as employed. Dual employment (two covered jobs) also blocks Form 19.

## Root cause

No DOE; immediate joining of next PF job; selecting final settlement because the UI listed it; contractor still filing ECR.

## How it is detected

Active member ID in service history. Latest ECR. Claim-type vs employment status.

## Fix

- If still employed and you need funds, use Form 31 for a permitted purpose, not Form 19.
- If you have left and joined another covered employer, file Form 13 transfer, not Form 19.
- If you have truly left and are unemployed, get DOE marked and wait the required period.
- If a ghost/wrong member ID shows you as employed, delink it (epfo-rr-051).

## Required documents

- Service History
- Relieving letter if truly exited
- Form 31 supporting purpose if still employed

## Who acts

member

## Prevention

- Match the form to life status: employed → 31; unemployed after wait → 19; new job → 13.

## Related records

- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-051](./epfo-rr-051.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q3(b).

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://cleartax.in/c/pf-withdrawal-online
- https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- https://pfbalancecheck.com/epfo-claim-rejected-reason/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-034",
  "rejection_reason": "Form 19 filed while member is still in PF-covered employment",
  "aliases": [
    "Still employed",
    "Member working presently under establishment coverable under PF Act",
    "Out of service reason selected while active",
    "Wrongly claimed final settlement while working",
    "Still showing as employed",
    "Out of service selected while working",
    "Cannot file Form 19 while in service",
    "Presently employed in covered establishment"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "OCS FAQ Q3(b): Member should not be working presently under any establishment coverable under PF Act. ClearTax: applying Form 31 but selecting 'Out of Service' (or the reverse) is a typical error.",
  "what_it_means": "Final settlement is for exit/retirement/unemployment, not for cash-out while on payroll of a covered employer. If a new employer has already allotted a member ID, or the old DOE is blank, the system treats you as employed. Dual employment (two covered jobs) also blocks Form 19.",
  "root_cause": "No DOE; immediate joining of next PF job; selecting final settlement because the UI listed it; contractor still filing ECR.",
  "how_detected": "Active member ID in service history. Latest ECR. Claim-type vs employment status.",
  "fix_steps": [
    "If still employed and you need funds, use Form 31 for a permitted purpose, not Form 19.",
    "If you have left and joined another covered employer, file Form 13 transfer, not Form 19.",
    "If you have truly left and are unemployed, get DOE marked and wait the required period.",
    "If a ghost/wrong member ID shows you as employed, delink it (epfo-rr-051)."
  ],
  "required_documents": [
    "Service History",
    "Relieving letter if truly exited",
    "Form 31 supporting purpose if still employed"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Match the form to life status: employed → 31; unemployed after wait → 19; new job → 13."
  ],
  "related_reason_ids": [
    "epfo-rr-024",
    "epfo-rr-043",
    "epfo-rr-039",
    "epfo-rr-051"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q3(b).",
  "last_verified": "2026-09-12"
}
```
