# Online claim filed while Form 13 transfer is still pending (epfo-rr-160)

> Dataset record `epfo-rr-160`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Online claim filed while Form 13 transfer is still pending

**Aliases:** Claim during pending transfer, Form 19 while Form 13 in process, Transfer pending claim rejected, Cannot claim until transfer completes, Raised claim before transfer

## Classification

- **Category:** Eligibility_Service
- **Affected claim types:** Form 19 PF Final Settlement, Form 31 Partial Withdrawal/Advance, Form 10C Pension Withdrawal Benefit, Form 13 Transfer, UMANG/Member Portal Online Claim
- **Severity:** high
- **Official/common message status:** Duplicate/in-process claims are rejected (MembersFAQ / portal). A pending transfer locks or confuses balances across MIDs; filing Form 19/31 concurrently is a common forum failure mode and may settle only partial corpus.

## What it means

Either the new claim is rejected as duplicate/in process, or it pays only the current MID leaving residuals (142). Correct sequencing is transfer first, then withdraw — sharpening 127.

## Root cause

Impatience; misunderstanding that transfer and settlement can run together; multiple MID balances.

## How it is detected

Track Claim shows transfer In process. New claim Rejected duplicate/forwarded. Partial settlement.

## Fix

- Wait for Form 13 to show Settled and destination passbook credited.
- If transfer is stuck, fix transfer (068-072, 144-146) before any settlement claim.
- After consolidation, file a single Form 19/31/10C as eligible.
- If a premature claim already paid one MID, transfer residuals then claim remainder.

## Required documents

- Transfer claim status
- Passbooks

## Who acts

member

## Prevention

- Never file settlement on day of transfer filing.
- Check no other claim in process before submitting.

## Related records

- [epfo-rr-052](./epfo-rr-052.md)
- [epfo-rr-127](./epfo-rr-127.md)
- [epfo-rr-142](./epfo-rr-142.md)
- [epfo-rr-073](./epfo-rr-073.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, forum, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Reddit r/epfoindia raised a claim before transfer pattern.

- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- https://www.reddit.com/r/epfoindia/comments/1tm7e94/raised_a_claim_before_transfer/
- https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-160",
  "rejection_reason": "Online claim filed while Form 13 transfer is still pending",
  "aliases": [
    "Claim during pending transfer",
    "Form 19 while Form 13 in process",
    "Transfer pending claim rejected",
    "Cannot claim until transfer completes",
    "Raised claim before transfer"
  ],
  "category": "Eligibility_Service",
  "claim_types_affected": [
    "Form 19 PF Final Settlement",
    "Form 31 Partial Withdrawal/Advance",
    "Form 10C Pension Withdrawal Benefit",
    "Form 13 Transfer",
    "UMANG/Member Portal Online Claim"
  ],
  "severity": "high",
  "official_status_or_message": "Duplicate/in-process claims are rejected (MembersFAQ / portal). A pending transfer locks or confuses balances across MIDs; filing Form 19/31 concurrently is a common forum failure mode and may settle only partial corpus.",
  "what_it_means": "Either the new claim is rejected as duplicate/in process, or it pays only the current MID leaving residuals (142). Correct sequencing is transfer first, then withdraw — sharpening 127.",
  "root_cause": "Impatience; misunderstanding that transfer and settlement can run together; multiple MID balances.",
  "how_detected": "Track Claim shows transfer In process. New claim Rejected duplicate/forwarded. Partial settlement.",
  "fix_steps": [
    "Wait for Form 13 to show Settled and destination passbook credited.",
    "If transfer is stuck, fix transfer (068-072, 144-146) before any settlement claim.",
    "After consolidation, file a single Form 19/31/10C as eligible.",
    "If a premature claim already paid one MID, transfer residuals then claim remainder."
  ],
  "required_documents": [
    "Transfer claim status",
    "Passbooks"
  ],
  "who_acts": "member",
  "prevention_tips": [
    "Never file settlement on day of transfer filing.",
    "Check no other claim in process before submitting."
  ],
  "related_reason_ids": [
    "epfo-rr-052",
    "epfo-rr-127",
    "epfo-rr-142",
    "epfo-rr-073"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.reddit.com/r/epfoindia/comments/1tm7e94/raised_a_claim_before_transfer/",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix"
  ],
  "source_types": [
    "official",
    "forum",
    "blog"
  ],
  "confidence": "high",
  "notes": "Reddit r/epfoindia raised a claim before transfer pattern.",
  "last_verified": "2026-09-12"
}
```
