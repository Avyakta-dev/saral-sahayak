# Supporting document expired — passport, medical certificate, or other time-limited proof (epfo-rr-171)

> Dataset record `epfo-rr-171`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Supporting document expired — passport, medical certificate, or other time-limited proof

**Aliases:** Expired passport PF claim, Medical certificate expired Form 31, Outdated supporting document rejected, Expired ID proof claim, Validity lapsed enclosure EPFO

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Form 19 PF Final Settlement, International Worker Claim, Form 10D Monthly Pension, Composite Claim Form, UMANG/Member Portal Online Claim
- **Severity:** medium
- **Official/common message status:** Physical and purpose-driven claims (illness, IW passport path, certain advances) need valid-dated proofs. Expired passport for IW physical claims or stale medical certificates for illness advances cause returns.

## What it means

A once-valid enclosure can fail if validity ended before submission/verification. Distinct from unclear cheque image (021).

## Root cause

Old scans reused; medical Certificate C dated months earlier; passport expired after leaving India.

## How it is detected

RO date check on enclosures. Portal upload metadata. Remark documents expired.

## Fix

- Replace with currently valid passport/medical/other certificate.
- For illness advances, obtain fresh Certificate C / doctor certificate as form requires.
- Resubmit claim with new enclosures only after validity confirmed.

## Required documents

- Valid passport or fresh medical certificate as applicable
- Updated claim enclosures

## Who acts

member

## Prevention

- Check expiry dates the week you file.

## Related records

- [epfo-rr-048](./epfo-rr-048.md)
- [epfo-rr-053](./epfo-rr-053.md)
- [epfo-rr-129](./epfo-rr-129.md)
- [epfo-rr-123](./epfo-rr-123.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Common physical-claim hygiene issue.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[official]** Form 19 instructions (EPF Scheme) — https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- **[official]** Composite Claim Form (Aadhaar) instructions — https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf

### Secondary reporting (news, blog, forum)

- **[blog]** ClearTax: EPF Form 31 eligibility and documents — https://cleartax.in/s/epf-form-31
- **[blog]** KPMG: simplifying PF withdrawal for International Workers — https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-171",
  "rejection_reason": "Supporting document expired — passport, medical certificate, or other time-limited proof",
  "aliases": [
    "Expired passport PF claim",
    "Medical certificate expired Form 31",
    "Outdated supporting document rejected",
    "Expired ID proof claim",
    "Validity lapsed enclosure EPFO"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Form 19 PF Final Settlement",
    "International Worker Claim",
    "Form 10D Monthly Pension",
    "Composite Claim Form",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "medium",
  "official_status_or_message": "Physical and purpose-driven claims (illness, IW passport path, certain advances) need valid-dated proofs. Expired passport for IW physical claims or stale medical certificates for illness advances cause returns.",
  "what_it_means": "A once-valid enclosure can fail if validity ended before submission/verification. Distinct from unclear cheque image (021).",
  "root_cause": "Old scans reused; medical Certificate C dated months earlier; passport expired after leaving India.",
  "how_detected": "RO date check on enclosures. Portal upload metadata. Remark documents expired.",
  "fix_steps": [
    "Replace with currently valid passport/medical/other certificate.",
    "For illness advances, obtain fresh Certificate C / doctor certificate as form requires.",
    "Resubmit claim with new enclosures only after validity confirmed."
  ],
  "required_documents": [
    "Valid passport or fresh medical certificate as applicable",
    "Updated claim enclosures"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Check expiry dates the week you file."
  ],
  "related_reason_ids": [
    "epfo-rr-048",
    "epfo-rr-053",
    "epfo-rr-129",
    "epfo-rr-123"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://cleartax.in/s/epf-form-31",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Instructions_CCF_aadhar.pdf",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "Common physical-claim hygiene issue.",
  "last_verified": "2026-09-12"
}
```
