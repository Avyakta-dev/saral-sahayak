import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConnectedApp from './App';

const App = (props: Parameters<typeof ConnectedApp>[0]) => (
  <ConnectedApp {...props} apiClient={null} />
);
import { capabilitiesSchema, previewCapabilities, type Capabilities } from './lib/capabilities';
import type { Language } from './lib/contracts';
import * as demo from './lib/demo';
import { getWalkthrough, walkthroughRemark } from './lib/walkthrough';

const languages: Language[] = ['en', 'hi', 'kn', 'ta', 'te', 'ml'];
const input = () => screen.getByRole('textbox', { name: 'Your message' });
const languageSelect = () => screen.getByRole('combobox', { name: 'Output language' });
const tick = async (milliseconds = 700) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
};
const subset = (codes: Language[]): Capabilities =>
  capabilitiesSchema.parse({
    ...previewCapabilities,
    languages: codes.map((code) =>
      previewCapabilities.languages.find((item) => item.code === code)!,
    ),
  });
const headings = {
  success: 'Your sample answer',
  needs_clarification: 'One more detail',
  unsupported: 'Not enough evidence',
  error: 'Could not prepare an answer',
};

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no layout or native modal focus management. Browser tests cover both.
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    }),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    }),
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Preview must not fetch');
    }),
  );
  vi.spyOn(window, 'XMLHttpRequest').mockImplementation(() => {
    throw new Error('Preview must not use XHR');
  });
});

afterEach(() => {
  // Unmount first so real cancellation/cleanup runs before restoring the clock.
  cleanup();
  try {
    expect(fetch).not.toHaveBeenCalled();
    expect(window.XMLHttpRequest).not.toHaveBeenCalled();
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  }
});

