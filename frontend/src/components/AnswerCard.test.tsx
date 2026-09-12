import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { responseSchema, type AnalyzeResponse, type Language } from '../lib/contracts';
import { getDemoResponse } from '../lib/demo';
import { getWalkthrough, walkthroughRemark } from '../lib/walkthrough';
import AnswerCard, { AnswerCard as NamedAnswerCard } from './AnswerCard';

const sample = () => getWalkthrough('en');
const renderCard = (response = sample(), onEdit = vi.fn()) =>
  render(<AnswerCard response={response} onEdit={onEdit} />);

async function expectEvidence(container: HTMLElement, response: AnalyzeResponse, ids: string[]) {
  await userEvent.click(within(container).getByText(ids.length > 1 ? 'Sources' : 'Source'));
  expect(within(container).getByText(/Synthetic evidence only/)).toBeVisible();
  for (const id of ids) {
    const citation = response.citations.find((entry) => entry.id === id)!;
    expect(within(container).getByText(citation.path)).toBeVisible();
    expect(within(container).getByText(citation.heading)).toBeVisible();
    expect(
      within(container).getByText(citation.record_id ?? 'Supporting document (no record ID)'),
    ).toBeVisible();
    const location = within(container).getByText(citation.path).closest('dl')!;
    expect(within(location).getByText(`${citation.start_line}–${citation.end_line}`)).toBeVisible();
    if (citation.start_column !== null && citation.end_column !== null) {
      expect(
        within(location).getByText(
          `Line ${citation.start_line}, column ${citation.start_column} → line ${citation.end_line}, column ${citation.end_column}`,
        ),
      ).toBeVisible();
    }
    for (const url of citation.source_urls) {
      expect(within(container).getByText(url)).toBeVisible();
    }
  }
  expect(within(container).queryByRole('link')).not.toBeInTheDocument();
}

describe('illustrative walkthrough', () => {
  it.each<Language>(['en', 'hi', 'kn', 'ta', 'te', 'ml'])(
    'validates the rich %s sample while preserving original citations, warnings and fixture values',
    (language) => {
      const original = getDemoResponse('success', language);
      const response = getWalkthrough(language);
      expect(responseSchema.parse(response)).toEqual(response);
      expect(response.language).toBe(language);
      expect(response.citations.slice(0, original.citations.length)).toEqual(original.citations);
      expect(response.citations).toHaveLength(original.citations.length + 1);
      const reason = response.citations.find((citation) => citation.record_id === 'epfo-rr-001')!;
      expect(reason).toMatchObject({
        path: 'references/knowledge/epfo/reasons/epfo-rr-001.md',
        start_column: 0,
        end_column: 0,
      });
      expect(reason.heading).toMatch(/SYNTHETIC.*not read/);
      expect(response.classification).toMatchObject({
        reason_id: reason.record_id,
        confidence: 'low',
      });
      expect(response.classification?.rationale).not.toBe('');
      expect(response.warnings.slice(0, original.warnings.length)).toEqual(original.warnings);
      expect(response.warnings.length).toBeGreaterThan(original.warnings.length);
      expect(response.actions).toHaveLength(2);
      for (const claim of [
        ...response.explanation,
        ...response.actions,
        ...response.required_documents,
      ]) {
        expect(claim.citation_ids).toEqual([reason.id, ...original.explanation[0].citation_ids]);
      }
      const factual = response.draft!.blocks.filter((block) => block.kind === 'factual');
      expect(factual).toHaveLength(1);
      expect(factual[0].citation_ids).toEqual([reason.id, ...original.explanation[0].citation_ids]);
      expect(
        response
          .draft!.blocks.filter((block) => block.kind === 'template')
          .every((block) => block.citation_ids.length === 0),
      ).toBe(true);
      expect(response.draft?.missing_fields).toHaveLength(2);
      expect(getDemoResponse('success', language)).toEqual(original);
    },
  );

  it('uses the requested fictional notice and a short illustrative narrative', () => {
    const response = sample();
    expect(walkthroughRemark('en')).toBe(
      'SAMPLE NOTICE: A detail in this imaginary claim needs review.',
    );
    expect(response.explanation[0].text).toBe(
      'This fictional notice asks for a detail to be checked. A real answer would identify the issue from evidence.',
    );
    expect(response.actions.map((action) => action.text)).toEqual([
      'Sample only: Review the fictional remark.',
      'Sample only: Check the highlighted detail in the example.',
    ]);
    expect(response.required_documents[0].text).toBe(
      'Sample rejection notice (illustrative, not a requirement)',
    );
    expect(response.draft?.title).toBe('Sample request — not for submission');
    expect(response.warnings.at(-1)).toMatch(/fake evidence/);
  });

  it('returns independent values without mutating the source fixture', () => {
    const original = getDemoResponse('success', 'en');
    const pristine = sample();
    const response = sample();
    response.citations[0].heading = 'changed locally';
    response.citations.at(-1)!.source_urls.push('https://example.invalid/mutation');
    response.actions[0].citation_ids.push('ev-other');
    response.draft!.blocks.at(-1)!.citation_ids.length = 0;
    response.warnings.length = 0;
    expect(sample()).toEqual(pristine);
    expect(getDemoResponse('success', 'en')).toEqual(original);
  });
});

