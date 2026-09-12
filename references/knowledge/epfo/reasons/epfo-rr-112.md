# Life certificate / Jeevan Pramaan not submitted — pension stopped or credit blocked (epfo-rr-112)

> Dataset record `epfo-rr-112`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Life certificate / Jeevan Pramaan not submitted — pension stopped or credit blocked

**Aliases:** Life certificate not submitted, Jeevan Pramaan pending pension, Digital life certificate overdue, Pension stopped LC not given

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Jeevan Pramaan is the official digital life-certificate platform for pensioners; NRI pension explainers stress annual life certificate to keep EPS pension flowing.

## What it means

After PPO starts, failure to submit yearly life certificate suspends credits. This is an ongoing compliance block, not a KYC name mismatch.

## Root cause

LC not filed by due date; biometric LC failed; NRI LC via wrong channel.

## How it is detected

Pension stopped remark. Existence verification failure.

## Fix

- Submit Digital Life Certificate via Jeevan Pramaan / authorized centres.
- NRIs follow embassy/acceptable LC process and update bank.
- After LC acceptance wait for pension restart; EPFiGMS if still stopped.
- Do not file duplicate Form 10D just to restart without LC.

## Required documents

- Jeevan Pramaan acknowledgement
- PPO number
- Aadhaar

## Who acts

member

## Prevention

- Diary annual LC before due month.

## Related records

- [epfo-rr-023](./epfo-rr-023.md)
- [epfo-rr-081](./epfo-rr-081.md)
- [epfo-rr-105](./epfo-rr-105.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Jeevan Pramaan (life certificate) — https://jeevanpramaan.gov.in
- **[official]** EPFO official website — https://www.epfindia.gov.in

### Secondary reporting (news, blog, forum)

- **[blog]** NRI Information: receiving Indian pension abroad — https://nriinformation.com/nri-info/indian-pension-abroad
- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-112",
  "rejection_reason": "Life certificate / Jeevan Pramaan not submitted — pension stopped or credit blocked",
  "aliases": [
    "Life certificate not submitted",
    "Jeevan Pramaan pending pension",
    "Digital life certificate overdue",
    "Pension stopped LC not given"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Jeevan Pramaan is the official digital life-certificate platform for pensioners; NRI pension explainers stress annual life certificate to keep EPS pension flowing.",
  "what_it_means": "After PPO starts, failure to submit yearly life certificate suspends credits. This is an ongoing compliance block, not a KYC name mismatch.",
  "root_cause": "LC not filed by due date; biometric LC failed; NRI LC via wrong channel.",
  "how_detected": "Pension stopped remark. Existence verification failure.",
  "fix_steps": [
    "Submit Digital Life Certificate via Jeevan Pramaan / authorized centres.",
    "NRIs follow embassy/acceptable LC process and update bank.",
    "After LC acceptance wait for pension restart; EPFiGMS if still stopped.",
    "Do not file duplicate Form 10D just to restart without LC."
  ],
  "required_documents": [
    "Jeevan Pramaan acknowledgement",
    "PPO number",
    "Aadhaar"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Diary annual LC before due month."
  ],
  "related_reason_ids": [
    "epfo-rr-023",
    "epfo-rr-081",
    "epfo-rr-105"
  ],
  "source_urls": [
    "https://jeevanpramaan.gov.in",
    "https://nriinformation.com/nri-info/indian-pension-abroad",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.epfindia.gov.in"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
