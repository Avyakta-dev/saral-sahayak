# Form 10C pension withdrawal benefit claimed with less than six months' eligible service (epfo-rr-035)

> Dataset record `epfo-rr-035`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 10C pension withdrawal benefit claimed with less than six months' eligible service

**Aliases:** EPS not eligible, Service less than 6 months, Pension withdrawal not eligible, Do not file Form 10C if EPS service under 6 months

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Official OCS FAQ Q4: Member's Total Service should be more than 6 months and less than 9.5 years in addition to Form 19 conditions for filing Pension Withdrawal Benefit Claim. ClearTax: service less than 6 months — generally cannot withdraw pension money.

## What it means

EPS withdrawal benefit is not payable for very short service. Under 6 months, Form 10C cash-out is the wrong product. Members who join and leave quickly should only file Form 19 for the EPF (PF) portion. Filing 10C anyway yields rejection, sometimes with remarks about EPS eligibility or contribution mismatch.

## Root cause

Composite claim defaulting both 19 and 10C; member unaware of 6-month EPS floor; service history understating months actually worked.

## How it is detected

System service calculation < 6 months. OCS eligibility for type 10C. Passbook EPS columns thin.

## Fix

- Check total EPS service across all member IDs (not just last job).
- If truly under 6 months, file only Form 19; skip 10C.
- If you actually worked longer but history is short, get DOE/DOJ/ECR corrected first (epfo-rr-024, epfo-rr-029).
- If service is 9.5 years or more, do not use 10C cash-out (epfo-rr-036).

## Required documents

- Service History
- Passbook showing EPS contributions

## Who acts

member

## Prevention

- On the claim dropdown, select Only PF Withdrawal (Form 19) when EPS service is under 6 months.

## Related records

- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-044](./epfo-rr-044.md)
- [epfo-rr-042](./epfo-rr-042.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q4 is the primary official source. Offline review flag: FAQ age/currency and possible supersession were not re-fetched; do not treat the under-six-months skip-10C claim as independently verified current entitlement.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf
- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [forum] https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-035",
  "rejection_reason": "Form 10C pension withdrawal benefit claimed with less than six months' eligible service",
  "aliases": [
    "EPS not eligible",
    "Service less than 6 months",
    "Pension withdrawal not eligible",
    "Do not file Form 10C if EPS service under 6 months"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Official OCS FAQ Q4: Member's Total Service should be more than 6 months and less than 9.5 years in addition to Form 19 conditions for filing Pension Withdrawal Benefit Claim. ClearTax: service less than 6 months — generally cannot withdraw pension money.",
  "what_it_means": "EPS withdrawal benefit is not payable for very short service. Under 6 months, Form 10C cash-out is the wrong product. Members who join and leave quickly should only file Form 19 for the EPF (PF) portion. Filing 10C anyway yields rejection, sometimes with remarks about EPS eligibility or contribution mismatch.",
  "root_cause": "Composite claim defaulting both 19 and 10C; member unaware of 6-month EPS floor; service history understating months actually worked.",
  "how_detected": "System service calculation < 6 months. OCS eligibility for type 10C. Passbook EPS columns thin.",
  "fix_steps": [
    "Check total EPS service across all member IDs (not just last job).",
    "If truly under 6 months, file only Form 19; skip 10C.",
    "If you actually worked longer but history is short, get DOE/DOJ/ECR corrected first (epfo-rr-024, epfo-rr-029).",
    "If service is 9.5 years or more, do not use 10C cash-out (epfo-rr-036)."
  ],
  "required_documents": [
    "Service History",
    "Passbook showing EPS contributions"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "On the claim dropdown, select Only PF Withdrawal (Form 19) when EPS service is under 6 months."
  ],
  "related_reason_ids": [
    "epfo-rr-036",
    "epfo-rr-044",
    "epfo-rr-042"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/"
  ],
  "source_types": [
    "official",
    "blog",
    "forum"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q4 is the primary official source. Offline review flag: FAQ age/currency and possible supersession were not re-fetched; do not treat the under-six-months skip-10C claim as independently verified current entitlement.",
  "last_verified": "2026-09-12"
}
```
