import { afterEach, describe, expect, it, vi } from 'vitest';
import successExample from '../../../docs/examples/success.json';
import clarificationExample from '../../../docs/examples/needs_clarification.json';
import unsupportedExample from '../../../docs/examples/unsupported.json';
import { capabilitiesSchema, previewCapabilities } from './capabilities';
import { requestSchema, responseSchema } from './contracts';
import {
  ApiError,
  analyzeRemark,
  createApiClient,
  fetchCapabilities,
  getApiBaseUrl,
  getConfiguredApiClient,
  isRetryableCode,
  type AnalysisInput,
  type AnalyzeRemarkInput,
  type Capabilities,
} from './api';

const input: AnalysisInput = { text: 'Synthetic rejection remark.', language: 'en' };
const signal = () => new AbortController().signal;
const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
const fullError = (code = 'model_not_configured', language = 'en') =>
  responseSchema.parse({
    status: 'error',
    language,
    error: { code, message: 'Synthetic service failure.' },
  });
const fakeClient = (response: Response, timeoutMs?: number) => {
  const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response);
  return { fetchImpl, client: createApiClient('/api/v1', { fetchImpl, timeoutMs }) };
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
const tick = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('trusted API configuration', () => {
  it.each([
    ['https://api.example.invalid/api/v1/', 'https://api.example.invalid/api/v1'],
    ['https://api.example.invalid/proxy/api/v1', 'https://api.example.invalid/proxy/api/v1'],
    ['http://localhost:8000/api/v1', 'http://localhost:8000/api/v1'],
    ['http://127.0.0.1:8000/api/v1', 'http://127.0.0.1:8000/api/v1'],
    ['http://127.2.3.4/api/v1', 'http://127.2.3.4/api/v1'],
    ['http://[::1]:8000/api/v1', 'http://[::1]:8000/api/v1'],
    ['/api/v1/', '/api/v1'],
    ['/proxy/api/v1', '/proxy/api/v1'],
    ['/', '/'],
  ])('accepts the trusted prefix %s', (base, expected) => {
    expect(createApiClient(base).baseUrl).toBe(expected);
  });

  it.each([
    '',
    'api/v1',
    '//evil.invalid/api/v1',
    '///evil.invalid/api/v1',
    'http://api.example.invalid/api/v1',
    'http://localhost.evil.invalid/api/v1',
    'http://0.0.0.0/api/v1',
    'http://127.1/api/v1',
    'http://2130706433/api/v1',
    'file:///api/v1',
    'javascript:secret',
    'https:///example.invalid/api/v1',
    'https://example.invalid@evil.invalid/api/v1',
    'https://@example.invalid/api/v1',
    'https://example.invalid/api/v1?key=synthetic-secret',
    'https://example.invalid/api/v1#synthetic-secret',
    '/api/v1?',
    '/api/v1#',
    'https://example.invalid/a/../api/v1',
    '/a/./api/v1',
    '/a/%2e%2e/api/v1',
    '/a/%252e%252e/api/v1',
    '/a%2f..%2fapi/v1',
    '/a%5capi/v1',
    '/api\\v1',
    'https://example.invalid\\@evil.invalid/api/v1',
    '/api/%00/v1',
    '/api/%0d%0a/v1',
    '/api/%7f/v1',
    '/api/%C2%85/v1',
    '/api/%250a/v1',
    '/api/%zz/v1',
    ' https://example.invalid/api/v1',
    'https://example.invalid/api/v1\n',
    'https://example.invalid:99999/api/v1',
  ])('rejects unsafe prefix %s without echoing it', (base) => {
    try {
      createApiClient(base);
      expect.unreachable('Configuration should be rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ code: 'invalid_configuration', retryable: false });
      expect((error as Error).message).toBe('The API connection settings are invalid.');
      expect((error as Error).message).not.toContain('synthetic-secret');
    }
  });

  it.each([0, 999, 300001, NaN, Infinity, 1000.5])('rejects invalid timeout %s', (timeoutMs) => {
    expect(() => createApiClient('/api/v1', { timeoutMs })).toThrow(ApiError);
  });

  it.each([undefined, '', '   '])('defaults server root %s to live same-origin', (base) => {
    vi.stubEnv('VITE_API_BASE_URL', base);
    vi.stubEnv('VITE_PREVIEW_ONLY', undefined);
    vi.stubEnv('VITE_API_TIMEOUT_MS', undefined);
    vi.stubEnv('VITE_LLM_API_KEY', 'synthetic-secret');
    vi.stubEnv('VITE_BACKEND_URL', 'https://not-used.invalid');
    const fetchImpl = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchImpl);
    expect(getApiBaseUrl()).toBe('');
    expect(getConfiguredApiClient()?.baseUrl).toBe('/api/v1');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    ['  http://127.0.0.1:8000///  ', 'http://127.0.0.1:8000'],
    [' https://api.example.invalid/// ', 'https://api.example.invalid'],
    ['/proxy///', '/proxy'],
    ['/', ''],
  ])(
    'normalizes trusted server root %s without changing the internal prefix convention',
    (base, root) => {
      vi.stubEnv('VITE_API_BASE_URL', base);
      expect(getApiBaseUrl()).toBe(root);
      expect(getConfiguredApiClient()?.baseUrl).toBe(`${root}/api/v1`);
    },
  );

  it('reads only explicit build-time API settings, without requesting anything', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/proxy');
    vi.stubEnv('VITE_API_TIMEOUT_MS', '300000');
    vi.stubEnv('VITE_LLM_API_KEY', 'synthetic-secret');
    const fetchImpl = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchImpl);
    expect(getConfiguredApiClient()?.baseUrl).toBe('/proxy/api/v1');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('forces preview only with explicit true, before inspecting live configuration', async () => {
    vi.stubEnv('VITE_PREVIEW_ONLY', 'true');
    vi.stubEnv('VITE_API_BASE_URL', 'invalid-live-settings');
    vi.stubEnv('VITE_API_TIMEOUT_MS', 'invalid-live-settings');
    const fetchImpl = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchImpl);
    expect(getConfiguredApiClient()).toBeNull();
    await expect(fetchCapabilities()).rejects.toMatchObject({
      code: 'preview_only',
      retryable: false,
    });
    await expect(analyzeRemark(input)).rejects.toMatchObject({
      code: 'preview_only',
      retryable: false,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'false', 'TRUE', '1', ' true '])(
    'does not infer preview from %s',
    (value) => {
      vi.stubEnv('VITE_PREVIEW_ONLY', value);
      vi.stubEnv('VITE_API_BASE_URL', '');
      expect(getConfiguredApiClient()).not.toBeNull();
    },
  );

  it.each(['999', '300001', 'NaN', '-1000', '1e3', '1000.5', ' 1000', 'secret'])(
    'rejects invalid configured timeout %s safely',
    (timeout) => {
      vi.stubEnv('VITE_API_BASE_URL', '/api/v1');
      vi.stubEnv('VITE_API_TIMEOUT_MS', timeout);
      expect(() => getConfiguredApiClient()).toThrow('The API connection settings are invalid.');
    },
  );

  it('never echoes an unsafe environment URL or logs configuration', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/api/v1?key=synthetic-secret');
    const log = vi.spyOn(console, 'log');
    const warn = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    expect(() => getConfiguredApiClient()).toThrow('The API connection settings are invalid.');
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

describe('public compatibility facade uses the bounded client', () => {
  it('GETs validated capabilities at the server root with optional signal', async () => {
    vi.stubEnv('VITE_API_BASE_URL', ' http://127.0.0.1:8000/// ');
    const metadata: Capabilities = { ...previewCapabilities, analysis_available: true };
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async () => json(metadata));
    vi.stubGlobal('fetch', fetchImpl);
    expect(await fetchCapabilities(signal())).toEqual(metadata);
    expect(await fetchCapabilities()).toEqual(metadata);
    expect(fetchImpl).toHaveBeenCalledWith('http://127.0.0.1:8000/api/v1/capabilities', {
      method: 'GET',
      signal: expect.any(AbortSignal),
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
  });

  it('accepts individual optional details without serializing signals or browser secrets', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.stubEnv('VITE_ANALYSIS_ACCESS_TOKEN', 'synthetic-secret');
    vi.stubEnv('VITE_LLM_API_KEY', 'synthetic-secret');
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(json(successExample));
    vi.stubGlobal('fetch', fetchImpl);
    const original: AnalyzeRemarkInput = {
      ...input,
      details: { claimant_name: ' Synthetic Name ' },
      signal: signal(),
    };
    expect(await analyzeRemark(original)).toEqual(responseSchema.parse(successExample));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/v1/analyze');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init?.body))).toEqual({
      ...input,
      details: { claimant_name: ' Synthetic Name ', claim_id: null, claim_type: null },
    });
    expect(JSON.stringify(init)).not.toMatch(
      /synthetic-secret|authorization|api[_-]?key|access[_-]?token/i,
    );
  });

  it('preserves full analysis error results and default details without a signal', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const result = fullError();
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(json(result, 503));
    vi.stubGlobal('fetch', fetchImpl);
    expect(await analyzeRemark(input)).toEqual(result);
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))).toEqual(
      requestSchema.parse(input),
    );
  });

  it.each(['capabilities', 'analyze'] as const)(
    'sanitizes network and fetch abort errors for %s',
    async (operation) => {
      vi.stubEnv('VITE_API_BASE_URL', '');
      const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('synthetic-secret'));
      vi.stubGlobal('fetch', fetchImpl);
      const run = () => (operation === 'capabilities' ? fetchCapabilities() : analyzeRemark(input));
      await expect(run()).rejects.toMatchObject({
        code: 'network_error',
        message: 'The API could not be reached. Please try again.',
      });
      fetchImpl.mockRejectedValue(new DOMException('synthetic-secret', 'AbortError'));
      await expect(run()).rejects.toMatchObject({
        name: 'AbortError',
        message: 'The request was cancelled.',
      });
    },
  );

  it('honors wrapper cancellation without forwarding its reason or accepting late results', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const pending = deferred<Response>();
    const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetchImpl);
    const controller = new AbortController();
    const failure = expect(
      analyzeRemark({ ...input, signal: controller.signal }),
    ).rejects.toMatchObject({
      name: 'AbortError',
      message: 'The request was cancelled.',
    });
    controller.abort('synthetic-secret');
    await failure;
    expect(fetchImpl.mock.calls[0][1]?.signal?.aborted).toBe(true);
    pending.resolve(json(successExample));
    await tick();
    await expect(fetchCapabilities(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retains request, content-type and response size validation in the facade', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const fetchImpl = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchImpl);
    await expect(
      analyzeRemark({ ...input, details: { claim_id: 'x'.repeat(101) } }),
    ).rejects.toMatchObject({ code: 'invalid_request' });
    expect(fetchImpl).not.toHaveBeenCalled();
    fetchImpl.mockResolvedValue(
      new Response('<html>synthetic-secret</html>', { headers: { 'Content-Type': 'text/html' } }),
    );
    await expect(analyzeRemark(input)).rejects.toMatchObject({
      code: 'invalid_response',
      message: 'The API returned an invalid response.',
    });
    fetchImpl.mockResolvedValue(json({}, 200, { 'Content-Length': '1048577' }));
    await expect(fetchCapabilities()).rejects.toMatchObject({ code: 'response_too_large' });
  });
});

