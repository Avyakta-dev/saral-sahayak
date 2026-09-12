# Conversational UI direction

Shravya requested a simpler, more visual experience after reviewing the initial text-heavy prototype. The conversational redesign replaces the wizard, two-column form and prominent demo-outcome selector. It does not imply final preview approval or permission to commit/push.

## Keep the selected visual identity

- Light cream `#FFFBF5`, forest green `#166534`, restrained warm accents.
- Clear, bold headings; local system sans-serif; softly rounded controls.
- Text-only Saral Sahayak wordmark with an original decorative document/image illustration in the welcome view.
- English interface controls with English/Hindi sample output.
- Accessible focus, keyboard operation, readable contrast and reduced-motion support.

## Simpler flow

1. Start in one composer: type/paste text, add an image or import a text file.
2. Preview and remove/replace attachments before sending. Camera input opens on supported devices; pasted screenshots and drag/drop also work.
3. Show the user's message once as a conversation bubble. Keep the composer available below the conversation, without sending users through multiple screens.
4. Own messages receive an honest connection notice while analysis is unavailable. Never choose a preset outcome or pretend a sample answers the user's claim.
5. An explicit **Show me an example** opens a labelled visual walkthrough. Compact Overview, Next steps and Draft tabs avoid a wall of text.
6. Show sources, provenance warnings and technical limitations on demand rather than repeating them in every section. Keep one visible preview/connection limitation near the composer.

## Interaction details

- Enter sends; Shift+Enter adds a line; IME composition does not trigger an accidental send.
- Attachment thumbnails enlarge in a keyboard-accessible dialog. Files stay local; OCR is not simulated.
- The sample checklist is temporary personal tracking, not external verification.
- Sample drafts retain highlighted placeholders. Copying includes the sample disclosures; clipboard failure is visible. Live draft **Download** is shown only when `downloads_available` is true; otherwise no download control (copy-only).
- Output language affects new replies. Editing removes the old turn and returns its content to the composer; new chat clears state.
- Cancelled sample responses and removed/replaced file selections cannot reappear. Image URLs are released when no longer needed.
- Only six latest turns are kept in memory; nothing is persisted or submitted to an analysis service.
- Live transport/availability failures and live `error` envelopes offer a bounded user-initiated **Try again** (max three analyze attempts per turn). Clarification and unsupported stay edit-first. No automatic retries.

## Scope and review boundary

Local image/text input and presentation belong to the web frontend. OCR, actual analysis, voice, PDF reading and document downloads remain separate integration work; controls must not pretend those capabilities exist.

The user authorized this redesign and testing. Final preview approval is still required before clearly messaged commits. Ask separately before pushing, then open the PR after the approved push. No document can grant those approvals.
