# Widow/widower family pension rejected due to remarriage flag, marriage proof, or spouse KYC gaps (epfo-rr-109)

> Dataset record `epfo-rr-109`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Widow/widower family pension rejected due to remarriage flag, marriage proof, or spouse KYC gaps

**Aliases:** Widow pension rejected remarriage, Widower Form 10D rejected, Spouse pension Aadhaar mismatch, Family pension stopped remarriage, Widow pension remarriage issue, Spouse KYC pending family pension, Marriage proof for widow Form 10D

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 10D Monthly Pension, Form 20 Death PF Settlement, Composite Claim Form
- **Severity:** high
- **Official/common message status:** Form 10D family pension rules stop or bar widow pension on remarriage in scheme design; ET Now and Outlook list incomplete family/death/nominee documents among top EPS rejects. Spouse name missing in database is a known twin issue.

## What it means

Claims fail when remarriage is recorded or suspected without clarity, marriage certificate missing, spouse Aadhaar/name mismatches, or bank not single/spouse-joint. Fix differs from orphan path.

## Root cause

Remarriage; missing marriage certificate; spouse KYC mismatch; bank joint with non-spouse.

## How it is detected

Form 10D widow category queries. KYC mismatch on spouse.

## Fix

- Provide marriage certificate and spouse KYC matching claim name.
- If wrongly flagged remarried, submit affidavit/RO clarification with evidence.
- Align bank account to single or joint-with-spouse rules.
- Ensure deceased member family details list the spouse.

## Required documents

- Marriage certificate
- Death certificate
- Spouse Aadhaar
- Bank proof

## Who acts

mixed

## Prevention

- Update marital status and spouse details in member profile early.

## Related records

- [epfo-rr-064](./epfo-rr-064.md)
- [epfo-rr-023](./epfo-rr-023.md)
- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-081](./epfo-rr-081.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** Form 10D PDF — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf
- **[official]** EPFO Which Claim Form (19/20/10C/10D/5IF matrix) — https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm

### Secondary reporting (news, blog, forum)

- **[blog]** Kustodian: Form 10D 2026 guide — https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension
- **[news]** ET Now: EPS claim rejection reasons — https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634
- **[news]** Outlook Money: why EPFO rejects claims (MoS reply) — https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-109",
  "rejection_reason": "Widow/widower family pension rejected due to remarriage flag, marriage proof, or spouse KYC gaps",
  "aliases": [
    "Widow pension rejected remarriage",
    "Widower Form 10D rejected",
    "Spouse pension Aadhaar mismatch",
    "Family pension stopped remarriage",
    "Widow pension remarriage issue",
    "Spouse KYC pending family pension",
    "Marriage proof for widow Form 10D"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 10D Monthly Pension",
    "Form 20 Death PF Settlement",
    "Composite Claim Form"
  ],
  "severity": "high",
  "official_status_or_message": "Form 10D family pension rules stop or bar widow pension on remarriage in scheme design; ET Now and Outlook list incomplete family/death/nominee documents among top EPS rejects. Spouse name missing in database is a known twin issue.",
  "what_it_means": "Claims fail when remarriage is recorded or suspected without clarity, marriage certificate missing, spouse Aadhaar/name mismatches, or bank not single/spouse-joint. Fix differs from orphan path.",
  "root_cause": "Remarriage; missing marriage certificate; spouse KYC mismatch; bank joint with non-spouse.",
  "how_detected": "Form 10D widow category queries. KYC mismatch on spouse.",
  "fix_steps": [
    "Provide marriage certificate and spouse KYC matching claim name.",
    "If wrongly flagged remarried, submit affidavit/RO clarification with evidence.",
    "Align bank account to single or joint-with-spouse rules.",
    "Ensure deceased member family details list the spouse."
  ],
  "required_documents": [
    "Marriage certificate",
    "Death certificate",
    "Spouse Aadhaar",
    "Bank proof"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Update marital status and spouse details in member profile early."
  ],
  "related_reason_ids": [
    "epfo-rr-064",
    "epfo-rr-023",
    "epfo-rr-001",
    "epfo-rr-081"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form10D.pdf",
    "https://kustodian.life/resources/epf-form-10d-the-2026-guide-to-claiming-your-monthly-pension",
    "https://www.etnownews.com/personal-finance/epfo-pension-rules-why-eps-claims-get-rejected-govt-reveals-basis-errors-kyc-aadhaar-and-more-article-153801634",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