describe('AnswerCard', () => {
  it('honors explicit mode over the legacy isSample alias', () => {
    const response = sample();
    const { rerender } = render(
      <AnswerCard response={response} onEdit={vi.fn()} mode="live" isSample />,
    );
    expect(screen.getByRole('heading', { name: 'Your grounded answer' })).toBeVisible();
    expect(screen.getByText('Not a general chatbot')).toBeVisible();
    rerender(<AnswerCard response={response} onEdit={vi.fn()} mode="sample" isSample={false} />);
    expect(screen.getByRole('heading', { name: 'Your sample answer' })).toBeVisible();
    rerender(<AnswerCard response={response} onEdit={vi.fn()} isSample={false} />);
    expect(screen.getByRole('heading', { name: 'Your grounded answer' })).toBeVisible();
  });

  it('exports both forms and defaults to one compact overview with collapsed disclosures', async () => {
    expect(AnswerCard).toBe(NamedAnswerCard);
    const response = sample();
    renderCard(response);
    expect(screen.getByRole('heading', { name: 'Your sample answer' })).toBeVisible();
    expect(screen.getByText('Sample only · not real claim advice')).toBeVisible();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy sample' })).not.toBeInTheDocument();
    const uncertainty = screen.getByRole('complementary', { name: 'Classification uncertainty' });
    expect(uncertainty).toBeVisible();
    expect(uncertainty).toHaveTextContent('Classification confidence: low');
    expect(within(uncertainty).getByText(response.classification!.rationale)).toBeVisible();
    expect(
      within(uncertainty).getByText(/not policy certainty or source verification/),
    ).toBeVisible();
    expect(uncertainty).not.toHaveTextContent(/\d+%/);
    expect(
      screen.getByText('Sample language quality has not been independently reviewed.'),
    ).toBeVisible();
    for (const warning of response.warnings) {
      expect(screen.getByText(warning)).not.toBeVisible();
    }
    await userEvent.click(screen.getByText('About this sample'));
    for (const warning of response.warnings) {
      expect(screen.getByText(warning)).toBeVisible();
    }
    expect(screen.getByText(/Original fixture notes below/, { selector: 'p' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('implements tab relationships, roving focus, arrow wrapping, Home and End', async () => {
    const user = userEvent.setup();
    renderCard();
    const tabs = screen.getAllByRole('tab');
    const checkSelected = (index: number) => {
      tabs.forEach((tab, tabIndex) => {
        expect(tab).toHaveAttribute('aria-selected', String(tabIndex === index));
        expect(tab).toHaveAttribute('tabindex', tabIndex === index ? '0' : '-1');
        const panel = document.getElementById(tab.getAttribute('aria-controls')!);
        expect(panel).toHaveAttribute('role', 'tabpanel');
        expect(panel).toHaveAttribute('aria-labelledby', tab.id);
        expect(panel?.hidden).toBe(tabIndex !== index);
      });
      expect(tabs[index]).toHaveFocus();
    };
    await user.click(tabs[0]);
    checkSelected(0);
    await user.keyboard('{ArrowRight}');
    checkSelected(1);
    await user.keyboard('{End}');
    checkSelected(2);
    await user.keyboard('{ArrowRight}');
    checkSelected(0);
    await user.keyboard('{ArrowLeft}');
    checkSelected(2);
    await user.keyboard('{Home}');
    checkSelected(0);
    await user.keyboard('{Tab}');
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveFocus();
    await user.click(tabs[1]);
    checkSelected(1);
  });

  it('keeps exact evidence beside every explanation, document, action and cited draft block', async () => {
    const response = sample();
    renderCard(response);
    await expectEvidence(
      screen.getByText(response.explanation[0].text).closest('.answer-claim')!,
      response,
      response.explanation[0].citation_ids,
    );
    await expectEvidence(
      screen.getByText(response.required_documents[0].text).closest('.document-tile')!,
      response,
      response.required_documents[0].citation_ids,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Next steps' }));
    for (const action of response.actions) {
      await expectEvidence(
        screen.getByText(action.text).closest('li')!,
        response,
        action.citation_ids,
      );
    }
    await userEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    const factual = response.draft!.blocks.find((block) => block.kind === 'factual')!;
    await expectEvidence(
      screen.getByText(factual.text).closest('.draft-block')!,
      response,
      factual.citation_ids,
    );
  });

  it('tracks temporary checkboxes, preserves them across tabs, and resets for a new response', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { rerender } = renderCard(sample(), onEdit);
    await user.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '2');
    const boxes = screen.getAllByRole('checkbox');
    await user.click(boxes[0]);
    await user.click(boxes[1]);
    expect(screen.getByRole('progressbar', { name: '2 of 2 checked' })).toHaveAttribute(
      'value',
      '2',
    );
    await user.click(boxes[0]);
    expect(screen.getByRole('progressbar', { name: '1 of 2 checked' })).toHaveAttribute(
      'value',
      '1',
    );
    expect(screen.getByText(/Temporary checklist · not saved or verified/)).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
    rerender(<AnswerCard response={sample()} onEdit={onEdit} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });

  it('highlights missing placeholders and copies the whole sample with all disclosures', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const response = sample();
    renderCard(response);
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText('[recipient]').tagName).toBe('MARK');
    expect(screen.getByText('[detail from the sample notice]').tagName).toBe('MARK');
    expect(screen.getByText(/Unfilled placeholders:/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Copy sample' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sample copied, including its disclosures.',
    );
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain('Sample request — not for submission');
    expect(copied).toContain('Evidence is imaginary and unverified.');
    response.draft!.blocks.forEach((block) => expect(copied).toContain(block.text));
    response.warnings.forEach((warning) => expect(copied).toContain(warning));
    expect(copied).toContain('[recipient]');
    const ids = new Set(response.draft!.blocks.flatMap((block) => block.citation_ids));
    expect(ids.size).toBe(2);
    for (const citation of response.citations.filter((entry) => ids.has(entry.id))) {
      expect(copied).toContain(`Source ${citation.id} (synthetic, unverified)`);
      expect(copied).toContain(citation.path);
      expect(copied).toContain(`Record ID: ${citation.record_id ?? 'supporting document'}`);
      expect(copied).toContain(`Heading: ${citation.heading}`);
      expect(copied).toContain(`Lines: ${citation.start_line}–${citation.end_line}`);
      if (citation.start_column !== null && citation.end_column !== null) {
        expect(copied).toContain(
          `zero-based columns: ${citation.start_column}–${citation.end_column}`,
        );
      }
      for (const url of citation.source_urls) expect(copied).toContain(url);
    }
  });

  it('reports denied clipboard access honestly and allows a retry', async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new DOMException('Permission denied', 'NotAllowedError'))
      .mockResolvedValueOnce();
    renderCard();
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    await user.click(screen.getByRole('button', { name: 'Copy sample' }));
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy.');
    expect(screen.getByRole('status')).toHaveTextContent('sample and its disclosures manually');
    expect(screen.getByRole('status')).not.toHaveTextContent('Sample copied');
    await user.click(screen.getByRole('button', { name: 'Copy sample' }));
    expect(screen.getByRole('status')).toHaveTextContent('Sample copied');
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it('does not report an old clipboard completion on a replacement answer', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const { rerender } = renderCard();
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    await user.click(screen.getByRole('button', { name: 'Copy sample' }));
    expect(screen.getByRole('button', { name: 'Copying…' })).toBeDisabled();
    rerender(<AnswerCard response={getWalkthrough('hi')} onEdit={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    await act(async () => finish());
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Copy sample' })).toBeEnabled();
  });

  it.each(['needs_clarification', 'unsupported', 'error'] as const)(
    'shows a short %s state with Edit, without guidance or draft controls',
    async (status) => {
      const response = getDemoResponse(status, 'en');
      const onEdit = vi.fn();
      const { container } = renderCard(response, onEdit);
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /copy|download/i })).not.toBeInTheDocument();
      expect(container.querySelector('.evidence')).toBeNull();
      expect(container.querySelectorAll('details')).toHaveLength(1);
      for (const question of response.questions) expect(screen.getByText(question)).toBeVisible();
      if (response.error) expect(screen.getByText(response.error.message)).toBeVisible();
      await userEvent.click(screen.getByRole('button', { name: 'Edit remark' }));
      expect(onEdit).toHaveBeenCalledTimes(1);
    },
  );

  it('suppresses accidentally retained guidance whenever the status is not success', () => {
    renderCard({
      ...sample(),
      status: 'error',
      error: { code: 'sample_error', message: 'Sample unavailable.' },
    });
    expect(screen.getByText('Sample unavailable.')).toBeVisible();
    expect(screen.queryByText(sample().explanation[0].text)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('handles null draft and absent optional lists without fake guidance or a progress bar', async () => {
    renderCard({ ...sample(), draft: null, actions: [], required_documents: [] });
    expect(screen.getByText('No document information was supplied.')).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getByText('No steps were supplied.')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText('No draft was supplied.')).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('changes output to Hindi while retaining English controls and accurate language tags', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const response = getWalkthrough('hi');
    const { container, rerender } = renderCard();
    expect(screen.getByText(sample().explanation[0].text)).toBeVisible();
    rerender(<AnswerCard response={response} onEdit={vi.fn()} />);
    expect(container.querySelector('.answer-card')).toHaveAttribute('lang', 'hi');
    expect(screen.queryByText(sample().explanation[0].text)).not.toBeInTheDocument();
    expect(walkthroughRemark('hi')).toBe(
      'नमूना सूचना: इस काल्पनिक दावे के एक विवरण की जाँच चाहिए।',
    );
    expect(screen.getByRole('heading', { name: 'Your sample answer' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit remark' })).toBeVisible();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Overview',
      'Next steps',
      'Draft',
    ]);
    expect(screen.getByText(response.explanation[0].text)).toBeVisible();
    expect(screen.getByText(response.explanation[0].text).closest('[lang]')).toHaveAttribute(
      'lang',
      'hi',
    );
    expect(screen.getByText(response.required_documents[0].text)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Document preview' })).toHaveAttribute('lang', 'en');
    await user.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getByRole('progressbar', { name: '0 of 2 checked' })).toBeVisible();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    for (const action of response.actions) {
      expect(screen.getByRole('checkbox', { name: action.text })).toBeVisible();
      expect(screen.getByText(action.text).closest('[lang]')).toHaveAttribute('lang', 'hi');
    }
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText('[प्राप्तकर्ता]').tagName).toBe('MARK');
    expect(screen.getByText('[प्राप्तकर्ता]').closest('[lang]')).toHaveAttribute('lang', 'hi');
    expect(screen.getByRole('heading', { name: response.draft!.title })).toBeVisible();
    expect(screen.getByText(response.draft!.missing_fields.join(', '))).toHaveAttribute(
      'lang',
      'hi',
    );
    await user.click(screen.getByRole('button', { name: 'Copy sample' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sample copied, including its disclosures.',
    );
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain('Sample request — not for submission');
    expect(copied).toContain(response.draft!.title);
    response.draft!.blocks.forEach((block) => expect(copied).toContain(block.text));
    response.warnings.forEach((warning) => expect(copied).toContain(warning));
    await user.click(screen.getByText('About this sample'));
    expect(screen.getByText(/पहले से लिखा काल्पनिक पाठ/)).toBeVisible();
    for (const warning of response.warnings) {
      expect(screen.getByText(warning)).toHaveAttribute(
        'lang',
        /[\u0900-\u097f]/u.test(warning) ? 'hi' : 'en',
      );
    }
    for (const selector of [
      '.sample-banner',
      '.answer-header',
      '.answer-tabs',
      '.steps-progress',
      '.steps-note',
      '.draft-toolbar',
      '.draft-missing',
      '.copy-feedback',
      '.answer-disclosure summary',
      '.answer-disclosure > p',
    ]) {
      expect(container.querySelector(selector)).toHaveAttribute('lang', 'en');
    }
  });

  it('keeps Hindi clarification questions and error text with English helpers and Edit', () => {
    const question = 'इस काल्पनिक नमूने में कौन सा विवरण दिखाना है?';
    const response = { ...getDemoResponse('needs_clarification', 'hi'), questions: [question] };
    const { rerender } = renderCard(response);
    expect(screen.getByRole('heading', { name: 'One more detail' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit remark' }).closest('[lang]')).toHaveAttribute(
      'lang',
      'en',
    );
    expect(screen.getByText('Please clarify the remark before continuing.')).toHaveAttribute(
      'lang',
      'en',
    );
    expect(screen.getByText(question)).toBeVisible();
    expect(screen.getByText(question).closest('[lang]')).toHaveAttribute('lang', 'hi');
    const error = getDemoResponse('error', 'hi');
    rerender(<AnswerCard response={error} onEdit={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Could not prepare an answer' })).toBeVisible();
    expect(screen.getByText(error.error!.message)).toHaveAttribute('lang', 'hi');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  for (const language of ['en', 'hi', 'kn', 'ta', 'te', 'ml'] as const) {
    it.each(['success', 'needs_clarification', 'unsupported', 'error'] as const)(
      `renders %s in ${language}, with English controls and correctly tagged warnings`,
      async (scenario) => {
        const response = getWalkthrough(language, scenario);
        const { container } = renderCard(response);
        expect(container.querySelector('.answer-card')).toHaveAttribute('lang', language);
        expect(
          screen.getByRole('button', { name: 'Edit remark' }).closest('[lang]'),
        ).toHaveAttribute('lang', 'en');
        expect(
          screen.getByText('Sample language quality has not been independently reviewed.'),
        ).toHaveAttribute('lang', 'en');
        if (scenario === 'success') {
          expect(screen.getByText(response.explanation[0].text)).toBeVisible();
          expect(
            screen.getByText(response.classification!.rationale).closest('[lang]'),
          ).toHaveAttribute('lang', language);
          expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
            'Overview',
            'Next steps',
            'Draft',
          ]);
        } else {
          expect(screen.queryByRole('tab')).not.toBeInTheDocument();
          expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /copy|download/i })).not.toBeInTheDocument();
          expect(container.querySelector('.evidence, .draft-paper')).toBeNull();
          for (const question of response.questions) {
            expect(screen.getByText(question)).toBeVisible();
            expect(screen.getByText(question).closest('[lang]')).toHaveAttribute('lang', language);
          }
          if (scenario === 'unsupported') {
            const message = container.querySelector('.answer-message > p')!;
            expect(message).toHaveTextContent(response.warnings[0]);
            expect(message).toBeVisible();
            expect(message).toHaveAttribute('lang', language);
          }
          if (scenario === 'error') {
            expect(screen.getByText(response.error!.message)).toBeVisible();
            expect(screen.getByText(response.error!.message)).toHaveAttribute('lang', language);
          }
        }
        await userEvent.click(screen.getByText('About this sample'));
        const scripts: [Language, RegExp][] = [
          ['hi', /[\u0900-\u097f]/u],
          ['kn', /[\u0c80-\u0cff]/u],
          ['ta', /[\u0b80-\u0bff]/u],
          ['te', /[\u0c00-\u0c7f]/u],
          ['ml', /[\u0d00-\u0d7f]/u],
        ];
        const disclosure = container.querySelector('.answer-disclosure') as HTMLElement;
        for (const warning of response.warnings) {
          const expected = scripts.find(([, range]) => range.test(warning))?.[0] ?? 'en';
          const item = within(disclosure).getByText(warning);
          expect(item).toBeVisible();
          expect(item).toHaveAttribute('lang', expected);
        }
      },
    );
  }

  it('treats supplied markup as inert text', async () => {
    const response = sample();
    const markup = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    response.explanation[0].text = markup;
    const { container } = renderCard(response);
    expect(screen.getByText(markup)).toBeVisible();
    expect(container.querySelector('script, img')).toBeNull();
  });
});
