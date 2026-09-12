# Name or date of birth mismatch between source and destination member IDs on Form 13 (epfo-rr-071)

> Dataset record `epfo-rr-071`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Name or date of birth mismatch between source and destination member IDs on Form 13

**Aliases:** Source destination mismatch, Member details mismatch on transfer, Different name on old PF account

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer
- **Severity:** high
- **Official/common message status:** Employer and source office compare member demographics before releasing transfer. MembersFAQ mismatch reasons apply. 25/04/2025 WSU circular (referenced by the overlap circular) puts responsibility on transferor offices to verify details for error-free transfer.

## What it means

Old PF may be in maiden name or a misspelling. The destination UAN is Aadhaar-correct. Transfer engines flag two different people. You must correct the source profile (JD with that old establishment or closed-establishment path) so both IDs look like the same human, then refile Form 13.

## Root cause

Maiden vs married name; DOB typo on old account; two people accidentally linked.

## How it is detected

Transfer rejection on member details. Visual mismatch of names on two member IDs.

## Fix

- Correct the incorrect ID via JD (present employer cannot always edit another establishment's member ID — SOP 5.2).
- If old establishment exists, they must authenticate that JD.
- If closed, use FO closed-establishment JD, then retry Form 13.
- Do not 'force' transfer with mismatched identity; that is a fraud control.

## Required documents

- Aadhaar
- Old and new profile printouts
- JD proofs
- Marriage certificate if maiden name

## Who acts

mixed

## Prevention

- Fix old account names before initiating Form 13.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-068](./epfo-rr-068.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** WSU/Amendments in IT, 1961/E-33306/2025-26/21 dated 25/04/2025 is referenced, not independently fetched.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO OTCP Members FAQ (employer rejection reasons, 15-day printout) — https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- **[circular]** SOP Joint Declaration JD/2022/1 (WSU PDF) — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary reporting (news, blog, forum)

- **[news]** StaffNews: full text overlap circular 20 May 2025 — https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html
- **[news]** Mint: EPF transfer errors before resigning — https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-071",
  "rejection_reason": "Name or date of birth mismatch between source and destination member IDs on Form 13",
  "aliases": [
    "Source destination mismatch",
    "Member details mismatch on transfer",
    "Different name on old PF account"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer"
  ],
  "severity": "high",
  "official_status_or_message": "Employer and source office compare member demographics before releasing transfer. MembersFAQ mismatch reasons apply. 25/04/2025 WSU circular (referenced by the overlap circular) puts responsibility on transferor offices to verify details for error-free transfer.",
  "what_it_means": "Old PF may be in maiden name or a misspelling. The destination UAN is Aadhaar-correct. Transfer engines flag two different people. You must correct the source profile (JD with that old establishment or closed-establishment path) so both IDs look like the same human, then refile Form 13.",
  "root_cause": "Maiden vs married name; DOB typo on old account; two people accidentally linked.",
  "how_detected": "Transfer rejection on member details. Visual mismatch of names on two member IDs.",
  "fix_steps": [
    "Correct the incorrect ID via JD (present employer cannot always edit another establishment's member ID — SOP 5.2).",
    "If old establishment exists, they must authenticate that JD.",
    "If closed, use FO closed-establishment JD, then retry Form 13.",
    "Do not 'force' transfer with mismatched identity; that is a fraud control."
  ],
  "required_documents": [
    "Aadhaar",
    "Old and new profile printouts",
    "JD proofs",
    "Marriage certificate if maiden name"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Fix old account names before initiating Form 13."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-002",
    "epfo-rr-013",
    "epfo-rr-068"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://www.staffnews.in/2025/06/simplification-of-transfer-claim-process.html",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "high",
  "notes": "WSU/Amendments in IT, 1961/E-33306/2025-26/21 dated 25/04/2025 is referenced, not independently fetched.",
  "last_verified": "2026-09-12"
}
```
