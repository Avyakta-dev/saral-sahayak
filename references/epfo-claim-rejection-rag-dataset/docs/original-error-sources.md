# Original error datasets

This is **not** a new set of canonical reason IDs. EPFO does **not** publish a single numbered rejection-code list. Runtime answers still come from bounded Markdown reads of generated knowledge files, not from this table.

What exists as “original errors”:

1. **Portal / SMS remarks** already stored as `aliases` on the 181 source records.
2. **Official or commonly seen status text** on each record (`official_status_or_message`).
3. **Government-stated buckets** from the Labour Ministry written reply in the Lok Sabha (9 Mar 2026), as reported by Outlook Money and Financial Express. Those buckets map to existing records; they are not extra IDs.

## Files

| File | Rows | Use |
| --- | --- | --- |
| `data/original-error-remarks.json` | 1082 | Structured original error text |
| `data/original-error-remarks.jsonl` | 1082 | Same, line-oriented |
| `data/original-error-remarks.csv` | 1082 | Spreadsheet review |

Each row has `original_error_text`, `kind`, and `canonical_reason_id` pointing at `epfo-rr-001` … `epfo-rr-181`.

`kind` values:

- `alias_or_portal_remark` — 892 remarks compiled onto records
- `official_or_commonly_seen_status` — 181 status blurbs
- `parliamentary_reply_bucket` — 9 MoS common-cause phrases

## Official / government originals (not a dump of every portal string)

These are the highest-authority **lists of causes**, still not a code table:

| Source | What it actually lists |
| --- | --- |
| [EPFO Online Claim Settlement FAQ](https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/FAQ_OCS_050517_1017.pdf) | Eligibility and KYC conditions that cause online claims to fail |
| [OTCP Members FAQ](https://epfindia.gov.in/site_docs/PDFs/OTCP_PDFs/MembersFAQ.pdf) | Employer-side rejection / 15-day printout issues |
| [Which claim form](https://www.epfindia.gov.in/site_en/WhichClaimForm.php?id=in_sm) | Wrong-form errors (19 / 20 / 10C / 10D / 5IF) |
| MoS Lok Sabha reply, 9 Mar 2026 (secondary report) | Incomplete forms, DOB / exit / Aadhaar / bank mismatch, missing death or heir documents, contribution discrepancies, incorrect form |
| [HO circular on multiple piecemeal rejections](https://www.gconnect.in/epfo/multiple-rejections-same-pf-claims-different-reasons-epfo.html) | Offices must list **all** defects at first rejection |

## What this is not

- Not live EPFO claim logs or personal claim data.
- Not embeddings / RAG chunks for runtime.
- Not invented `epfo-rr-182+` reasons.
- Not proof that every alias was copied from a live SMS; aliases are curated remarks on the source records.

Last verified: 2026-09-12.