describe('protected small transport errors', () => {
  const cases = [
    [401, 'access_denied', false, 'Analysis access denied.'],
    [429, 'analysis_capacity', false, 'Analysis capacity is limited.'],
    [504, 'request_timeout', true, 'Analysis request timed out.'],
  ] as const;

  it.each(cases)(
    'maps HTTP %s / %s exactly, safely, with no automatic retries',
    async (status, code, retryable, message) => {
      vi.stubEnv('VITE_API_BASE_URL', '');
      const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
        json({ error: { code, message: 'synthetic-secret https://private.invalid' } }, status, {
          'Retry-After': '1',
        }),
      );
      vi.stubGlobal('fetch', fetchImpl);
      await expect(analyzeRemark(input)).rejects.toMatchObject({
        code,
        httpStatus: status,
        retryable,
        message,
      });
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    },
  );

  it.each(cases)(
    'rejects %s / %s on other statuses and malformed envelopes',
    async (correctStatus, code) => {
      for (const status of [200, 400, 401, 403, 413, 422, 429, 500, 503, 504]) {
        if (status === correctStatus) continue;
        const { client } = fakeClient(
          json({ error: { code, message: 'synthetic-secret' } }, status),
        );
        await expect(client.analyze(input, signal())).rejects.toMatchObject({
          code: 'invalid_response',
          retryable: false,
          httpStatus: status,
        });
      }
      for (const envelope of [
        { error: { code, message: '' } },
        { error: { code, message: 'x'.repeat(501) } },
        { error: { code, message: 'Synthetic', debug: 'synthetic-secret' } },
        { error: { code, message: 'Synthetic' }, detail: 'synthetic-secret' },
      ]) {
        const { client } = fakeClient(json(envelope, correctStatus));
        await expect(client.analyze(input, signal())).rejects.toMatchObject({
          code: 'invalid_response',
        });
      }
    },
  );
});