describe('offline capability-driven App', () => {
  it('defaults to the validated six-language fixture with native labels, not backend discovery', () => {
    render(<App />);
    expect(languageSelect()).toHaveValue('en');
    const options = within(languageSelect()).getAllByRole('option');
    expect(options.map((option) => option.getAttribute('value'))).toEqual(languages);
    expect(options.map((option) => option.textContent)).toEqual([
      'English',
      'हिन्दी',
      'ಕನ್ನಡ',
      'தமிழ்',
      'తెలుగు',
      'മലയാളം',
    ]);
    expect(screen.getByText('6 example languages · quality unreviewed')).toBeVisible();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getByRole('combobox', { name: 'Interface language' })).toHaveValue('en');
    expect(screen.getByRole('button', { name: /Show me an example/ })).toBeVisible();
    for (const scenario of demo.demoScenarios) {
      expect(screen.queryByRole('button', { name: scenario.label })).not.toBeInTheDocument();
    }
  });

  it.each<Language[]>([
    ['ta', 'en'],
    ['ml', 'kn', 'en', 'hi'],
  ])(
    'uses only enabled options in configured order (not the first option as default): %j',
    (...codes) => {
      const capabilities = subset(codes);
      // Native names must come from the supplied response, not a hardcoded lookup.
      capabilities.languages[0].native_name += ' — fixture';
      render(<App capabilities={capabilities} />);
      expect(languageSelect()).toHaveValue('en');
      const options = within(languageSelect()).getAllByRole('option');
      expect(options.map((option) => option.getAttribute('value'))).toEqual(codes);
      expect(options.map((option) => option.textContent)).toEqual(
        capabilities.languages.map((item) => item.native_name),
      );
      capabilities.languages.forEach((item, index) => {
        expect(options[index]).toHaveAccessibleName(`${item.name} (${item.native_name})`);
      });
    },
  );

  it('discloses quality flags as fixture metadata even when quality and availability are true', () => {
    const capabilities = subset(['hi', 'en']);
    capabilities.languages[0].quality_verified = true;
    capabilities.analysis_available = true;
    render(<App capabilities={capabilities} />);
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Example language capabilities'));
    expect(within(dialog).getByText('Fixture quality flag: true')).toBeVisible();
    expect(within(dialog).getByText('Quality not verified')).toBeVisible();
    expect(
      within(dialog).getByText(/validated offline response, not a live service check/),
    ).toBeVisible();
    expect(
      within(dialog).getByText(/not verified connectivity, accurate guidance or fluent output/),
    ).toBeVisible();
    expect(
      within(dialog).getByText(/Sample translations have not been independently reviewed/),
    ).toBeVisible();
    expect(within(dialog).getByText('Not connected yet')).toBeVisible();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close preview details' }));
    fireEvent.change(input(), { target: { value: 'Synthetic quality-flag test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(
      screen.getByRole('heading', {
        name: 'Your message is here. The assistant isn’t connected yet.',
      }),
    ).toBeVisible();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('resets a disabled selected language to the enabled default and aborts its pending sample', async () => {
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const { rerender } = render(<App />);
    fireEvent.change(languageSelect(), { target: { value: 'ta' } });
    fireEvent.change(input(), { target: { value: 'Unsent fictional text' } });
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    const signal = load.mock.calls[0][2];
    await tick(300);
    rerender(<App capabilities={subset(['ml', 'en'])} />);
    expect(signal.aborted).toBe(true);
    expect(languageSelect()).toHaveValue('en');
    expect(screen.getByText(/That language is not enabled/)).toBeVisible();
    await tick(1500);
    expect(screen.queryByRole('region', { name: 'Your sample answer' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Opening the sample walkthrough/)).not.toBeInTheDocument();
    expect(input()).toHaveValue('Unsent fictional text');
    expect(input()).not.toHaveAttribute('readonly');
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    await tick();
    expect(screen.getByRole('region', { name: 'Your sample answer' })).toHaveAttribute(
      'lang',
      'en',
    );
  });

  it('aborts pending work on changed capabilities even when the selected language remains enabled', async () => {
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const { rerender } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    const signal = load.mock.calls[0][2];
    await tick(300);
    rerender(<App capabilities={subset(['ta', 'en'])} />);
    expect(signal.aborted).toBe(true);
    await tick(1500);
    expect(languageSelect()).toHaveValue('en');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText(/Opening the sample walkthrough/)).not.toBeInTheDocument();
    expect(input()).not.toHaveAttribute('readonly');
  });

  it('does not abort pending work on an ordinary rerender with the same capabilities reference', async () => {
    const capabilities = subset(['ta', 'en']);
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const { rerender } = render(<App capabilities={capabilities} />);
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    rerender(<App capabilities={capabilities} />);
    expect(load.mock.calls[0][2].aborted).toBe(false);
    await tick();
    expect(screen.getByRole('region', { name: 'Your sample answer' })).toBeVisible();
  });

  it('aborts pending mock work when unmounted', async () => {
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    unmount();
    expect(load.mock.calls[0][2].aborted).toBe(true);
    await tick(1500);
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});

describe('explicit sample gallery', () => {
  for (const language of languages) {
    it.each(demo.demoScenarios)(
      '%s gallery reply in ' + language + ' is selected explicitly, never by user keywords',
      async ({ value, label }) => {
        const load = vi.spyOn(demo, 'loadDemoResponse');
        render(<App />);
        fireEvent.change(languageSelect(), { target: { value: language } });
        fireEvent.change(input(), {
          target: { value: `${value}: ${label} — my own fictional message` },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
        expect(load).not.toHaveBeenCalled();
        expect(screen.getByText(/This preview can’t analyze your claim/)).toBeVisible();
        expect(screen.queryByRole('tab')).not.toBeInTheDocument();
        fireEvent.change(input(), { target: { value: 'Keep this unsent text' } });
        fireEvent.click(screen.getByRole('button', { name: 'Details' }));
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByRole('heading', { name: 'Explore sample replies' }),
        ).toBeVisible();
        for (const scenario of demo.demoScenarios) {
          expect(within(dialog).getByRole('button', { name: scenario.label })).toBeVisible();
        }
        fireEvent.click(within(dialog).getByRole('button', { name: label }));
        expect(dialog).not.toBeVisible();
        expect(load).toHaveBeenCalledWith(value, language, expect.any(AbortSignal));
        expect(screen.getByText('Opening the sample walkthrough…')).toBeVisible();
        await tick(699);
        expect(screen.queryByRole('region', { name: headings[value] })).not.toBeInTheDocument();
        await tick(1);
        const card = screen.getByRole('region', { name: headings[value] });
        const response = getWalkthrough(language, value);
        expect(card).toHaveAttribute('lang', language);
        expect(screen.getByText(walkthroughRemark(language, value))).toBeVisible();
        expect(within(card).getByText('Sample only · not real claim advice')).toBeVisible();
        expect(
          within(card).getByText(/Sample language quality has not been independently reviewed/),
        ).toBeVisible();
        expect(input()).toHaveValue('Keep this unsent text');
        if (value === 'success') {
          expect(within(card).getByText(response.explanation[0].text)).toBeVisible();
          expect(
            within(card)
              .getAllByRole('tab')
              .map((tab) => tab.textContent),
          ).toEqual(['Overview', 'Next steps', 'Draft']);
        } else {
          expect(within(card).queryByRole('tab')).not.toBeInTheDocument();
          expect(within(card).queryByRole('checkbox')).not.toBeInTheDocument();
          expect(
            within(card).queryByRole('button', { name: /copy|download/i }),
          ).not.toBeInTheDocument();
          expect(card.querySelector('.evidence, .draft-paper')).toBeNull();
          for (const question of response.questions)
            expect(within(card).getByText(question)).toBeVisible();
          if (value === 'unsupported')
            expect(within(card).getAllByText(response.warnings[0])[0]).toBeVisible();
          if (value === 'error') {
            expect(response.error?.code).toBe('service_unavailable');
            expect(within(card).getByText(response.error!.message)).toBeVisible();
            expect(card.querySelector('.answer-message')).not.toHaveTextContent(
              /agent_not_implemented|not implemented/i,
            );
          }
        }
        expect(screen.getByText(/This preview can’t analyze your claim/)).toBeVisible();
        fireEvent.click(within(card).getByRole('button', { name: 'Edit remark' }));
        await tick(20);
        expect(input()).toHaveFocus();
        expect(input()).toHaveValue(walkthroughRemark(language, value));
        fireEvent.keyDown(input(), { key: 'Enter', code: 'Enter' });
        expect(screen.queryByRole('region', { name: headings[value] })).not.toBeInTheDocument();
        expect(load).toHaveBeenCalledTimes(1);
        expect(screen.getAllByText(/This preview can’t analyze your claim/)).toHaveLength(2);
      },
    );
  }
});
