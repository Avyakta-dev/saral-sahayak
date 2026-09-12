# Widow/widower family pension stopped or reclaim raised after remarriage without proper notification path (epfo-rr-133)

> Dataset record `epfo-rr-133`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Widow/widower family pension stopped or reclaim raised after remarriage without proper notification path

**Aliases:** Pension stopped remarriage, Widow remarried pension discontinued, Family pension recovery after remarriage, Notify EPFO remarriage Form 10D, Widower pension ceased on remarriage

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** EPS family pension: widow/widower pension ceases on remarriage; child pension continues independently. Life certificate / marital status checks and Jeevan Pramaan can surface remarriage. Portal or RO may stop credit, reject restart claims, or seek recovery of overpaid widow pension.

## What it means

Unlike child pension, widow/widower pension is not lifelong after remarriage. Failure to notify EPFO can cause overpayment recovery and blocked credits. New claims to restart widow pension after remarriage are correctly rejected. Children under 25 should continue on their own PPO lines if already sanctioned.

## Root cause

Scheme rule that widow pension stops on remarriage; missing update of marital status; life-certificate mismatch; confusion that child pension also stops (it should not).

## How it is detected

Life certificate / marital status declaration. Bank credit stop. RO remarriage intimation. Recovery notice.

## Fix

- If remarried: notify jurisdictional RO in writing with remarriage proof; do not refile widow pension.
- Confirm child pensions remain active under separate beneficiary records until age 25 or disablement rules.
- If wrongly stopped while still unmarried: submit fresh life/marital-status certificate and EPFiGMS with PPO number.
- Clear any recovery demand with RO accounts before expecting resumed unrelated benefits.
- Keep Jeevan Pramaan / digital life certificate current annually.

## Required documents

- Remarriage certificate or affidavit if notifying stoppage
- Life certificate / Jeevan Pramaan if disputing stoppage
- PPO copy
- Child birth certificates if child pension continuity is at issue

## Who acts

mixed

## Prevention

- Inform EPFO promptly on remarriage to avoid recovery.
- File separate clarity for children's pensions when widow pension stops.

## Related records

- [epfo-rr-109](./epfo-rr-109.md)
- [epfo-rr-112](./epfo-rr-112.md)
- [epfo-rr-118](./epfo-rr-118.md)
- [epfo-rr-132](./epfo-rr-132.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Builds on epfo-rr-109 with explicit remarriage-stoppage and recovery edge; child continuity emphasised.

- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- https://jeevanpramaan.gov.in
- https://www.wealthpedia.in/eps-family-pension/
- https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-133",
  "rejection_reason": "Widow/widower family pension stopped or reclaim raised after remarriage without proper notification path",
  "aliases": [
    "Pension stopped remarriage",
    "Widow remarried pension discontinued",
    "Family pension recovery after remarriage",
    "Notify EPFO remarriage Form 10D",
    "Widower pension ceased on remarriage"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "EPS family pension: widow/widower pension ceases on remarriage; child pension continues independently. Life certificate / marital status checks and Jeevan Pramaan can surface remarriage. Portal or RO may stop credit, reject restart claims, or seek recovery of overpaid widow pension.",
  "what_it_means": "Unlike child pension, widow/widower pension is not lifelong after remarriage. Failure to notify EPFO can cause overpayment recovery and blocked credits. New claims to restart widow pension after remarriage are correctly rejected. Children under 25 should continue on their own PPO lines if already sanctioned.",
  "root_cause": "Scheme rule that widow pension stops on remarriage; missing update of marital status; life-certificate mismatch; confusion that child pension also stops (it should not).",
  "how_detected": "Life certificate / marital status declaration. Bank credit stop. RO remarriage intimation. Recovery notice.",
  "fix_steps": [
    "If remarried: notify jurisdictional RO in writing with remarriage proof; do not refile widow pension.",
    "Confirm child pensions remain active under separate beneficiary records until age 25 or disablement rules.",
    "If wrongly stopped while still unmarried: submit fresh life/marital-status certificate and EPFiGMS with PPO number.",
    "Clear any recovery demand with RO accounts before expecting resumed unrelated benefits.",
    "Keep Jeevan Pramaan / digital life certificate current annually."
  ],
  "required_documents": [
    "Remarriage certificate or affidavit if notifying stoppage",
    "Life certificate / Jeevan Pramaan if disputing stoppage",
    "PPO copy",
    "Child birth certificates if child pension continuity is at issue"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Inform EPFO promptly on remarriage to avoid recovery.",
    "File separate clarity for children's pensions when widow pension stops."
  ],
  "related_reason_ids": [
    "epfo-rr-109",
    "epfo-rr-112",
    "epfo-rr-118",
    "epfo-rr-132"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://jeevanpramaan.gov.in",
    "https://www.wealthpedia.in/eps-family-pension/",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "Builds on epfo-rr-109 with explicit remarriage-stoppage and recovery edge; child continuity emphasised.",
  "last_verified": "2026-09-12"
}
```
