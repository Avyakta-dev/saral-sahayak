# Form 13 transfer rejected with remark to update EPS date of joining and date of exit (epfo-rr-145)

> Dataset record `epfo-rr-145`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 13 transfer rejected with remark to update EPS date of joining and date of exit

**Aliases:** PLZ UPDATE EPS DOJ AND DOE, Update EPS DOJ DOE transfer rejected, EPS dates missing Form 13, Pension DOJ DOE not updated transfer, Transfer claim EPS service dates

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Forum-reported transfer rejection remark: update EPS DOJ and DOE. Even when Service History shows EPF dates, EPS-specific joining/exit fields may be blank or inconsistent, blocking One Member-One EPF Account transfers.

## What it means

Employer must correct EPS membership dates in the establishment database/JD path. Member-side refiling alone fails. Distinct from generic overlap reject (070) and name mismatch (071).

## Root cause

EPS DOJ/DOE never captured at onboarding; Form 11 EPS tick without dates; employer payroll-PF disconnect.

## How it is detected

Track Transfer Claim remark text. Service History EPF vs EPS columns.

## Fix

- Ask the relevant employer (often previous) to update EPS DOJ and DOE in EPFO.
- If dates are wrong, use Joint Declaration parameters for DOJ/DOE/reason of leaving as SOP allows.
- Confirm EPS dates appear on Service History, then refile Form 13 once.
- If employer closed, approach RO with physical documents for date correction.
- EPFiGMS quoting the exact remark if employer claims dates already updated but reject persists.

## Required documents

- Service History screenshot
- Appointment/relieving letters
- JD/employer correction proof

## Who acts

employer

## Prevention

- At joining, ensure Form 11 EPS section and portal dates are complete.
- Verify Service History after each exit is marked.

## Related records

- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-025](./epfo-rr-025.md)
- [epfo-rr-044](./epfo-rr-044.md)
- [epfo-rr-068](./epfo-rr-068.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** forum, blog, circular, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Remark string commonly reported on Reddit r/epfoindia; employer update is the fix.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[circular]** SOP Joint Declaration JD/2022/1 (WSU PDF) — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[forum]** Reddit: raised a claim before transfer — https://www.reddit.com/r/epfoindia/comments/1tm7e94/raised_a_claim_before_transfer/
- **[blog]** Kustodian: Form 13 guide — https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- **[news]** Mint: wrong service history — https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-145",
  "rejection_reason": "Form 13 transfer rejected with remark to update EPS date of joining and date of exit",
  "aliases": [
    "PLZ UPDATE EPS DOJ AND DOE",
    "Update EPS DOJ DOE transfer rejected",
    "EPS dates missing Form 13",
    "Pension DOJ DOE not updated transfer",
    "Transfer claim EPS service dates"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Forum-reported transfer rejection remark: update EPS DOJ and DOE. Even when Service History shows EPF dates, EPS-specific joining/exit fields may be blank or inconsistent, blocking One Member-One EPF Account transfers.",
  "what_it_means": "Employer must correct EPS membership dates in the establishment database/JD path. Member-side refiling alone fails. Distinct from generic overlap reject (070) and name mismatch (071).",
  "root_cause": "EPS DOJ/DOE never captured at onboarding; Form 11 EPS tick without dates; employer payroll-PF disconnect.",
  "how_detected": "Track Transfer Claim remark text. Service History EPF vs EPS columns.",
  "fix_steps": [
    "Ask the relevant employer (often previous) to update EPS DOJ and DOE in EPFO.",
    "If dates are wrong, use Joint Declaration parameters for DOJ/DOE/reason of leaving as SOP allows.",
    "Confirm EPS dates appear on Service History, then refile Form 13 once.",
    "If employer closed, approach RO with physical documents for date correction.",
    "EPFiGMS quoting the exact remark if employer claims dates already updated but reject persists."
  ],
  "required_documents": [
    "Service History screenshot",
    "Appointment/relieving letters",
    "JD/employer correction proof"
  ],
  "who_acts": "employer",
  "prevention_tips": [
    "At joining, ensure Form 11 EPS section and portal dates are complete.",
    "Verify Service History after each exit is marked."
  ],
  "related_reason_ids": [
    "epfo-rr-024",
    "epfo-rr-025",
    "epfo-rr-044",
    "epfo-rr-068"
  ],
  "source_urls": [
    "https://www.reddit.com/r/epfoindia/comments/1tm7e94/raised_a_claim_before_transfer/",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html"
  ],
  "source_types": [
    "forum",
    "blog",
    "circular",
    "official"
  ],
  "confidence": "high",
  "notes": "Remark string commonly reported on Reddit r/epfoindia; employer update is the fix.",
  "last_verified": "2026-09-12"
}
```
