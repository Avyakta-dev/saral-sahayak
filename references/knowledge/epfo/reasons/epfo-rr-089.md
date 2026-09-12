# Form 31 COVID-19 / pandemic outbreak advance rejected or wrongly substituted with calamity (epfo-rr-089)

> Dataset record `epfo-rr-089`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 COVID-19 / pandemic outbreak advance rejected or wrongly substituted with calamity

**Aliases:** Outbreak of pandemic COVID-19 advance rejected, COVID Form 31 rejected, Lockdown advance not processed, Applied natural calamity instead of COVID

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Official EPFO COVID FAQ (Apr 2020): select purpose Outbreak of pandemic (COVID-19) specifically; natural calamity is NOT treated as COVID advance; pending other Form 31 may block a fresh COVID claim until earlier claim is rejected.

## What it means

Legacy COVID special advances still appear in histories and FAQ mirrors. Rejections when wrong purpose chosen, earlier Form 31 still open, KYC/bank failed, or COVID purpose no longer enabled. Fix differs from ordinary calamity/unemployment.

## Root cause

Wrong purpose; prior claim pending; purpose removed from dropdown; KYC/bank.

## How it is detected

Purpose text COVID/pandemic. Track Claim shows prior pending Form 31.

## Fix

- If COVID purpose still listed and you qualify, select it exactly not Natural Calamity.
- If another Form 31 is pending, request RO rejection of earlier claim per COVID FAQ before refiling.
- If COVID purpose is gone, use a currently enabled purpose that truly fits.
- Fix KYC/bank first if those are the real blockers.

## Required documents

- Screenshot of purpose dropdown
- Prior claim ID if blocking
- KYC/bank verified status

## Who acts

member

## Prevention

- Treat COVID FAQ as historical; follow live portal purposes.

## Related records

- [epfo-rr-088](./epfo-rr-088.md)
- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-039](./epfo-rr-039.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Historical special advance; high confidence on FAQ text, medium on current portal availability.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO COVID-19 advance claim FAQ (Apr 2020) — https://www.epfindia.gov.in/site_docs/PDFs/Updates/covid_faq_claim_04042020.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-089",
  "rejection_reason": "Form 31 COVID-19 / pandemic outbreak advance rejected or wrongly substituted with calamity",
  "aliases": [
    "Outbreak of pandemic COVID-19 advance rejected",
    "COVID Form 31 rejected",
    "Lockdown advance not processed",
    "Applied natural calamity instead of COVID"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Official EPFO COVID FAQ (Apr 2020): select purpose Outbreak of pandemic (COVID-19) specifically; natural calamity is NOT treated as COVID advance; pending other Form 31 may block a fresh COVID claim until earlier claim is rejected.",
  "what_it_means": "Legacy COVID special advances still appear in histories and FAQ mirrors. Rejections when wrong purpose chosen, earlier Form 31 still open, KYC/bank failed, or COVID purpose no longer enabled. Fix differs from ordinary calamity/unemployment.",
  "root_cause": "Wrong purpose; prior claim pending; purpose removed from dropdown; KYC/bank.",
  "how_detected": "Purpose text COVID/pandemic. Track Claim shows prior pending Form 31.",
  "fix_steps": [
    "If COVID purpose still listed and you qualify, select it exactly not Natural Calamity.",
    "If another Form 31 is pending, request RO rejection of earlier claim per COVID FAQ before refiling.",
    "If COVID purpose is gone, use a currently enabled purpose that truly fits.",
    "Fix KYC/bank first if those are the real blockers."
  ],
  "required_documents": [
    "Screenshot of purpose dropdown",
    "Prior claim ID if blocking",
    "KYC/bank verified status"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Treat COVID FAQ as historical; follow live portal purposes."
  ],
  "related_reason_ids": [
    "epfo-rr-088",
    "epfo-rr-052",
    "epfo-rr-039"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Updates/covid_faq_claim_04042020.pdf",
    "https://cleartax.in/s/epf-form-31",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "Historical special advance; high confidence on FAQ text, medium on current portal availability.",
  "last_verified": "2026-09-12"
}
```
