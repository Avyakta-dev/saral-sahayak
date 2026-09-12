# Glossary

Educational definitions for RAG retrieval. Confirm current usage on [epfindia.gov.in](https://www.epfindia.gov.in).

## Identity and KYC
- **UAN**: Universal Account Number — lifelong 12-digit member identity across jobs.
- **Member ID**: Establishment-specific PF account sitting under a UAN.
- **KYC seeding**: Storing Aadhaar, PAN, and bank+IFSC against the UAN.
- **Verified vs Pending KYC**: Uploaded is not verified. Online claims need Verified rows.
- **e-KYC / UIDAI OTP**: At claim time the member consents to UIDAI sharing Aadhaar demographics with EPFO.
- **Joint Declaration (JD)**: Joint request of member + employer to change up to 11 basic profile parameters (name, gender, DOB, parent name, relationship, marital status, DOJ, reason of leaving, DOL/DOE, nationality, Aadhaar). SOP JD/2022/1.
- **Minor vs major JD**: SOP classification that sets documents (2 vs 3+) and approving officer.
- **Form 11**: Declaration at joining (previous UAN, EPS membership). Wrong ticks create EPS mismatches.
- **Form 2**: Nomination form (paper); e-nomination is the digital equivalent and is valid only after e-sign.

## Bank and payment
- **IFSC**: Indian Financial System Code for NEFT. Changes after bank mergers.
- **NPCI validation**: Automated confirmation that the account exists and name matches. When it succeeds, cheque images are generally no longer required (2025 circular).
- **NEFT / UTR**: Electronic credit and its bank reference. Settled-but-returned means the UTR came back.
- **Sole vs joint account**: Ordinary PF claims expect a sole member account. Form 10D often allows joint with spouse only.

## Service and eligibility
- **DOE / DOL**: Date of exit / date of leaving. Blank DOE blocks Form 19/10C.
- **DOJ**: Date of joining. Required for Form 31 and service length.
- **ECR**: Electronic Challan-cum-Return — monthly employer filing of contributions.
- **EPS**: Employees' Pension Scheme 1995. Withdrawal benefit (Form 10C) vs monthly pension (Form 10D).
- **Pensionable service**: Months with EPS contribution, not mere calendar tenure. 9 years 6 months generally rounds to 10 years.
- **Overlap**: Two member IDs with intersecting DOJ–DOE ranges. Transfers should not be rejected solely for genuine overlap (circular 20 May 2025).
- **Annexure K**: Transfer statement of past service/contributions attached to Form 13.
- **Inoperative account**: Long transaction-less account that must be unblocked after KYC (SOP Aug 2024).
- **Scheme Certificate**: Preserves EPS service until pension age when cash-out is not allowed.

## Forms (short)
- **Form 19**: PF final settlement.
- **Form 31**: Partial withdrawal / advance.
- **Form 10C**: EPS withdrawal benefit or scheme certificate.
- **Form 10D**: Monthly pension (including family pension).
- **Form 13**: Transfer.
- **Form 20**: PF on death.
- **Form 5IF**: EDLI insurance on death in service.
- **CCF**: Composite Claim Form (Aadhaar or Non-Aadhaar) combining 19/10C/31 for physical filing.
- **Form 15G/15H**: Income-tax self-declaration to reduce TDS; not a substitute for PAN seeding.

## Other
- **DSC / e-sign**: Employer's digital signature used to approve KYC, JD, transfers.
- **EDLI**: Employees' Deposit Linked Insurance, generally only if death while in service.
- **PPO**: Pension Payment Order.
- **CPPS**: Centralised Pension Payment System (Aadhaar-linked pension credit anywhere in India).
- **CoC / SSA**: Certificate of Coverage under a Social Security Agreement for international workers.
- **EPFiGMS**: Official grievance portal.
- **Exempted establishment / trust**: Employer runs a private PF trust; extra certificates for EDLI/transfer.
- **EPF Scheme 2026**: Reported replacement of EPF Scheme 1952 effective 29 June 2026 (secondary sources). Verify live rules for 12-month membership, 25% retention, and 3-day settlement targets.

## Confidence labels in this dataset
- **high**: Official FAQ/form/circular or multiple independent reputable sources.
- **medium**: Widely reported secondary pattern or 2026 rule not independently gazette-verified.
- **low**: Sparse or forum-only (few records).
