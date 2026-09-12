# EPFO claim-rejection RAG dataset

Hackathon-ready knowledge base of **181 canonical rejection reasons** for Employees' Provident Fund Organisation (India) claims: KYC, bank, employer, eligibility, forms, portal, death/EDLI, transfer, international workers, and compliance.

**Last verified:** 2026-09-12

## Disclaimer

This package is **educational / hackathon material**. It is **not** official EPFO guidance, not legal advice, and not a substitute for the EPF & MP Act 1952, EPF/EPS/EDLI schemes, or current circulars. Portal remarks are not published as a single numbered code list; this dataset **does not invent rejection codes or circular numbers**. Verify everything on [epfindia.gov.in](https://www.epfindia.gov.in), the [member portal](https://unifiedportal-mem.epfindia.gov.in/memberinterface/), and [EPFiGMS](https://epfigms.gov.in/). EPF Scheme 2026 details from news/explainers are marked medium confidence where the gazette was not fetched.

## Contents

```
README.md
sources.md
data/rejections.json
data/rejections.jsonl
data/rejections.csv
data/source_links.json
data/source_links.csv
docs/glossary.md
docs/claim-types-overview.md
docs/resolution-playbooks.md
rag/chunks.jsonl
```

ZIP is built from these paths only (not `_build/`).

## Record count and category index

**181 records.** Category histogram:

- **Eligibility_Service**: 41
- **Nominee_Death**: 21
- **KYC_Identity**: 20
- **Compliance_Legal**: 18
- **Technical_Portal**: 17
- **Bank_Payment**: 16
- **Form_Documentation**: 15
- **Employer_Related**: 13
- **Transfer_Related**: 13
- **Other**: 7

IDs run `epfo-rr-001` … `epfo-rr-181` (**181** contiguous canonical reasons in this build).

### Category → record IDs (see JSON for titles)

#### Bank_Payment
- `epfo-rr-015` — Bank account and IFSC not seeded in EPFO database (critical, high)
- `epfo-rr-016` — Bank KYC not verified or NPCI account validation failed (critical, high)
- `epfo-rr-017` — Incorrect bank account number entered in KYC or claim (high, high)
- `epfo-rr-018` — Invalid or outdated IFSC after bank merger or branch change (high, high)
- `epfo-rr-019` — Joint, third-party, or not-sole-operated bank account used for claim payment (high, high)
- `epfo-rr-020` — Bank account holder name does not match UAN/Aadhaar name (high, high)
- `epfo-rr-021` — Unclear cancelled cheque or passbook image for non-NPCI-verified accounts (medium, high)
- `epfo-rr-022` — Claim settled but payment returned because account is dormant, frozen, closed, or KYC-pending at bank (high, high)
- `epfo-rr-023` — Pension (Form 10D) bank account is not single or joint with spouse (high, medium)
- `epfo-rr-105` — NRI / FEMA bank account issue — resident account after non-resident status or NRE/foreign account used (high, high)
- `epfo-rr-106` — Cancelled cheque upload demanded or rejected despite NPCI-verified bank KYC (post-removal circular edge case) (medium, high)
- `epfo-rr-115` — Bank account changed after claim submission causing payment failure or re-validation reject (medium, high)
- `epfo-rr-156` — UPI-only / VPA-centric account without usable account-number+IFSC for EPFO NEFT credit (high, medium)
- `epfo-rr-157` — Cooperative or regional rural bank account fails NPCI validation for EPFO bank KYC (high, medium)
- `epfo-rr-158` — Bank account holder name truncated on NPCI/NEFT validation causing false name mismatch (medium, medium)
- `epfo-rr-159` — Penny-drop bank account verification failed during EPFO bank KYC seeding (high, high)

#### Compliance_Legal
- `epfo-rr-074` — International worker or specified migrant class blocked for want of Aadhaar even though physical settlement without Aadhaar seeding is allowed (high, high)
- `epfo-rr-075` — International worker Certificate of Coverage (CoC) or Social Security Agreement documentation issues (medium, medium)
- `epfo-rr-076` — Inoperative or high-risk member ID subjected to additional scrutiny; claim delayed or returned (high, high)
- `epfo-rr-077` — Dual employment or overlapping wage reporting with two covered establishments (medium, medium)
- `epfo-rr-078` — PAN missing or Form 15G/15H issues causing TDS problems on taxable (service < 5 years) Form 19 (medium, medium)
- `epfo-rr-101` — Higher pension / EPS-95 joint option claim blocked or returned for contribution proof gaps (high, high)
- `epfo-rr-102` — EPS wage ceiling / pension contribution above statutory cap causing claim hold (high, high)
- `epfo-rr-112` — Life certificate / Jeevan Pramaan not submitted — pension stopped or credit blocked (high, high)
- `epfo-rr-123` — International worker claim blocked for want of passport/bank attestation on physical non-Aadhaar path (high, high)
- `epfo-rr-128` — Higher pension option pending validation delaying ordinary Form 10D start (medium, medium)
- `epfo-rr-150` — Inspection para or compliance proceeding against establishment holding member claims (high, medium)
- `epfo-rr-163` — High-value claim subjected to additional scrutiny or officer-layer hold (high, medium)
- `epfo-rr-164` — Multiple claims pattern / serial filing flagged as suspicious or auto-blocked (high, medium)
- `epfo-rr-165` — Fake, non-existent, or shell employer establishment triggering claim/compliance block (critical, medium)
- `epfo-rr-166` — Death claim held for fraud checks — death certificate authenticity or claimant identity verification (critical, medium)
- `epfo-rr-167` — SSA country-specific withdrawal or benefit rule blocking International Worker claim (high, medium)
- `epfo-rr-168` — Certificate of Coverage expired while worker still on overseas detachment (high, high)
- `epfo-rr-169` — Detached worker rules misapplied — dual contribution or wrong classification as domestic member (high, medium)

#### Eligibility_Service
- `epfo-rr-033` — Form 19 filed before the mandatory waiting period after leaving employment (high, high)
- `epfo-rr-034` — Form 19 filed while member is still in PF-covered employment (critical, high)
- `epfo-rr-035` — Form 10C pension withdrawal benefit claimed with less than six months' eligible service (high, high)
- `epfo-rr-036` — Form 10C cash withdrawal filed when pensionable service is 10 years or more (Scheme Certificate / Form 10D required) (high, high)
- `epfo-rr-037` — Form 10D monthly pension claimed with less than 10 years' eligible service (critical, high)
- `epfo-rr-038` — Form 10D claimed before eligible age (normally 58, or 50 for reduced early pension) (high, high)
- `epfo-rr-039` — Form 31 advance purpose ineligible or minimum membership/service not met (high, medium)
- `epfo-rr-040` — Form 31 amount exceeds permitted limit or would breach the mandatory retained balance (medium, medium)
- `epfo-rr-041` — Overlapping service periods between two employments / member IDs (high, high)
- `epfo-rr-042` — Service history gaps, missing EPS months, or incomplete contribution record (high, high)
- `epfo-rr-043` — Wrong claim form selected for the member's situation (high, high)
- `epfo-rr-044` — Form 11 / EPS membership status discrepancy (EPS enrolled vs not enrolled) (high, medium)
- `epfo-rr-045` — Inoperative or blocked UAN/member account not unblocked before claim (high, high)
- `epfo-rr-046` — Multiple UANs not merged; service and EPS split across accounts (high, high)
- `epfo-rr-082` — Form 31 housing purchase/construction/plot advance ineligible or ownership/service not met (high, high)
- `epfo-rr-083` — Form 31 housing loan repayment advance rejected (agency certificate / tenure / amount) (high, high)
- `epfo-rr-084` — Form 31 home renovation/alteration/improvement advance rejected (medium, high)
- `epfo-rr-085` — Form 31 marriage advance ineligible (service, relationship, frequency, or amount) (high, high)
- `epfo-rr-086` — Form 31 education (post-matriculation) advance ineligible (high, high)
- `epfo-rr-087` — Form 31 medical/illness treatment advance rejected (self or family) (high, high)
- `epfo-rr-088` — Form 31 natural calamity / abnormal conditions advance rejected (medium, high)
- `epfo-rr-089` — Form 31 COVID-19 / pandemic outbreak advance rejected or wrongly substituted with calamity (medium, high)
- `epfo-rr-090` — Form 31 unemployment / non-contribution advance rejected (waiting period or still contributing) (critical, high)
- `epfo-rr-091` — Form 31 cut in wages / non-receipt of wages for two months advance rejected (medium, high)
- `epfo-rr-092` — Form 31 factory closure / lockout advance rejected (medium, high)
- `epfo-rr-093` — Form 31 advance for purchase of equipment by physically handicapped member rejected (medium, medium)
- `epfo-rr-094` — Form 31 illness advance for pregnancy or family member treatment documentation/eligibility failure (medium, medium)
- `epfo-rr-095` — Form 31 advance within one year of retirement (90% pre-retirement) rejected (medium, high)
- `epfo-rr-096` — Form 31 rejected because membership/service months are insufficient for the selected purpose (high, high)
- `epfo-rr-100` — VPF / excess voluntary contribution confusion causing claim or transfer friction (medium, medium)
- `epfo-rr-110` — Form 10D reduced early pension claimed when full pension intended (or vice versa) (medium, high)
- `epfo-rr-111` — Disablement / physically handicapped pension (Form 10D) eligibility or medical board proof inadequate (medium, medium)
- `epfo-rr-119` — Scheme Certificate not issued or lost blocking later Form 10D recognition of past service (high, high)
- `epfo-rr-121` — Form 31 Special Circumstances purpose used without meeting unemployment/calamity/closure conditions (medium, medium)
- `epfo-rr-125` — One-year continuous unemployment full-withdrawal expectation filed on wrong Form 31 purpose (medium, medium)
- `epfo-rr-131` — Form 31 housing plot/site purchase rejected separately from construction (ownership or cost cap) (medium, high)
- `epfo-rr-160` — Online claim filed while Form 13 transfer is still pending (high, high)
- `epfo-rr-162` — Claim or transfer attempted while multiple-UAN merge / deactivation is still in progress (high, high)
- `epfo-rr-178` — Concurrent Form 31 advance and Form 19 final settlement conflict (high, high)
- `epfo-rr-179` — Second Form 31 withdrawal for the same purpose filed too soon / frequency limit exceeded (high, medium)
- `epfo-rr-180` — Nominee or family filed death-style claim while member is still alive (critical, high)

#### Employer_Related
- `epfo-rr-024` — Date of exit (DOE) not updated by employer in EPFO service history (critical, high)
- `epfo-rr-025` — Date of joining (DOJ) missing or incorrect in EPFO database (high, high)
- `epfo-rr-026` — Employer attestation missing on physical or Non-Aadhaar composite claim (high, high)
- `epfo-rr-027` — Employer rejected the online/physical claim because member details do not match establishment records (high, high)
- `epfo-rr-028` — Employer digital signature (DSC) or e-sign missing, expired, or not registered (high, high)
- `epfo-rr-029` — Employer PF/EPS contribution not deposited or ECR not filed for relevant months (high, high)
- `epfo-rr-030` — Establishment closed, untraceable, or no authorised officer to attest or approve KYC (high, high)
- `epfo-rr-031` — Exempted establishment or private PF trust complications blocking EPFO claim or transfer (high, medium)
- `epfo-rr-032` — Employer rejected online claim because signed printout was not received within 15 days (medium, high)
- `epfo-rr-097` — Claim rejected because contribution received after date of exit (post-exit ECR) (high, high)
- `epfo-rr-098` — Unemployment/exit claim rejected because PF and EPS are still being deposited by employer (high, high)
- `epfo-rr-147` — Establishment code change, merger, or amalgamation leaving member ID mapped to obsolete code (high, medium)
- `epfo-rr-149` — ECR revised or supplementary return filed after claim submission altering service or contribution data (high, medium)

#### Form_Documentation
- `epfo-rr-047` — Incomplete or incorrectly filled claim application (medium, high)
- `epfo-rr-048` — Required supporting documents not submitted (especially death, pension, and physical claims) (high, high)
- `epfo-rr-049` — Wrong Composite Claim Form used (Aadhaar vs Non-Aadhaar) or CCF filed without meeting seeding conditions (medium, high)
- `epfo-rr-050` — Missing claimant or employer signature / stamp on physical claim (medium, high)
- `epfo-rr-051` — Wrong Member ID selected or unknown Member ID linked under the UAN (medium, medium)
- `epfo-rr-052` — Duplicate claim already in process or previously forwarded and not rejected (medium, high)
- `epfo-rr-053` — Form 31 purpose documents or self-certification deficient (low, medium)
- `epfo-rr-099` — Form 14 financing of LIC policy rejected (eligibility, insurer, or balance) (medium, medium)
- `epfo-rr-104` — Composite Form 19+10C claim partially rejected or mistimed (one component fails) (high, high)
- `epfo-rr-129` — Form 31 illness Certificate C / doctor-employer certificate defective on physical claim (medium, high)
- `epfo-rr-140` — Form 5IF EDLI filed without or out of sequence with Form 20 PF death claim causing return (medium, high)
- `epfo-rr-170` — Physical claim attested by wrong authority — not on EPFO's accepted attestor list (high, high)
- `epfo-rr-171` — Supporting document expired — passport, medical certificate, or other time-limited proof (medium, medium)
- `epfo-rr-172` — Foreign-language document without certified translation rejected (medium, medium)
- `epfo-rr-173` — Notary attestation used where gazetted or listed authority attestation is mandatory (medium, high)

#### KYC_Identity
- `epfo-rr-001` — Name mismatch between Aadhaar and UAN/EPFO records (critical, high)
- `epfo-rr-002` — Date of birth mismatch across UAN, Aadhaar, and PAN (high, high)
- `epfo-rr-003` — Father's or mother's name mismatch in UAN versus Aadhaar (high, high)
- `epfo-rr-004` — Gender mismatch between UAN profile and Aadhaar (medium, high)
- `epfo-rr-005` — Aadhaar not seeded or not verified against UAN (critical, high)
- `epfo-rr-006` — PAN not seeded for PF final settlement when service is less than five years (high, high)
- `epfo-rr-007` — UAN not activated or member portal credentials not usable (critical, high)
- `epfo-rr-008` — Aadhaar OTP or UIDAI e-KYC authentication failed at claim submission (high, high)
- `epfo-rr-009` — Registered mobile number inactive, not Aadhaar-linked, or not receiving EPFO/UIDAI OTPs (high, high)
- `epfo-rr-010` — KYC uploaded but pending employer digital verification (critical, high)
- `epfo-rr-011` — Aadhaar already linked to another UAN (high, high)
- `epfo-rr-012` — Name mismatch caused by initials, honorifics, extra spaces, or expanded vs abbreviated middle name (high, high)
- `epfo-rr-013` — Joint Declaration for profile correction pending, returned, or rejected (high, high)
- `epfo-rr-014` — PAN name or date of birth does not match UAN/Aadhaar (medium, medium)
- `epfo-rr-151` — Aadhaar face authentication failure on UMANG blocking UAN activation or KYC refresh (critical, high)
- `epfo-rr-152` — Legacy biometric (fingerprint) mismatch at Aadhaar authentication for claim or KYC (high, medium)
- `epfo-rr-153` — Aadhaar Vault / reference-key or encrypted Aadhaar storage issue preventing seeding display (medium, medium)
- `epfo-rr-154` — DigiLocker-fetched KYC document rejected or not accepted as EPFO seeding proof (medium, medium)
- `epfo-rr-155` — Passport-only member blocked on Aadhaar-mandatory online path despite physical non-Aadhaar eligibility (high, high)
- `epfo-rr-161` — Claim filed while Joint Declaration for profile correction is still pending or under RO approval (high, high)

#### Nominee_Death
- `epfo-rr-060` — No valid nomination on record (Form 2 / e-nomination absent or incomplete) (high, high)
- `epfo-rr-061` — Claimant is not the nominee and does not qualify as family or legal heir under the scheme (critical, high)
- `epfo-rr-062` — Death certificate missing, unreadable, or particulars not matching UAN records (critical, high)
- `epfo-rr-063` — Legal heir or succession certificate missing when there is no valid nomination (high, high)
- `epfo-rr-064` — Family details missing for widow/widower or child pension (Form 10D death/family pension) (high, high)
- `epfo-rr-065` — Guardianship certificate missing for a minor nominee, family member, or legal heir (high, high)
- `epfo-rr-066` — Deceased member's KYC or name does not match Aadhaar, blocking death claim (high, high)
- `epfo-rr-067` — EDLI (Form 5IF) not payable because member did not die while in service (critical, high)
- `epfo-rr-107` — Member dies while a claim is pending — settlement path must switch to death claims (critical, high)
- `epfo-rr-108` — Orphan pension (Form 10D) documentation or eligibility gaps (high, medium)
- `epfo-rr-109` — Widow/widower family pension rejected due to remarriage flag, marriage proof, or spouse KYC gaps (high, high)
- `epfo-rr-118` — Child pension stopped or rejected because beneficiary crossed age limit without disablement exception (medium, medium)
- `epfo-rr-132` — Widow and children simultaneous Form 10D family pension — documentation or bank allocation defects (high, high)
- `epfo-rr-133` — Widow/widower family pension stopped or reclaim raised after remarriage without proper notification path (high, high)
- `epfo-rr-134` — Full orphan Form 10D pension rejected — both-parents death proof or orphan rate documentation gaps (high, high)
- `epfo-rr-135` — Family/orphan pension credit blocked after guardian change without EPFO update (medium, medium)
- `epfo-rr-136` — Dependent parents Form 10D pension rejected when spouse or eligible children still exist or dependency unproven (high, medium)
- `epfo-rr-137` — EDLI Form 5IF assurance amount disputed — calculated benefit below expected minimum/maximum band (medium, high)
- `epfo-rr-138` — EDLI claim complicated by dual employment — overlapping covered establishments at death (high, medium)
- `epfo-rr-139` — EDLI denied or delayed for contribution continuity / break-in-service beyond clarified weekend-holiday gaps (high, medium)
- `epfo-rr-141` — EDLI Form 5IF stalled for exempted establishment / private trust missing twelve-month PF particulars (high, high)

#### Other
- `epfo-rr-079` — Vague portal remark such as 'Verification pending' or 'Contact employer' without a specific defect (medium, medium)
- `epfo-rr-080` — Establishment code, Regional Office mapping, or exempted-office jurisdiction mismatch (low, medium)
- `epfo-rr-081` — Form 10D descriptive roll, joint photographs, or family identification documents missing (medium, medium)
- `epfo-rr-103` — Atal Pension Yojana or other NPS product confused with EPS Form 10C/10D claim (low, medium)
- `epfo-rr-117` — Wrong Regional Office jurisdiction or physical claim filed at incorrect PF office (medium, high)
- `epfo-rr-126` — Vague demographic mismatch remark without naming the field — refile without KYC/JD fix (medium, medium)
- `epfo-rr-148` — Regional Office bifurcation or jurisdiction remapping mid-claim sending file to wrong RO (medium, medium)

#### Technical_Portal
- `epfo-rr-054` — OTP expired, portal session timeout, or claim not fully submitted (medium, high)
- `epfo-rr-055` — UMANG app claim failed to sync or duplicated against the member portal (medium, medium)
- `epfo-rr-056` — e-Nomination filed but PDF not e-signed, so nomination is incomplete (high, high)
- `epfo-rr-057` — Repeated same-day resubmissions after rejection without fixing the root cause (low, medium)
- `epfo-rr-058` — Claim returned for clarification rather than finally rejected (medium, high)
- `epfo-rr-059` — Claim initially shown approved or under process then rejected after backend validation (medium, medium)
- `epfo-rr-113` — Portal remark Member not eligible for this claim type due to life-status mismatch (high, high)
- `epfo-rr-114` — Claim stuck Under process indefinitely without settlement or clear reject remark (medium, high)
- `epfo-rr-120` — Online claim failed because last four digits of bank account verification did not match seeded KYC (high, high)
- `epfo-rr-122` — Passbook balance zero or stale while ECR paid — claim amount/eligibility fails (medium, high)
- `epfo-rr-124` — E-sign failure at member claim or nomination submission (member-side, not employer DSC) (medium, high)
- `epfo-rr-130` — UMANG shows claim rejected or failed while member portal shows different status (medium, high)
- `epfo-rr-174` — Captcha or portal session expiry preventing claim submission completion (low, medium)
- `epfo-rr-175` — Employer DSC token / USB crypto device errors blocking claim or KYC approval (high, high)
- `epfo-rr-176` — Mobile app vs web portal claim channel conflict or divergent submission state (medium, high)
- `epfo-rr-177` — Browser PDF or image upload exceeds size/type limits on claim or KYC forms (low, medium)
- `epfo-rr-181` — UAN activation attempted on member portal after shift to UMANG Face Authentication only (high, high)

#### Transfer_Related
- `epfo-rr-068` — Form 13 transfer pending or rejected because previous or present employer did not digitally attest (high, high)
- `epfo-rr-069` — Annexure K or complete transfer/service history missing (high, medium)
- `epfo-rr-070` — Transfer claim rejected solely due to overlapping service (should generally be processed after 20 May 2025 circular) (medium, high)
- `epfo-rr-071` — Name or date of birth mismatch between source and destination member IDs on Form 13 (high, high)
- `epfo-rr-072` — Transferor (source) Regional Office verification pending or failed (medium, medium)
- `epfo-rr-073` — Previous PF balances not transferred, leaving split corpus and incomplete service for settlement (medium, medium)
- `epfo-rr-116` — Exempted establishment private trust transfer to EPFO failed or incomplete blocking later settlement (high, high)
- `epfo-rr-127` — Transfer-then-withdraw sequencing error — Form 13 incomplete before Form 19/31 (high, high)
- `epfo-rr-142` — Multiple member IDs under one UAN — only partial balance transferred leaving residual MID unclaimed (high, high)
- `epfo-rr-143` — Auto-transfer of EPF failed — exit not marked, KYC incomplete, or multi-account conditions unmet (medium, medium)
- `epfo-rr-144` — Transfer settled but balance mismatch — amount debited at source not credited at destination (critical, high)
- `epfo-rr-145` — Form 13 transfer rejected with remark to update EPS date of joining and date of exit (high, high)
- `epfo-rr-146` — PF transferred or credited to wrong member ID under the UAN (critical, high)

## Field glossary (schema)

| Field | Meaning |
|---|---|
| `id` | Stable primary key (`epfo-rr-NNN`) |
| `rejection_reason` | Canonical human title |
| `aliases` | Portal remarks and near-synonyms merged into this record |
| `category` | One of 10 enums |
| `claim_types_affected` | Forms / channels |
| `severity` | critical / high / medium / low (impact if unfixed) |
| `official_status_or_message` | FAQ wording or commonly seen remark; **not** an invented code |
| `what_it_means` | RAG-dense explanation |
| `root_cause` | Why the data or rule fails |
| `how_detected` | Portal screens, FAQs, office checks |
| `fix_steps` | Ordered remediation |
| `required_documents` | Typical proofs |
| `who_acts` | member / employer / EPFO_office / bank / mixed |
| `prevention_tips` | Before the next claim |
| `related_reason_ids` | Graph edges to other records |
| `source_urls` | Citation URLs (every record has ≥1) |
| `source_types` | official, circular, news, blog, forum |
| `confidence` | high / medium / low |
| `last_verified` | ISO date |
| `notes` | Caveats, circular numbers, 2026 uncertainties |

## RAG chunks

`rag/chunks.jsonl` has **181** self-contained chunks (one per reason) with the reason name inside the text, plus metadata (`reason_id`, `category`, `claim_types_affected`, `source_urls`, `confidence`). Target length ~200–600 words.

## Suggested retrieval

- Embed `chunks.jsonl` `text`.
- Filter by `category` or `claim_types_affected` when the user names a form.
- Always return `source_urls` and `confidence` with the answer.
- If the user pastes a portal remark, match `aliases`.

## How to refresh

Rebuilders: Python sources live in `_build/` (not shipped in the ZIP). Official PDFs on epfindia.gov.in are canonical even when crawlers receive 403.
