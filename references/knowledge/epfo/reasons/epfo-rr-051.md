# Wrong Member ID selected or unknown Member ID linked under the UAN (epfo-rr-051)

> Dataset record `epfo-rr-051`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Wrong Member ID selected or unknown Member ID linked under the UAN

**Aliases:** Wrong Member ID, Unknown employer linked, Incorrect member ID, Delink member ID

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Service History can show multiple member IDs. Selecting the wrong one, or having a mistakenly linked ID, produces wrong office, wrong DOE, or overlap. Practitioner guides describe delinking a wrong member ID from UAN.

## What it means

UAN is the umbrella; Member ID is the establishment-specific account. A claim settled against a member ID with zero balance, or an ID that still looks employed, fails. A stranger's member ID linked by UAN seeding error is a serious KYC incident.

## Root cause

Employer seeded wrong UAN; member picked first ID in a dropdown; old contractor ID never closed.

## How it is detected

Service History unknown establishment. Claim office mismatch. Overlap with a job you never had.

## Fix

- List member IDs vs actual employers from payslips.
- Ask EPFO/employer to delink a truly wrong ID (portal delink if offered, else EPFiGMS).
- File the claim against the last genuine member ID with DOE.
- Transfer genuine old IDs rather than delinking them.

## Required documents

- Payslips proving actual employers
- UAN card
- EPFiGMS if delink needed

## Who acts

mixed

## Prevention

- At each job, confirm the new member ID appears and that no unknown ID is added.

## Related records

- [epfo-rr-041](./epfo-rr-041.md)
- [epfo-rr-046](./epfo-rr-046.md)
- [epfo-rr-034](./epfo-rr-034.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Delink UI labels vary; do not invent a delink circular number.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[news]** Mint: wrong service history — https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-051",
  "rejection_reason": "Wrong Member ID selected or unknown Member ID linked under the UAN",
  "aliases": [
    "Wrong Member ID",
    "Unknown employer linked",
    "Incorrect member ID",
    "Delink member ID"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Service History can show multiple member IDs. Selecting the wrong one, or having a mistakenly linked ID, produces wrong office, wrong DOE, or overlap. Practitioner guides describe delinking a wrong member ID from UAN.",
  "what_it_means": "UAN is the umbrella; Member ID is the establishment-specific account. A claim settled against a member ID with zero balance, or an ID that still looks employed, fails. A stranger's member ID linked by UAN seeding error is a serious KYC incident.",
  "root_cause": "Employer seeded wrong UAN; member picked first ID in a dropdown; old contractor ID never closed.",
  "how_detected": "Service History unknown establishment. Claim office mismatch. Overlap with a job you never had.",
  "fix_steps": [
    "List member IDs vs actual employers from payslips.",
    "Ask EPFO/employer to delink a truly wrong ID (portal delink if offered, else EPFiGMS).",
    "File the claim against the last genuine member ID with DOE.",
    "Transfer genuine old IDs rather than delinking them."
  ],
  "required_documents": [
    "Payslips proving actual employers",
    "UAN card",
    "EPFiGMS if delink needed"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "At each job, confirm the new member ID appears and that no unknown ID is added."
  ],
  "related_reason_ids": [
    "epfo-rr-041",
    "epfo-rr-046",
    "epfo-rr-034"
  ],
  "source_urls": [
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "medium",
  "notes": "Delink UI labels vary; do not invent a delink circular number.",
  "last_verified": "2026-09-12"
}
```
