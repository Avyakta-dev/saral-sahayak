# Claim or transfer attempted while multiple-UAN merge / deactivation is still in progress (epfo-rr-162)

> Dataset record `epfo-rr-162`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claim or transfer attempted while multiple-UAN merge / deactivation is still in progress

**Aliases:** UAN merge in progress claim rejected, Multiple UAN deactivation pending, Claim during UAN consolidation, uanepf merge not complete, Duplicate UAN linking pending claim

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 13 Transfer, Form 31 Partial Withdrawal/Advance, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Multiple UANs must be merged/deactivated (commonly via EPFO UAN support process) before clean One Member-One EPF Account transfers and settlements. Claims filed mid-merge see split service, Aadhaar-link conflicts, or rejects.

## What it means

Aadhaar can link to only one UAN. Merge-in-flight leaves identity and balances unstable. Distinct from completed multiple-UAN problem statement (046).

## Root cause

Member files claim immediately after emailing for UAN deactivation; backend not finished; Aadhaar still on old UAN.

## How it is detected

Aadhaar already linked errors. Service split across UANs. Support ticket open.

## Fix

- Complete UAN merge/deactivation correspondence; confirm only one active UAN holds Aadhaar.
- Transfer all MIDs into the surviving UAN.
- Verify KYC on surviving UAN.
- Then file settlement/advance once.
- Do not keep claiming on the UAN marked for deactivation.

## Required documents

- All UAN numbers
- Merge/deactivation email trail
- Aadhaar link status screenshots

## Who acts

mixed

## Prevention

- Never generate a second UAN; merge early in career.

## Related records

- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-011](./epfo-rr-011.md)
- [epfo-rr-142](./epfo-rr-142.md)
- [epfo-rr-005](./epfo-rr-005.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Merge process commonly referenced via uanepf support channel in secondary guides.

- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts
- https://www.pensionbazaar.com/epf/uan-aadhaar-link-issue/
- https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-162",
  "rejection_reason": "Claim or transfer attempted while multiple-UAN merge / deactivation is still in progress",
  "aliases": [
    "UAN merge in progress claim rejected",
    "Multiple UAN deactivation pending",
    "Claim during UAN consolidation",
    "uanepf merge not complete",
    "Duplicate UAN linking pending claim"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 13 Transfer",
    "Form 31 Partial Withdrawal/Advance",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Multiple UANs must be merged/deactivated (commonly via EPFO UAN support process) before clean One Member-One EPF Account transfers and settlements. Claims filed mid-merge see split service, Aadhaar-link conflicts, or rejects.",
  "what_it_means": "Aadhaar can link to only one UAN. Merge-in-flight leaves identity and balances unstable. Distinct from completed multiple-UAN problem statement (046).",
  "root_cause": "Member files claim immediately after emailing for UAN deactivation; backend not finished; Aadhaar still on old UAN.",
  "how_detected": "Aadhaar already linked errors. Service split across UANs. Support ticket open.",
  "fix_steps": [
    "Complete UAN merge/deactivation correspondence; confirm only one active UAN holds Aadhaar.",
    "Transfer all MIDs into the surviving UAN.",
    "Verify KYC on surviving UAN.",
    "Then file settlement/advance once.",
    "Do not keep claiming on the UAN marked for deactivation."
  ],
  "required_documents": [
    "All UAN numbers",
    "Merge/deactivation email trail",
    "Aadhaar link status screenshots"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Never generate a second UAN; merge early in career."
  ],
  "related_reason_ids": [
    "epfo-rr-046",
    "epfo-rr-011",
    "epfo-rr-142",
    "epfo-rr-005"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://zerodha.com/z-connect/varsity/epfo-claim-rejections-what-is-service-overlap-and-how-to-merge-pf-accounts",
    "https://www.pensionbazaar.com/epf/uan-aadhaar-link-issue/",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Merge process commonly referenced via uanepf support channel in secondary guides.",
  "last_verified": "2026-09-12"
}
```
