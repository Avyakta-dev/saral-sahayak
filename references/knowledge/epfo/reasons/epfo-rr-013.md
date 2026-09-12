# Joint Declaration for profile correction pending, returned, or rejected (epfo-rr-013)

> Dataset record `epfo-rr-013`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Joint Declaration for profile correction pending, returned, or rejected

**Aliases:** JD pending with employer, Joint declaration rejected, Profile correction not approved, Modify basic details rejected, Joint Declaration pending claim blocked, JD returned by employer, Modify basic details under process

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** high
- **Official/common message status:** Tracked under member portal Joint Declaration / Update Details Processed Requests. Employer may return with comments; EPFO approver may reject specifying grounds. SOP timelines: minor T+7 days, major T+15 days at field office after DA receipt (plus 3 days if referred to EO).

## What it means

When name/DOB/parent/DOJ/DOE/Aadhaar etc. are wrong, the claim will keep failing until a Joint Declaration is approved. If the JD itself is pending with employer, returned for extra documents, or rejected by EPFO, the member is stuck: they cannot truthfully resubmit the original claim. SOP also limits how many parameters and how many times each field may change (generally once for name/DOB/gender/parent/Aadhaar; marital status twice; max five parameters in normal course).

## Root cause

Insufficient documents for major vs minor class; employer e-sign missing; trying to change more than five parameters; using previous employer for a member ID they did not generate; closed establishment not using Annexure-II attestation.

## How it is detected

JD status in member login; email to employer; EPFO rejection grounds on the request.

## Fix

- Open the JD status and read employer/EPFO remarks word for word.
- Re-file a single JD covering all needed identity fields together (SOP 6.8: correct basic changes in one go).
- Attach the document count required: at least two for minor, at least three for major, with Aadhaar mandatory for name/gender/Aadhaar changes.
- Chase employer to e-sign within 7 days (employer dashboard is supposed to prompt beyond 7 days).
- If establishment is closed, use physical Annexure-II attested by an authority listed in SOP 6.14 and submit at the FO.
- If EPFO rejected for fraud-risk (too many identity fields), meet the OIC with a written explanation; SOP 6.12 allows >5 parameters only after OIC records reasons.
- Only after JD is approved and KYC Verified, resubmit the PF/EPS claim.

## Required documents

- JD form / online JD
- Proofs per SOP Annexure-I for each parameter
- Employer e-sign or closed-establishment attestation

## Who acts

mixed

## Prevention

- Fix profile years before the claim.
- Do not open multiple sequential JDs for the same field (frequency limits).

## Related records

- [epfo-rr-001](./epfo-rr-001.md)
- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-003](./epfo-rr-003.md)
- [epfo-rr-024](./epfo-rr-024.md)
- [epfo-rr-028](./epfo-rr-028.md)
- [epfo-rr-030](./epfo-rr-030.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Circular WSU/2022/Rationalisation of work areas/Joint Declaration (E-54018)/3638 dated 22.08.2023; SOP No. JD/2022/1. Later SOP versions (e.g. JD/2024/1) may refine screens; verify current portal labels.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- [official] https://epfigms.gov.in/

### Secondary (news / blog / forum)

- [news] https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- [news] https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-013",
  "rejection_reason": "Joint Declaration for profile correction pending, returned, or rejected",
  "aliases": [
    "JD pending with employer",
    "Joint declaration rejected",
    "Profile correction not approved",
    "Modify basic details rejected",
    "Joint Declaration pending claim blocked",
    "JD returned by employer",
    "Modify basic details under process"
  ],
  "category": "KYC_Identity",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 31 Partial Withdrawal/Advance",
    "Form 13 Transfer",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim",
    "International Worker Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Tracked under member portal Joint Declaration / Update Details Processed Requests. Employer may return with comments; EPFO approver may reject specifying grounds. SOP timelines: minor T+7 days, major T+15 days at field office after DA receipt (plus 3 days if referred to EO).",
  "what_it_means": "When name/DOB/parent/DOJ/DOE/Aadhaar etc. are wrong, the claim will keep failing until a Joint Declaration is approved. If the JD itself is pending with employer, returned for extra documents, or rejected by EPFO, the member is stuck: they cannot truthfully resubmit the original claim. SOP also limits how many parameters and how many times each field may change (generally once for name/DOB/gender/parent/Aadhaar; marital status twice; max five parameters in normal course).",
  "root_cause": "Insufficient documents for major vs minor class; employer e-sign missing; trying to change more than five parameters; using previous employer for a member ID they did not generate; closed establishment not using Annexure-II attestation.",
  "how_detected": "JD status in member login; email to employer; EPFO rejection grounds on the request.",
  "fix_steps": [
    "Open the JD status and read employer/EPFO remarks word for word.",
    "Re-file a single JD covering all needed identity fields together (SOP 6.8: correct basic changes in one go).",
    "Attach the document count required: at least two for minor, at least three for major, with Aadhaar mandatory for name/gender/Aadhaar changes.",
    "Chase employer to e-sign within 7 days (employer dashboard is supposed to prompt beyond 7 days).",
    "If establishment is closed, use physical Annexure-II attested by an authority listed in SOP 6.14 and submit at the FO.",
    "If EPFO rejected for fraud-risk (too many identity fields), meet the OIC with a written explanation; SOP 6.12 allows >5 parameters only after OIC records reasons.",
    "Only after JD is approved and KYC Verified, resubmit the PF/EPS claim."
  ],
  "required_documents": [
    "JD form / online JD",
    "Proofs per SOP Annexure-I for each parameter",
    "Employer e-sign or closed-establishment attestation"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Fix profile years before the claim.",
    "Do not open multiple sequential JDs for the same field (frequency limits)."
  ],
  "related_reason_ids": [
    "epfo-rr-001",
    "epfo-rr-002",
    "epfo-rr-003",
    "epfo-rr-024",
    "epfo-rr-028",
    "epfo-rr-030"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms",
    "https://epfigms.gov.in/"
  ],
  "source_types": [
    "official",
    "circular",
    "news"
  ],
  "confidence": "high",
  "notes": "Circular WSU/2022/Rationalisation of work areas/Joint Declaration (E-54018)/3638 dated 22.08.2023; SOP No. JD/2022/1. Later SOP versions (e.g. JD/2024/1) may refine screens; verify current portal labels.",
  "last_verified": "2026-09-12"
}
```
