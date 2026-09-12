# Offline evidence findings

Reviewed 2026-09-12 against the archived JSON and generated readable sections, not live policy. IDs below are dataset IDs, not government rejection codes. Exact excerpts and source candidates are machine-checked in `cases.json` and `verification-register.json`.

## Blocking source conflicts and currency gaps

1. **UAN activation: 007 versus 181.** Record 007's `Fix` directs the member to Activate UAN on the member portal; record 181 says website activation paths are discontinued. This is incompatible channel guidance, not merely a paraphrase. Verify the original activation manual's effective date, applicability and exceptions before correcting either source record. Do not combine both instructions into an authoritative checklist.
2. **2026 withdrawal rules: 039, 040, 096.** The 12-month rule and 25% retention claims are qualified as secondary-sourced or gazette-unchecked. Record 040 also calls an automatically calculated portal amount the legal maximum. A portal calculation is not independently established legal authority. Do not promise a percentage or entitlement; clarification of user facts cannot supply the missing authoritative instrument.
3. **Short EPS service: 035.** The record says to skip Form 10C for under six months using older FAQ material. This is a high-impact currency check, not a verified statement about current eligibility. Leave the claim unverified until an authoritative current rule and its effective date are reviewed.

These findings are flags, not corrections. No source policy was changed and no finding is injected into the runtime as an unreviewed rule. The current corpus still contains these conflicts; it must not be described as policy-verified or ready for unconditional advice.

## Overlaps and conditional applicability

- **Name mismatch: 001 and 012.** The initials-versus-expanded-name subtype relates to the general mismatch record. Shared applicability is not an error and should not force an exclusive lookup result. General record 001 alone does not prove current minor/major Joint Declaration document requirements.
- **KYC pending: 010 and 016.** Employer approval and bank/NPCI verification are distinct possible blockers. Ask which KYC row and exact status is involved before assigning the actor. Do not assume every pending row requires HR action.
- **Joint accounts: 019 and 023.** The claimed pension exception depends on claim type and account-holder relationship. Record 023 discloses that its rule was not quoted verbatim from a public Form 10D instruction PDF. Do not state that all joint accounts are invalid or treat the exception as independently verified.
- **Cheque images: 021 and 106.** The corpus describes conditional image requirements. Ask whether bank status is specifically NPCI-verified and which portal/channel requested the image. Neither a universal upload requirement nor a universal waiver is supported by an unexplained 'verified' label.
- **Service: 096 and 039.** Missing joining date, untransferred prior service, and purpose eligibility are separate possibilities. Ask the selected purpose and service/transfer context; do not infer a 12-month waiting rule from the remark alone.
- **Overlap: 041 and 070.** Transfer-only guidance must not be generalized to final settlement. Record 070 explicitly limits its scope. Ask claim type, whether overlap is the sole ground, and whether dates are erroneous. The StaffNews reproduction and the revamped Form 13 PDF are not automatically the same instrument.
- **Unknown ZX-999.** No diagnosis should be invented for a synthetic opaque code. The numeric-code caveat in 001 supports a limitation, not an exhaustive proof that every government system lacks codes.

## Full-corpus mechanical review

`inventory.json` records all 181 rows without treating flags as proof of errors. Empty notes do not imply no caveats are needed. Empty required documents do not establish that no documents could ever be requested. Duplicated claim-type values are preserved from source and counted once in group membership. Shared aliases are an offline curation signal only: no runtime score, deterministic matcher, or alias index is implemented.

`source_types` is a record-level summary, not a positional list parallel to `source_urls`. Direct inspection confirms that the JSON source-link catalog has per-URL `source_type` values for all 119 entries (contrary to an earlier exploration summary). The inventory preserves those recorded authority labels and checks URL-to-record mappings; it does not independently verify them. Do not manufacture URL-level authority by zipping two unrelated arrays. Source confidence and verification dates remain inherited metadata.

The independent validator checks readable meaning, causes, detection, ordered fix content, documents, actors, prevention, links, caveats, confidence, dates, and URLs against their source fields. It detects changed remedies even if the embedded JSON still matches the archive. This is fidelity checking, not truth checking.

## Navigation and remaining implementation limitations

The current index is about 51 KB because full claim-type descriptions repeat on each entry. Category sections range up to about 10 KB, below the 12 KiB hard read cap but larger than the tool's 3072-byte default. Bounded reads may require continuation. Future navigation improvements should preserve claim-type applicability and be measured against actual Anish-owned traces; no tool budgets were raised.

Readable reason sections are checked against the 120-line/12 KiB maximum. The complete-source JSON section duplicates information and is not needed for review evidence; the fixture validator rejects it as an evidence target. Tests do not show that a model will select the best sections.

Remaining integration gates: actual cited responses, bounded tool traces, ambiguous/unknown abstention, stale-policy handling, source verification, and independent quality review of all six accepted languages. None is inferred from offline test counts.
