import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { responseSchema, type AnalyzeResponse, type Language } from '../lib/contracts';
import { getDemoResponse } from '../lib/demo';
import { getWalkthrough, walkthroughRemark } from '../lib/walkthrough';
import AnswerCard, { AnswerCard as NamedAnswerCard } from './AnswerCard';

const sample = () => getWalkthrough('en');
const renderCard = (
  response = sample(),
  onEdit = vi.fn(),
  mode: 'live' | 'sample' = 'sample',
  onRetry?: () => void,
  retryLabel?: string,
) =>
  render(
    <AnswerCard
      response={response}
      onEdit={onEdit}
      mode={mode}
      onRetry={onRetry}
      retryLabel={retryLabel}
    />,
  );

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
    expect(
      within(container).getByText(`${citation.start_line}–${citation.end_line}`),
    ).toBeVisible();
    for (const url of citation.source_urls) {
      expect(within(container).getByText(url)).toBeVisible();
    }
  }
  expect(within(container).queryByRole('link')).not.toBeInTheDocument();
}

describe('illustrative walkthrough', () => {
  it.each<Language>(['en', 'hi'])(
    'validates %s without changing original metadata or warnings',
    (language) => {
      const original = getDemoResponse('success', language);
      const response = getWalkthrough(language);
      expect(responseSchema.parse(response)).toEqual(response);
      expect(response.language).toBe(language);
      expect(response.citations).toEqual(original.citations);
      expect(response.classification).toEqual(original.classification);
      expect(response.warnings.slice(0, original.warnings.length)).toEqual(original.warnings);
      expect(response.warnings.length).toBeGreaterThan(original.warnings.length);
      expect(response.actions).toHaveLength(2);
      for (const claim of [
        ...response.explanation,
        ...response.actions,
        ...response.required_documents,
      ]) {
        expect(claim.citation_ids).toEqual(original.explanation[0].citation_ids);
      }
      expect(response.draft?.blocks.every((block) => block.kind === 'template')).toBe(true);
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
    const response = sample();
    response.citations[0].heading = 'changed locally';
    response.actions[0].citation_ids.push('ev-other');
    response.warnings.length = 0;
    expect(sample().citations).toEqual(original.citations);
    expect(sample().actions[0].citation_ids).toEqual(original.explanation[0].citation_ids);
    expect(getDemoResponse('success', 'en')).toEqual(original);
  });
});

describe('AnswerCard', () => {
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
    screen.queryAllByText(/confidence|matrix|success|\d+%/i).forEach((element) => {
      expect(element).not.toBeVisible();
    });
    for (const warning of response.warnings) {
      expect(screen.getByText(warning)).not.toBeVisible();
    }
    await userEvent.click(screen.getByText('About this sample'));
    for (const warning of response.warnings) {
      expect(screen.getByText(warning)).toBeVisible();
    }
    expect(screen.getByText(/Original fixture notes below/)).toBeVisible();
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
    // The original fixture's factual draft block must still work, without editing that fixture.
    response.draft = getDemoResponse('success', 'en').draft;
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
    await expectEvidence(
      screen.getByText(response.draft!.blocks[0].text).closest('.draft-block')!,
      response,
      response.draft!.blocks[0].citation_ids,
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

  it('shows live error code, warnings, and a bounded Try again action', async () => {
    const onRetry = vi.fn();
    const response = getDemoResponse('error', 'en');
    const { container } = renderCard(response, vi.fn(), 'live', onRetry, 'Try again (2 left)');
    expect(screen.getByText(response.error!.message)).toBeVisible();
    expect(screen.getByText(response.error!.code)).toBeVisible();
    const message = container.querySelector('.answer-message') as HTMLElement;
    for (const warning of response.warnings) {
      expect(within(message).getByText(warning)).toBeVisible();
    }
    await userEvent.click(screen.getByRole('button', { name: 'Try again (2 left)' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not offer Try again for sample errors or clarification/unsupported live states', () => {
    const { unmount: unmountSample } = renderCard(
      getDemoResponse('error', 'en'),
      vi.fn(),
      'sample',
      vi.fn(),
    );
    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
    unmountSample();
    const { unmount: unmountUnsupported } = render(
      <AnswerCard
        response={getDemoResponse('unsupported', 'en')}
        onEdit={vi.fn()}
        mode="live"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
    unmountUnsupported();
    render(
      <AnswerCard
        response={getDemoResponse('needs_clarification', 'en')}
        onEdit={vi.fn()}
        mode="live"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
  });

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

  it('labels live answers as grounded with not-chatbot disclosures', async () => {
    const response = sample();
    render(<AnswerCard response={response} onEdit={vi.fn()} mode="live" />);
    expect(screen.getByRole('heading', { name: 'Your grounded answer' })).toBeVisible();
    expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
    expect(screen.queryByText('Sample only · not real claim advice')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('About this answer'));
    expect(screen.getByText(/Educational guidance only/)).toBeVisible();
    expect(screen.getByText('Not a general chatbot')).toBeVisible();
    expect(screen.getByText(/Cites EPFO Markdown paths and original source URLs/)).toBeVisible();
    expect(screen.getByText(/Abstains or asks for clarification/)).toBeVisible();
    expect(screen.getByText(/Checklists and drafts come from cited blocks/)).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    // Live Evidence may render multiple citation details; assert copy without requiring a single node.
    expect(screen.getAllByText(/Evidence cited by the analysis service/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Synthetic evidence only/)).not.toBeInTheDocument();
  });

  it('keeps sample disclosures when mode is sample', () => {
    renderCard(sample(), vi.fn(), 'sample');
    expect(screen.getByRole('heading', { name: 'Your sample answer' })).toBeVisible();
    expect(screen.getByText('Sample only · not real claim advice')).toBeVisible();
  });

  it('treats supplied markup as inert text', async () => {
    const response = sample();
    const markup = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    response.explanation[0].text = markup;
    const { container } = renderCard(response);
    expect(screen.getByText(markup)).toBeVisible();
    expect(container.querySelector('script, img')).toBeNull();
  });
});
