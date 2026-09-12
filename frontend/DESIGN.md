# Conversational UI direction

Shravya requested a simpler, more visual experience after reviewing the initial text-heavy prototype. Keep the conversational composer and compact answer tabs; do not restore a wizard or prominent outcome selector.

## Visual identity

- Light cream `#FFFBF5`, forest green `#166534`, restrained warm accents.
- Clear headings, local system sans-serif and softly rounded controls.
- Text-only Saral Sahayak wordmark and decorative document/image illustration.
- English interface controls. API output choices use actual capability metadata; offline examples use the validated six-language fixture. Quality flags never imply guaranteed fluency or policy accuracy.
- Visible keyboard focus, readable contrast, responsive layouts and reduced-motion support.

## Two explicit modes

**API mode** starts when a valid public application API prefix is configured. Metadata discovery sends no claim text. It gates enabled languages and the visible **Analyze text** action. Only the user's explicit action sends editable text to the configured service; images stay local. Actual success/clarification/unsupported/error responses render without mock substitution.

**Preview mode** is the default when no API is configured, or an explicit choice through **Use examples**. Own messages receive a truthful connection notice. **Show me an example** and the secondary sample gallery display labelled preset content, never a purported analysis of the user's input.

Configuration failures do not silently switch into preview. Switching modes is explicit and cancels pending work. Completed turns retain their original API/sample presentation.

## Conversation and evidence

- Keep the user's message once in a bubble and the composer available below the conversation.
- Overview, Next steps and Draft tabs avoid a wall of text.
- Show categorical classification confidence and rationale without percentages. Show actual unsupported reasons and clarification questions, not fabricated actions.
- API warnings/limitations are visible by default; detailed source locations remain expandable.
- Preserve path, canonical record ID, exact heading, lines, zero-based columns and original source URLs. Keep remedy/source excerpts as separate evidence items.
- Draft placeholders stay visible. Copy includes factual-block sources and limitations. API drafts and explicit samples use different notices; neither promises a successful claim outcome.

## Interaction and privacy

- Enter sends/analyzes; Shift+Enter adds a line; IME composition never causes accidental submission.
- Image thumbnails can enlarge, be removed or replaced. File selection is not an upload or OCR capability.
- API consent text explains that only editable text is sent and asks users to omit personal identifiers. Cookies/provider credentials are not sent.
- Clarification editing preserves original text and relevant questions. Editing or retrying removes stale guidance for that turn.
- Cancel, new chat, mode/language/capability changes and unmount invalidate in-flight work. Never simulate agent stages or percentages.
- No automatic retries. A transient analysis failure permits at most two deliberate resends; metadata refreshes are bounded too.
- Checklist marks are temporary personal tracking. The latest six turns remain in memory; no account, analytics or persisted claim history is introduced.

## Scope and review

Issue 24 was explicitly accepted by Anish through merged PR 35. This follow-up implements issue 25's real text API connection and requires review. Issue 26 remains gated on that review and its own acceptance criteria.

OCR, voice, PDF reading, document downloads, provider configuration and deployment remain separate shared work. No frontend control should invent those capabilities. Source/translation quality, physical camera behavior and real-provider readiness are not certified by local synthetic tests. No document grants merge or provider-credit authorization.
