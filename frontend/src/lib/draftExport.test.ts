import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDemoResponse } from './demo';
import { downloadDraftText, draftDownloadFilename, formatDraftExportText } from './draftExport';

const labels = {
  banner: 'Grounded analysis · educational, not legal advice',
  draftNotice: 'Draft from cited evidence — review before any use',
  missing: 'Unfilled placeholders',
  disclosure: 'About this answer',
  disclosureNote: 'Educational guidance only.',
};

describe('draftExport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('formats draft text with disclosures and missing fields', () => {
    const response = getDemoResponse('success', 'en');
    const text = formatDraftExportText(response.draft!, labels, response.warnings);
    expect(text).toContain(labels.banner);
    expect(text).toContain(labels.draftNotice);
    expect(text).toContain(response.draft!.title);
    response.draft!.blocks.forEach((block) => expect(text).toContain(block.text));
    expect(text).toContain(`${labels.missing}: ${response.draft!.missing_fields.join(', ')}`);
    expect(text).toContain(labels.disclosureNote);
    response.warnings.forEach((warning) => expect(text).toContain(warning));
  });

  it('omits missing-fields line when none are present', () => {
    const response = getDemoResponse('success', 'en');
    response.draft!.missing_fields = [];
    const text = formatDraftExportText(response.draft!, labels, []);
    expect(text).not.toContain(labels.missing);
  });

  it('builds a language-scoped safe filename', () => {
    expect(draftDownloadFilename('hi')).toBe('saral-sahayak-draft-hi.txt');
    expect(draftDownloadFilename('EN')).toBe('saral-sahayak-draft-en.txt');
    expect(draftDownloadFilename('../evil')).toBe('saral-sahayak-draft-en.txt');
  });

  it('downloads via object URL and revokes it', () => {
    const createObjectURL = vi.fn(() => 'blob:synthetic-draft');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const click = vi.fn();
    const remove = vi.fn();
    const anchor = {
      href: '',
      download: '',
      rel: '',
      style: { display: '' },
      click,
      remove,
    } as unknown as HTMLAnchorElement;
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const appendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);

    downloadDraftText('saral-sahayak-draft-en.txt', 'synthetic export');

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(createElement).toHaveBeenCalledWith('a');
    expect(anchor.download).toBe('saral-sahayak-draft-en.txt');
    expect(anchor.href).toBe('blob:synthetic-draft');
    expect(anchor.rel).toBe('noopener');
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:synthetic-draft');
  });
});
