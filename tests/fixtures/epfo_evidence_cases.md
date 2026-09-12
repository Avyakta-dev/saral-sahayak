# Evidence-case review fixtures

These offline fixtures define what a future agent review must demonstrate. They are expectations, not hardcoded runtime answers. A case is supported only after the listed sections are actually read; ambiguous and unknown cases must not receive an invented classification or remedy.

## Supported: exact or sufficiently specific reason

- **Input:** `Name mismatch with Aadhaar` plus a supplied UAN-name/Aadhaar-name mismatch.
- **Expected state:** `success` only after a candidate reason file is read and the evidence supports the classification.
- **Expected evidence sections:** `Rejection phrase and aliases`, `Classification`, `What it means`, `Fix`, `Required documents`, and `Sources and verification` from the selected reason file.
- **Review checks:** Preserve the record’s caveat, confidence, verification date, and original URLs. Each action must cite the exact read heading; source URLs must come from read evidence.

## Ambiguous: similar candidate reasons

- **Input:** `claim rejected due to mismatch` without saying whether the mismatch is name, bank, date of birth, or service data.
- **Expected state:** `needs_clarification` after bounded reads of plausible candidate records.
- **Expected clarification:** Ask only which field or portal remark differs and request the exact rejection text if available.
- **Forbidden behavior:** Do not select a canonical reason, prescribe a fix, or write a ready draft from a phrase that fits multiple records.

## Unknown or unsupported: no grounded candidate

- **Input:** `claim rejected - code ZX-999` when no read evidence identifies that code or reason.
- **Expected state:** `unsupported` (or focused clarification if the exact portal remark could resolve it).
- **Expected evidence:** The response may cite the limitation or navigation read, but must not cite an unread reason as support.
- **Forbidden behavior:** Do not invent a government rejection code, fetch a URL automatically, claim live EPFO verification, or provide unsupported remedies.
