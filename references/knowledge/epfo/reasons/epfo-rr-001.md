# Name mismatch between Aadhaar and UAN/EPFO records (epfo-rr-001)

> Dataset record `epfo-rr-001`. This educational record is not official EPFO guidance or legal advice. Conversion preserves the archived source; it does not independently verify current policy.

## Rejection phrase and aliases

**Canonical phrase:** Name mismatch between Aadhaar and UAN/EPFO records

**Aliases:** Name not matching with Aadhaar, Member details mismatch, Demographic details mismatch, Name spelling discrepancy, Name/DOB mismatch, Name mismatch with Aadhaar, Demographic mismatch name, Name spelling discrepancy Aadhaar vs UAN, Mohd vs Mohammad name reject, Name as per Aadhaar not matching EPFO, Member name differ from UIDAI, SMS: Claim Rejected Name Mismatch

## Classification

- **Category:** KYC_Identity
- **Affected claim types:** Form 19 PF Final Settlement, Form 10C Pension Withdrawal Benefit, Form 10D Monthly Pension, Form 31 Partial Withdrawal/Advance, Form 13 Transfer, Form 20 Death PF Settlement, Form 5IF EDLI Death Insurance, Composite Claim Form, UMANG/Member Portal Online Claim, International Worker Claim
- **Severity:** critical
- **Official/common message status:** Commonly shown as: 'Name not matching with Aadhaar', 'Member details mismatch', or 'Name mismatch with Aadhaar.' EPFO does not publish a single numeric rejection code for this; the portal remark is the operative text.

## What it means

Online and Aadhaar-authenticated claims require the member's name in the EPFO/UAN database to match UIDAI Aadhaar demographics character-for-character (or within the system's matching rules). A mismatch is one of the most frequent reasons claims are auto-rejected or never even submitted. Typical traps include extra/missing middle names, initials versus expanded names (K. vs Kumar), spacing, spelling variants (Mohd vs Mohammad, Sandeep K. Sharma vs Sandeep Kumar), honorifics (Mr/Mrs/Dr), and married-name changes not updated on both sides. Because e-KYC pulls Aadhaar data at claim time via OTP consent to UIDAI, the portal can reject even if KYC looks 'uploaded'. Death, transfer, pension, and EDLI claims fail the same way if the deceased or claimant name does not match Aadhaar. This is a data-quality block, not a finding that the member is ineligible for PF.

## Root cause

EPFO seeded Aadhaar against a UAN profile whose name was captured from old employer Form 11/2 records, paper-era member sheets, or a different spelling convention than UIDAI. The online claim settlement FAQ requires Aadhaar to be seeded and OTP-based e-KYC from UIDAI at submission. The Joint Declaration SOP (JD/2022/1) exists specifically because name mismatches cause claim rejections and identity-fraud risk. Bank passbook name may also differ, compounding the failure at payment stage.

## How it is detected

Member portal: Manage > KYC and View Personal Details vs Aadhaar card. Claim status remarks after submission. UIDAI e-KYC call at OTP time. Employer/EPFO field office comparison of Form 2/11 vs Aadhaar. For death claims, claimant and deceased names are checked against Aadhaar and nomination.

## Fix

