# Concurrent Form 31 advance and Form 19 final settlement conflict (epfo-rr-178)

> Dataset record `epfo-rr-178`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Concurrent Form 31 advance and Form 19 final settlement conflict

**Aliases:** Form 31 and Form 19 together rejected, Cannot file advance and final settlement same time, Partial and full withdrawal conflict, Form 19 blocked due to Form 31 pending, Simultaneous 31 and 19 claims

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Form 19 requires exit and waiting rules; Form 31 is typically an in-service advance. Filing both concurrently conflicts with employment-status logic and duplicate-claim controls. Portal rejects or returns one/both.

## What it means

Choose the life event: still employed needing purpose advance then Form 31; exited and eligible for settlement then Form 19 after waiting. Not both.

## Root cause

Misunderstanding composite forms; trying to drain balance twice; DOE marked while still wanting advance purposes.

## How it is detected

Two claim IDs. Remarks about not eligible / duplicate / still employed vs already exited.

## Fix

- Decide based on Service History employment status and DOE.
- Withdraw or wait out the inappropriate claim until Rejected.
- File only the correct form once.
- If DOE wrongly marked, get employer correction before Form 31.

## Required documents

- Service History
- Claim status screenshots

## Who acts

member

## Prevention

- Never submit 19 and 31 in the same week without reading Which Claim Form.

## Related records

- [epfo-rr-034](./epfo-rr-034.md)
- [epfo-rr-033](./epfo-rr-033.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Logic from official form matrix plus duplicate rules.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf

### Secondary (news / blog / forum)

- [blog] https://cleartax.in/c/pf-withdrawal-online
- [blog] https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-178",
  "rejection_reason": "Concurrent Form 31 advance and Form 19 final settlement conflict",
  "aliases": [
    "Form 31 and Form 19 together rejected",
    "Cannot file advance and final settlement same time",
    "Partial and full withdrawal conflict",
    "Form 19 blocked due to Form 31 pending",
    "Simultaneous 31 and 19 claims"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Form 19 requires exit and waiting rules; Form 31 is typically an in-service advance. Filing both concurrently conflicts with employment-status logic and duplicate-claim controls. Portal rejects or returns one/both.",
  "what_it_means": "Choose the life event: still employed needing purpose advance then Form 31; exited and eligible for settlement then Form 19 after waiting. Not both.",
  "root_cause": "Misunderstanding composite forms; trying to drain balance twice; DOE marked while still wanting advance purposes.",
  "how_detected": "Two claim IDs. Remarks about not eligible / duplicate / still employed vs already exited.",
  "fix_steps": [
    "Decide based on Service History employment status and DOE.",
    "Withdraw or wait out the inappropriate claim until Rejected.",
    "File only the correct form once.",
    "If DOE wrongly marked, get employer correction before Form 31."
  ],
  "required_documents": [
    "Service History",
    "Claim status screenshots"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never submit 19 and 31 in the same week without reading Which Claim Form."
  ],
  "related_reason_ids": [
    "epfo-rr-034",
    "epfo-rr-033",
    "epfo-rr-043",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/OCS_FAQ_Eligibility_102017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Logic from official form matrix plus duplicate rules.",
  "last_verified": "2026-09-12"
}
```
