# Interface languages

The web interface supports English (`en`), Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), Telugu (`te`) and Malayalam (`ml`). English is the default. Translation catalogs are local source files under `frontend/src/lib/i18n/`; selecting a language does not send text to an external translation service.

## Independent interface and output choices

- **Interface language** controls localized site labels, instructions, notices, safe error messages, consent dialogs, result controls and activity labels. It is available without backend connectivity.
- **Analysis output language** controls a new model request and is limited to the languages advertised by backend capabilities. Changing the site language must not relabel a response already received or send a request.
- In example mode, **Output language** selects one of the six authored fictional examples from the validated offline capabilities fixture. In API mode the selector uses only backend-enabled languages. This remains independent of Interface language; switching interface language does not manufacture or translate answer content.

Selections are kept in memory for the page session. Reload restores English; no claimant data or chat history is persisted for localization.

## Content that stays literal

User input, uploaded filenames, source paths, citation IDs, Markdown headings, original URLs and canonical draft placeholders retain their original values. Backend answer prose retains the language declared by that response. The activity panel translates host phase labels, not the evidence metadata itself. Interface localization is not an instruction to translate a policy source or infer its language.

## Privacy and quality

Consent and error wording must preserve the same meaning in every language. Unknown backend errors are mapped to an allowlisted generic message, never displayed or translated verbatim. Current interface translations require independent native-language review; successful rendering, key parity and automated tests do not establish linguistic accuracy, legal correctness or multilingual model quality.

Optional image analysis requires validated capabilities advertising image support. All six catalogs disclose complete selected-file upload (including metadata) to service-controlled storage and processing by the configured possibly remote model. The preview and separate Analyze action are mandatory. No browser automatic redaction is promised; cancelling cannot recall uploaded data. Images and text are alternative inputs.

Some newly integrated readiness, retry and quality-metadata messages retain main’s English copy. Full native-language UX review is still required.

## Historical validation before publication merge

The earlier localization pass verified matching catalog keys and interpolation parameters. The frontend build, formatting and 315 unit/component tests passed, together with 124 preview browser tests and 38 live/locale browser tests. Browser tests use synthetic responses and cover all six interface languages at desktop and 320-pixel mobile widths, consent and safe errors, literal evidence metadata, and unchanged Hindi answer content under a different interface locale. These are implementation checks, not a native-language quality certification.

## Maintenance

Add semantic English keys in `en.ts` and supply every key in all five other dictionaries. Preserve each interpolation token exactly (for example `{name}`, `{count}`, `{heading}`). Never replace missing translations with a spread of the English dictionary. Keep technical identifiers out of translated phrases except as literal interpolation parameters. Validate controls, consent, errors and mixed-language answers at desktop and narrow mobile widths after changes.
