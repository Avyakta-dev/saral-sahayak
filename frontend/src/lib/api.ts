import { capabilitiesSchema, type Capabilities } from './capabilities';
import {
  requestSchema,
  responseSchema,
  transportErrorSchema,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type Language,
  type TransportError,
} from './contracts';

const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 120_000;
const CAPABILITIES_TIMEOUT_MS = 5_000;

export type AnalysisInput = {
  text: string;
  language: Language;
  details?: AnalyzeRequest['details'];
};

export interface ApiClient {
  baseUrl: string;
  getCapabilities(signal: AbortSignal): Promise<Capabilities>;
  analyze(input: AnalysisInput, signal: AbortSignal): Promise<AnalyzeResponse>;
}

export function isRetryableCode(code: string): boolean {
  return [
    'network_error',
    'analysis_timeout',
    'model_unavailable',
    'service_unavailable',
    'analysis_failed',
  ].includes(code);
}

export class ApiError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly httpStatus?: number;

  constructor(code: string, message: string, httpStatus?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.retryable = isRetryableCode(code);
    this.httpStatus = httpStatus;
  }
}

const invalidConfiguration = () =>
  new ApiError('invalid_configuration', 'The API connection settings are invalid.');
const invalidResponse = (status?: number) =>
  new ApiError('invalid_response', 'The API returned an invalid response.', status);
const abortError = () => new DOMException('The request was cancelled.', 'AbortError');

