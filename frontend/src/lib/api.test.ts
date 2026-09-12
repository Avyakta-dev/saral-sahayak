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

import success from '../../../docs/examples/success.json';
import { analyzeText, getCapabilities, ANALYSIS_TIMEOUT_MS, RESPONSE_BYTE_LIMIT } from './api';
import { capabilitiesSchema, liveResponseSchema, responseSchema } from './contracts';

const capabilities = {
  schema_version: '1.0',
  default_language: 'en',
  languages: ['en', 'hi', 'kn', 'ta', 'te', 'ml'].map((code) => ({
    code,
    name: code,
    native_name: code,
    quality_verified: false,
  })),
  analysis_available: true,
  checks: {
    model_configured: true,
    model_connectivity_verified: false,
    knowledge_index_present: true,
    knowledge_structure_ready: true,
    knowledge_content_verified: false,
    agent_implemented: true,
  },
  inputs: ['text'],
  downloads_available: false,
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const signal = () => new AbortController().signal;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('live contracts', () => {
  it('validates unique enabled languages and consistent readiness, never quality claims', () => {
    expect(capabilitiesSchema.parse(capabilities).languages).toHaveLength(6);
    for (const patch of [
      { languages: [] },
      { languages: [capabilities.languages[1]] },
      { languages: [capabilities.languages[0], capabilities.languages[0]] },
      { analysis_available: false },
      { extra: true },
      { languages: [{ ...capabilities.languages[0], quality_verified: true }] },
    ]) {
      expect(capabilitiesSchema.safeParse({ ...capabilities, ...patch }).success).toBe(false);
    }
  });
  it('accepts all six response languages and nullable paired zero-based columns', () => {
    for (const language of ['en', 'hi', 'kn', 'ta', 'te', 'ml']) {
      expect(liveResponseSchema.safeParse({ ...success, language }).success).toBe(true);
    }
    for (const patch of [
      {},
      { start_column: null, end_column: null },
      { start_column: 0, end_column: 0 },
      { start_column: 3, end_column: 2, start_line: 1, end_line: 2 },
    ]) {
      expect(
        responseSchema.safeParse({ ...success, citations: [{ ...success.citations[0], ...patch }] })
          .success,
      ).toBe(true);
    }
    for (const patch of [
      { start_column: 0 },
      { start_column: null, end_column: 1 },
      { start_column: -1, end_column: 1 },
      { start_column: 0.5, end_column: 1 },
      { start_column: 2, end_column: 1, start_line: 1, end_line: 1 },
    ]) {
      expect(
        responseSchema.safeParse({ ...success, citations: [{ ...success.citations[0], ...patch }] })
          .success,
      ).toBe(false);
    }
  });
  it('requires explicit live wire fields and visible prose without breaking historical fixture parser', () => {
    expect(
      liveResponseSchema.safeParse({ status: 'unsupported', warnings: ['No evidence'] }).success,
    ).toBe(false);
    expect(
      liveResponseSchema.safeParse({
        ...success,
        explanation: [{ text: '\u200b ', citation_ids: success.explanation[0].citation_ids }],
      }).success,
    ).toBe(false);
  });
});

describe('bounded API transport', () => {
  it('GETs only capabilities and POSTs exactly reviewed text and language with no credentials or retry', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(capabilities))
      .mockResolvedValueOnce(response({ ...success, language: 'kn' }));
    vi.stubGlobal('fetch', fetcher);
    await getCapabilities(signal());
    const result = await analyzeText('  Synthetic remark  ', 'kn', signal());
    expect(result.language).toBe('kn');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toBe('/api/v1/capabilities');
    expect(fetcher.mock.calls[1][0]).toBe('/api/v1/analyze');
    expect(fetcher.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ text: 'Synthetic remark', language: 'kn' }),
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
    });
  });
  it.each([
    () => response({ ...success, language: 'hi' }),
    () => response({ ...success, extra: true }),
    () => response(success, 503),
    () =>
      new Response('<html>private provider message</html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      }),
    () => new Response('{', { headers: { 'Content-Type': 'application/json' } }),
    () =>
      new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(RESPONSE_BYTE_LIMIT + 1),
        },
      }),
    () =>
      new Response('x'.repeat(RESPONSE_BYTE_LIMIT + 1), {
        headers: { 'Content-Type': 'application/json' },
      }),
  ])(
    'rejects malformed/mismatched/oversized responses without exposing content or retries %#',
    async (factory) => {
      const fetcher = vi.fn().mockResolvedValue(factory());
      vi.stubGlobal('fetch', fetcher);
      await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow('invalid response');
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it('maps both error envelopes to local copy, never arbitrary messages', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        response({ error: { code: 'invalid_request', message: 'PRIVATE_PROVIDER_SECRET' } }, 422),
      )
      .mockResolvedValueOnce(
        response(
          responseSchema.parse({
            status: 'error',
            error: { code: 'model_unavailable', message: 'PRIVATE_PROVIDER_SECRET' },
          }),
          502,
        ),
      );
    vi.stubGlobal('fetch', fetcher);
    await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow('backend rejected');
    await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow(
      'configured model is unavailable',
    );
  });
  it('never starts a cancelled or invalid input request', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const controller = new AbortController();
    controller.abort();
    await expect(analyzeText('Synthetic', 'en', controller.signal)).rejects.toHaveProperty(
      'name',
      'AbortError',
    );
    await expect(analyzeText('x'.repeat(8001), 'en', signal())).rejects.toThrow('8,000');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('bounds non-cooperating fetches at 125 seconds and aborts without retry', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetcher);
    const result = analyzeText('Synthetic', 'en', signal());
    const rejection = expect(result).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(ANALYSIS_TIMEOUT_MS);
    await rejection;
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('aborts while reading the response body and cannot return a late result', async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetcher);
    const controller = new AbortController();
    const result = analyzeText('Synthetic', 'en', controller.signal);
    const rejection = expect(result).rejects.toHaveProperty('name', 'AbortError');
    await Promise.resolve();
    await Promise.resolve();
    controller.abort();
    await rejection;
    expect(() =>
      streamController!.enqueue(new TextEncoder().encode(JSON.stringify(success))),
    ).toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