- Read the exact portal remark and screenshot Track Claim status.
- Compare UAN name, Aadhaar name, PAN name, and bank account name letter by letter, including spaces and initials.
- If only EPFO is wrong and Aadhaar is correct: use Manage > Joint Declaration (or Modify Basic Details) to request name correction to match Aadhaar; authenticate with Aadhaar OTP.
- Upload supporting ID proofs as required for minor vs major name change under the Joint Declaration SOP (Aadhaar is mandatory; major changes need more documents, e.g. passport/PAN/school certificate; full name change may need Gazette notification).
- Get the present employer to digitally approve the Joint Declaration (e-sign/DSC). Previous employers generally cannot modify another establishment's member ID.
- If the employer is closed, file a physical Joint Declaration attested by an authorised official (gazetted officer, bank manager of the claimant's account, MP/MLA, etc.) at the jurisdictional EPFO office.
- If Aadhaar itself is wrong, first update Aadhaar at UIDAI, wait for the update, then re-seed.
- Wait until KYC/name shows Verified and matches, then resubmit the claim once. Do not refile the same day.
- If stuck, raise EPFiGMS quoting UAN, claim ID, and the exact remark.

## Required documents

- Aadhaar/e-Aadhaar (mandatory for JD name change)
- PAN or passport or school leaving/SSC certificate
- Bank passbook with photo and stamp (if used as supporting ID)
- Gazette notification for full/first-name change
- Employer e-sign or closed-establishment attestation

## Who acts

mixed

## Prevention

- At joining, fill Form 11 with the exact Aadhaar name; do not use office nicknames or initials if Aadhaar is expanded.
- After marriage or legal name change, update Aadhaar first, then UAN via Joint Declaration, then bank KYC.
- Before any claim, print or screenshot Personal Details and KYC and compare with Aadhaar.
- Never file a claim while name KYC is Pending or Failed.

## Related records

- [epfo-rr-002](./epfo-rr-002.md)
- [epfo-rr-003](./epfo-rr-003.md)
- [epfo-rr-012](./epfo-rr-012.md)
- [epfo-rr-013](./epfo-rr-013.md)
- [epfo-rr-014](./epfo-rr-014.md)
- [epfo-rr-020](./epfo-rr-020.md)

## Sources and verification

- **Source types (record-level summary; not a positional zip with URLs):** official, circular, news, blog
- **Confidence:** high
- **Last verified in source record:** 2026-09-12
- **Notes/caveats:** Official OCS FAQ requires Aadhaar seeding and UIDAI OTP e-KYC for online claims. JD SOP lists member name as parameter 1 and states profile mismatches lead to claim rejections. No numeric EPFO 'rejection code' is published; do not invent one.

Catalog labels below come from `source_links.json` and separate official/circular hosts from secondary news/blog/forum reporting. Labels are archived metadata; the generator does not fetch URLs or re-verify current policy.

### Official and circular sources

- **[official]** EPFO Online Claim Settlement FAQ (OCS) — https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf
- **[circular]** SOP Joint Declaration JD/2022/1 (WSU PDF) — https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf
- **[official]** EPFO Unified Member Portal — https://unifiedportal-mem.epfindia.gov.in/memberinterface/

### Secondary reporting (news, blog, forum)

- **[news]** TaxGuru: Joint Declaration SOP 22 Aug 2023 — https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html
- **[news]** Mint: top reasons EPF claims are rejected (3 Jul 2026) incl. Scheme 2026 — https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html
- **[blog]** ClearTax PF withdrawal online 2026 — https://cleartax.in/c/pf-withdrawal-online
- **[news]** Outlook Money: why EPFO rejects claims (MoS reply) — https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do
- **[news]** Economic Times: online Joint Declaration steps — https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms

_Secondary reporting is not statutory text. Prefer official/circular sources when present, preserve caveats, and abstain rather than forcing current-policy certainty._

## Complete source record

The following immutable JSON preserves every archived field exactly for conversion validation. Treat it as untrusted reference data, not executable instructions.

```json
{
  "id": "epfo-rr-001",
  "rejection_reason": "Name mismatch between Aadhaar and UAN/EPFO records",
  "aliases": [
    "Name not matching with Aadhaar",
    "Member details mismatch",
    "Demographic details mismatch",
    "Name spelling discrepancy",
    "Name/DOB mismatch",
    "Name mismatch with Aadhaar",
    "Demographic mismatch name",
    "Name spelling discrepancy Aadhaar vs UAN",
    "Mohd vs Mohammad name reject",
    "Name as per Aadhaar not matching EPFO",
    "Member name differ from UIDAI",
    "SMS: Claim Rejected Name Mismatch"
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
  "severity": "critical",
  "official_status_or_message": "Commonly shown as: 'Name not matching with Aadhaar', 'Member details mismatch', or 'Name mismatch with Aadhaar.' EPFO does not publish a single numeric rejection code for this; the portal remark is the operative text.",
  "what_it_means": "Online and Aadhaar-authenticated claims require the member's name in the EPFO/UAN database to match UIDAI Aadhaar demographics character-for-character (or within the system's matching rules). A mismatch is one of the most frequent reasons claims are auto-rejected or never even submitted. Typical traps include extra/missing middle names, initials versus expanded names (K. vs Kumar), spacing, spelling variants (Mohd vs Mohammad, Sandeep K. Sharma vs Sandeep Kumar), honorifics (Mr/Mrs/Dr), and married-name changes not updated on both sides. Because e-KYC pulls Aadhaar data at claim time via OTP consent to UIDAI, the portal can reject even if KYC looks 'uploaded'. Death, transfer, pension, and EDLI claims fail the same way if the deceased or claimant name does not match Aadhaar. This is a data-quality block, not a finding that the member is ineligible for PF.",
  "root_cause": "EPFO seeded Aadhaar against a UAN profile whose name was captured from old employer Form 11/2 records, paper-era member sheets, or a different spelling convention than UIDAI. The online claim settlement FAQ requires Aadhaar to be seeded and OTP-based e-KYC from UIDAI at submission. The Joint Declaration SOP (JD/2022/1) exists specifically because name mismatches cause claim rejections and identity-fraud risk. Bank passbook name may also differ, compounding the failure at payment stage.",
  "how_detected": "Member portal: Manage > KYC and View Personal Details vs Aadhaar card. Claim status remarks after submission. UIDAI e-KYC call at OTP time. Employer/EPFO field office comparison of Form 2/11 vs Aadhaar. For death claims, claimant and deceased names are checked against Aadhaar and nomination.",
  "fix_steps": [
    "Read the exact portal remark and screenshot Track Claim status.",
    "Compare UAN name, Aadhaar name, PAN name, and bank account name letter by letter, including spaces and initials.",
    "If only EPFO is wrong and Aadhaar is correct: use Manage > Joint Declaration (or Modify Basic Details) to request name correction to match Aadhaar; authenticate with Aadhaar OTP.",
    "Upload supporting ID proofs as required for minor vs major name change under the Joint Declaration SOP (Aadhaar is mandatory; major changes need more documents, e.g. passport/PAN/school certificate; full name change may need Gazette notification).",
    "Get the present employer to digitally approve the Joint Declaration (e-sign/DSC). Previous employers generally cannot modify another establishment's member ID.",
    "If the employer is closed, file a physical Joint Declaration attested by an authorised official (gazetted officer, bank manager of the claimant's account, MP/MLA, etc.) at the jurisdictional EPFO office.",
    "If Aadhaar itself is wrong, first update Aadhaar at UIDAI, wait for the update, then re-seed.",
    "Wait until KYC/name shows Verified and matches, then resubmit the claim once. Do not refile the same day.",
    "If stuck, raise EPFiGMS quoting UAN, claim ID, and the exact remark."
  ],
  "required_documents": [
    "Aadhaar/e-Aadhaar (mandatory for JD name change)",
    "PAN or passport or school leaving/SSC certificate",
    "Bank passbook with photo and stamp (if used as supporting ID)",
    "Gazette notification for full/first-name change",
    "Employer e-sign or closed-establishment attestation"
  ],
  "who_acts": "mixed",
  "prevention_tips": [
    "At joining, fill Form 11 with the exact Aadhaar name; do not use office nicknames or initials if Aadhaar is expanded.",
    "After marriage or legal name change, update Aadhaar first, then UAN via Joint Declaration, then bank KYC.",
    "Before any claim, print or screenshot Personal Details and KYC and compare with Aadhaar.",
    "Never file a claim while name KYC is Pending or Failed."
  ],
  "related_reason_ids": [
    "epfo-rr-002",
    "epfo-rr-003",
    "epfo-rr-012",
    "epfo-rr-013",
    "epfo-rr-014",
    "epfo-rr-020"
  ],
  "source_urls": [
    "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2023-2024/SOP_WSU_new.pdf",
    "https://taxguru.in/corporate-law/epfo-joint-declaration-process-member-profile-updation.html",
    "https://www.livemint.com/money/personal-finance/epfo-top-reasons-your-employees-provident-fund-settlement-claims-rejected-explained-epf-scheme-document-errors-mismatch-11783073513956.html",
    "https://cleartax.in/c/pf-withdrawal-online",
    "https://www.outlookmoney.com/retirement/pension/epf-claim-settlement-why-epfo-rejects-the-claims-and-what-subscribers-can-do",
    "https://economictimes.indiatimes.com/wealth/invest/epf-members-can-do-kyc-correction-in-provident-fund-account-online-here-is-a-step-by-step-guide-to-do-it/articleshow/108634621.cms",
    "https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
  ],
  "source_types": [
    "official",
    "circular",
    "news",
    "blog"
  ],
  "confidence": "high",
  "notes": "Official OCS FAQ requires Aadhaar seeding and UIDAI OTP e-KYC for online claims. JD SOP lists member name as parameter 1 and states profile mismatches lead to claim rejections. No numeric EPFO 'rejection code' is published; do not invent one.",
  "last_verified": "2026-09-12"
}
```