// Only the trusted build configuration supplies this prefix. Never derive it from
// claim text, capabilities, a response link, URL parameters or browser storage.
function validateBaseUrl(value: string): string {
  if (typeof value !== 'string' || !value) throw invalidConfiguration();
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw invalidConfiguration();
  }
  if (
    /[\p{Cc}\p{Cf}\p{White_Space}\\?#]/u.test(decoded) ||
    // Reject encoded separators and nested escapes before URL normalization.
    /%(?:2f|5c|3f|23|40|3a|25)/i.test(value) ||
    decoded.split('/').some((part) => part === '.' || part === '..')
  ) {
    throw invalidConfiguration();
  }
  if (value.startsWith('/')) {
    if (value.startsWith('//')) throw invalidConfiguration();
    return value.replace(/\/+$/, '') || '/';
  }
  const authority = /^https?:\/\/([^/?#]+)/i.exec(value)?.[1];
  if (!authority || /[@%]/.test(authority)) throw invalidConfiguration();
  try {
    const url = new URL(value);
    const host = authority.replace(/:\d+$/, '').toLowerCase();
    const loopback =
      host === 'localhost' ||
      host === '[::1]' ||
      (/^127(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(host) &&
        host.split('.').every((part) => Number(part) <= 255));
    if (
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
    ) {
      throw invalidConfiguration();
    }
    return url.href.replace(/\/+$/, '');
  } catch {
    // Never include the configured value or a native URL parser exception.
    throw invalidConfiguration();
  }
}

function validateTimeout(value: number): number {
  if (!Number.isInteger(value) || value < 1_000 || value > 300_000) {
    throw invalidConfiguration();
  }
  return value;
}

function cancelBody(response: Response): void {
  void response.body?.cancel().catch(() => undefined);
}

async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const tooLarge = () =>
    new ApiError(
      'response_too_large',
      'The API response exceeded the safe size limit.',
      response.status,
    );
  const length = response.headers.get('content-length');
  if (length !== null && /^\d+$/.test(length) && Number(length) > MAX_RESPONSE_BYTES) {
    cancelBody(response);
    throw tooLarge();
  }
  const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (
    !contentType ||
    !/^application\/(?:json|[a-z0-9!#$&^_.+-]+\+json)$/.test(contentType) ||
    !response.body
  ) {
    cancelBody(response);
    throw invalidResponse(response.status);
  }

  const reader = response.body.getReader();
  let cancelled = false;
  const cancel = () => {
    if (!cancelled) {
      cancelled = true;
      // Do not forward caller abort reasons (which may contain private data).
      void reader.cancel().catch(() => undefined);
    }
  };
  signal.addEventListener('abort', cancel, { once: true });
  let complete = false;
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const parts: string[] = [];
    let bytes = 0;
    while (true) {
      if (signal.aborted) throw abortError();
      const { done, value } = await reader.read();
      if (signal.aborted) throw abortError();
      if (done) {
        complete = true;
        break;
      }
      bytes += value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) throw tooLarge();
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    return JSON.parse(parts.join('')) as unknown;
  } catch (error) {
    if (signal.aborted) throw abortError();
    if (error instanceof ApiError) throw error;
    throw invalidResponse(response.status);
  } finally {
    signal.removeEventListener('abort', cancel);
    if (!complete) cancel();
    reader.releaseLock();
  }
}

// These are transport envelopes, not analysis guidance. Ignore their prose and
// expose only fixed messages; reject valid-looking envelopes on the wrong status.
function smallHttpError(body: unknown, status: number): ApiError | null {
  const parsed = transportErrorSchema.safeParse(body);
  if (!parsed.success) return null;
  const envelope: TransportError = parsed.data;
  const message = 'detail' in envelope ? envelope.detail : envelope.error.message;
  if (Array.from(message).length > 500) return null;
  if (status === 400 && 'detail' in envelope) {
    return new ApiError('invalid_request', 'The API could not read the request.', status);
  }
  if ('error' in envelope) {
    if (status === 413 && envelope.error.code === 'request_too_large') {
      return new ApiError('request_too_large', 'The request exceeds the 32 KiB limit.', status);
    }
    if (status === 422 && envelope.error.code === 'invalid_request') {
      return new ApiError('invalid_request', 'The request does not match the API schema.', status);
    }
  }
  return null;
}

export function createApiClient(
  baseUrl: string,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): ApiClient {
  const base = validateBaseUrl(baseUrl);
  const timeoutMs = validateTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  async function request<T>(
    endpoint: 'capabilities' | 'analyze',
    signal: AbortSignal,
    parse: (body: unknown, response: Response) => T,
    body?: string,
  ): Promise<T> {
    if (signal.aborted) throw abortError();
    const controller = new AbortController();
    let interruption: Error | undefined;
    let rejectInterrupted: (reason: Error) => void = () => undefined;
    const interrupted = new Promise<never>((_, reject) => {
      rejectInterrupted = reject;
    });
    const interrupt = (error: Error) => {
      if (interruption) return;
      interruption = error;
      rejectInterrupted(error);
      controller.abort();
    };
    const onAbort = () => interrupt(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(
      () => interrupt(new ApiError('analysis_timeout', 'The API request timed out.')),
      endpoint === 'capabilities' ? Math.min(timeoutMs, CAPABILITIES_TIMEOUT_MS) : timeoutMs,
    );
    const run = async () => {
      const response = await fetchImpl(`${base === '/' ? '' : base}/${endpoint}`, {
        method: endpoint === 'capabilities' ? 'GET' : 'POST',
        signal: controller.signal,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body }),
      });
      // An injected/nonconforming fetch may resolve after cancellation. Do not
      // read or validate that response, and never let it replace a newer result.
      if (controller.signal.aborted) {
        cancelBody(response);
        throw interruption ?? abortError();
      }
      if (
        response.redirected ||
        response.type === 'opaqueredirect' ||
        (response.status >= 300 && response.status < 400)
      ) {
        cancelBody(response);
        throw invalidResponse(response.status);
      }
      const json = await readJson(response, controller.signal);
      if (controller.signal.aborted) throw interruption ?? abortError();
      return parse(json, response);
    };
    try {
      return await Promise.race([run(), interrupted]);
    } catch (error) {
      if (interruption) throw interruption;
      if (error instanceof ApiError) throw error;
      // Fetch/CORS/network errors can contain endpoints or response details.
      throw new ApiError('network_error', 'The API could not be reached. Please try again.');
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
    }
  }

  return {
    baseUrl: base,
    getCapabilities(signal) {
      return request('capabilities', signal, (body, response) => {
        if (!response.ok)
          throw smallHttpError(body, response.status) ?? invalidResponse(response.status);
        const result = capabilitiesSchema.safeParse(body);
        if (!result.success) throw invalidResponse(response.status);
        return result.data;
      });
    },
    async analyze(input, signal) {
      if (signal.aborted) throw abortError();
      const payload = requestSchema.safeParse(input);
      if (!payload.success) {
        throw new ApiError(
          'invalid_request',
          'Check the text, language and details, including the 8,000-character and 32 KiB limits.',
        );
      }
      // Serialize exactly the validated payload: original text, allowed details
      // and schema defaults. The schema budgets these very same UTF-8 bytes.
      return request(
        'analyze',
        signal,
        (body, response) => {
          const result = responseSchema.safeParse(body);
          if (
            result.success &&
            result.data.language === payload.data.language &&
            (response.ok || result.data.status === 'error')
          ) {
            return result.data;
          }
          if (!response.ok && !result.success) {
            const transportError = smallHttpError(body, response.status);
            if (transportError) throw transportError;
          }
          throw invalidResponse(response.status);
        },
        JSON.stringify(payload.data),
      );
    },
  };
}

export function getConfiguredApiClient(): ApiClient | null {
  const baseUrl: unknown = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl === undefined || baseUrl === '' || (typeof baseUrl === 'string' && !baseUrl.trim())) {
    return null;
  }
  if (typeof baseUrl !== 'string') throw invalidConfiguration();
  const rawTimeout: unknown = import.meta.env.VITE_API_TIMEOUT_MS;
  let timeoutMs: number | undefined;
  if (rawTimeout !== undefined && rawTimeout !== '') {
    if (typeof rawTimeout !== 'string' || !/^\d+$/.test(rawTimeout)) throw invalidConfiguration();
    timeoutMs = validateTimeout(Number(rawTimeout));
  }
  return createApiClient(baseUrl, { timeoutMs });
}
