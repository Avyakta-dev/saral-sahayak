# Claimant is not the nominee and does not qualify as family or legal heir under the scheme (epfo-rr-061)

> Dataset record `epfo-rr-061`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claimant is not the nominee and does not qualify as family or legal heir under the scheme

**Aliases:** Claimant not matching nominee, Wrong claimant, Relationship does not match nomination, Ineligible family member

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension
- **Severity:** critical
- **Official/common message status:** Form 5IF: EDLI is payable to persons entitled to PF accumulations, in the order nominee → family (with exclusions) → legal heir. Major son and married daughter with husband alive are excluded from 'family' for EDLI in the instruction text when there is no nomination.

## What it means

A brother, a married daughter (in some EDLI family definitions), or a friend cannot collect merely by producing the death certificate. If a nominee exists, a different relative's claim is rejected. If the nominee is dead or refuses, the file must be recast under family/legal-heir rules, not quietly paid to whoever applied first.

## Root cause

Wrong person applied; nomination outdated after divorce/remarriage; confusion between PF nominee and insurance nominee.

## How it is detected

Name vs Form 2. Relationship field. Succession papers absent.

## Fix

- Identify who is on the nomination. That person should apply.
- If nominee is minor, the guardian applies with guardianship certificate if not the natural guardian (epfo-rr-065).
- If no nomination, map eligible family per the specific scheme (EPF vs EPS vs EDLI definitions differ slightly).
- If you are a legal heir outside family definition, get succession certificate and apply as legal heir.
- Do not file competing claims from multiple relatives without a coordinated heirship document.

## Required documents

- Nomination copy
- Relationship proof (marriage/birth certificate)
- Succession certificate if legal heir

## Who acts

member

## Prevention

- Update nomination after marriage, divorce, or birth of children.

## Related records

- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-063](./epfo-rr-063.md)
- [epfo-rr-065](./epfo-rr-065.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Read Form 5IF family exclusions carefully; EPF Scheme family definition for Form 20 may not be identical in every clause.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf
- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/provident-fund/form-5if-guide
- [blog] https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-061",
  "rejection_reason": "Claimant is not the nominee and does not qualify as family or legal heir under the scheme",
  "aliases": [
    "Claimant not matching nominee",
    "Wrong claimant",
    "Relationship does not match nomination",
    "Ineligible family member"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension"
  ],
  "severity": "critical",
  "official_status_or_message": "Form 5IF: EDLI is payable to persons entitled to PF accumulations, in the order nominee → family (with exclusions) → legal heir. Major son and married daughter with husband alive are excluded from 'family' for EDLI in the instruction text when there is no nomination.",
  "what_it_means": "A brother, a married daughter (in some EDLI family definitions), or a friend cannot collect merely by producing the death certificate. If a nominee exists, a different relative's claim is rejected. If the nominee is dead or refuses, the file must be recast under family/legal-heir rules, not quietly paid to whoever applied first.",
  "root_cause": "Wrong person applied; nomination outdated after divorce/remarriage; confusion between PF nominee and insurance nominee.",
  "how_detected": "Name vs Form 2. Relationship field. Succession papers absent.",
  "fix_steps": [
    "Identify who is on the nomination. That person should apply.",
    "If nominee is minor, the guardian applies with guardianship certificate if not the natural guardian (epfo-rr-065).",
    "If no nomination, map eligible family per the specific scheme (EPF vs EPS vs EDLI definitions differ slightly).",
    "If you are a legal heir outside family definition, get succession certificate and apply as legal heir.",
    "Do not file competing claims from multiple relatives without a coordinated heirship document."
  ],
  "required_documents": [
    "Nomination copy",
    "Relationship proof (marriage/birth certificate)",
    "Succession certificate if legal heir"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Update nomination after marriage, divorce, or birth of children."
  ],
  "related_reason_ids": [
    "epfo-rr-060",
    "epfo-rr-063",
    "epfo-rr-065"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://kustodian.life/resources/provident-fund/form-5if-guide",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Read Form 5IF family exclusions carefully; EPF Scheme family definition for Form 20 may not be identical in every clause.",
  "last_verified": "2026-09-12"
}
```
