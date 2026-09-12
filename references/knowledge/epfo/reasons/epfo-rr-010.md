# KYC uploaded but pending employer digital verification (epfo-rr-010)

> Dataset record `epfo-rr-010`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** KYC uploaded but pending employer digital verification

**Aliases:** KYC pending, KYC not approved, KYC pending for employer approval, Unverified KYC, Green tick missing on KYC, KYC uploaded but not verified, Employer approval pending KYC, SMS: Claim Rejected KYC Pending

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Composite Claim Form, UMANG/Member Portal Online Claim, Form 13 Transfer, Form 20 Death PF Settlement
- **Severity:** critical
- **Official/common message status:** Portal: 'KYC pending' / 'KYC not verified' / 'KYC not approved'. Aadhaar, PAN and bank must typically show Verified, not merely displayed.

## What it means

Uploading Aadhaar/PAN/bank on the member portal is not the same as verified KYC. Many establishments must digitally approve KYC with DSC/e-sign. Members file claims while status is Pending; EPFO then rejects. Bank KYC may also need the bank/NPCI to confirm the account. Until all three are Verified, online claims are unsafe to file.

## Root cause

Employer DSC expired, HR inaction, establishment marked closed so KYC never lands, or bank has not confirmed the account.

## How it is detected

Manage > KYC column: Pending / Rejected / Failed. Employer dashboard pending KYC list.

## Fix

- Screenshot KYC status for Aadhaar, PAN, and Bank separately.
- Email HR with UAN and ask to approve pending KYC in the employer unified portal using a valid DSC/e-sign.
- If DSC is expired, employer must renew it (related: epfo-rr-028).
- If bank KYC is pending, confirm with the bank that the account can receive NPCI/EPFO credits and that name matches.
- If employer is closed, take KYC and a physical claim/JD to the field office for seeding/approval under closed-establishment process.
- Reapply only after every required KYC row is Verified.

## Required documents

- Aadhaar, PAN, cancelled cheque/passbook as applicable
- Employer DSC/e-sign
- Closed-establishment attestation if employer defunct

## Who acts

mixed

## Prevention

- Check KYC monthly, not only at exit.
- Do not file claims in the pending window.
- Ask new employers to approve KYC in the first week.

## Related records

- [epfo-rr-005](./epfo-rr-005.md)
- [epfo-rr-016](./epfo-rr-016.md)
- [epfo-rr-028](./epfo-rr-028.md)
- [epfo-rr-030](./epfo-rr-030.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog, forum
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Forum reports used only as secondary confirmation of the Pending vs Verified distinction.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** FinRight: 9 common EPF rejection reasons — https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them
- **[blog]** PFBalanceCheck: claim rejected reason 2026 — https://pfbalancecheck.com/epfo-claim-rejected-reason/
- **[blog]** HR Software Delhi: PF withdrawal process / rejections — https://hrsoftwaredelhi.com/pf-withdrawal-process/
- **[forum]** Reddit r/india: bank KYC not verified — https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-010",
  "rejection_reason": "KYC uploaded but pending employer digital verification",
  "aliases": [
    "KYC pending",
    "KYC not approved",
    "KYC pending for employer approval",
    "Unverified KYC",
    "Green tick missing on KYC",
    "KYC uploaded but not verified",
    "Employer approval pending KYC",
    "SMS: Claim Rejected KYC Pending"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement"
  ],
  "severity": "critical",
  "official_status_or_message": "Portal: 'KYC pending' / 'KYC not verified' / 'KYC not approved'. Aadhaar, PAN and bank must typically show Verified, not merely displayed.",
  "what_it_means": "Uploading Aadhaar/PAN/bank on the member portal is not the same as verified KYC. Many establishments must digitally approve KYC with DSC/e-sign. Members file claims while status is Pending; EPFO then rejects. Bank KYC may also need the bank/NPCI to confirm the account. Until all three are Verified, online claims are unsafe to file.",
  "root_cause": "Employer DSC expired, HR inaction, establishment marked closed so KYC never lands, or bank has not confirmed the account.",
  "how_detected": "Manage > KYC column: Pending / Rejected / Failed. Employer dashboard pending KYC list.",
  "fix_steps": [
    "Screenshot KYC status for Aadhaar, PAN, and Bank separately.",
    "Email HR with UAN and ask to approve pending KYC in the employer unified portal using a valid DSC/e-sign.",
    "If DSC is expired, employer must renew it (related: epfo-rr-028).",
    "If bank KYC is pending, confirm with the bank that the account can receive NPCI/EPFO credits and that name matches.",
    "If employer is closed, take KYC and a physical claim/JD to the field office for seeding/approval under closed-establishment process.",
    "Reapply only after every required KYC row is Verified."
  ],
  "required_documents": [
    "Aadhaar, PAN, cancelled cheque/passbook as applicable",
    "Employer DSC/e-sign",
    "Closed-establishment attestation if employer defunct"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Check KYC monthly, not only at exit.",
    "Do not file claims in the pending window.",
    "Ask new employers to approve KYC in the first week."
  ],
  "related_reason_ids": [
    "epfo-rr-005",
    "epfo-rr-016",
    "epfo-rr-028",
    "epfo-rr-030"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them",
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://hrsoftwaredelhi.com/pf-withdrawal-process/",
    "https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/"
  ],
  "source_types": [
    "official",
    "blog",
    "forum"
  ],
  "confidence": "high",
  "notes": "Forum reports used only as secondary confirmation of the Pending vs Verified distinction.",
  "last_verified": "2026-09-12"
}
```
