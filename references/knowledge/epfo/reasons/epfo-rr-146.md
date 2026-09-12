# PF transferred or credited to wrong member ID under the UAN (epfo-rr-146)

> Dataset record `epfo-rr-146`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** PF transferred or credited to wrong member ID under the UAN

**Aliases:** PF transferred to wrong member ID, Credit in incorrect MID, Transfer wrong destination member ID, Balance showing under unknown member ID, Mis-credited PF transfer

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, Form 19 PF Final Settlement, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** Transfers can post to an incorrect member ID when the wrong destination is selected or backend mapping errs. Passbook then shows credit on an unexpected MID; claims on the intended MID fail for insufficient balance.

## What it means

Funds are still under the member's UAN but on the wrong establishment account. Correction needs RO re-credit/re-transfer — not a fresh employer contribution.

## Root cause

Wrong MID chosen in Form 13; multiple similar establishment codes; clerical mapping error.

## How it is detected

Passbook comparison across MIDs. Settled transfer with unexpected destination. Employer HR confirmation.

## Fix

- Document UAN, correct MID, wrong MID, amounts, and claim ID.
- Email/HR ticket to attesting employer with screenshots.
- EPFiGMS requesting correction of mis-credit and transfer to the intended MID.
- Avoid filing Form 19 on the wrong MID unless that is intentionally the consolidation target.
- RTI for transfer file if grievance stalls.

## Required documents

- Passbook screenshots all MIDs
- Transfer claim details
- Establishment code proofs

## Who acts

EPFO_office

## Prevention

- Double-check destination MID in the transfer dropdown against Service History.
- Prefer consolidating into the currently active employment MID.

## Related records

- [epfo-rr-051](./epfo-rr-051.md)
- [epfo-rr-144](./epfo-rr-144.md)
- [epfo-rr-142](./epfo-rr-142.md)
- [epfo-rr-072](./epfo-rr-072.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** RTI Wiki practical guide on wrong-MID transfer.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFiGMS grievance portal — https://epfigms.gov.in/
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** RTI Wiki: PF transferred to wrong member ID — https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction
- **[blog]** Kustodian: Form 13 guide — https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- **[blog]** CitizenNest: Form 13 transfer rejected — https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-146",
  "rejection_reason": "PF transferred or credited to wrong member ID under the UAN",
  "aliases": [
    "PF transferred to wrong member ID",
    "Credit in incorrect MID",
    "Transfer wrong destination member ID",
    "Balance showing under unknown member ID",
    "Mis-credited PF transfer"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "Form 19 PF Final Settlement",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Transfers can post to an incorrect member ID when the wrong destination is selected or backend mapping errs. Passbook then shows credit on an unexpected MID; claims on the intended MID fail for insufficient balance.",
  "what_it_means": "Funds are still under the member's UAN but on the wrong establishment account. Correction needs RO re-credit/re-transfer — not a fresh employer contribution.",
  "root_cause": "Wrong MID chosen in Form 13; multiple similar establishment codes; clerical mapping error.",
  "how_detected": "Passbook comparison across MIDs. Settled transfer with unexpected destination. Employer HR confirmation.",
  "fix_steps": [
    "Document UAN, correct MID, wrong MID, amounts, and claim ID.",
    "Email/HR ticket to attesting employer with screenshots.",
    "EPFiGMS requesting correction of mis-credit and transfer to the intended MID.",
    "Avoid filing Form 19 on the wrong MID unless that is intentionally the consolidation target.",
    "RTI for transfer file if grievance stalls."
  ],
  "required_documents": [
    "Passbook screenshots all MIDs",
    "Transfer claim details",
    "Establishment code proofs"
  ],
  "who_acts": "EPFO_office",
  "prevention_tips": [
    "Double-check destination MID in the transfer dropdown against Service History.",
    "Prefer consolidating into the currently active employment MID."
  ],
  "related_reason_ids": [
    "epfo-rr-051",
    "epfo-rr-144",
    "epfo-rr-142",
    "epfo-rr-072"
  ],
  "source_urls": [
    "https://righttoinformation.wiki/practical-guides/pf-transferred-to-wrong-member-id-correction",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix",
    "https://epfigms.gov.in/",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "RTI Wiki practical guide on wrong-MID transfer.",
  "last_verified": "2026-09-12"
}
```
