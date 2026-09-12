# Unemployment/exit claim rejected because PF and EPS are still being deposited by employer (epfo-rr-098)

> Dataset record `epfo-rr-098`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Unemployment/exit claim rejected because PF and EPS are still being deposited by employer

**Aliases:** PF and EPS being deposited by the employers, Contribution still being received, Employer still filing ECR claim rejected, Active contribution blocks unemployment advance

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** high
- **Official/common message status:** Reddit r/EPFO: Form 31 advance for continuous unemployment rejected with pf and eps being deposited by the employers even when member believes last deposit was exit month.

## What it means

System treats ongoing ECR as proof the member is not in a non-contribution/unemployment state. May be delayed ECR, wrong active MID, or true continued employment. Fix differs from one-off post-exit clarification when deposits keep appearing.

## Root cause

Delayed ECR; contractor still covering member; wrong MID active; DOE not recognised.

## How it is detected

Remark about PF/EPS being deposited. Passbook new rows after claimed exit.

## Fix

- Check passbook for any credit after intended exit.
- If employment truly ended, have employer stop ECR and confirm DOE.
- If a ghost MID is receiving ECR, delink/correct.
- Only refile unemployment/Form 19 after contributions stop and waiting rules met.

## Required documents

- Passbook
- Employer confirmation ECR stopped
- Service History

## Who acts

mixed

## Prevention

- Verify no establishment still lists you as active before unemployment claims.

## Related records

- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-097](./epfo-rr-097.md)
- [epfo-rr-034](./epfo-rr-034.md)
- [epfo-rr-051](./epfo-rr-051.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** forum, blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[forum]** Reddit: PF and EPS being deposited by employers — https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/
- **[forum]** Reddit: Form 31 unemployment insufficient service — https://www.reddit.com/r/epfoindia/comments/1mdyhcm/epfo_claim_rejected_form_31/
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-098",
  "rejection_reason": "Unemployment/exit claim rejected because PF and EPS are still being deposited by employer",
  "aliases": [
    "PF and EPS being deposited by the employers",
    "Contribution still being received",
    "Employer still filing ECR claim rejected",
    "Active contribution blocks unemployment advance"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "Reddit r/EPFO: Form 31 advance for continuous unemployment rejected with pf and eps being deposited by the employers even when member believes last deposit was exit month.",
  "what_it_means": "System treats ongoing ECR as proof the member is not in a non-contribution/unemployment state. May be delayed ECR, wrong active MID, or true continued employment. Fix differs from one-off post-exit clarification when deposits keep appearing.",
  "root_cause": "Delayed ECR; contractor still covering member; wrong MID active; DOE not recognised.",
  "how_detected": "Remark about PF/EPS being deposited. Passbook new rows after claimed exit.",
  "fix_steps": [
    "Check passbook for any credit after intended exit.",
    "If employment truly ended, have employer stop ECR and confirm DOE.",
    "If a ghost MID is receiving ECR, delink/correct.",
    "Only refile unemployment/Form 19 after contributions stop and waiting rules met."
  ],
  "required_documents": [
    "Passbook",
    "Employer confirmation ECR stopped",
    "Service History"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Verify no establishment still lists you as active before unemployment claims."
  ],
  "related_reason_ids": [
    "epfo-rr-090",
    "epfo-rr-097",
    "epfo-rr-034",
    "epfo-rr-051"
  ],
  "source_urls": [
    "https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/",
    "https://www.reddit.com/r/epfoindia/comments/1mdyhcm/epfo_claim_rejected_form_31/",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "forum",
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
