# Wrong Regional Office jurisdiction or physical claim filed at incorrect PF office (epfo-rr-117)

> Dataset record `epfo-rr-117`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Wrong Regional Office jurisdiction or physical claim filed at incorrect PF office

**Aliases:** Claim sent to wrong RO, Jurisdictional mismatch claim rejected, Establishment code different office, Physical claim submitted at incorrect PF office

## Classification

- **Category:** Other
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Form 13 Transfer, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Sibling epfo-rr-080 covers establishment mapping. This expands physical-filing and routing where members submit paper at the wrong RO.

## What it means

Online claims usually auto-route, but physical CCF/death claims filed at the wrong counter are returned. Online claims can park when establishment code points to a different region after reorganization.

## Root cause

Wrong counter filing; establishment remapped; old office code on form.

## How it is detected

Return remark naming jurisdiction; physical claim not acknowledged.

## Fix

- Check establishment code and jurisdictional RO on epfindia office search / passbook.
- File physical claims only at the owning RO.
- For online claims stuck on jurisdiction, EPFiGMS asking for correct office marking.
- Do not assume any city RO can settle any UAN.

## Required documents

- Establishment code printout
- Passbook header
- Physical claim acknowledgement

## Who acts

mixed

## Prevention

- Verify RO before travelling with physical forms.

## Related records

- [epfo-rr-080](./epfo-rr-080.md)
- [epfo-rr-072](./epfo-rr-072.md)
- [epfo-rr-031](./epfo-rr-031.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO official website — https://www.epfindia.gov.in
- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[blog]** CitizenNest: PF claim rejected fix — https://www.citizennest.com/guide/pf-claim-rejected-fix
- **[blog]** CitizenNest: Form 13 transfer rejected — https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-117",
  "rejection_reason": "Wrong Regional Office jurisdiction or physical claim filed at incorrect PF office",
  "aliases": [
    "Claim sent to wrong RO",
    "Jurisdictional mismatch claim rejected",
    "Establishment code different office",
    "Physical claim submitted at incorrect PF office"
  ],
  "category": "Other",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 10D Monthly Pension",
    "Form 20 Death PF Settlement",
    "Form 5IF EDLI Death Insurance",
    "Form 13 Transfer",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Sibling epfo-rr-080 covers establishment mapping. This expands physical-filing and routing where members submit paper at the wrong RO.",
  "what_it_means": "Online claims usually auto-route, but physical CCF/death claims filed at the wrong counter are returned. Online claims can park when establishment code points to a different region after reorganization.",
  "root_cause": "Wrong counter filing; establishment remapped; old office code on form.",
  "how_detected": "Return remark naming jurisdiction; physical claim not acknowledged.",
  "fix_steps": [
    "Check establishment code and jurisdictional RO on epfindia office search / passbook.",
    "File physical claims only at the owning RO.",
    "For online claims stuck on jurisdiction, EPFiGMS asking for correct office marking.",
    "Do not assume any city RO can settle any UAN."
  ],
  "required_documents": [
    "Establishment code printout",
    "Passbook header",
    "Physical claim acknowledgement"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Verify RO before travelling with physical forms."
  ],
  "related_reason_ids": [
    "epfo-rr-080",
    "epfo-rr-072",
    "epfo-rr-031"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in",
    "https://www.citizennest.com/guide/pf-claim-rejected-fix",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
