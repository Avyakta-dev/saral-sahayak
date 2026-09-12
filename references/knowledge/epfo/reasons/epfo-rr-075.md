# International worker Certificate of Coverage (CoC) or Social Security Agreement documentation issues (epfo-rr-075)

> Dataset record `epfo-rr-075`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** International worker Certificate of Coverage (CoC) or Social Security Agreement documentation issues

**Aliases:** CoC rejected, SSA certificate, International worker detachment documents, Certificate of Coverage

## Classification

- **Category:** Compliance_Legal
- **Affected claim types:** International Worker Claim, Form 19 PF Final Settlement, Form 13 Transfer
- **Severity:** medium
- **Official/common message status:** EPFO IW portal issues Certificates of Coverage under SSAs so that detached workers need not double-contribute. CoC applications can be rejected by the Regional Office after employer e-sign if passport, assignment, or SSA details are inconsistent. This is not the same as a PF withdrawal rejection but blocks the intended exemption path and later confuses nationality/contribution claims.

## What it means

If CoC was never issued, the IW may have been forced into full EPF/EPS. Withdrawal then follows ordinary or IW physical rules. If CoC was issued, some contributions should not exist; claiming them, or claiming exemption without CoC, creates compliance rejects. Nationality is a JD parameter (major if Non-SSA to SSA country).

## Root cause

Wrong SSA country; assignment dates; employer e-sign missing on CoC; nationality field wrong on UAN.

## How it is detected

IW portal rejection remarks. Nationality mismatch on JD. Contribution despite CoC.

## Fix

- Check IW portal status and rejection remarks; correct passport/assignment/SSA fields; employer re-e-signs.
- Align UAN nationality via JD with passport.
- For withdrawal after assignment, use IW physical path if no Aadhaar (epfo-rr-074) or online if seeded.
- Do not mix CoC exemption requests with Form 19 on the member portal without guidance from the IW cell.

## Required documents

- Passport
- Assignment letter
- SSA/CoC application
- Employer e-sign

## Who acts

mixed

## Prevention

- Apply CoC before the assignment starts, not after payroll has already deducted PF wrongly.

## Related records

- [epfo-rr-074](./epfo-rr-074.md)
- [epfo-rr-013](./epfo-rr-013.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, blog
- **Confidence:** medium
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** CoC rejection mechanics summarised from IW brochure explainers; not a numbered 'claim rejection code'. Nationality major/minor split is in SOP JD/2022/1 Table 2.

Per-URL labels below come from `source_links.json` (official/circular vs secondary). Titles and citation counts are in [sources.md](../sources.md). Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official / circular

- [official] https://www.epfindia.gov.in/site_en/International_workers.php
- [circular] https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf

### Secondary (news / blog / forum)

- [blog] https://www.gconnect.in/epfo/social-security-international-workers-agreements-epf-scheme-1952.html
- [blog] https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf

_Secondary reporting is not statutory text; prefer official/circular sources and preserve caveats rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-075",
  "rejection_reason": "International worker Certificate of Coverage (CoC) or Social Security Agreement documentation issues",
  "aliases": [
    "CoC rejected",
    "SSA certificate",
    "International worker detachment documents",
    "Certificate of Coverage"
  ],
  "category": "Compliance_Legal",
  "claim_types_affected": [
    "International Worker Claim",
    "Form 19 PF Final Settlement",
    "Form 13 Transfer"
  ],
  "severity": "medium",
  "official_status_or_message": "EPFO IW portal issues Certificates of Coverage under SSAs so that detached workers need not double-contribute. CoC applications can be rejected by the Regional Office after employer e-sign if passport, assignment, or SSA details are inconsistent. This is not the same as a PF withdrawal rejection but blocks the intended exemption path and later confuses nationality/contribution claims.",
  "what_it_means": "If CoC was never issued, the IW may have been forced into full EPF/EPS. Withdrawal then follows ordinary or IW physical rules. If CoC was issued, some contributions should not exist; claiming them, or claiming exemption without CoC, creates compliance rejects. Nationality is a JD parameter (major if Non-SSA to SSA country).",
  "root_cause": "Wrong SSA country; assignment dates; employer e-sign missing on CoC; nationality field wrong on UAN.",
  "how_detected": "IW portal rejection remarks. Nationality mismatch on JD. Contribution despite CoC.",
  "fix_steps": [
    "Check IW portal status and rejection remarks; correct passport/assignment/SSA fields; employer re-e-signs.",
    "Align UAN nationality via JD with passport.",
    "For withdrawal after assignment, use IW physical path if no Aadhaar (epfo-rr-074) or online if seeded.",
    "Do not mix CoC exemption requests with Form 19 on the member portal without guidance from the IW cell."
  ],
  "required_documents": [
    "Passport",
    "Assignment letter",
    "SSA/CoC application",
    "Employer e-sign"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Apply CoC before the assignment starts, not after payroll has already deducted PF wrongly."
  ],
  "related_reason_ids": [
    "epfo-rr-074",
    "epfo-rr-013"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_en/International_workers.php",
    "https://www.gconnect.in/epfo/social-security-international-workers-agreements-epf-scheme-1952.html",
    "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-EPFO-Update-Simplifying-process-of-PF-withdrawal-for-International-Workers.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf"
  ],
  "source_types": [
    "official",
    "blog"
  ],
  "confidence": "medium",
  "notes": "CoC rejection mechanics summarised from IW brochure explainers; not a numbered 'claim rejection code'. Nationality major/minor split is in SOP JD/2022/1 Table 2.",
  "last_verified": "2026-09-12"
}
```
