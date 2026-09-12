# EPS wage ceiling / pension contribution above statutory cap causing claim hold (epfo-rr-102)

> Dataset record `epfo-rr-102`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** EPS wage ceiling / pension contribution above statutory cap causing claim hold

**Aliases:** EPS contribution more than 1250, Pension contribution exceeds limit, Wage ceiling mismatch EPS, Wages more than 15000 EPS error, EPS ineligible due to salary above 15000

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 19 PF Final Settlement, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** high
- **Official/common message status:** Kustodian 2026 EPS rejection guide lists remarks such as pension contribution exceeds limit / wage ceiling mismatch, EPS contribution more than 1250, and EPS ineligible due to salary above 15000 for post-Sep 2014 joiners without higher-pension option.

## What it means

Employer ECR may have pushed excess into EPS instead of EPF, or higher-pension accounting does not reconcile. Claims involving EPS get held until ECR is revised. Distinct from service-length rejects.

## Root cause

ECR misclassification; no higher-pension option but EPS above ceiling; higher-pension interest mismatch.

## How it is detected

Portal/office remark on EPS limit or wage ceiling. Passbook EPS column anomalies.

## Fix

- Compare EPS monthly credits to expected ceiling without higher pension.
- Ask employer to revise ECR and move excess to EPF where appropriate.
- If you opted for higher pension, supply option papers and differential proofs.
- Refile settlement after passbook reflects correction.

## Required documents

- Passbook EPS columns
- ECR revision proof
- Higher pension option if any

## Who acts

employer

## Prevention

- Audit first EPS credit after salary crosses ceiling.

## Related records

- [epfo-rr-101](./epfo-rr-101.md)
- [epfo-rr-044](./epfo-rr-044.md)
- [epfo-rr-029](./epfo-rr-029.md)
- [epfo-rr-042](./epfo-rr-042.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** 1250 figure from secondary guides reflecting statutory 8.33% of 15000 ceiling.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-claim-rejected-because-of-eps-top-reasons-and-proven-fixes-india-2026-guide
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- [news] https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- [forum] https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-102",
  "rejection_reason": "EPS wage ceiling / pension contribution above statutory cap causing claim hold",
  "aliases": [
    "EPS contribution more than 1250",
    "Pension contribution exceeds limit",
    "Wage ceiling mismatch EPS",
    "Wages more than 15000 EPS error",
    "EPS ineligible due to salary above 15000"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 19 PF Final Settlement",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "Kustodian 2026 EPS rejection guide lists remarks such as pension contribution exceeds limit / wage ceiling mismatch, EPS contribution more than 1250, and EPS ineligible due to salary above 15000 for post-Sep 2014 joiners without higher-pension option.",
  "what_it_means": "Employer ECR may have pushed excess into EPS instead of EPF, or higher-pension accounting does not reconcile. Claims involving EPS get held until ECR is revised. Distinct from service-length rejects.",
  "root_cause": "ECR misclassification; no higher-pension option but EPS above ceiling; higher-pension interest mismatch.",
  "how_detected": "Portal/office remark on EPS limit or wage ceiling. Passbook EPS column anomalies.",
  "fix_steps": [
    "Compare EPS monthly credits to expected ceiling without higher pension.",
    "Ask employer to revise ECR and move excess to EPF where appropriate.",
    "If you opted for higher pension, supply option papers and differential proofs.",
    "Refile settlement after passbook reflects correction."
  ],
  "required_documents": [
    "Passbook EPS columns",
    "ECR revision proof",
    "Higher pension option if any"
  ],
  "who_acts": "employer",
  "prevention_tips": [
    "Audit first EPS credit after salary crosses ceiling."
  ],
  "related_reason_ids": [
    "epfo-rr-101",
    "epfo-rr-044",
    "epfo-rr-029",
    "epfo-rr-042"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-claim-rejected-because-of-eps-top-reasons-and-proven-fixes-india-2026-guide",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.reddit.com/r/epfoindia/comments/1m6co8r/why_so_many_epf_claims_are_being_rejected_and/"
  ],
  "source_types": [
    "blog",
    "news",
    "forum"
  ],
  "confidence": "high",
  "notes": "1250 figure from secondary guides reflecting statutory 8.33% of 15000 ceiling.",
  "last_verified": "2026-09-12"
}
```
