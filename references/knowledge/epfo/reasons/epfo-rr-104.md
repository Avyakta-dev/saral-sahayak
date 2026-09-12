# Composite Form 19+10C claim partially rejected or mistimed (one component fails) (epfo-rr-104)

> Dataset record `epfo-rr-104`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Composite Form 19+10C claim partially rejected or mistimed (one component fails)

**Aliases:** Form 19 approved 10C rejected, Composite claim partial rejection, Only PF withdrawal succeeded pension failed, 10C rejected with Form 19 settled

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** ClearTax/PFBalanceCheck and OCS FAQ: online claims often allow PF-only or PF+pension withdrawal. Service bands for 10C cause 10C portion to fail while Form 19 may still settle. Reddit EPS threads report 10C rejects alongside PF claims.

## What it means

Members see PF money credit but pension component reject (or vice versa). Refiling entire composite without fixing EPS eligibility wastes time. Fix path is component-specific.

## Root cause

EPS service band wrong; EPS contributions missing; composite default including 10C.

## How it is detected

Track Claim shows different outcomes per component.

## Fix

- Read which component failed — 19 vs 10C.
- If 10C failed for service under 6 months, stop 10C; keep Form 19 result.
- If 10+ years, file scheme certificate / later 10D instead of 10C cash.
- Refile only the failed component after correction; avoid duplicate PF claim.

## Required documents

- Track Claim screenshots both components
- Service History
- Passbook

## Who acts

member

## Prevention

- On first filing choose PF-only when EPS clearly out of band.

## Related records

- [epfo-rr-035](./epfo-rr-035.md)
- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[forum]** Reddit r/epfoindia: EPS contribution not available — https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-104",
  "rejection_reason": "Composite Form 19+10C claim partially rejected or mistimed (one component fails)",
  "aliases": [
    "Form 19 approved 10C rejected",
    "Composite claim partial rejection",
    "Only PF withdrawal succeeded pension failed",
    "10C rejected with Form 19 settled"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "ClearTax/PFBalanceCheck and OCS FAQ: online claims often allow PF-only or PF+pension withdrawal. Service bands for 10C cause 10C portion to fail while Form 19 may still settle. Reddit EPS threads report 10C rejects alongside PF claims.",
  "what_it_means": "Members see PF money credit but pension component reject (or vice versa). Refiling entire composite without fixing EPS eligibility wastes time. Fix path is component-specific.",
  "root_cause": "EPS service band wrong; EPS contributions missing; composite default including 10C.",
  "how_detected": "Track Claim shows different outcomes per component.",
  "fix_steps": [
    "Read which component failed — 19 vs 10C.",
    "If 10C failed for service under 6 months, stop 10C; keep Form 19 result.",
    "If 10+ years, file scheme certificate / later 10D instead of 10C cash.",
    "Refile only the failed component after correction; avoid duplicate PF claim."
  ],
  "required_documents": [
    "Track Claim screenshots both components",
    "Service History",
    "Passbook"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "On first filing choose PF-only when EPS clearly out of band."
  ],
  "related_reason_ids": [
    "epfo-rr-035",
    "epfo-rr-036",
    "epfo-rr-043",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "official",
    "blog",
    "forum"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
