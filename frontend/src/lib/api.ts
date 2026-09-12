import { capabilitiesSchema, type Capabilities as ValidatedCapabilities } from './capabilities';
import {
  activitySchema,
  liveResponseSchema,
  uploadTicketSchema,
  type AnalysisActivity,
  type OutputLanguage,
  type UploadTicket,
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

// Preserve main's public metadata type for existing status consumers. Network
// results still pass the stricter capabilitiesSchema and use ValidatedCapabilities.
export type Capabilities = {
  schema_version?: string;
  analysis_available: boolean;
  default_language?: string;
  languages?: unknown;
  checks?: Record<string, boolean>;
  inputs?: string[];
  downloads_available?: boolean;
};

export type AnalysisInput = {
  text: string;
  language: Language;
  details?: Partial<AnalyzeRequest['details']>;
};

/** Main's public facade; signal is never serialized into the request body. */
export type AnalyzeRemarkInput = AnalysisInput & { signal?: AbortSignal };

export interface ApiClient {
  baseUrl: string;
  getCapabilities(signal: AbortSignal): Promise<ValidatedCapabilities>;
  analyze(input: AnalysisInput, signal: AbortSignal): Promise<AnalyzeResponse>;
  analyzeStream?(
    input: AnalysisInput,
    signal: AbortSignal,
    onActivity: (activity: AnalysisActivity) => void,
  ): Promise<AnalyzeResponse>;
  createImageUpload?(language: Language, file: File, signal: AbortSignal): Promise<UploadTicket>;
  analyzeImageStream?(
    key: string,
    language: Language,
    signal: AbortSignal,
    onActivity: (activity: AnalysisActivity) => void,
  ): Promise<AnalyzeResponse>;
}

export function isRetryableCode(code: string): boolean {
  return [
    'network_error',
    'analysis_timeout',
    'request_timeout',
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
    if (status === 401 && envelope.error.code === 'access_denied') {
      return new ApiError('access_denied', 'Analysis access denied.', status);
    }
    if (status === 429 && envelope.error.code === 'analysis_capacity') {
      // No automatic or UI retry, even if Retry-After is present.
      return new ApiError('analysis_capacity', 'Analysis capacity is limited.', status);
    }
    if (status === 504 && envelope.error.code === 'request_timeout') {
      return new ApiError('request_timeout', 'Analysis request timed out.', status);
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
    endpoint: 'capabilities' | 'analyze' | 'analyze/stream' | 'images/uploads',
    signal: AbortSignal,
    parse: (body: unknown, response: Response) => T,
    body?: string,
    streamReader?: (response: Response, signal: AbortSignal) => Promise<T>,
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
        referrerPolicy: 'no-referrer',
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
      if (response.ok && streamReader) return streamReader(response, controller.signal);
      const json = await readJson(response, controller.signal);
      if (controller.signal.aborted) throw interruption ?? abortError();
      return parse(json, response);
    };
    try {
      return await Promise.race([run(), interrupted]);
    } catch (error) {
      if (interruption) throw interruption;
      if (error instanceof ApiError) throw error;
      if ((error instanceof DOMException || error instanceof Error) && error.name === 'AbortError')
        throw abortError();
      // Fetch/CORS/network errors can contain endpoints or response details.
      throw new ApiError('network_error', 'The API could not be reached. Please try again.');
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
    }
  }

  const stream = (
    payload: string,
    language: Language,
    signal: AbortSignal,
    onActivity: (activity: AnalysisActivity) => void,
  ) =>
    request(
      'analyze/stream',
      signal,
      (body, response) => {
        const result = liveResponseSchema.safeParse(body);
        if (result.success && result.data.language === language && result.data.error)
          throw new ApiError(
            result.data.error.code,
            safeErrorMessage(result.data.error.code),
            response.status,
          );
        throw smallHttpError(body, response.status) ?? invalidResponse(response.status);
      },
      payload,
      (response, requestSignal) =>
        readAnalysisStream(response, requestSignal, language, onActivity),
    );

  return {
    baseUrl: base,
    analyzeStream(input, signal, onActivity) {
      const parsed = requestSchema.safeParse(input);
      if (!parsed.success)
        return Promise.reject(
          new ApiError('invalid_request', 'Check the text, language and request size.'),
        );
      return stream(JSON.stringify(parsed.data), input.language, signal, onActivity);
    },
    createImageUpload(language, file, signal) {
      if (
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
        !Number.isSafeInteger(file.size) ||
        file.size < 1 ||
        file.size > 10 * 1024 * 1024
      )
        return Promise.reject(
          new ApiError('invalid_request', 'Choose a valid image of 10 MiB or less.'),
        );
      return request(
        'images/uploads',
        signal,
        (body, response) => {
          const parsed = uploadTicketSchema.safeParse(body);
          if (response.ok && parsed.success && parsed.data.content_type === file.type)
            return parsed.data;
          throw smallHttpError(body, response.status) ?? invalidResponse(response.status);
        },
        JSON.stringify({ language, content_type: file.type, content_length: file.size }),
      );
    },
    analyzeImageStream(key, language, signal, onActivity) {
      if (!/^inbox\/[0-9a-f]{32}\.(?:png|jpg|jpeg|webp)$/.test(key))
        return Promise.reject(new ApiError('invalid_request', 'Invalid image reference.'));
      return stream(JSON.stringify({ image_key: key, language }), language, signal, onActivity);
    },
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

/** Trusted server root, NOT an API prefix. Blank means same-origin /api/v1. */
export function getApiBaseUrl(): string {
  const raw: unknown = import.meta.env.VITE_API_BASE_URL;
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') throw invalidConfiguration();
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return validateBaseUrl(trimmed).replace(/\/+$/, '');
}

export function getConfiguredApiClient(): ApiClient | null {
  // Preview must be explicit. App tests may instead inject apiClient={null}.
  // Browser preview builds must set VITE_PREVIEW_ONLY=true; a blank URL is live same-origin.
  if (import.meta.env.VITE_PREVIEW_ONLY === 'true') return null;
  const baseUrl = getApiBaseUrl();
  const rawTimeout: unknown = import.meta.env.VITE_API_TIMEOUT_MS;
  let timeoutMs: number | undefined;
  if (rawTimeout !== undefined && rawTimeout !== '') {
    if (typeof rawTimeout !== 'string' || !/^\d+$/.test(rawTimeout)) throw invalidConfiguration();
    timeoutMs = validateTimeout(Number(rawTimeout));
  }
  const client = createApiClient(`${baseUrl}/api/v1`, { timeoutMs });
  if (
    import.meta.env.VITE_ENABLE_ANALYSIS !== 'true' &&
    import.meta.env.VITE_ENABLE_STREAMING !== 'true'
  )
    client.analyzeStream = undefined;
  return client;
}

function requireConfiguredApiClient(): ApiClient {
  const client = getConfiguredApiClient();
  if (!client)
    throw new ApiError('preview_only', 'Live API requests are disabled in preview mode.');
  return client;
}

/** Read-only metadata through the same bounded, validated transport as the App. */
export async function fetchCapabilities(signal?: AbortSignal): Promise<Capabilities> {
  return requireConfiguredApiClient().getCapabilities(signal ?? new AbortController().signal);
}

/** Never sends browser access tokens or provider keys; retries remain user-initiated. */
export async function analyzeRemark(input: AnalyzeRemarkInput): Promise<AnalyzeResponse> {
  const { signal, ...payload } = input;
  return requireConfiguredApiClient().analyze(payload, signal ?? new AbortController().signal);
}

export const ANALYSIS_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;
export const RESPONSE_BYTE_LIMIT = MAX_RESPONSE_BYTES;
const invalid = 'The backend returned an invalid response. No guidance was displayed.';
export function safeErrorMessage(code: string): string {
  if (code === 'analysis_timeout' || code === 'request_timeout')
    return 'Analysis timed out. Review before trying again.';
  return 'Analysis could not be completed safely. No guidance was displayed.';
}
async function readAnalysisStream(
  response: Response,
  requestSignal: AbortSignal,
  language: Language,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  if (
    !/^text\/event-stream(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '') ||
    !response.body
  )
    throw new ApiError('invalid_response', invalid);
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > RESPONSE_BYTE_LIMIT))
    throw new ApiError('invalid_response', invalid);
  const reader = response.body.getReader();
  const cancelRead = () => {
    void reader.cancel().catch(() => {});
  };
  requestSignal.addEventListener('abort', cancelRead, { once: true });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let buffer = '',
    size = 0,
    activities = 0;
  let final: AnalyzeResponse | null = null;
  const frame = (raw: string) => {
    let event = '',
      data = '';
    for (const line of raw.split('\n')) {
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('event:') && !event) event = line.slice(6).replace(/^ /, '');
      else if (line.startsWith('data:'))
        data += (data ? '\n' : '') + line.slice(5).replace(/^ /, '');
      else throw new ApiError('invalid_response', invalid);
    }
    if (!event && !data) return;
    if (final || !data) throw new ApiError('invalid_response', invalid);
    const value: unknown = JSON.parse(data);
    if (event === 'activity') {
      const parsed = activitySchema.safeParse(value);
      if (!parsed.success || ++activities > 128) throw new ApiError('invalid_response', invalid);
      if (!requestSignal.aborted) onActivity(parsed.data);
    } else if (event === 'result') {
      const parsed = liveResponseSchema.safeParse(value);
      if (!parsed.success || parsed.data.language !== language)
        throw new ApiError('invalid_response', invalid);
      final = parsed.data;
    } else throw new ApiError('invalid_response', invalid);
  };
  try {
    while (true) {
      if (requestSignal.aborted) throw abortError();
      const { done, value } = await reader.read();
      if (requestSignal.aborted) throw abortError();
      if (value) {
        size += value.byteLength;
        if (size > RESPONSE_BYTE_LIMIT) throw new ApiError('invalid_response', invalid);
      }
      buffer += decoder.decode(value, { stream: !done });
      // Normalize only complete CRLF pairs, including pairs split across chunks.
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        frame(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
      if (done) break;
    }
    if (buffer.trim() || !final)
      throw new ApiError(
        'invalid_response',
        'The analysis stream ended without a complete validated result. No guidance was displayed.',
      );
    const result = final as AnalyzeResponse;
    if (result.error) throw new ApiError(result.error.code, safeErrorMessage(result.error.code));
    return result;
  } catch (error) {
    cancelRead();
    throw error instanceof ApiError ? error : new ApiError('invalid_response', invalid);
  } finally {
    requestSignal.removeEventListener('abort', cancelRead);
    reader.releaseLock();
  }
}

export function analyzeTextStream(
  text: string,
  language: OutputLanguage,
  signal: AbortSignal,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  const client = createApiClient(`${getApiBaseUrl()}/api/v1`);
  return client.analyzeStream!({ text, language }, signal, onActivity);
}
/** Upload the exact reviewed File; never add a forbidden Content-Length header. */
export async function uploadImage(
  ticket: UploadTicket,
  file: File,
  signal: AbortSignal,
): Promise<void> {
  if (!uploadTicketSchema.safeParse(ticket).success || file.type !== ticket.content_type)
    throw new ApiError(
      'invalid_request',
      'The image type changed before upload. Re-attach the image.',
    );
  if (signal.aborted) throw abortError();
  const controller = new AbortController();
  let rejectAbort: (error: Error) => void = () => undefined;
  const interrupted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const abort = () => {
    rejectAbort(abortError());
    controller.abort();
  };
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => {
    rejectAbort(new ApiError('analysis_timeout', 'Image upload timed out.'));
    controller.abort();
  }, 20_000);
  try {
    const response = await Promise.race([
      fetch(ticket.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': ticket.content_type },
        body: file,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        signal: controller.signal,
      }),
      interrupted,
    ]);
    cancelBody(response);
    if (controller.signal.aborted) throw abortError();
    if (!response.ok || response.redirected)
      throw new ApiError('image_upload_failed', 'Image upload failed. Review before trying again.');
  } catch (cause) {
    if (cause instanceof ApiError || (cause instanceof Error && cause.name === 'AbortError'))
      throw cause;
    throw new ApiError('image_upload_failed', 'Image upload failed. Review before trying again.');
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}

export function getCapabilities(signal: AbortSignal): Promise<ValidatedCapabilities> {
  return createApiClient(`${getApiBaseUrl()}/api/v1`).getCapabilities(signal);
}
export async function analyzeText(
  text: string,
  language: OutputLanguage,
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  const result = await createApiClient(`${getApiBaseUrl()}/api/v1`).analyze(
    { text, language },
    signal,
  );
  if (result.error) throw new ApiError(result.error.code, safeErrorMessage(result.error.code));
  return result;
}
