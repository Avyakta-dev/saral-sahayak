import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getDemoResponse } from '../lib/demo';
import { Evidence } from './Evidence';
import { AnswerCard } from './AnswerCard';

const success = () => getDemoResponse('success', 'en');

describe('evidence disclosure', () => {
  it('keeps exact source locations visible without linking imaginary references', async () => {
    const response = success();
    render(<Evidence ids={response.explanation[0].citation_ids} citations={response.citations} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    expect(screen.getByText(response.citations[0].path)).toBeVisible();
    expect(screen.getByText(response.citations[0].heading)).toBeVisible();
    expect(screen.getByText('Supporting document (no record ID)')).toBeVisible();
    expect(screen.getByText(response.citations[0].source_urls[0])).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('never makes an unsafe source URL clickable', async () => {
    const citation = {
      ...success().citations[0],
      source_urls: ['javascript:alert(1)', 'https://user:password@example.org/'],
    };
    render(<Evidence ids={[citation.id]} citations={[citation]} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getAllByText('Unavailable link — unsafe URL rejected')).toHaveLength(2);
  });

  it('opens allowed source URLs without referrer or opener access', async () => {
    const citation = { ...success().citations[0], source_urls: ['https://example.org/source'] };
    render(<Evidence ids={[citation.id]} citations={[citation]} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.org/source');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('reports an absent referenced citation rather than inventing evidence', async () => {
    render(<Evidence ids={['ev-missing']} citations={[]} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    expect(screen.getByRole('alert')).toHaveTextContent('Source details are unavailable');
  });

  it('does not mistake empty URL arrays for verified evidence', async () => {
    const citation = { ...success().citations[0], source_urls: [] };
    render(<Evidence ids={[citation.id]} citations={[citation]} />);
    await userEvent.click(screen.getByText('Source', { exact: true }));
    expect(screen.getByText(/No source URL supplied/)).toBeVisible();
  });
});

describe('result and draft edge cases', () => {
  it('handles success without optional actions, documents or draft honestly', async () => {
    const response = { ...success(), actions: [], required_documents: [], draft: null };
    render(<AnswerCard response={response} onEdit={vi.fn()} />);
    expect(screen.getByText('No document information was supplied.')).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Next steps' }));
    expect(screen.getByText('No steps were supplied.')).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText('No draft was supplied.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Copy sample' })).not.toBeInTheDocument();
  });

  it('renders untrusted answer markup as inert text', () => {
    const text = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const response = success();
    response.explanation[0].text = text;
    const { container } = render(<AnswerCard response={response} onEdit={vi.fn()} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(container.querySelector('script, img')).toBeNull();
  });

  it('keeps draft placeholders highlighted rather than inventing user data', async () => {
    render(<AnswerCard response={success()} onEdit={vi.fn()} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByText(/CLAIMANT_NAME — intentionally not supplied/).tagName).toBe('MARK');
    expect(screen.getByText(/Unfilled placeholders:/)).toBeVisible();
    expect(screen.getByText('Sample request — not for submission', { exact: true })).toBeVisible();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('renders no document for a null draft', async () => {
    render(<AnswerCard response={{ ...success(), draft: null }} onEdit={vi.fn()} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText('No draft was supplied.')).toBeVisible();
  });

  it('labels personal action tracking and does not put checkboxes on documents', async () => {
    render(<AnswerCard response={success()} onEdit={vi.fn()} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Next steps' }));
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText('1 of 1 checked')).toBeVisible();
    expect(
      screen.getByText('Temporary checklist · not saved or verified by any service.'),
    ).toBeVisible();
  });
});
