# Member dies while a claim is pending — settlement path must switch to death claims (epfo-rr-107)

> Dataset record `epfo-rr-107`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Member dies while a claim is pending — settlement path must switch to death claims

**Aliases:** Member deceased mid claim, Claimant died during processing, Pending Form 19 after death of member, Death during under process claim

## Classification

- **Category:** Nominee_Death
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** critical
- **Official/common message status:** Death claims use Forms 20/10D/5IF per Which Claim Form; pending member-filed Form 19/31/10C cannot be completed as if the member were alive. Kustodian/Zee death guides stress nomination and death certificates.

## What it means

If the member dies after filing but before settlement, RO must stop the living-member claim and process nominee/legal-heir death claims. Family refiling Form 19 in the deceased login is wrong.

## Root cause

Death after submission; family continues wrong form; nomination incomplete.

## How it is detected

Death intimation to RO; claim parked; family tries same claim ID.

## Fix

- Intimate jurisdictional RO / EPFiGMS with death certificate and pending claim ID; request closure of living-member claim.
- File Form 20 (and 10D/10C/5IF as applicable) as nominee/heir.
- Ensure e-nomination was e-signed or follow legal-heir path.
- Do not keep OTPing the deceased UAN for Form 19.

## Required documents

- Death certificate
- Pending claim ID
- Nomination / legal heir proofs
- Claimant KYC/bank

## Who acts

mixed

## Prevention

- Keep e-nomination e-signed while alive.

## Related records

- [epfo-rr-060](./epfo-rr-060.md)
- [epfo-rr-062](./epfo-rr-062.md)
- [epfo-rr-067](./epfo-rr-067.md)
- [epfo-rr-052](./epfo-rr-052.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf
- [official] https://epfigms.gov.in/

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-death-claim-process-india
- [news] https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-107",
  "rejection_reason": "Member dies while a claim is pending — settlement path must switch to death claims",
  "aliases": [
    "Member deceased mid claim",
    "Claimant died during processing",
    "Pending Form 19 after death of member",
    "Death during under process claim"
  ],
  "category": "Nominee_Death",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "critical",
  "official_status_or_message": "Death claims use Forms 20/10D/5IF per Which Claim Form; pending member-filed Form 19/31/10C cannot be completed as if the member were alive. Kustodian/Zee death guides stress nomination and death certificates.",
  "what_it_means": "If the member dies after filing but before settlement, RO must stop the living-member claim and process nominee/legal-heir death claims. Family refiling Form 19 in the deceased login is wrong.",
  "root_cause": "Death after submission; family continues wrong form; nomination incomplete.",
  "how_detected": "Death intimation to RO; claim parked; family tries same claim ID.",
  "fix_steps": [
    "Intimate jurisdictional RO / EPFiGMS with death certificate and pending claim ID; request closure of living-member claim.",
    "File Form 20 (and 10D/10C/5IF as applicable) as nominee/heir.",
    "Ensure e-nomination was e-signed or follow legal-heir path.",
    "Do not keep OTPing the deceased UAN for Form 19."
  ],
  "required_documents": [
    "Death certificate",
    "Pending claim ID",
    "Nomination / legal heir proofs",
    "Claimant KYC/bank"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Keep e-nomination e-signed while alive."
  ],
  "related_reason_ids": [
    "epfo-rr-060",
    "epfo-rr-062",
    "epfo-rr-067",
    "epfo-rr-052"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf",
    "https://zeenews.india.com/personal-finance/pf-settlement-money-may-not-reach-your-family-for-a-common-mistake-your-e-nomination-will-not-be-valid-until-you-do-this-3054752.html",
    "https://epfigms.gov.in/"
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
