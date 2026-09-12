# Form 13 transfer pending or rejected because previous or present employer did not digitally attest (epfo-rr-068)

> Dataset record `epfo-rr-068`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 13 transfer pending or rejected because previous or present employer did not digitally attest

**Aliases:** Transfer pending with employer, Previous employer not approving transfer, Present employer attestation pending, Form 13 employer not attesting, Transfer pending employer attestation, Previous employer not approving Form 13, Present employer DSC pending transfer

## Classification

- **Category:** Transfer_Related
- **Affected claim types:** Form 13 Transfer
- **Severity:** high
- **Official/common message status:** OTCP/MembersFAQ: online transfer needs employer attestation (previous or present, depending on flow) via DSC/e-sign. Employer rejection reasons include details mismatch, duplicate already forwarded, printout not received after 15 days, signature mismatch.

## What it means

Form 13 moves PF and service from an old member ID to the current one. If neither employer attests, the transfer sits or is rejected. Members can often choose present employer when the old HR has vanished, provided the present employer will e-sign. Without transfer, later 10D/19 can fail for incomplete history.

## Root cause

Old employer DSC expired; company closed; HR refuses; member details mismatch.

## How it is detected

Track Transfer Claim: pending with previous/present employer or rejected by employer.

## Fix

- In the transfer UI, select the attesting employer who is actually reachable (often the present one).
- Align name/DOB so employer records match (JD if needed).
- If a printout is still required, deliver it within 15 days (epfo-rr-032).
- If old employer is closed, use present employer attestation or the field-office transfer helpdesk / EPFiGMS.
- After Approved/Transferred, verify Annexure K / unified passbook before filing settlement.

## Required documents

- UAN of both sides
- Member IDs
- KYC verified
- Employer DSC

## Who acts

mixed

## Prevention

- Start Form 13 in the first month of a new job, not years later.
- Do not resign from the new job before the old transfer is done if you can avoid it.

## Related records

- [epfo-rr-027](./epfo-rr-027.md)
- [epfo-rr-028](./epfo-rr-028.md)
- [epfo-rr-032](./epfo-rr-032.md)
- [epfo-rr-030](./epfo-rr-030.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** official, blog, news
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf
- https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php
- https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status
- https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html
- https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-068",
  "rejection_reason": "Form 13 transfer pending or rejected because previous or present employer did not digitally attest",
  "aliases": [
    "Transfer pending with employer",
    "Previous employer not approving transfer",
    "Present employer attestation pending",
    "Form 13 employer not attesting",
    "Transfer pending employer attestation",
    "Previous employer not approving Form 13",
    "Present employer DSC pending transfer"
  ],
  "category": "Transfer_Related",
  "claim_types_affected": [
    "Form 13 Transfer"
  ],
  "severity": "high",
  "official_status_or_message": "OTCP/MembersFAQ: online transfer needs employer attestation (previous or present, depending on flow) via DSC/e-sign. Employer rejection reasons include details mismatch, duplicate already forwarded, printout not received after 15 days, signature mismatch.",
  "what_it_means": "Form 13 moves PF and service from an old member ID to the current one. If neither employer attests, the transfer sits or is rejected. Members can often choose present employer when the old HR has vanished, provided the present employer will e-sign. Without transfer, later 10D/19 can fail for incomplete history.",
  "root_cause": "Old employer DSC expired; company closed; HR refuses; member details mismatch.",
  "how_detected": "Track Transfer Claim: pending with previous/present employer or rejected by employer.",
  "fix_steps": [
    "In the transfer UI, select the attesting employer who is actually reachable (often the present one).",
    "Align name/DOB so employer records match (JD if needed).",
    "If a printout is still required, deliver it within 15 days (epfo-rr-032).",
    "If old employer is closed, use present employer attestation or the field-office transfer helpdesk / EPFiGMS.",
    "After Approved/Transferred, verify Annexure K / unified passbook before filing settlement."
  ],
  "required_documents": [
    "UAN of both sides",
    "Member IDs",
    "KYC verified",
    "Employer DSC"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Start Form 13 in the first month of a new job, not years later.",
    "Do not resign from the new job before the old transfer is done if you can avoid it."
  ],
  "related_reason_ids": [
    "epfo-rr-027",
    "epfo-rr-028",
    "epfo-rr-032",
    "epfo-rr-030"
  ],
  "source_urls": [
    "https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf",
    "https://www.epfindia.gov.in/site_en/OTCP_ForEmployers.php",
    "https://kustodian.life/resources/epf-form-13-pf-transfer-online-offline-how-to-fill-pdf-status",
    "https://www.livemint.com/money/personal-finance/changing-jobs-soon-fix-these-epf-transfer-errors-before-resigning-for-a-smooth-pf-transfer-11782808524771.html",
    "https://www.citizennest.com/guide/epf-transfer-claim-rejected-fix"
  ],
  "source_types": [
    "official",
    "blog",
    "news"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
