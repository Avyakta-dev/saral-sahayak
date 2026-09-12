import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getWalkthrough } from '../lib/walkthrough';
import { getDemoResponse } from '../lib/demo';
import { AnswerCard } from './AnswerCard';
import { Evidence } from './Evidence';

// Synthetic response data exercises the live renderer, not a provider or source verification.
describe('analysis-service answer presentation', () => {
  it('distinguishes API responses from explicit sample replies', () => {
    const response = getWalkthrough('en');
    render(<AnswerCard response={response} onEdit={vi.fn()} isSample={false} />);
    expect(screen.getByRole('heading', { name: 'Your guidance' })).toBeVisible();
    expect(screen.getByText('Analysis response · verify important guidance')).toBeVisible();
    expect(screen.queryByText('Sample only · not real claim advice')).not.toBeInTheDocument();
    expect(
      screen.getByText('Output language quality has not been independently verified.'),
    ).toBeVisible();
    expect(screen.getByText(response.classification!.rationale)).toBeVisible();
    expect(
      screen.getByText(
        'Classification confidence is not source verification or a guarantee of the outcome.',
      ),
    ).toBeVisible();
  });

  it('treats quality flags as service metadata rather than an accuracy guarantee', () => {
    render(
      <AnswerCard
        response={getWalkthrough('en')}
        onEdit={vi.fn()}
        isSample={false}
        qualityVerified
      />,
    );
    expect(
      screen.getByText(
        'The service reports reviewed language quality; this does not guarantee this answer.',
      ),
    ).toBeVisible();
  });

  it('shows actual limitations by default, without calling sources verified', () => {
    const response = getWalkthrough('en');
    response.warnings = [
      'The source may be out of date. Check important requirements before acting.',
    ];
    render(<AnswerCard response={response} onEdit={vi.fn()} isSample={false} />);
    expect(screen.getByText(response.warnings[0])).toBeVisible();
    expect(
      screen.getByText('Important limitations and source information').closest('details'),
    ).toHaveAttribute('open');
  });

  it('preserves service citation details including zero columns without synthetic UI claims', async () => {
    const response = getWalkthrough('en');
    render(<AnswerCard response={response} onEdit={vi.fn()} isSample={false} />);
    const overview = screen.getByRole('tabpanel', { name: 'Overview' });
    await userEvent.click(within(overview).getAllByText('Sources')[0]);
    expect(
      within(overview).getAllByText(
        'Source details supplied by the analysis service. Citations are not independent verification of current policy.',
      )[0],
    ).toBeVisible();
    expect(
      within(overview).queryByText(
        'Synthetic evidence only. These locations have not been read or verified.',
      ),
    ).not.toBeInTheDocument();
    expect(within(overview).getAllByText('Line 1, column 0 → line 1, column 0')[0]).toBeVisible();
  });

  it('copies the real draft framing, citations and limitations rather than sample boilerplate', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const response = getWalkthrough('en');
    response.warnings = ['Verify important requirements with the relevant authority.'];
    render(<AnswerCard response={response} onEdit={vi.fn()} isSample={false} />);
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText('Review this draft and any missing details before use')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Copy draft' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Draft copied with citations and limitations.',
    );
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain('supplied by the analysis service; not independently verified');
    expect(copied).toContain('zero-based columns: 0–0');
    expect(copied).toContain(response.warnings[0]);
    response.citations.forEach((citation) => {
      expect(copied).toContain(citation.path);
      expect(copied).toContain(citation.heading);
      citation.source_urls.forEach((url) => expect(copied).toContain(url));
    });
    expect(copied).not.toContain('Sample only · not real claim advice');
    expect(screen.queryByRole('button', { name: 'Copy sample' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('reports live draft clipboard failure without falsely reporting success', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'));
    render(<AnswerCard response={getWalkthrough('en')} onEdit={vi.fn()} isSample={false} />);
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    await user.click(screen.getByRole('button', { name: 'Copy draft' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Could not copy. Select and copy the draft and its citations manually.',
    );
  });

  it.each(['needs_clarification', 'unsupported', 'error'] as const)(
    'never exposes guidance or draft controls for API %s',
    (state) => {
      const response = getDemoResponse(state, 'en');
      const onEdit = vi.fn();
      const { container } = render(
        <AnswerCard response={response} onEdit={onEdit} isSample={false} />,
      );
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /copy|download/i })).not.toBeInTheDocument();
      expect(container.querySelector('.answer-uncertainty')).toBeNull();
      expect(container.querySelector('.evidence')).toBeNull();
      expect(screen.getByRole('button', { name: 'Edit remark' })).toBeVisible();
      if (response.error) expect(screen.getByText(response.error.message)).toBeVisible();
      if (response.questions.length) expect(screen.getByText(response.questions[0])).toBeVisible();
      if (state === 'unsupported')
        expect(screen.getAllByText(response.warnings[0])[0]).toBeVisible();
    },
  );

  it('does not label absent service source URLs as verified evidence', async () => {
    const citation = { ...getWalkthrough('en').citations[0], source_urls: [] };
    render(<Evidence ids={[citation.id]} citations={[citation]} isSample={false} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    expect(
      screen.getByText('No source URL supplied. The underlying source cannot be verified here.'),
    ).toBeVisible();
  });
});
