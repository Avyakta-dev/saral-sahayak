# Nominee or family filed death-style claim while member is still alive (epfo-rr-180)

> Dataset record `epfo-rr-180`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Nominee or family filed death-style claim while member is still alive

**Aliases:** Nominee claim member alive, Form 20 filed but member living, Death claim on living member, Family claimed PF without death, Life status mismatch nominee filing

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 10D Monthly Pension, UMANG/Member Portal Online Claim
- **Severity:** critical
- **Official/common message status:** Portal life-status checks and backend validation reject death claims when member is marked alive (related remark patterns in 113). Filing Form 20/5IF without a registered death is treated as serious mismatch and may trigger fraud review.

## What it means

Sometimes relatives file wrongly during disappearance/illness; sometimes it is fraud. Either way settlement is blocked. Member-alive advances must use Form 31/19 paths instead.

## Root cause

Misinformation; identity theft; wrong form; DOE confusion mistaken for death.

## How it is detected

Life-status mismatch remark. No death certificate in civil records. Member login still active.

## Fix

- If member is alive: cancel/withdraw death claims; member files correct Form 19/31/10C themselves.
- If member is deceased but portal shows alive: submit registrar death certificate and employer intimation; request life-status update before refiling.
- Expect fraud review if conflicting filings exist (see 166).
- EPFiGMS with clear chronology.

## Required documents

- Proof member alive (if disputing false death claim) or death certificate (if portal wrong)
- Claim IDs
- KYC

## Who acts

mixed

## Prevention

- Families should confirm death registration before Form 20.
- Members should safeguard UAN credentials.

## Related records

- [epfo-rr-113](./epfo-rr-113.md)
- [epfo-rr-107](./epfo-rr-107.md)
- [epfo-rr-166](./epfo-rr-166.md)
- [epfo-rr-043](./epfo-rr-043.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Complements life-status mismatch technical remark 113 with nominee-filed edge.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf
- [official] https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- [official] https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary (news / blog / forum)

- [blog] https://kustodian.life/resources/epf-death-claim-process-india

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-180",
  "rejection_reason": "Nominee or family filed death-style claim while member is still alive",
  "aliases": [
    "Nominee claim member alive",
    "Form 20 filed but member living",
    "Death claim on living member",
    "Family claimed PF without death",
    "Life status mismatch nominee filing"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 10D Monthly Pension",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "critical",
  "official_status_or_message": "Portal life-status checks and backend validation reject death claims when member is marked alive (related remark patterns in 113). Filing Form 20/5IF without a registered death is treated as serious mismatch and may trigger fraud review.",
  "what_it_means": "Sometimes relatives file wrongly during disappearance/illness; sometimes it is fraud. Either way settlement is blocked. Member-alive advances must use Form 31/19 paths instead.",
  "root_cause": "Misinformation; identity theft; wrong form; DOE confusion mistaken for death.",
  "how_detected": "Life-status mismatch remark. No death certificate in civil records. Member login still active.",
  "fix_steps": [
    "If member is alive: cancel/withdraw death claims; member files correct Form 19/31/10C themselves.",
    "If member is deceased but portal shows alive: submit registrar death certificate and employer intimation; request life-status update before refiling.",
    "Expect fraud review if conflicting filings exist (see 166).",
    "EPFiGMS with clear chronology."
  ],
  "required_documents": [
    "Proof member alive (if disputing false death claim) or death certificate (if portal wrong)",
    "Claim IDs",
    "KYC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Families should confirm death registration before Form 20.",
    "Members should safeguard UAN credentials."
  ],
  "related_reason_ids": [
    "epfo-rr-113",
    "epfo-rr-107",
    "epfo-rr-166",
    "epfo-rr-043"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form20.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://kustodian.life/resources/epf-death-claim-process-india",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "Complements life-status mismatch technical remark 113 with nominee-filed edge.",
  "last_verified": "2026-09-12"
}
```
