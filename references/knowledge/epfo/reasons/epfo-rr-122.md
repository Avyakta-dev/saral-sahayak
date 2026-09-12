# Passbook balance zero or stale while ECR paid — claim amount/eligibility fails (epfo-rr-122)

> Dataset record `epfo-rr-122`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Passbook balance zero or stale while ECR paid — claim amount/eligibility fails

**Aliases:** Passbook shows zero balance, Passbook not updated claim rejected, Eligible amount zero on claim screen, Recent ECR not reflecting in passbook

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Mint service-history explainers; PFBalanceCheck checklist asks whether passbook shows recent deposits. Claims can show eligible amount zero when passbook lags ECR.

## What it means

Member sees salary deductions but claim wizard offers tiny/zero eligible amount. May be transfer-out, wrong MID, or ledger delay. Distinct from employer never depositing.

## Root cause

Ledger lag; wrong MID selected; prior transfer emptied MID; portal cache.

## How it is detected

Claim screen eligible amount vs expected. Passbook stale vs ECR.

## Fix

- Check passbook for every member ID under the UAN.
- Confirm employer ECR filed and credited.
- If wrong MID has the balance, select correct MID or complete transfer first.
- If ledger stuck, EPFiGMS for passbook update before refiling large claims.

## Required documents

- Passbook all MIDs
- ECR/challan proof if available
- Claim eligible-amount screenshot

## Who acts

mixed

## Prevention

- Reconcile passbook monthly.

## Related records

- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-051](./epfo-rr-051.md)
- [epfo-rr-073](./epfo-rr-073.md)
- [epfo-rr-040](./epfo-rr-040.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** news, blog, official
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[news]** Mint: wrong service history — https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[blog]** Bajaj Finserv: EPF withdrawal rules — https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-122",
  "rejection_reason": "Passbook balance zero or stale while ECR paid — claim amount/eligibility fails",
  "aliases": [
    "Passbook shows zero balance",
    "Passbook not updated claim rejected",
    "Eligible amount zero on claim screen",
    "Recent ECR not reflecting in passbook"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Mint service-history explainers; PFBalanceCheck checklist asks whether passbook shows recent deposits. Claims can show eligible amount zero when passbook lags ECR.",
  "what_it_means": "Member sees salary deductions but claim wizard offers tiny/zero eligible amount. May be transfer-out, wrong MID, or ledger delay. Distinct from employer never depositing.",
  "root_cause": "Ledger lag; wrong MID selected; prior transfer emptied MID; portal cache.",
  "how_detected": "Claim screen eligible amount vs expected. Passbook stale vs ECR.",
  "fix_steps": [
    "Check passbook for every member ID under the UAN.",
    "Confirm employer ECR filed and credited.",
    "If wrong MID has the balance, select correct MID or complete transfer first.",
    "If ledger stuck, EPFiGMS for passbook update before refiling large claims."
  ],
  "required_documents": [
    "Passbook all MIDs",
    "ECR/challan proof if available",
    "Claim eligible-amount screenshot"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Reconcile passbook monthly."
  ],
  "related_reason_ids": [
    "epfo-rr-029",
    "epfo-rr-051",
    "epfo-rr-073",
    "epfo-rr-040"
  ],
  "source_urls": [
    "https://www.livemint.com/money/personal-finance/epfo-showing-wrong-service-history-what-employees-should-check-immediately-and-do-next-to-rectify-the-error-11786520369893.html",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    "https://www.bajajfinserv.in/investments/epf-or-pf-withdrawal-rules"
  ],
  "source_types": [
    "news",
    "blog",
    "official"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
