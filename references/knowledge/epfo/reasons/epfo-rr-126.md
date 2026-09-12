# Vague demographic mismatch remark without naming the field — refile without KYC/JD fix (epfo-rr-126)

> Dataset record `epfo-rr-126`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Vague demographic mismatch remark without naming the field — refile without KYC/JD fix

**Aliases:** Details mismatch please contact nearest EPFO office, Member details do not tally, KYC mismatch please update, Data mismatch claim cancelled

## Classification

- **Category:** Other
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 13 Transfer, UMANG/Member Portal Online Claim, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Quora/Reddit/PFBalanceCheck/Kustodian collect vague mismatch remarks such as details mismatch contact EPFO office.

## What it means

Unlike named name/DOB mismatches, the portal only says details mismatch. Root cause is still profile/KYC, but first step is inventory all fields via KYC and Joint Declaration before touching the claim form again.

## Root cause

Unspecified demographic mismatch; member refiles without JD/KYC fix.

## How it is detected

Vague mismatch remark without naming name/DOB/gender.

## Fix

- Compare UAN personal details to Aadhaar field by field.
- Fix via KYC seeding or Joint Declaration as needed.
- Get statuses to Verified.
- Refile once with screenshot proof of alignment.

## Required documents

- Aadhaar
- UAN profile screenshots
- JD acknowledgement if used

## Who acts

member

## Prevention

- Never refile the same day a vague mismatch appears.

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-079](./epfo-rr-079.md)
- [epfo-rr-057](./epfo-rr-057.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, forum
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Quora URL is forum-class secondary.

- https://pfbalancecheck.com/epfo-claim-rejected-reason/
- https://kustodian.life/resources/epf-claim-rejected-reasons-guide
- https://kustodian.life/resources/epf-claim-rejected-name-aadhaar-dob-mismatch-fix-guide-2025
- https://www.quora.com/Why-was-my-EPF-claim-rejected
- https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/
- https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-126",
  "rejection_reason": "Vague demographic mismatch remark without naming the field — refile without KYC/JD fix",
  "aliases": [
    "Details mismatch please contact nearest EPFO office",
    "Member details do not tally",
    "KYC mismatch please update",
    "Data mismatch claim cancelled"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Quora/Reddit/PFBalanceCheck/Kustodian collect vague mismatch remarks such as details mismatch contact EPFO office.",
  "what_it_means": "Unlike named name/DOB mismatches, the portal only says details mismatch. Root cause is still profile/KYC, but first step is inventory all fields via KYC and Joint Declaration before touching the claim form again.",
  "root_cause": "Unspecified demographic mismatch; member refiles without JD/KYC fix.",
  "how_detected": "Vague mismatch remark without naming name/DOB/gender.",
  "fix_steps": [
    "Compare UAN personal details to Aadhaar field by field.",
    "Fix via KYC seeding or Joint Declaration as needed.",
    "Get statuses to Verified.",
    "Refile once with screenshot proof of alignment."
  ],
  "required_documents": [
    "Aadhaar",
    "UAN profile screenshots",
    "JD acknowledgement if used"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never refile the same day a vague mismatch appears."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-002",
    "epfo-rr-013",
    "epfo-rr-079",
    "epfo-rr-057"
  ],
  "source_urls": [
    "https://pfbalancecheck.com/epfo-claim-rejected-reason/",
    "https://kustodian.life/resources/epf-claim-rejected-reasons-guide",
    "https://kustodian.life/resources/epf-claim-rejected-name-aadhaar-dob-mismatch-fix-guide-2025",
    "https://www.quora.com/Why-was-my-EPF-claim-rejected",
    "https://www.reddit.com/r/india/comments/1tp295c/epfo_rejected_your_pf_claim_dont_panic_after/",
    "https://finright.in/blogs/most-common-reasons-for-epf-claim-rejections-and-tips-to-avoid-them"
  ],
  "source_types": [
    "blog",
    "forum"
  ],
  "confidence": "medium",
  "notes": "Quora URL is forum-class secondary.",
  "last_verified": "2026-09-12"
}
```
