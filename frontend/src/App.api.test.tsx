import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as api from './lib/api';
import { ApiError, type ApiClient } from './lib/api';
import { failureKey } from './lib/backendStatus';
import { capabilitiesSchema, previewCapabilities, type Capabilities } from './lib/capabilities';
import type { AnalyzeResponse, Language } from './lib/contracts';
import * as demo from './lib/demo';
import * as attachments from './lib/attachments';
import { getWalkthrough } from './lib/walkthrough';
import { LocaleProvider, locales, dictionaries, translate } from './lib/i18n';

const input = () => screen.getByRole('textbox', { name: 'Your message' });
const languages = () => screen.getByRole('combobox', { name: 'Output language' });
const analyzeButton = () => screen.getByRole('button', { name: 'Analyze text' });
const refreshButton = () => screen.getByRole('button', { name: 'Refresh connection' });
const remark = '  Fictional rejection wording only  ';
let expectedFetches = 0;
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const tick = async (ms = 700) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function caps(codes: Language[] = ['en', 'hi']): Capabilities {
  return capabilitiesSchema.parse({
    ...previewCapabilities,
    languages: codes.map((code) =>
      previewCapabilities.languages.find((item) => item.code === code),
    ),
    analysis_available: true,
  });
}
function response(status: AnalyzeResponse['status'] = 'success', language: Language = 'en') {
  const result = getWalkthrough(language, status);
  if (status === 'success')
    result.explanation[0].text = 'Distinct answer supplied by the fake analysis service.';
  return result;
}
function client(capabilities = caps()) {
  return {
    baseUrl: '/api/v1',
    getCapabilities: vi.fn<ApiClient['getCapabilities']>().mockResolvedValue(capabilities),
    analyze: vi.fn<ApiClient['analyze']>().mockResolvedValue(response()),
  };
}
async function ready(fake = client()) {
  const view = render(<App apiClient={fake} />);
  await settle();
  return { fake, ...view };
}
function type(value = remark) {
  fireEvent.change(input(), { target: { value } });
}
async function submit(value = remark) {
  type(value);
  fireEvent.click(analyzeButton());
  await settle();
}
function examples() {
  fireEvent.click(screen.getByRole('button', { name: 'Use examples' }));
}
function useApi() {
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Use API' }));
}

beforeEach(() => {
  expectedFetches = 0;
  vi.useFakeTimers();
  vi.stubEnv('VITE_API_BASE_URL', '');
  vi.stubEnv('VITE_API_TIMEOUT_MS', '');
  vi.stubEnv('VITE_PREVIEW_ONLY', 'false');
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('No real network in API UI tests');
    }),
  );
  vi.spyOn(window, 'XMLHttpRequest').mockImplementation(() => {
    throw new Error('No XHR');
  });
});

