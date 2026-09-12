# Employer DSC token / USB crypto device errors blocking claim or KYC approval (epfo-rr-175)

> Dataset record `epfo-rr-175`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Employer DSC token / USB crypto device errors blocking claim or KYC approval

**Aliases:** DSC token not detected, USB token error employer EPFO, Digital signature token failure, Crypto token driver claim stuck, DSC PIN blocked employer portal

## Classification

- **Category:** Technical_Portal
- **Affected claim types:** Form 13 Transfer, UMANG/Member Portal Online Claim, Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance
- **Severity:** high
- **Official/common message status:** Employer approvals for KYC, JD, and transfers need valid DSC/e-sign. Token driver failures, expired certificates, blocked PINs, or USB not detected leave member requests Pending — experienced as claim rejection. Extends 028 with device-level symptoms.

## What it means

Member cannot fix USB drivers; employer IT must. Switching to e-sign (if enabled) or renewing DSC is the path.

## Root cause

Expired DSC; Java/browser plugin issues; forgotten token PIN; wrong DSC registered to establishment.

## How it is detected

Employer portal errors on sign. KYC Pending endlessly. Transfer awaiting employer.

## Fix

- Employer: renew DSC, reset token PIN with SCA, update drivers.
- Register new DSC on EPFO employer portal per DSC FAQ.
- Approve pending KYC/JD/transfer after DSC healthy.
- Member: follow up in writing; EPFiGMS if employer unresponsive citing Pending KYC.

## Required documents

- DSC renewal receipt
- Screenshots of token errors

## Who acts

employer

## Prevention

- Employers should diary DSC expiry and keep backup authorised signatories.

## Related records

- [epfo-rr-028](./epfo-rr-028.md)
- [epfo-rr-010](./epfo-rr-010.md)
- [epfo-rr-068](./epfo-rr-068.md)
- [epfo-rr-013](./epfo-rr-013.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** DSC FAQ is official; token errors are the practical manifestation.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO DSC FAQ for employers — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2020-2021/Faq_dsc.pdf
- **[official]** EPFO OTCP for employers — https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php
- **[official]** EPFO OTCP Members FAQ (employer rejection reasons, 15-day printout) — https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** Orbit Careers: KYC pending employer approval — https://orbitcareers.com/uan-kyc-pending-for-employer-approval/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-175",
  "rejection_reason": "Employer DSC token / USB crypto device errors blocking claim or KYC approval",
  "aliases": [
    "DSC token not detected",
    "USB token error employer EPFO",
    "Digital signature token failure",
    "Crypto token driver claim stuck",
    "DSC PIN blocked employer portal"
  ],
  "category": "Technical_Portal",
  "claim_types_affected": [
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim",
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance"
  ],
  "severity": "high",
  "official_status_or_message": "Employer approvals for KYC, JD, and transfers need valid DSC/e-sign. Token driver failures, expired certificates, blocked PINs, or USB not detected leave member requests Pending — experienced as claim rejection. Extends 028 with device-level symptoms.",
  "what_it_means": "Member cannot fix USB drivers; employer IT must. Switching to e-sign (if enabled) or renewing DSC is the path.",
  "root_cause": "Expired DSC; Java/browser plugin issues; forgotten token PIN; wrong DSC registered to establishment.",
  "how_detected": "Employer portal errors on sign. KYC Pending endlessly. Transfer awaiting employer.",
  "fix_steps": [
    "Employer: renew DSC, reset token PIN with SCA, update drivers.",
    "Register new DSC on EPFO employer portal per DSC FAQ.",
    "Approve pending KYC/JD/transfer after DSC healthy.",
    "Member: follow up in writing; EPFiGMS if employer unresponsive citing Pending KYC."
  ],
  "required_documents": [
    "DSC renewal receipt",
    "Screenshots of token errors"
  ],
  "who_acts": "employer",
  "prevention_tips": [
    "Employers should diary DSC expiry and keep backup authorised signatories."
  ],
  "related_reason_ids": [
    "epfo-rr-028",
    "epfo-rr-010",
    "epfo-rr-068",
    "epfo-rr-013"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2020-2021/Faq_dsc.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php",
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://orbitcareers.com/uan-kyc-pending-for-employer-approval/",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "DSC FAQ is official; token errors are the practical manifestation.",
  "last_verified": "2026-09-12"
}
```
