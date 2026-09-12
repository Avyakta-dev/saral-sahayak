# Atal Pension Yojana or other NPS product confused with EPS Form 10C/10D claim (epfo-rr-103)

> Dataset record `epfo-rr-103`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Atal Pension Yojana or other NPS product confused with EPS Form 10C/10D claim

**Aliases:** Atal Pension claim on EPFO portal, APY withdrawal via UAN rejected, NPS confused with EPS pension, Wrong pension scheme claim EPFO

## Classification

- **Category:** Other
- **Affected claim types:** Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** low
- **Official/common message status:** EPFO Which Claim Form and OCS FAQs cover EPS Forms 10C/10D only. APY is a PFRDA/NPS product administered via banks/India Post/CRAs — not settled on the EPFO member-claim dropdown.

## What it means

Members sometimes try to raise APY/NPS exit on the EPFO claim screen. The claim is rejected or never offered because EPFO settles EPF/EPS/EDLI only. Fix is to use the APY/NPS POP-SP channel.

## Root cause

Product confusion between EPS and APY/NPS.

## How it is detected

User attempts pension claim without EPS eligibility; references APY PRAN.

## Fix

- Confirm whether pension is EPS (UAN/passbook EPS) or APY/NPS (PRAN).
- For EPS use Form 10C/10D on EPFO portal.
- For APY/NPS use bank/POP-SP/NPSCRA exit — not EPFO Form 10D.
- Do not refile EPFO claims for APY balances.

## Required documents

- UAN passbook
- PRAN statement if APY/NPS

## Who acts

member

## Prevention

- Check which pension product was deducted from salary.

## Related records

- [epfo-rr-043](./epfo-rr-043.md)
- [epfo-rr-036](./epfo-rr-036.md)
- [epfo-rr-037](./epfo-rr-037.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Educational distinction; APY is not an EPFO scheme.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://www.epfindia.gov.in

### Secondary (news / blog / forum)

- [blog] https://www.pensionbazaar.com/epf/epf-withdrawal-rules/

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-103",
  "rejection_reason": "Atal Pension Yojana or other NPS product confused with EPS Form 10C/10D claim",
  "aliases": [
    "Atal Pension claim on EPFO portal",
    "APY withdrawal via UAN rejected",
    "NPS confused with EPS pension",
    "Wrong pension scheme claim EPFO"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "low",
  "official_status_or_message": "EPFO Which Claim Form and OCS FAQs cover EPS Forms 10C/10D only. APY is a PFRDA/NPS product administered via banks/India Post/CRAs — not settled on the EPFO member-claim dropdown.",
  "what_it_means": "Members sometimes try to raise APY/NPS exit on the EPFO claim screen. The claim is rejected or never offered because EPFO settles EPF/EPS/EDLI only. Fix is to use the APY/NPS POP-SP channel.",
  "root_cause": "Product confusion between EPS and APY/NPS.",
  "how_detected": "User attempts pension claim without EPS eligibility; references APY PRAN.",
  "fix_steps": [
    "Confirm whether pension is EPS (UAN/passbook EPS) or APY/NPS (PRAN).",
    "For EPS use Form 10C/10D on EPFO portal.",
    "For APY/NPS use bank/POP-SP/NPSCRA exit — not EPFO Form 10D.",
    "Do not refile EPFO claims for APY balances."
  ],
  "required_documents": [
    "UAN passbook",
    "PRAN statement if APY/NPS"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Check which pension product was deducted from salary."
  ],
  "related_reason_ids": [
    "epfo-rr-043",
    "epfo-rr-036",
    "epfo-rr-037"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in",
    "https://www.pensionbazaar.com/epf/epf-withdrawal-rules/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Educational distinction; APY is not an EPFO scheme.",
  "last_verified": "2026-09-12"
}
```
