# Date of joining (DOJ) missing or incorrect in EPFO database (epfo-rr-025)

> Dataset record `epfo-rr-025`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Date of joining (DOJ) missing or incorrect in EPFO database

**Aliases:** Date of joining not available, DOJ missing, Joining date mismatch

## Classification

- **Category:** Employer_Related
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** OCS FAQ: Date of Joining must be available for Form 19; Form 31 requires Date of Joining in the EPFO database. JD SOP lists Date of Joining as a correctable parameter.

## What it means

Missing DOJ breaks service-length calculations used for Form 31 eligibility, Form 10C/10D pensionable service, and Form 19 continuity. A wrong DOJ can create overlapping service with a previous employer. Form 31 online will not proceed if DOJ is absent.

## Root cause

Employer filed ECR without complete member profile; mid-month joining not captured; data loss in UAN seeding from old member ID.

## How it is detected

Service History DOJ blank or obviously wrong versus appointment letter. Form 31 eligibility fail.

## Fix

- Compare appointment letter with Service History.
- Ask employer to correct DOJ in the employer portal / file JD for Date of Joining with attendance/appointment proofs (SOP Annexure-E).
- If overlap is created by the correction, handle overlap (epfo-rr-041) rather than leaving a false DOJ.
- Refile after Service History shows the correct DOJ.

## Required documents

- Appointment letter
- Attendance/employee register extract
- Employer letter with ECR of the joining period

## Who acts

mixed

## Prevention

- On joining, verify DOJ in the UAN portal within the first contribution month.

## Related records

- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-039](./epfo-rr-039.md)
- [epfo-rr-041](./epfo-rr-041.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** OCS FAQ Q3 and Q5.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[circular]** SOP Joint Declaration JD/2022/1 (WSU PDF) — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary reporting (news, blog, forum)

- **[news]** TaxGuru: Joint Declaration SOP 22 Aug 2023 — https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- **[news]** Mint: wrong service history — https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-025",
  "rejection_reason": "Date of joining (DOJ) missing or incorrect in EPFO database",
  "aliases": [
    "Date of joining not available",
    "DOJ missing",
    "Joining date mismatch"
  ],
  "category": "Employer_Related",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "OCS FAQ: Date of Joining must be available for Form 19; Form 31 requires Date of Joining in the EPFO database. JD SOP lists Date of Joining as a correctable parameter.",
  "what_it_means": "Missing DOJ breaks service-length calculations used for Form 31 eligibility, Form 10C/10D pensionable service, and Form 19 continuity. A wrong DOJ can create overlapping service with a previous employer. Form 31 online will not proceed if DOJ is absent.",
  "root_cause": "Employer filed ECR without complete member profile; mid-month joining not captured; data loss in UAN seeding from old member ID.",
  "how_detected": "Service History DOJ blank or obviously wrong versus appointment letter. Form 31 eligibility fail.",
  "fix_steps": [
    "Compare appointment letter with Service History.",
    "Ask employer to correct DOJ in the employer portal / file JD for Date of Joining with attendance/appointment proofs (SOP Annexure-E).",
    "If overlap is created by the correction, handle overlap (epfo-rr-041) rather than leaving a false DOJ.",
    "Refile after Service History shows the correct DOJ."
  ],
  "required_documents": [
    "Appointment letter",
    "Attendance/employee register extract",
    "Employer letter with ECR of the joining period"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "On joining, verify DOJ in the UAN portal within the first contribution month."
  ],
  "related_reason_ids": [
    "epfo-rr-024",
    "epfo-rr-039",
    "epfo-rr-041"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "high",
  "notes": "OCS FAQ Q3 and Q5.",
  "last_verified": "2026-09-12"
}
```
