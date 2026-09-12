# Pension (Form 10D) bank account is not single or joint with spouse (epfo-rr-023)

> Dataset record `epfo-rr-023`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Pension (Form 10D) bank account is not single or joint with spouse

**Aliases:** Pension joint account with children rejected, Form 10D bank account mismatch, Spouse joint account required

## Classification

- **Category:** Bank_Payment
- **Affected claim types:** Form 10D Monthly Pension
- **Severity:** high
- **Official/common message status:** Common Form 10D rejection: bank account must be a single account or joint with spouse. Joint accounts with children or parents are often rejected because widow-pension continuity is designed around the spouse.

## What it means

Monthly EPS pension under Form 10D is a lifetime payment that can convert to widow/widower pension. EPFO therefore wants the pension credit account to be the pensioner's own account or a joint account with the spouse whose name is already in family details. A joint account with a son, or a child's account, breaks that logic and is a documented top Form 10D rejection reason.

## Root cause

Retiree used a family joint account; spouse name missing in EPFO family details; confusion with Form 19 sole-account rule.

## How it is detected

Form 10D scrutiny of passbook. Family details vs account holders.

## Fix

- Open a single savings account in the pensioner's name, or a joint account with spouse only.
- Seed/update that account and ensure spouse name exists in e-nomination/family details.
- Attach passbook copy showing the allowed holders.
- Resubmit Form 10D.

## Required documents

- Passbook of single or member+spouse account
- Spouse Aadhaar
- Family details / e-nomination

## Who acts

member

## Prevention

- Set up the pension bank account a year before age 58.
- Complete family details long before Form 10D.

## Related records

- [epfo-rr-019](./epfo-rr-019.md)
- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-037](./epfo-rr-037.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** blog, news, official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Widely reported in Form 10D guides and consistent with family-pension design; not quoted verbatim from a public Form 10D instruction PDF in this build (official Form 10D PDF exists at epfindia).

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- [news] https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/
- [news] https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-023",
  "rejection_reason": "Pension (Form 10D) bank account is not single or joint with spouse",
  "aliases": [
    "Pension joint account with children rejected",
    "Form 10D bank account mismatch",
    "Spouse joint account required"
  ],
  "category": "Bank_Payment",
  "claim_types_affected": [
    "Form 10D Monthly Pension"
  ],
  "severity": "high",
  "official_status_or_message": "Common Form 10D rejection: bank account must be a single account or joint with spouse. Joint accounts with children or parents are often rejected because widow-pension continuity is designed around the spouse.",
  "what_it_means": "Monthly EPS pension under Form 10D is a lifetime payment that can convert to widow/widower pension. EPFO therefore wants the pension credit account to be the pensioner's own account or a joint account with the spouse whose name is already in family details. A joint account with a son, or a child's account, breaks that logic and is a documented top Form 10D rejection reason.",
  "root_cause": "Retiree used a family joint account; spouse name missing in EPFO family details; confusion with Form 19 sole-account rule.",
  "how_detected": "Form 10D scrutiny of passbook. Family details vs account holders.",
  "fix_steps": [
    "Open a single savings account in the pensioner's name, or a joint account with spouse only.",
    "Seed/update that account and ensure spouse name exists in e-nomination/family details.",
    "Attach passbook copy showing the allowed holders.",
    "Resubmit Form 10D."
  ],
  "required_documents": [
    "Passbook of single or member+spouse account",
    "Spouse Aadhaar",
    "Family details / e-nomination"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Set up the pension bank account a year before age 58.",
    "Complete family details long before Form 10D."
  ],
  "related_reason_ids": [
    "epfo-rr-019",
    "epfo-rr-064",
    "epfo-rr-037"
  ],
  "source_urls": [
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.financialexpress.com/money/epfo-pension-rules-settlement-in-20-days-but-heres-why-many-eps-claims-still-get-rejected-4168274/",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "blog",
    "news",
    "official"
  ],
  "confidence": "medium",
  "notes": "Widely reported in Form 10D guides and consistent with family-pension design; not quoted verbatim from a public Form 10D instruction PDF in this build (official Form 10D PDF exists at epfindia).",
  "last_verified": "2026-09-12"
}
```
