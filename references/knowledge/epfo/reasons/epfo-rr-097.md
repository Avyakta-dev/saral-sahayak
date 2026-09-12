# Claim rejected because contribution received after date of exit (post-exit ECR) (epfo-rr-097)

> Dataset record `epfo-rr-097`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Claim rejected because contribution received after date of exit (post-exit ECR)

**Aliases:** CONTRIBUTION RECEIVED AFTER DATE OF EXIT, PLEASE CLARIFY, Contribution after DOE, Post exit PF deposit flagged, ECR after leaving employment, Contribution received after date of exit, Post exit ECR claim rejected, PF deposited after leaving

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Reddit r/epfoindia: Form 31 unemployment rejected with exact remark CONTRIBUTION RECEIVED AFTER DATE OF EXIT, PLEASE CLARIFY when March wages PF posted in April after DOE. Payroll timing, not necessarily illegal dual employment.

## What it means

EPFO sees a contribution chronologically after DOE and demands clarification before settling unemployment or exit-linked claims. Distinct from still employed and from missing DOE.

## Root cause

Final-month salary PF filed in next calendar month; DOE earlier than contribution month; employer mistake.

## How it is detected

Exact Track Claim / query remark about contribution after exit.

## Fix

- Get employer letter stating post-DOE credit relates to wages earned on or before DOE.
- Submit via EPFiGMS / RO with claim ID and passbook screenshot.
- Do not change DOE falsely; clarify wage month instead.
- After clarification acceptance, refile once.

## Required documents

- Employer clarification letter
- Passbook showing contribution month
- Relieving letter / DOE proof

## Who acts

mixed

## Prevention

- Ask payroll to map wage month vs ECR month before exit claims.

## Related records

- [epfo-rr-090](./epfo-rr-090.md)
- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-098](./epfo-rr-098.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** forum, official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Remark string from member reports; not an invented official code.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://epfigms.gov.in/

### Secondary (news / blog / forum)

- [forum] https://www.reddit.com/r/epfoindia/comments/1lwzhcs/my_epfo_claim_got_rejected_form31_after_16_days/
- [forum] https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/
- [blog] https://pfbalancecheck.com/epfo-claim-rejected-reason/
- [blog] https://cleartax.in/s/epf-form-31

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-097",
  "rejection_reason": "Claim rejected because contribution received after date of exit (post-exit ECR)",
  "aliases": [
    "CONTRIBUTION RECEIVED AFTER DATE OF EXIT, PLEASE CLARIFY",
    "Contribution after DOE",
    "Post exit PF deposit flagged",
    "ECR after leaving employment",
    "Contribution received after date of exit",
    "Post exit ECR claim rejected",
    "PF deposited after leaving"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Reddit r/epfoindia: Form 31 unemployment rejected with exact remark CONTRIBUTION RECEIVED AFTER DATE OF EXIT, PLEASE CLARIFY when March wages PF posted in April after DOE. Payroll timing, not necessarily illegal dual employment.",
  "what_it_means": "EPFO sees a contribution chronologically after DOE and demands clarification before settling unemployment or exit-linked claims. Distinct from still employed and from missing DOE.",
  "root_cause": "Final-month salary PF filed in next calendar month; DOE earlier than contribution month; employer mistake.",
  "how_detected": "Exact Track Claim / query remark about contribution after exit.",
  "fix_steps": [
    "Get employer letter stating post-DOE credit relates to wages earned on or before DOE.",
    "Submit via EPFiGMS / RO with claim ID and passbook screenshot.",
    "Do not change DOE falsely; clarify wage month instead.",
    "After clarification acceptance, refile once."
  ],
  "required_documents": [
    "Employer clarification letter",
    "Passbook showing contribution month",
    "Relieving letter / DOE proof"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Ask payroll to map wage month vs ECR month before exit claims."
  ],
  "related_reason_ids": [
    "epfo-rr-090",
    "epfo-rr-024",
    "epfo-rr-029",
    "epfo-rr-098"
  ],
  "source_urls": [
    "https://www.reddit.com/r/epfoindia/comments/1lwzhcs/my_epfo_claim_got_rejected_form31_after_16_days/",
    "https://www.reddit.com/r/EPFO/comments/1smfaow/claim_got_rejected_saying_pf_and_eps_being/",
    "https://epfigms.gov.in/",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://cleartax.in/s/epf-form-31"
  ],
  "source_types": [
    "forum",
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Remark string from member reports; not an invented official code.",
  "last_verified": "2026-09-12"
}
```
