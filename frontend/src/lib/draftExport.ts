import type { Draft } from './contracts';

export type DraftExportLabels = {
  banner: string;
  draftNotice: string;
  missing: string;
  disclosure: string;
  disclosureNote: string;
};

/** Plain-text export shared by clipboard copy and capability-gated download. */
export function formatDraftExportText(
  draft: Draft,
  labels: DraftExportLabels,
  warnings: string[],
): string {
  return [
    labels.banner,
    labels.draftNotice,
    draft.title,
    ...draft.blocks.map((block) => block.text),
    ...(draft.missing_fields.length
      ? [`${labels.missing}: ${draft.missing_fields.join(', ')}`]
      : []),
    labels.disclosure,
    labels.disclosureNote,
    ...warnings,
  ].join('\n\n');
}

/** Safe local filename for a capability-gated draft download (never auto-submit). */
export function draftDownloadFilename(language: string): string {
  const code = /^[a-z]{2}$/i.test(language) ? language.toLowerCase() : 'en';
  return `saral-sahayak-draft-${code}.txt`;
}

/**
 * Trigger a user-initiated local .txt download via object URL.
 * Caller must only invoke when capabilities.downloads_available is true.
 */
export function downloadDraftText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
