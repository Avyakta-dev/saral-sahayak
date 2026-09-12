import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDemoResponse } from './demo';
import { analyzeRemark, fetchCapabilities, getApiBaseUrl } from './api';

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
      new Response(JSON.stringify({ schema_version: '1.0', analysis_available: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const controller = new AbortController();
    await expect(fetchCapabilities(controller.signal)).resolves.toEqual({
      schema_version: '1.0',
      analysis_available: true,
    });
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
