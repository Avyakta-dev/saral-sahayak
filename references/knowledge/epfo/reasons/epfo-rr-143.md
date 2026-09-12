# Auto-transfer of EPF failed — exit not marked, KYC incomplete, or multi-account conditions unmet (epfo-rr-143)

> Dataset record `epfo-rr-143`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Auto-transfer of EPF failed — exit not marked, KYC incomplete, or multi-account conditions unmet

**Aliases:** Auto transfer not happened, Automatic PF transfer failed, One Member One EPF auto transfer pending, PF not auto transferred after joining, Auto transfer conditions not satisfied

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** EPFO auto-transfer after joining a new establishment typically needs prior DOE marked, KYC seeded/verified, same UAN reused, and system eligibility. If conditions fail, balance stays on old MID until manual Form 13. Members often call this a rejection though no claim was filed.

## What it means

Waiting forever for auto-transfer leaves corpus split and blocks clean Form 19/31 on full balance. Manual transfer is the fix path — different from employer-not-attesting a filed Form 13 (068).

## Root cause

Previous employer never marked exit; new UAN generated; Aadhaar/bank KYC pending; older-than-last MID not in auto scope.

## How it is detected

No transfer claim ID but balance still on old MID months after joining. Employer/HR saying auto will happen.

## Fix

- Confirm previous DOE on Service History; get employer to mark exit if blank.
- Ensure Aadhaar/PAN/Bank KYC Verified on UAN.
- Confirm same UAN was given to new employer (not a fresh UAN).
- If 4-6 weeks pass with no credit, file manual Form 13 / Online Transfer Request.
- For multiple old MIDs, file separate transfers (see 142).

## Required documents

- Service History
- KYC screenshot
- Joining proof with UAN

## Who acts

mixed

## Prevention

- Always share existing UAN at joining; never create a second UAN.
- Chase DOE in the resignation month.

## Related records

- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-068](./epfo-rr-068.md)
- [epfo-rr-142](./epfo-rr-142.md)
- [epfo-rr-010](./epfo-rr-010.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Auto-transfer behaviour documented in secondary explainers; portal remains authoritative.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary (news / blog / forum)

- [blog] https://investmentepfo.com/auto-transfer-of-epf-how-it-works-when-you-switch-jobs/
- [blog] https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- [news] https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-143",
  "rejection_reason": "Auto-transfer of EPF failed — exit not marked, KYC incomplete, or multi-account conditions unmet",
  "aliases": [
    "Auto transfer not happened",
    "Automatic PF transfer failed",
    "One Member One EPF auto transfer pending",
    "PF not auto transferred after joining",
    "Auto transfer conditions not satisfied"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "EPFO auto-transfer after joining a new establishment typically needs prior DOE marked, KYC seeded/verified, same UAN reused, and system eligibility. If conditions fail, balance stays on old MID until manual Form 13. Members often call this a rejection though no claim was filed.",
  "what_it_means": "Waiting forever for auto-transfer leaves corpus split and blocks clean Form 19/31 on full balance. Manual transfer is the fix path — different from employer-not-attesting a filed Form 13 (068).",
  "root_cause": "Previous employer never marked exit; new UAN generated; Aadhaar/bank KYC pending; older-than-last MID not in auto scope.",
  "how_detected": "No transfer claim ID but balance still on old MID months after joining. Employer/HR saying auto will happen.",
  "fix_steps": [
    "Confirm previous DOE on Service History; get employer to mark exit if blank.",
    "Ensure Aadhaar/PAN/Bank KYC Verified on UAN.",
    "Confirm same UAN was given to new employer (not a fresh UAN).",
    "If 4-6 weeks pass with no credit, file manual Form 13 / Online Transfer Request.",
    "For multiple old MIDs, file separate transfers (see 142)."
  ],
  "required_documents": [
    "Service History",
    "KYC screenshot",
    "Joining proof with UAN"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Always share existing UAN at joining; never create a second UAN.",
    "Chase DOE in the resignation month."
  ],
  "related_reason_ids": [
    "epfo-rr-024",
    "epfo-rr-068",
    "epfo-rr-142",
    "epfo-rr-010"
  ],
  "source_urls": [
    "https://investmentepfo.com/auto-transfer-of-epf-how-it-works-when-you-switch-jobs/",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "medium",
  "notes": "Auto-transfer behaviour documented in secondary explainers; portal remains authoritative.",
  "last_verified": "2026-09-12"
}
```
