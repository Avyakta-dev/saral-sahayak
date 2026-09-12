import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDemoResponse } from './demo';
import { analyzeRemark, fetchCapabilities, getApiBaseUrl } from './api';

import { testCapabilities, languageSamples } from '../test/languages';

const originalEnv = import.meta.env.VITE_API_BASE_URL;

describe('getApiBaseUrl', () => {
  afterEach(() => {
    import.meta.env.VITE_API_BASE_URL = originalEnv;
  });

  it('trims whitespace and strips trailing slashes', () => {
    import.meta.env.VITE_API_BASE_URL = '  http://127.0.0.1:8000///  ';
    expect(getApiBaseUrl()).toBe('http://127.0.0.1:8000');
  });

  it('treats blank values as same-origin (empty string)', () => {
    import.meta.env.VITE_API_BASE_URL = '   ';
    expect(getApiBaseUrl()).toBe('');
    import.meta.env.VITE_API_BASE_URL = '';
    expect(getApiBaseUrl()).toBe('');
  });
});

describe('fetchCapabilities', () => {
  beforeEach(() => {
    import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    import.meta.env.VITE_API_BASE_URL = originalEnv;
    vi.unstubAllGlobals();
  });

  it('GETs capabilities and returns analysis_available', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(testCapabilities), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const controller = new AbortController();
    await expect(fetchCapabilities(controller.signal)).resolves.toEqual(testCapabilities);
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8000/api/v1/capabilities', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  });

  it('throws a clear error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchCapabilities()).rejects.toThrow(/Could not reach the analysis service/);
  });

  it.each([
    null,
    [],
    {},
    { ...testCapabilities, languages: [] },
    { ...testCapabilities, languages: testCapabilities.languages.slice(1) },
    {
      ...testCapabilities,
      languages: [testCapabilities.languages[0], testCapabilities.languages[0]],
    },
    { ...testCapabilities, languages: [{ ...testCapabilities.languages[0], code: 'fr' }] },
    { ...testCapabilities, default_language: 'hi' },
    ...[true, 'false', undefined].map((quality_verified) => ({
      ...testCapabilities,
      languages: [{ ...testCapabilities.languages[0], quality_verified }],
    })),
    ...['', ' ', ' English', '<script>', 'English\u202e', 'a'.repeat(61), 'English\n'].flatMap(
      (name) => [
        { ...testCapabilities, languages: [{ ...testCapabilities.languages[0], name }] },
        {
          ...testCapabilities,
          languages: [{ ...testCapabilities.languages[0], native_name: name }],
        },
      ],
    ),
  ])('rejects malformed capability metadata %#', async (payload) => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload)));
    await expect(fetchCapabilities()).rejects.toThrow(/valid availability and language metadata/);
  });

  it('accepts a configured subset in its supplied order', async () => {
    const payload = {
      ...testCapabilities,
      languages: [testCapabilities.languages[3], testCapabilities.languages[0]],
    };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload)));
    await expect(fetchCapabilities()).resolves.toEqual(payload);
  });

  it('rethrows abort errors', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    vi.mocked(fetch).mockRejectedValue(abort);
    await expect(fetchCapabilities()).rejects.toBe(abort);
  });
});

describe('analyzeRemark', () => {
  beforeEach(() => {
    import.meta.env.VITE_API_BASE_URL = '';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    import.meta.env.VITE_API_BASE_URL = originalEnv;
    vi.unstubAllGlobals();
  });

  it('POSTs JSON without browser secrets and parses AnalyzeResponse', async () => {
    const payload = getDemoResponse('success', 'en');
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const controller = new AbortController();
    const result = await analyzeRemark({
      text: 'Synthetic remark',
      language: 'en',
      details: { claimant_name: null, claim_id: null, claim_type: null },
      signal: controller.signal,
    });
    expect(result.status).toBe('success');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/analyze');
    expect(init?.method).toBe('POST');
    expect(init?.signal).toBe(controller.signal);
    const headers = init?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(JSON.stringify(headers)).not.toMatch(/ANALYSIS_ACCESS_TOKEN|LLM_API_KEY|api[_-]?key/i);
    expect(JSON.parse(String(init?.body))).toEqual({
      text: 'Synthetic remark',
      language: 'en',
      details: { claimant_name: null, claim_id: null, claim_type: null },
    });
  });

  it.each(languageSamples)(
    'preserves literal text and identifiers in $code',
    async ({ code, text }) => {
      const payload = { ...getDemoResponse('success', 'en'), language: code };
      payload.explanation[0].text = `${text} SYNTHETIC-ID-00/A [claimant_name] e\u0301`;
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload)));
      const result = await analyzeRemark({ text: payload.explanation[0].text, language: code });
      expect(result).toEqual(payload);
      expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({
        text: payload.explanation[0].text,
        language: code,
      });
    },
  );

  it('parses error envelopes that match AnalyzeResponse', async () => {
    const payload = getDemoResponse('error', 'en');
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(analyzeRemark({ text: 'Synthetic', language: 'en' })).resolves.toMatchObject({
      status: 'error',
      error: { code: payload.error!.code },
    });
  });

  it('throws on non-JSON bodies', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('<html>nope</html>', { status: 404, headers: { 'Content-Type': 'text/html' } }),
    );
    await expect(analyzeRemark({ text: 'Synthetic', language: 'en' })).rejects.toThrow(/non-JSON/);
  });

  it('throws a clear error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(analyzeRemark({ text: 'Synthetic', language: 'en' })).rejects.toThrow(
      /Could not reach the analysis service/,
    );
  });

  it('surfaces transport error messages when the body is not an AnalyzeResponse', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'request_too_large', message: 'Request exceeds 32 KiB.' },
        }),
        { status: 413, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(analyzeRemark({ text: 'Synthetic', language: 'en' })).rejects.toThrow(
      'Request exceeds 32 KiB.',
    );
  });
});
