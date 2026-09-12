# Establishment code, Regional Office mapping, or exempted-office jurisdiction mismatch (epfo-rr-080)

> Dataset record `epfo-rr-080`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Establishment code, Regional Office mapping, or exempted-office jurisdiction mismatch

**Aliases:** Wrong PF office, Establishment mapping error, Jurisdictional mismatch, Claim sent to wrong office, Wrong Regional Office jurisdiction, Establishment code mapped to wrong RO, File at correct PF office

## Classification

- **Category:** Other
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** low
- **Official/common message status:** Claims are processed by the office that holds the member ID. Wrong office mapping, establishment code errors, or claiming at a city office that is not the jurisdictional RO causes return. Which-Claim-Form and physical instructions say submit to the office where the account is maintained.

## What it means

A Delhi resident whose last establishment reports to RO Peenya will not get a Delhi-office physical claim settled. Online claims usually route themselves; paper claims often go to the wrong counter.

## Root cause

Member posts to the nearest office; establishment transferred between ROs; member ID prefix ignored.

## How it is detected

Physical claim returned. Online claim sitting in unexpected office queue.

## Fix

- Read the office on the passbook / member ID.
- Use establishment search on epfindia.gov.in.
- File online where possible so routing is automatic.
- If paper, send to the jurisdictional RO with the establishment code on the envelope.

## Required documents

- Passbook showing office/establishment code
- Correct RO address

## Who acts

member

## Prevention

- Never walk into a random PF office with a physical form without checking jurisdiction.

## Related records

- [epfo-rr-051](./epfo-rr-051.md)
- [epfo-rr-031](./epfo-rr-031.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Operational jurisdiction issue; no unique published code.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm
- [official] https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf
- [official] https://www.epfindia.gov.in
- [official] https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-080",
  "rejection_reason": "Establishment code, Regional Office mapping, or exempted-office jurisdiction mismatch",
  "aliases": [
    "Wrong PF office",
    "Establishment mapping error",
    "Jurisdictional mismatch",
    "Claim sent to wrong office",
    "Wrong Regional Office jurisdiction",
    "Establishment code mapped to wrong RO",
    "File at correct PF office"
  ],
  "category": "Other",
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
  "severity": "low",
  "official_status_or_message": "Claims are processed by the office that holds the member ID. Wrong office mapping, establishment code errors, or claiming at a city office that is not the jurisdictional RO causes return. Which-Claim-Form and physical instructions say submit to the office where the account is maintained.",
  "what_it_means": "A Delhi resident whose last establishment reports to RO Peenya will not get a Delhi-office physical claim settled. Online claims usually route themselves; paper claims often go to the wrong counter.",
  "root_cause": "Member posts to the nearest office; establishment transferred between ROs; member ID prefix ignored.",
  "how_detected": "Physical claim returned. Online claim sitting in unexpected office queue.",
  "fix_steps": [
    "Read the office on the passbook / member ID.",
    "Use establishment search on epfindia.gov.in.",
    "File online where possible so routing is automatic.",
    "If paper, send to the jurisdictional RO with the establishment code on the envelope."
  ],
  "required_documents": [
    "Passbook showing office/establishment code",
    "Correct RO address"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never walk into a random PF office with a physical form without checking jurisdiction."
  ],
  "related_reason_ids": [
    "epfo-rr-051",
    "epfo-rr-031"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm",
    "https://epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form19_instructions_Eng.pdf",
    "https://www.epfindia.gov.in",
    "https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Form5IF_Instructions_Eng.pdf"
  ],
  "source_types": [
    "official"
  ],
  "confidence": "medium",
  "notes": "Operational jurisdiction issue; no unique published code.",
  "last_verified": "2026-09-12"
}
```