afterEach(() => {
  cleanup();
  expect(fetch).toHaveBeenCalledTimes(expectedFetches);
  expect(window.XMLHttpRequest).not.toHaveBeenCalled();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

describe('API discovery and explicit consent', () => {
  it('disables unsupported live image actions with an explanation but preserves local examples', async () => {
    const { fake } = await ready();
    expect(screen.getByRole('button', { name: /Add a screenshot/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Take a photo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Add a screenshot/ })).toHaveAccessibleDescription(
      'Text-only analysis after approval. No images sent.',
    );
    fireEvent.click(screen.getByLabelText('Add a file'));
    expect(screen.getByRole('button', { name: /Upload an image/ })).toBeDisabled();
    expect(fake.analyze).not.toHaveBeenCalled();
    examples();
    expect(screen.getByRole('button', { name: /Add a screenshot/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Upload an image/ })).toBeEnabled();
  });
  it('discovers metadata only, gates pending capabilities and sends nothing until explicit Analyze', async () => {
    const metadata = deferred<Capabilities>();
    const fake = client();
    fake.getCapabilities.mockReturnValue(metadata.promise);
    render(<App apiClient={fake} capabilities={previewCapabilities} />);
    type();
    expect(fake.getCapabilities).toHaveBeenCalledExactlyOnceWith(expect.any(AbortSignal));
    expect(languages()).toBeDisabled();
    expect(within(languages()).queryByRole('option', { name: /Hindi/ })).not.toBeInTheDocument();
    expect(analyzeButton()).toBeDisabled();
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(fake.analyze).not.toHaveBeenCalled();
    await act(async () => {
      metadata.resolve(caps(['hi', 'en']));
    });
    expect(languages()).toBeEnabled();
    expect(languages()).toHaveValue('en');
    expect(
      within(languages())
        .getAllByRole('option')
        .map((item) => item.getAttribute('value')),
    ).toEqual(['hi', 'en']);
    expect(fake.analyze).not.toHaveBeenCalled();
    expect(screen.getByText(/without Aadhaar, PAN, UAN, bank details/)).toBeVisible();
    fireEvent.click(analyzeButton());
    await settle();
    expect(fake.analyze).toHaveBeenCalledExactlyOnceWith(
      { text: remark, language: 'en' },
      expect.any(AbortSignal),
    );
    expect(
      screen.getByText('Distinct answer supplied by the fake analysis service.'),
    ).toBeVisible();
    expect(document.querySelector('.user-message p')?.textContent).toBe(remark);
    expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
    expect(screen.queryByText('Sample only · not real claim advice')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('offers a local draft download only after a live answer when downloads_available is true', async () => {
    const capabilities = caps();
    capabilities.downloads_available = true;
    const { fake } = await ready(client(capabilities));
    await submit();
    fireEvent.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByRole('button', { name: 'Copy draft' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Download draft' })).toBeVisible();
    expect(fake.analyze).toHaveBeenCalledOnce();
  });

  it('uses service native labels and submits only the selected enabled language', async () => {
    const subset = caps(['ta', 'en']);
    subset.languages[0].native_name = 'தமிழ் — enabled';
    const { fake } = await ready(client(subset));
    expect(
      within(languages())
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['தமிழ் — enabled', 'English']);
    fireEvent.change(languages(), { target: { value: 'ta' } });
    fake.analyze.mockResolvedValue(response('unsupported', 'ta'));
    type();
    fireEvent.keyDown(input(), { key: 'Enter' });
    await settle();
    expect(fake.analyze).toHaveBeenCalledWith(
      { text: remark, language: 'ta' },
      expect.any(AbortSignal),
    );
  });

  it('uses the real same-origin API default with no injected client or base URL', async () => {
    expectedFetches = 1;
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(caps()), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    render(<App />);
    await settle();
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/capabilities',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(screen.getByRole('button', { name: 'API' })).toBeVisible();
    type();
    expect(analyzeButton()).toBeEnabled();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('uses explicit preview-only configuration without a network request', () => {
    vi.stubEnv('VITE_PREVIEW_ONLY', 'true');
    render(<App />);
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Analyze text' })).not.toBeInTheDocument();
  });

  it('uses configured API unless explicitly injected or configured for preview', async () => {
    const fake = client();
    const configured = vi.spyOn(api, 'getConfiguredApiClient').mockReturnValue(fake);
    const first = render(<App />);
    await settle();
    expect(fake.getCapabilities).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'API' })).toBeVisible();
    first.unmount();
    configured.mockClear();
    const second = render(<App apiClient={null} />);
    expect(configured).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    second.unmount();
    configured.mockReturnValue(null);
    render(<App />);
    type();
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(fake.analyze).not.toHaveBeenCalled();
    expect(screen.getByText(/This preview can’t analyze your claim/)).toBeVisible();
  });

  it('fails closed on invalid environment configuration without revealing its value', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/api/v1?key=synthetic-config-token');
    render(<App />);
    type();
    expect(screen.getByText(/analysis service configuration is invalid/)).toBeVisible();
    expect(languages()).toBeDisabled();
    expect(analyzeButton()).toBeDisabled();
    expect(document.body.textContent).not.toContain('synthetic-config-token');
    examples();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(input()).toHaveValue(remark);
  });

  it('does not use provider keys or browser storage for configuration or requests', async () => {
    const getStorage = vi.spyOn(Storage.prototype, 'getItem');
    const setStorage = vi.spyOn(Storage.prototype, 'setItem');
    vi.stubEnv('VITE_PROVIDER_API_KEY', 'NEVER_SEND_THIS_TEST_SECRET');
    const { fake } = await ready();
    await submit();
    expect(fake.getCapabilities.mock.calls[0]).toHaveLength(1);
    expect(Object.keys(fake.analyze.mock.calls[0][0])).toEqual(['text', 'language']);
    expect(JSON.stringify(fake.analyze.mock.calls)).not.toContain('NEVER_SEND_THIS_TEST_SECRET');
    expect(document.body.textContent).not.toContain('NEVER_SEND_THIS_TEST_SECRET');
    expect(getStorage).not.toHaveBeenCalled();
    expect(setStorage).not.toHaveBeenCalled();
  });

  it('keeps image-only input local and sends only text when an image is attached', async () => {
    const { fake } = await ready();
    const png = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'local-private-name.png',
      { type: 'image/png' },
    );
    // Image decoding has its own tests; this test verifies the UI's transmission boundary.
    vi.spyOn(attachments, 'readImage').mockResolvedValue({
      kind: 'image',
      file: png,
      name: png.name,
      url: 'blob:local-only',
      width: 20,
      height: 20,
    });
    vi.spyOn(attachments, 'releaseImage').mockImplementation(() => undefined);
    fireEvent.change(screen.getByLabelText('Choose image file'), { target: { files: [png] } });
    await settle();
    expect(screen.getByText(/Image stays local. Paste its wording/)).toBeVisible();
    expect(analyzeButton()).toBeDisabled();
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(fake.analyze).not.toHaveBeenCalled();
    await submit('Fictional typed wording');
    expect(fake.analyze).toHaveBeenCalledExactlyOnceWith(
      { text: 'Fictional typed wording', language: 'en' },
      expect.any(AbortSignal),
    );
    expect(JSON.stringify(fake.analyze.mock.calls)).not.toMatch(
      /blob:|local-private-name|file|image/,
    );
  });
});

describe('real response states, edit context and explicit examples', () => {
  it.each(['success', 'needs_clarification', 'unsupported', 'error'] as const)(
    'renders the actual %s response without requesting a sample',
    async (status) => {
      const load = vi.spyOn(demo, 'loadDemoResponse');
      const fake = client();
      const result = response(status);
      fake.analyze.mockResolvedValue(result);
      await ready(fake);
      await submit();
      expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
      if (status === 'success') expect(screen.getByText(result.explanation[0].text)).toBeVisible();
      if (status === 'needs_clarification')
        expect(screen.getByText(result.questions[0])).toBeVisible();
      if (status === 'unsupported')
        expect(screen.getAllByText(result.warnings[0])[0]).toBeVisible();
      if (status === 'error')
        expect(
          screen.getAllByText(dictionaries.en[failureKey(result.error!.code)])[0],
        ).toBeVisible();
      expect(load).not.toHaveBeenCalled();
    },
  );

  it('edits a clarification with original text and questions nearby, then submits the user revision only', async () => {
    const fake = client();
    const clarification = response('needs_clarification');
    fake.analyze
      .mockResolvedValueOnce(clarification)
      .mockResolvedValueOnce(response('unsupported'));
    await ready(fake);
    await submit();
    fireEvent.click(screen.getByRole('button', { name: 'Edit remark' }));
    expect(input()).toHaveValue(remark);
    const context = screen.getByRole('complementary', { name: 'Clarification context' });
    expect(within(context).getByText(clarification.questions[0])).toBeVisible();
    expect(
      screen.queryByText('Grounded analysis · educational, not legal advice'),
    ).not.toBeInTheDocument();
    await submit('Revised fictional remark with the requested context');
    expect(fake.analyze).toHaveBeenLastCalledWith(
      { text: 'Revised fictional remark with the requested context', language: 'en' },
      expect.any(AbortSignal),
    );
    expect(
      screen.queryByRole('complementary', { name: 'Clarification context' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Not enough evidence' })).toBeVisible();
  });

  it('requires an explicit example switch and never relabels completed API or sample turns', async () => {
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const { fake } = await ready();
    await submit();
    type('Keep this unsent fictional remark');
    examples();
    expect(fake.getCapabilities).toHaveBeenCalledOnce();
    expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: demo.demoScenarios[0].label }),
    );
    await tick();
    expect(load).toHaveBeenCalledOnce();
    expect(screen.getByText('Sample only · not real claim advice')).toBeVisible();
    expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
    expect(input()).toHaveValue('Keep this unsent fictional remark');
    useApi();
    await settle();
    expect(fake.getCapabilities).toHaveBeenCalledTimes(2);
    expect(fake.analyze).toHaveBeenCalledOnce();
    expect(screen.getByText('Sample only · not real claim advice')).toBeVisible();
    expect(screen.getByText('Grounded analysis · educational, not legal advice')).toBeVisible();
    expect(input()).toHaveValue('Keep this unsent fictional remark');
    // Timers are already fake; allow DOM visibility queries headroom during parallel browser runs.
  }, 10_000);

  it('Show me an example explicitly cancels metadata discovery and uses offline fixtures', async () => {
    const metadata = deferred<Capabilities>();
    const fake = client();
    fake.getCapabilities.mockReturnValue(metadata.promise);
    render(<App apiClient={fake} />);
    type();
    fireEvent.click(screen.getByRole('button', { name: /Show me an example/ }));
    expect(fake.getCapabilities.mock.calls[0][0].aborted).toBe(true);
    await act(async () => {
      metadata.resolve(caps(['en']));
    });
    await tick();
    expect(screen.getByText('Sample only · not real claim advice')).toBeVisible();
    expect(within(languages()).getAllByRole('option')).toHaveLength(6);
    expect(fake.analyze).not.toHaveBeenCalled();
    expect(input()).toHaveValue(remark);
  });

  it('discloses structural availability and download limitations, even for true metadata flags', async () => {
    const capabilities = caps();
    capabilities.downloads_available = true;
    capabilities.languages[0].quality_verified = true;
    await ready(client(capabilities));
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(
      within(screen.getByRole('dialog')).getByText(/configuration and structure metadata/),
    ).toBeVisible();
    expect(screen.getByText(/Live drafts can save a local text file/)).toBeVisible();
    fireEvent.click(screen.getByText('Service language capabilities'));
    expect(screen.getByText('Service quality flag: true')).toBeVisible();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });
});

describe('failures and bounded manual retries', () => {
  it.each([
    'network_error',
    'analysis_timeout',
    'request_timeout',
    'analysis_capacity',
    'access_denied',
    'invalid_request',
    'request_too_large',
    'invalid_response',
    'response_too_large',
    'invalid_configuration',
  ])('handles transport %s without exposing raw errors or falling back', async (code) => {
    const load = vi.spyOn(demo, 'loadDemoResponse');
    const fake = client();
    fake.analyze.mockRejectedValue(new ApiError(code, 'PRIVATE_RAW_BODY_OR_ENDPOINT'));
    await ready(fake);
    await submit();
    expect(screen.getByRole('heading', { name: 'Could not reach an answer' })).toBeVisible();
    expect(document.body.textContent).not.toContain('PRIVATE_RAW_BODY_OR_ENDPOINT');
    expect(input()).toHaveValue(remark);
    expect(load).not.toHaveBeenCalled();
    expect(screen.queryByText('Sample only · not real claim advice')).not.toBeInTheDocument();
    if (api.isRetryableCode(code))
      expect(screen.getByRole('button', { name: 'Retry analysis' })).toBeEnabled();
    else expect(screen.queryByRole('button', { name: 'Retry analysis' })).not.toBeInTheDocument();
    await tick(300_000);
    expect(fake.analyze).toHaveBeenCalledOnce();
  });

  it.each([
    'access_denied',
    'analysis_capacity',
    'budget_exhausted',
    'model_not_configured',
    'knowledge_unavailable',
    'language_disabled',
    'invalid_request',
  ])('renders typed %s through AnswerCard without blind retry', async (code) => {
    const fake = client();
    const result = response('error');
    result.error = { code, message: 'Service supplied typed failure detail.' };
    fake.analyze.mockResolvedValue(result);
    await ready(fake);
    await submit();
    expect(screen.getByRole('heading', { name: 'Could not prepare an answer' })).toBeVisible();
    expect(screen.queryByText('Service supplied typed failure detail.')).not.toBeInTheDocument();
    expect(screen.getAllByText(dictionaries.en[failureKey(code)])[0]).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Retry analysis' })).not.toBeInTheDocument();
    await tick(300_000);
    expect(fake.analyze).toHaveBeenCalledOnce();
  });

  it.each(['transport', 'envelope'])(
    'allows at most two manual same-turn retries for transient %s errors',
    async (kind) => {
      const fake = client();
      if (kind === 'transport')
        fake.analyze.mockRejectedValue(new ApiError('network_error', 'sanitized'));
      else fake.analyze.mockResolvedValue(response('error'));
      await ready(fake);
      await submit();
      expect(screen.getByText(/Retry resends the same text/)).toBeVisible();
      for (let retry = 0; retry < 2; retry += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Retry analysis' }));
        await settle();
      }
      expect(fake.analyze).toHaveBeenCalledTimes(3);
      expect(screen.getByRole('button', { name: 'Retry analysis' })).toBeDisabled();
      expect(screen.getByText(/Retry limit reached/)).toBeVisible();
      expect(document.querySelectorAll('.user-message')).toHaveLength(1);
      for (const [payload] of fake.analyze.mock.calls)
        expect(payload).toEqual({ text: remark, language: 'en' });
    },
  );

  it('bounds request_timeout to two explicit retries', async () => {
    const fake = client();
    fake.analyze.mockRejectedValue(new ApiError('request_timeout', 'sanitized'));
    await ready(fake);
    await submit();
    for (let retry = 0; retry < 2; retry += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Retry analysis' }));
      await settle();
    }
    expect(fake.analyze).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'Retry analysis' })).toBeDisabled();
  });

  it('does not treat available metadata as gateway authorization', async () => {
    const fake = client();
    fake.analyze.mockRejectedValue(new ApiError('access_denied', 'PRIVATE_TOKEN'));
    await ready(fake);
    expect(document.querySelector('.api-connection')).toHaveAttribute('data-state', 'ready');
    await submit();
    expect(screen.getByText('Analysis gateway not ready')).toBeVisible();
    expect(screen.getAllByText(/Do not enter access tokens or provider keys/)[0]).toBeVisible();
    expect(analyzeButton()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Retry analysis' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'API' })).toBeVisible();
    expect(document.body.textContent).not.toContain('PRIVATE_TOKEN');
  });

  it('clears the old error while retrying and prevents duplicate requests', async () => {
    const retry = deferred<AnalyzeResponse>();
    const fake = client();
    fake.analyze
      .mockRejectedValueOnce(new ApiError('network_error', 'sanitized'))
      .mockReturnValueOnce(retry.promise);
    await ready(fake);
    await submit();
    fireEvent.click(screen.getByRole('button', { name: 'Retry analysis' }));
    expect(
      screen.queryByRole('heading', { name: 'Could not reach an answer' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Waiting for the analysis service…')).toBeVisible();
    expect(input()).toHaveAttribute('readonly');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(fake.analyze).toHaveBeenCalledTimes(2);
    await act(async () => {
      retry.resolve(response());
    });
    expect(screen.queryByText('Waiting for the analysis service…')).not.toBeInTheDocument();
  });
});

describe('capability readiness, refresh and cancellation', () => {
  it('gates unavailable analysis even with known enabled languages', async () => {
    const unavailable = caps();
    unavailable.analysis_available = false;
    const { fake } = await ready(client(unavailable));
    type();
    expect(languages()).toBeDisabled();
    expect(analyzeButton()).toBeDisabled();
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(fake.analyze).not.toHaveBeenCalled();
    expect(screen.getByText(/Text analysis is unavailable/)).toBeVisible();
  });

  it.each(['unreachable', 'malformed'])(
    'fails closed on %s metadata and never automatically retries',
    async (kind) => {
      const fake = client();
      if (kind === 'unreachable')
        fake.getCapabilities.mockRejectedValue(new ApiError('network_error', 'PRIVATE_ENDPOINT'));
      else fake.getCapabilities.mockResolvedValue({ analysis_available: true } as Capabilities);
      await ready(fake);
      type();
      expect(languages()).toBeDisabled();
      expect(analyzeButton()).toBeDisabled();
      expect(document.body.textContent).not.toContain('PRIVATE_ENDPOINT');
      await tick(300_000);
      expect(fake.getCapabilities).toHaveBeenCalledOnce();
      expect(fake.analyze).not.toHaveBeenCalled();
    },
  );

  it('caps metadata refreshes at two, including explicit returns from examples', async () => {
    const { fake } = await ready();
    type();
    fireEvent.click(refreshButton());
    await settle();
    examples();
    useApi();
    await settle();
    expect(fake.getCapabilities).toHaveBeenCalledTimes(3);
    expect(refreshButton()).toBeDisabled();
    examples();
    useApi();
    await settle();
    expect(fake.getCapabilities).toHaveBeenCalledTimes(3);
    expect(languages()).toBeDisabled();
    expect(analyzeButton()).toBeDisabled();
    expect(screen.getByText(/Connection refresh limit reached/)).toBeVisible();
    expect(input()).toHaveValue(remark);
  });

  it('refresh aborts pending analysis, removes its guidance and resets a disabled language', async () => {
    const pending = deferred<AnalyzeResponse>();
    const fake = client();
    fake.analyze.mockReturnValue(pending.promise);
    await ready(fake);
    fireEvent.change(languages(), { target: { value: 'hi' } });
    await submit();
    const signal = fake.analyze.mock.calls[0][1];
    fake.getCapabilities.mockResolvedValue(caps(['en']));
    fireEvent.click(refreshButton());
    await settle();
    expect(signal.aborted).toBe(true);
    expect(languages()).toHaveValue('en');
    await act(async () => {
      pending.resolve(response('success', 'hi'));
    });
    expect(
      screen.queryByText('Distinct answer supplied by the fake analysis service.'),
    ).not.toBeInTheDocument();
    expect(input()).toHaveValue(remark);
  });

  it.each(['cancel', 'language', 'mode', 'new chat'] as const)(
    '%s aborts analysis and ignores late replies',
    async (action) => {
      const pending = deferred<AnalyzeResponse>();
      const fake = client();
      fake.analyze.mockReturnValue(pending.promise);
      await ready(fake);
      await submit();
      const signal = fake.analyze.mock.calls[0][1];
      if (action === 'cancel')
        fireEvent.click(screen.getByRole('button', { name: 'Stop analysis' }));
      if (action === 'language') fireEvent.change(languages(), { target: { value: 'hi' } });
      if (action === 'mode') examples();
      if (action === 'new chat') fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
      expect(signal.aborted).toBe(true);
      expect(input()).toHaveValue(action === 'new chat' ? '' : remark);
      await act(async () => {
        pending.resolve(response());
      });
      expect(
        screen.queryByText('Distinct answer supplied by the fake analysis service.'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Waiting for the analysis service…')).not.toBeInTheDocument();
    },
  );

  it('new chat cancels a pending metadata refresh without losing completed turn ownership', async () => {
    const { fake } = await ready();
    await submit();
    const pending = deferred<Capabilities>();
    fake.getCapabilities.mockReturnValue(pending.promise);
    fireEvent.click(refreshButton());
    const signal = fake.getCapabilities.mock.calls[1][0];
    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
    expect(signal.aborted).toBe(true);
    await act(async () => {
      pending.resolve(caps());
    });
    expect(languages()).toBeDisabled();
    expect(
      screen.queryByText('Grounded analysis · educational, not legal advice'),
    ).not.toBeInTheDocument();
  });

  it('changing client aborts the old connection and ignores its late metadata', async () => {
    const pending = deferred<Capabilities>();
    const old = client();
    old.getCapabilities.mockReturnValue(pending.promise);
    const next = client(caps(['en']));
    const { rerender } = render(<App apiClient={old} />);
    type();
    rerender(<App apiClient={next} />);
    await settle();
    expect(old.getCapabilities.mock.calls[0][0].aborted).toBe(true);
    await act(async () => {
      pending.resolve(caps());
    });
    expect(within(languages()).getAllByRole('option')).toHaveLength(1);
    expect(input()).toHaveValue(remark);
    expect(next.analyze).not.toHaveBeenCalled();
  });

  it.each(['metadata', 'analysis'] as const)(
    'unmount aborts pending %s and safely ignores late completion',
    async (kind) => {
      const metadata = deferred<Capabilities>();
      const analysis = deferred<AnalyzeResponse>();
      const fake = client();
      if (kind === 'metadata') fake.getCapabilities.mockReturnValue(metadata.promise);
      else fake.analyze.mockReturnValue(analysis.promise);
      const { unmount } = render(<App apiClient={fake} />);
      await settle();
      if (kind === 'analysis') await submit();
      const signal =
        kind === 'metadata' ? fake.getCapabilities.mock.calls[0][0] : fake.analyze.mock.calls[0][1];
      unmount();
      expect(signal.aborted).toBe(true);
      await act(async () => {
        metadata.resolve(caps());
        analysis.resolve(response());
      });
      expect(
        screen.queryByText('Distinct answer supplied by the fake analysis service.'),
      ).not.toBeInTheDocument();
    },
  );
});

describe('reactive interface localization without extra requests', () => {
  it('updates pending, missing gates and refresh errors in all six locales without refetching', async () => {
    const metadata = deferred<Capabilities>();
    const fake = client();
    fake.getCapabilities.mockReturnValueOnce(metadata.promise);
    render(
      <LocaleProvider>
        <App apiClient={fake} />
      </LocaleProvider>,
    );
    const change = (code: (typeof locales)[number]) =>
      fireEvent.change(document.querySelector('#ui-language')!, { target: { value: code } });
    for (const code of locales) {
      change(code);
      expect(screen.getByText(dictionaries[code].backendChecking)).toBeVisible();
      expect(screen.getByText(dictionaries[code].connectionChecking)).toBeVisible();
      expect(fake.getCapabilities).toHaveBeenCalledOnce();
    }
    const missing = caps();
    missing.analysis_available = false;
    missing.checks.model_configured = false;
    missing.checks.knowledge_structure_ready = false;
    await act(async () => metadata.resolve(missing));
    for (const code of locales) {
      change(code);
      expect(screen.getByText(dictionaries[code].waitingBoth)).toBeVisible();
      expect(
        screen.getByRole('complementary', { name: dictionaries[code].analysisReadiness }),
      ).toHaveAttribute('lang', code);
      expect(fake.getCapabilities).toHaveBeenCalledOnce();
    }
    fake.getCapabilities.mockRejectedValue(new ApiError('invalid_response', 'PRIVATE_UNTRUSTED'));
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: dictionaries.ml.refreshConnection }));
      await settle();
    }
    for (const code of locales) {
      change(code);
      expect(screen.getByText(dictionaries[code].failureResponse)).toBeVisible();
      expect(screen.getByText(translate(code, 'refreshLimit', { count: 2 }))).toBeVisible();
      expect(
        screen.getByRole('button', { name: dictionaries[code].refreshConnection }),
      ).toBeDisabled();
      expect(fake.getCapabilities).toHaveBeenCalledTimes(3);
      expect(fake.analyze).not.toHaveBeenCalled();
      expect(document.body.textContent).not.toContain('PRIVATE_UNTRUSTED');
    }
  });

  it('reactively translates stored transport errors and retry limits without changing input or retrying', async () => {
    const fake = client();
    fake.analyze.mockRejectedValue(new ApiError('model_unavailable', 'PRIVATE_UNTRUSTED'));
    render(
      <LocaleProvider>
        <App apiClient={fake} />
      </LocaleProvider>,
    );
    await settle();
    await submit();
    for (const code of locales) {
      fireEvent.change(document.querySelector('#ui-language')!, { target: { value: code } });
      expect(
        screen.getByRole('heading', { name: dictionaries[code].answerUnreachable }),
      ).toBeVisible();
      expect(screen.getByText(dictionaries[code].failureUnknown)).toBeVisible();
      expect(
        screen.getByText(translate(code, 'retryExplanationOther', { count: 2 })),
      ).toBeVisible();
      expect(fake.analyze).toHaveBeenCalledOnce();
      expect(fake.getCapabilities).toHaveBeenCalledOnce();
      expect(screen.getByRole('textbox', { name: dictionaries[code].yourMessage })).toHaveValue(
        remark,
      );
    }
    // Switching UI locale now also switches the analysis output language when the
    // code matches an enabled one, so it must be set back to the turn's own
    // language before retrying it, or the mismatch silently no-ops the retry.
    fireEvent.change(document.querySelector('#ui-language')!, { target: { value: 'en' } });
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: dictionaries.en.retryAnalysis }));
      await settle();
    }
    for (const code of locales) {
      fireEvent.change(document.querySelector('#ui-language')!, { target: { value: code } });
      expect(screen.getByText(dictionaries[code].retryLimit)).toBeVisible();
      expect(screen.getByRole('button', { name: dictionaries[code].retryAnalysis })).toBeDisabled();
      expect(fake.analyze).toHaveBeenCalledTimes(3);
    }
    expect(document.body.textContent).not.toContain('PRIVATE_UNTRUSTED');
  });

  it('localizes capacity and access denials in every locale while preserving no-retry behavior', async () => {
    const fake = client();
    fake.analyze.mockRejectedValue(new ApiError('analysis_capacity', 'PRIVATE_CAPACITY'));
    const view = render(
      <LocaleProvider>
        <App apiClient={fake} />
      </LocaleProvider>,
    );
    await settle();
    await submit();
    for (const code of locales) {
      fireEvent.change(document.querySelector('#ui-language')!, { target: { value: code } });
      expect(screen.getAllByText(dictionaries[code].failureCapacity)[0]).toBeVisible();
      expect(
        screen.queryByRole('button', { name: dictionaries[code].retryAnalysis }),
      ).not.toBeInTheDocument();
      expect(fake.analyze).toHaveBeenCalledOnce();
    }
    view.unmount();
    fake.getCapabilities.mockRejectedValue(new ApiError('access_denied', 'PRIVATE_ACCESS'));
    render(
      <LocaleProvider>
        <App apiClient={fake} />
      </LocaleProvider>,
    );
    await settle();
    for (const code of locales) {
      fireEvent.change(document.querySelector('#ui-language')!, { target: { value: code } });
      expect(screen.getByText(dictionaries[code].gatewayNotReady)).toBeVisible();
      expect(screen.getByText(dictionaries[code].failureAccess)).toBeVisible();
      expect(fake.getCapabilities).toHaveBeenCalledTimes(2);
    }
  });
});