describe('HTTP requests and wire validation', () => {
  it('GETs only read-only metadata from the exact configured prefix', async () => {
    const metadata = { ...previewCapabilities, analysis_available: true };
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(json(metadata));
    const client = createApiClient('https://api.example.invalid/proxy/api/v1/', { fetchImpl });
    expect(await client.getCapabilities(signal())).toEqual(metadata);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.invalid/proxy/api/v1/capabilities',
      {
        method: 'GET',
        signal: expect.any(AbortSignal),
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      },
    );
    // Availability is not promoted into provider, content or language verification.
    expect(metadata.checks.model_connectivity_verified).toBe(false);
    expect(metadata.languages.every(({ quality_verified }) => !quality_verified)).toBe(true);
  });

  it('POSTs original Unicode text/details and exactly the validated keys', async () => {
    const original: AnalysisInput = {
      text: '  Synthetic हिन्दी remark.\n"Quoted" \\ example 😀  ',
      language: 'hi',
      details: { claimant_name: '  Synthetic Name  ', claim_id: 'DEMO-42', claim_type: null },
    };
    const result = { ...unsupportedExample, language: 'hi' };
    const { client, fetchImpl } = fakeClient(json(result));
    expect(await client.analyze(original, signal())).toEqual(responseSchema.parse(result));
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/v1/analyze');
    expect(options).toEqual({
      method: 'POST',
      signal: expect.any(AbortSignal),
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestSchema.parse(original)),
    });
    expect(JSON.parse(options!.body as string)).toEqual(original);
    expect(Object.keys(JSON.parse(options!.body as string))).toEqual([
      'text',
      'language',
      'details',
    ]);
  });

  it('includes only schema defaults when optional details are absent', async () => {
    const { client, fetchImpl } = fakeClient(json(unsupportedExample));
    await client.analyze(input, signal());
    expect(JSON.parse(fetchImpl.mock.calls[0][1]!.body as string)).toEqual({
      ...input,
      details: { claimant_name: null, claim_id: null, claim_type: null },
    });
  });

  it.each([
    { ...input, text: '' },
    { ...input, text: '   ' },
    { ...input, text: 'x'.repeat(8001) },
    { ...input, text: ' '.repeat(8000) + 'x' },
    { ...input, language: 'xx' },
    { ...input, secret: 'synthetic-secret' },
    { ...input, details: { claimant_name: 'x'.repeat(201) } },
    { ...input, details: { claim_id: 'x'.repeat(101) } },
    { ...input, details: { claim_type: 'x'.repeat(101) } },
    { ...input, details: { provider_key: 'synthetic-secret' } },
    { ...input, text: '\u0000'.repeat(6000) },
  ])('rejects invalid requests before fetch', async (invalid) => {
    const { client, fetchImpl } = fakeClient(json(unsupportedExample));
    await expect(client.analyze(invalid as AnalysisInput, signal())).rejects.toMatchObject({
      code: 'invalid_request',
      retryable: false,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('counts Unicode code points, not UTF-16 code units', async () => {
    const { client, fetchImpl } = fakeClient(json(unsupportedExample));
    await expect(
      client.analyze({ ...input, text: '😀'.repeat(8000) }, signal()),
    ).resolves.toMatchObject({ status: 'unsupported' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await expect(
      client.analyze({ ...input, text: '😀'.repeat(8001) }, signal()),
    ).rejects.toMatchObject({ code: 'invalid_request' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('budgets the exact escaped UTF-8 JSON body including details/defaults at 32 KiB', async () => {
    const details = { claimant_name: '😀'.repeat(190), claim_id: null, claim_type: null };
    const fixed = JSON.stringify(requestSchema.parse({ ...input, text: 'x', details }));
    const overhead = new TextEncoder().encode(fixed).byteLength - 1;
    const remaining = 32768 - overhead;
    const text = '😀'.repeat(Math.floor(remaining / 4)) + 'x'.repeat(remaining % 4);
    const exact = { ...input, text, details };
    const { client, fetchImpl } = fakeClient(json(unsupportedExample));
    await client.analyze(exact, signal());
    expect(new TextEncoder().encode(fetchImpl.mock.calls[0][1]!.body as string).byteLength).toBe(
      32768,
    );
    await expect(client.analyze({ ...exact, text: `${text}x` }, signal())).rejects.toMatchObject({
      code: 'invalid_request',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([successExample, clarificationExample, unsupportedExample])(
    'validates the $status response',
    async (example) => {
      const { client } = fakeClient(json(example));
      const expected = responseSchema.parse(example);
      expect(await client.analyze({ ...input, language: expected.language }, signal())).toEqual(
        expected,
      );
    },
  );

  it.each([
    [422, 'language_disabled'],
    [503, 'model_not_configured'],
    [503, 'knowledge_unavailable'],
    [503, 'service_unavailable'],
    [503, 'budget_exhausted'],
    [502, 'model_unavailable'],
    [502, 'invalid_model_output'],
    [504, 'analysis_timeout'],
    [500, 'analysis_failed'],
    [502, 'analysis_failed'],
    [499, 'client_disconnected'],
  ])(
    'returns valid full HTTP %s / %s errors without fake guidance or retries',
    async (status, code) => {
      const result = fullError(code as string);
      const { client, fetchImpl } = fakeClient(json(result, status as number));
      expect(await client.analyze(input, signal())).toEqual(result);
      expect(result.draft).toBeNull();
      expect(result.actions).toEqual([]);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [400, { detail: 'Raw framework parsing detail: synthetic-secret' }, 'invalid_request'],
    [
      413,
      { error: { code: 'request_too_large', message: 'synthetic-secret' } },
      'request_too_large',
    ],
    [422, { error: { code: 'invalid_request', message: 'synthetic-secret' } }, 'invalid_request'],
  ])('handles the small HTTP %s transport envelope separately', async (status, envelope, code) => {
    const { client } = fakeClient(json(envelope, status as number));
    const failure = await client.analyze(input, signal()).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ code, httpStatus: status, retryable: false });
    expect((failure as Error).message).not.toContain('synthetic-secret');
  });

  it.each([
    [503, successExample],
    [422, clarificationExample],
    [502, unsupportedExample],
    [503, { error: { code: 'invalid_request', message: 'Not a full envelope.' } }],
    [422, { detail: 'Wrong envelope.' }],
    [400, { detail: ['invalid'] }],
    [413, { error: { code: 'invalid_request', message: 'Wrong status.' } }],
    [422, { error: { code: 'unexpected', message: 'Unknown small code.' } }],
    [400, { detail: 'x'.repeat(501) }],
    [200, { error: { code: 'invalid_request', message: 'Wrong status.' } }],
    [502, { ...fullError(), draft: successExample.draft }],
    [200, { ...unsupportedExample, extra: 'unexpected' }],
    [200, {}],
  ])('rejects invalid/contradictory HTTP %s envelopes', async (status, envelope) => {
    const { client } = fakeClient(json(envelope, status as number));
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
      httpStatus: status,
    });
  });

  it.each([200, 503])('rejects mismatched response language on HTTP %s', async (status) => {
    const body =
      status === 200
        ? { ...unsupportedExample, language: 'hi' }
        : fullError('analysis_failed', 'hi');
    const { client } = fakeClient(json(body, status));
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('rejects malformed capabilities rather than inventing availability or languages', async () => {
    const { client } = fakeClient(json({ analysis_available: true }));
    await expect(client.getCapabilities(signal())).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('does not accept capabilities on an HTTP error', async () => {
    const { client } = fakeClient(json(previewCapabilities, 503));
    await expect(client.getCapabilities(signal())).rejects.toMatchObject({
      code: 'invalid_response',
      httpStatus: 503,
    });
  });

  it.each([undefined, 'text/html', 'text/plain'])(
    'rejects non-JSON content type %s and SPA fallbacks',
    async (type) => {
      const response = new Response('<html>synthetic-secret</html>', {
        headers: type ? { 'Content-Type': type } : {},
      });
      const { client } = fakeClient(response);
      await expect(client.analyze(input, signal())).rejects.toMatchObject({
        code: 'invalid_response',
        message: 'The API returned an invalid response.',
      });
    },
  );

  it('accepts JSON with a charset and rejects malformed JSON without exposing it', async () => {
    const { client } = fakeClient(
      json(unsupportedExample, 200, { 'Content-Type': 'Application/JSON; charset=utf-8' }),
    );
    await expect(client.analyze(input, signal())).resolves.toMatchObject({ status: 'unsupported' });
    const invalid = fakeClient(
      new Response('{synthetic-secret', { headers: { 'Content-Type': 'application/json' } }),
    );
    await expect(invalid.client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
      message: 'The API returned an invalid response.',
    });
  });

  it('rejects redirects even if an injected fetch ignores redirect:error', async () => {
    const response = json(unsupportedExample);
    Object.defineProperty(response, 'redirected', { value: true });
    const { client, fetchImpl } = fakeClient(response);
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const redirect = fakeClient(json(unsupportedExample, 307));
    await expect(redirect.client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });
});

describe('bounded response streams', () => {
  it('rejects an oversized declared body and cancels before reading', async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel });
    const response = new Response(stream, {
      headers: { 'Content-Type': 'application/json', 'Content-Length': '1048577' },
    });
    const { client } = fakeClient(response);
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'response_too_large',
      retryable: false,
    });
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, '1'])(
    'limits streamed bytes without trusting Content-Length %s',
    async (length) => {
      const cancel = vi.fn();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(600000).fill(32));
          controller.enqueue(new Uint8Array(500000).fill(32));
        },
        cancel,
      });
      const response = new Response(stream, {
        headers: {
          'Content-Type': 'application/json',
          ...(length ? { 'Content-Length': length } : {}),
        },
      });
      const { client } = fakeClient(response);
      await expect(client.analyze(input, signal())).rejects.toMatchObject({
        code: 'response_too_large',
      });
      expect(cancel).toHaveBeenCalledTimes(1);
    },
  );

  it('permits a valid JSON body exactly at 1 MiB but not a byte above', async () => {
    const body = JSON.stringify(unsupportedExample);
    const size = new TextEncoder().encode(body).byteLength;
    const exact = body + ' '.repeat(1048576 - size);
    const { client } = fakeClient(
      new Response(exact, { headers: { 'Content-Type': 'application/json' } }),
    );
    await expect(client.analyze(input, signal())).resolves.toMatchObject({ status: 'unsupported' });
    const over = fakeClient(
      new Response(`${exact} `, { headers: { 'Content-Type': 'application/json' } }),
    );
    await expect(over.client.analyze(input, signal())).rejects.toMatchObject({
      code: 'response_too_large',
    });
  });

  it('decodes UTF-8 across chunk boundaries before schema parsing', async () => {
    const body = { ...unsupportedExample, language: 'hi', warnings: ['केवल कृत्रिम उदाहरण।'] };
    const bytes = new TextEncoder().encode(JSON.stringify(body));
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
        controller.close();
      },
    });
    const { client } = fakeClient(
      new Response(stream, { headers: { 'Content-Type': 'application/json' } }),
    );
    expect(await client.analyze({ ...input, language: 'hi' }, signal())).toEqual(
      responseSchema.parse(body),
    );
  });

  it('rejects invalid UTF-8 rather than accepting replacement characters', async () => {
    const { client } = fakeClient(
      new Response(new Uint8Array([0xff]), { headers: { 'Content-Type': 'application/json' } }),
    );
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('applies the byte limit to metadata and HTTP error responses too', async () => {
    const oversized = () =>
      new Response(' '.repeat(1048577), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    await expect(fakeClient(oversized()).client.getCapabilities(signal())).rejects.toMatchObject({
      code: 'response_too_large',
    });
    await expect(fakeClient(oversized()).client.analyze(input, signal())).rejects.toMatchObject({
      code: 'response_too_large',
    });
  });
});

describe('cancellation, deadlines and manual-only retries', () => {
  it('never fetches after a caller is already aborted', async () => {
    const controller = new AbortController();
    controller.abort('synthetic-secret');
    const { client, fetchImpl } = fakeClient(json(unsupportedExample));
    await expect(client.analyze(input, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
      message: 'The request was cancelled.',
    });
    await expect(client.getCapabilities(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('settles caller cancellation promptly even if fetch ignores abort, then discards late success', async () => {
    const pending = deferred<Response>();
    const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(pending.promise);
    const client = createApiClient('/api/v1', { fetchImpl });
    const controller = new AbortController();
    const request = client.analyze(input, controller.signal);
    const failure = expect(request).rejects.toMatchObject({
      name: 'AbortError',
      message: 'The request was cancelled.',
    });
    controller.abort('synthetic-secret');
    await failure;
    expect(fetchImpl.mock.calls[0][1]!.signal!.aborted).toBe(true);
    const cancel = vi.fn();
    pending.resolve(new Response(new ReadableStream({ cancel })));
    await tick();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('cancels an active reader on caller abort without publishing partial results', async () => {
    const cancel = vi.fn();
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{'));
        },
        cancel,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { client } = fakeClient(response);
    const controller = new AbortController();
    const request = client.analyze(input, controller.signal);
    const failure = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    await tick();
    controller.abort();
    await failure;
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['analyze', undefined, 120000],
    ['analyze', 1000, 1000],
    ['analyze', 300000, 300000],
    ['capabilities', undefined, 5000],
    ['capabilities', 300000, 5000],
    ['capabilities', 1000, 1000],
  ] as const)(
    'bounds %s with configured timeout %s at %s ms',
    async (operation, timeoutMs, deadline) => {
      vi.useFakeTimers();
      const pending = deferred<Response>();
      const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(pending.promise);
      const client = createApiClient('/api/v1', { fetchImpl, timeoutMs });
      const request =
        operation === 'analyze'
          ? client.analyze(input, signal())
          : client.getCapabilities(signal());
      const failure = expect(request).rejects.toMatchObject({
        code: 'analysis_timeout',
        retryable: true,
        message: 'The API request timed out.',
      });
      await vi.advanceTimersByTimeAsync(deadline - 1);
      expect(fetchImpl.mock.calls[0][1]!.signal!.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await failure;
      expect(fetchImpl.mock.calls[0][1]!.signal!.aborted).toBe(true);
      pending.reject(new Error('late synthetic-secret transport error'));
      await tick();
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('keeps the deadline active while reading and cancels a stalled stream', async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const { client } = fakeClient(
      new Response(new ReadableStream({ cancel }), {
        headers: { 'Content-Type': 'application/json' },
      }),
      1000,
    );
    const request = client.analyze(input, signal());
    const failure = expect(request).rejects.toMatchObject({ code: 'analysis_timeout' });
    await vi.advanceTimersByTimeAsync(1000);
    await failure;
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('clears completed timers and abort listeners without cancelling a finished response', async () => {
    vi.useFakeTimers();
    const { client, fetchImpl } = fakeClient(json(unsupportedExample), 1000);
    const controller = new AbortController();
    await client.analyze(input, controller.signal);
    controller.abort();
    await vi.advanceTimersByTimeAsync(300000);
    expect(fetchImpl.mock.calls[0][1]!.signal!.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sanitizes raw fetch errors and does not automatically retry', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('https://example.invalid/synthetic-secret raw body'));
    const client = createApiClient('/api/v1', { fetchImpl });
    await expect(client.analyze(input, signal())).rejects.toMatchObject({
      code: 'network_error',
      retryable: true,
      message: 'The API could not be reached. Please try again.',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([
    'network_error',
    'analysis_timeout',
    'request_timeout',
    'model_unavailable',
    'service_unavailable',
    'analysis_failed',
  ])('marks only transient code %s retryable', (code) => {
    expect(isRetryableCode(code)).toBe(true);
    expect(new ApiError(code, 'Safe message.').retryable).toBe(true);
  });

  it.each([
    'invalid_configuration',
    'invalid_request',
    'request_too_large',
    'invalid_response',
    'response_too_large',
    'language_disabled',
    'model_not_configured',
    'knowledge_unavailable',
    'budget_exhausted',
    'invalid_model_output',
    'client_disconnected',
    'access_denied',
    'analysis_capacity',
    'preview_only',
    'unknown',
    'toString',
  ])('does not retry code %s', (code) => {
    expect(isRetryableCode(code)).toBe(false);
    expect(new ApiError(code, 'Safe message.').retryable).toBe(false);
  });
});

import success from '../../../docs/examples/success.json';
import { analyzeText, getCapabilities, ANALYSIS_TIMEOUT_MS, RESPONSE_BYTE_LIMIT } from './api';
import { liveResponseSchema } from './contracts';

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
  history_available: true,
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

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
      { extra: true },
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
      body: JSON.stringify({
        text: '  Synthetic remark  ',
        language: 'kn',
        details: { claimant_name: null, claim_id: null, claim_type: null },
      }),
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
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
      await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow(
        /invalid response|safe size limit/,
      );
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
    await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow(
      'does not match the API schema',
    );
    await expect(analyzeText('Synthetic', 'en', signal())).rejects.toThrow(
      'Analysis could not be completed safely',
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
  it('bounds non-cooperating fetches at the configured deadline and aborts without retry', async () => {
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

