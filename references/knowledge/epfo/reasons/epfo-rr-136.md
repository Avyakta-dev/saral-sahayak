# Dependent parents Form 10D pension rejected when spouse or eligible children still exist or dependency unproven (epfo-rr-136)

> Dataset record `epfo-rr-136`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Dependent parents Form 10D pension rejected when spouse or eligible children still exist or dependency unproven

**Aliases:** Parent pension EPS rejected, Dependent father mother Form 10D, No widow no children parent pension, Dependency proof missing parents pension, Parents claiming family pension wrongly

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension, Form 20 Death PF Settlement
- **Severity:** high
- **Official/common message status:** EPS priority for family pension typically runs widow/widower, then children, then dependent parents if no other eligible family. Parent claims fail when a spouse or eligible child exists, or when financial dependency is not evidenced.

## What it means

Parents cannot leapfrog a living widow or eligible children. Even when priority is clear, ROs ask for dependency declarations and proof that no higher-priority beneficiary exists. Distinct from nominee-vs-family fights on Form 20 PF corpus.

## Root cause

Wrong priority understanding; surviving spouse not disclosed; weak dependency evidence; confusion between EPF nominee and EPS family definition.

## How it is detected

Family matrix on Form 10D. Existence of widow/children in UAN family details. RO interview/documents.

## Fix

- Confirm no surviving spouse and no eligible children under scheme rules.
- Submit dependency affidavit and supporting income/dependence proofs as RO lists.
- If a widow/child exists, those beneficiaries must claim; parents are not the Form 10D claimants.
- For PF accumulations (Form 20), follow nomination/legal-heir path separately from EPS parents pension.

## Required documents

- Death certificate of member
- Affidavit of no surviving spouse/eligible children
- Dependency proof
- Parents' Aadhaar and bank KYC

## Who acts

mixed

## Prevention

- Members should keep accurate family details so priority is clear.
- Do not file parent pension in parallel with widow pension.

## Related records

- [epfo-rr-061](./epfo-rr-061.md)
- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-132](./epfo-rr-132.md)
- [epfo-rr-060](./epfo-rr-060.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Priority order summarised from EPS family-pension explainers; RO may ask extra dependency proof.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://www.wealthpedia.in/eps-family-pension/
- [blog] https://kustodian.life/resources/epf-death-claim-process-india
- [blog] https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-136",
  "rejection_reason": "Dependent parents Form 10D pension rejected when spouse or eligible children still exist or dependency unproven",
  "aliases": [
    "Parent pension EPS rejected",
    "Dependent father mother Form 10D",
    "No widow no children parent pension",
    "Dependency proof missing parents pension",
    "Parents claiming family pension wrongly"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "Form 20 Death PF Settlement"
  ],
  "severity": "high",
  "official_status_or_message": "EPS priority for family pension typically runs widow/widower, then children, then dependent parents if no other eligible family. Parent claims fail when a spouse or eligible child exists, or when financial dependency is not evidenced.",
  "what_it_means": "Parents cannot leapfrog a living widow or eligible children. Even when priority is clear, ROs ask for dependency declarations and proof that no higher-priority beneficiary exists. Distinct from nominee-vs-family fights on Form 20 PF corpus.",
  "root_cause": "Wrong priority understanding; surviving spouse not disclosed; weak dependency evidence; confusion between EPF nominee and EPS family definition.",
  "how_detected": "Family matrix on Form 10D. Existence of widow/children in UAN family details. RO interview/documents.",
  "fix_steps": [
    "Confirm no surviving spouse and no eligible children under scheme rules.",
    "Submit dependency affidavit and supporting income/dependence proofs as RO lists.",
    "If a widow/child exists, those beneficiaries must claim; parents are not the Form 10D claimants.",
    "For PF accumulations (Form 20), follow nomination/legal-heir path separately from EPS parents pension."
  ],
  "required_documents": [
    "Death certificate of member",
    "Affidavit of no surviving spouse/eligible children",
    "Dependency proof",
    "Parents' Aadhaar and bank KYC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Members should keep accurate family details so priority is clear.",
    "Do not file parent pension in parallel with widow pension."
  ],
  "related_reason_ids": [
    "epfo-rr-061",
    "epfo-rr-064",
    "epfo-rr-132",
    "epfo-rr-060"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.wealthpedia.in/eps-family-pension/",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://righttoinformation.wiki/epf-death-claim-without-nominee-legal-heir-india"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Priority order summarised from EPS family-pension explainers; RO may ask extra dependency proof.",
  "last_verified": "2026-09-12"
}
```
