# Form 31 illness Certificate C / doctor-employer certificate defective on physical claim (epfo-rr-129)

> Dataset record `epfo-rr-129`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Form 31 illness Certificate C / doctor-employer certificate defective on physical claim

**Aliases:** Certificate C rejected, Doctor certificate not accepted Form 31, Employer medical certificate defective, Physical medical advance documents returned

## Classification

- **Category:** Form_Documentation
- **Affected claim types:** Form 31 Partial Withdrawal/Advance, Composite Claim Form
- **Severity:** medium
- **Official/common message status:** Labour-law Form 31 PDF and ClearTax document tables require Certificate C signed by employer and doctor for illness advances on traditional/physical paths. Online self-cert often replaces this.

## What it means

Distinct from medical eligibility amount: purpose is valid but certificates are unsigned, undated, non-registered doctor, or employer stamp missing.

## Root cause

Unsigned/undated certificate; non-recognised doctor; employer stamp missing; unreadable scan.

## How it is detected

Physical claim returned for medical certificates.

## Fix

- Obtain fresh doctor certificate with registration details and dates.
- Get employer signature/stamp on Certificate C where required.
- Upload clear scans if portal asks; otherwise submit physical set to RO.
- If eligible for online Aadhaar claim, prefer online self-cert path.

## Required documents

- Certificate C / doctor certificate
- Employer signed medical form
- Readable scans

## Who acts

mixed

## Prevention

- Prefer online illness advance when KYC allows.

## Related records

- [epfo-rr-087](./epfo-rr-087.md)
- [epfo-rr-053](./epfo-rr-053.md)
- [epfo-rr-050](./epfo-rr-050.md)
- [epfo-rr-048](./epfo-rr-048.md)

## Sources and verification

- **Source types (record-level summary; not URL-position aligned):** blog, circular
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** _No additional note recorded._

- https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf
- https://cleartax.in/s/epf-form-31
- https://www.indiafilings.com/learn/epf-form-31
- https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-129",
  "rejection_reason": "Form 31 illness Certificate C / doctor-employer certificate defective on physical claim",
  "aliases": [
    "Certificate C rejected",
    "Doctor certificate not accepted Form 31",
    "Employer medical certificate defective",
    "Physical medical advance documents returned"
  ],
  "category": "Form_Documentation",
  "claim_types_affected": [
    "Form 31 Partial Withdrawal/Advance",
    "Composite Claim Form"
  ],
  "severity": "medium",
  "official_status_or_message": "Labour-law Form 31 PDF and ClearTax document tables require Certificate C signed by employer and doctor for illness advances on traditional/physical paths. Online self-cert often replaces this.",
  "what_it_means": "Distinct from medical eligibility amount: purpose is valid but certificates are unsigned, undated, non-registered doctor, or employer stamp missing.",
  "root_cause": "Unsigned/undated certificate; non-recognised doctor; employer stamp missing; unreadable scan.",
  "how_detected": "Physical claim returned for medical certificates.",
  "fix_steps": [
    "Obtain fresh doctor certificate with registration details and dates.",
    "Get employer signature/stamp on Certificate C where required.",
    "Upload clear scans if portal asks; otherwise submit physical set to RO.",
    "If eligible for online Aadhaar claim, prefer online self-cert path."
  ],
  "required_documents": [
    "Certificate C / doctor certificate",
    "Employer signed medical form",
    "Readable scans"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "Prefer online illness advance when KYC allows."
  ],
  "related_reason_ids": [
    "epfo-rr-087",
    "epfo-rr-053",
    "epfo-rr-050",
    "epfo-rr-048"
  ],
  "source_urls": [
    "https://labourlawadvisor.in/blog/wp-content/uploads/2019/08/PF-Advance-Rules.pdf",
    "https://cleartax.in/s/epf-form-31",
    "https://www.indiafilings.com/learn/epf-form-31",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2016-2017/Composite_Claim_Forms_31792.pdf"
  ],
  "source_types": [
    "blog",
    "circular"
  ],
  "confidence": "high",
  "notes": "",
  "last_verified": "2026-09-12"
}
```
