import { responseSchema, type Language } from './contracts';

export type AnalyzeRemarkInput = {
  text: string;
  language: Language;
  details?: {
    claimant_name?: string | null;
    claim_id?: string | null;
    claim_type?: string | null;
  };
  signal?: AbortSignal;
};

export type Capabilities = {
  schema_version?: string;
  analysis_available: boolean;
  default_language?: string;
  languages?: unknown;
  checks?: Record<string, boolean>;
  inputs?: string[];
  downloads_available?: boolean;
};

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

/** Base URL for API calls. Empty string means same-origin relative paths. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw === undefined || raw === null) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';
  return trimTrailingSlashes(trimmed);
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

function isAbortError(cause: unknown): boolean {
  return (
    (cause instanceof DOMException && cause.name === 'AbortError') ||
    (cause instanceof Error && cause.name === 'AbortError')
  );
}

function transportErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    const nested = root.error;
    if (nested && typeof nested === 'object') {
      const message = (nested as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim()) return message.trim();
    }
    if (typeof root.message === 'string' && root.message.trim()) return root.message.trim();
  }
  return fallback;
}

async function readJsonBody(response: Response): Promise<unknown> {
  let raw: string;
  try {
    raw = await response.text();
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new Error('Could not read the analysis service response body.');
  }
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error('The analysis service returned a non-JSON response.');
  }
}

/** GET /api/v1/capabilities — no secrets; read-only availability metadata. */
export async function fetchCapabilities(signal?: AbortSignal): Promise<Capabilities> {
  let response: Response;
  try {
    response = await fetch(apiUrl('/api/v1/capabilities'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new Error(
      'Could not reach the analysis service. Check that the backend is running and VITE_API_BASE_URL is set if needed.',
    );
  }

  const data = await readJsonBody(response);
  if (!response.ok) {
    throw new Error(
      transportErrorMessage(data, `Capabilities request failed with HTTP ${response.status}.`),
    );
  }
  if (
    !data ||
    typeof data !== 'object' ||
    typeof (data as Capabilities).analysis_available !== 'boolean'
  ) {
    throw new Error('Capabilities response was missing analysis_available.');
  }
  return data as Capabilities;
}

/**
 * POST /api/v1/analyze with a JSON AnalyzeRequest body.
 * Never sends ANALYSIS_ACCESS_TOKEN or LLM keys from the browser.
 */
export async function analyzeRemark(input: AnalyzeRemarkInput): Promise<AnalyzeResponse> {
  const body: Record<string, unknown> = {
    text: input.text,
    language: input.language,
  };
  if (input.details !== undefined) body.details = input.details;

  let response: Response;
  try {
    response = await fetch(apiUrl('/api/v1/analyze'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: input.signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new Error(
      'Could not reach the analysis service. Check that the backend is running and VITE_API_BASE_URL is set if needed.',
    );
  }

  const data = await readJsonBody(response);
  const parsed = responseSchema.safeParse(data);
  if (parsed.success) return parsed.data;

  throw new Error(
    transportErrorMessage(
      data,
      response.ok
        ? 'The analysis service returned a response that did not match the expected contract.'
        : `Analysis request failed with HTTP ${response.status}.`,
    ),
  );
}

import {
  capabilitiesSchema,
  activitySchema,
  type AnalysisActivity,
  liveResponseSchema,
  transportErrorSchema,
  uploadTicketSchema,
  validateInput,
  type AnalyzeResponse,
  type Capabilities as ValidatedCapabilities,
  type OutputLanguage,
  type UploadTicket,
} from './contracts';

export const ANALYSIS_TIMEOUT_MS = 125_000;
export const RESPONSE_BYTE_LIMIT = 2 * 1024 * 1024;
const invalid = 'The backend returned an invalid response. No guidance was displayed.';

const errorMessages: Record<string, string> = {
  model_not_configured:
    'The backend model is not configured. Ask the demo operator to check setup.',
  knowledge_unavailable: 'The backend knowledge corpus is unavailable or incomplete.',
  service_unavailable: 'The analysis service is unavailable. Ask the demo operator to check setup.',
  budget_exhausted:
    'Analysis reached its safe processing limit. Edit the remark before trying again.',
  model_unavailable: 'The configured model is unavailable. No answer could be prepared.',
  invalid_model_output: 'The model response could not be validated. No guidance was displayed.',
  analysis_timeout: 'Analysis timed out. You can edit the remark and explicitly try again.',
  analysis_failed: 'Analysis could not be completed safely. No guidance was displayed.',
  language_disabled:
    'This output language is no longer enabled. Reload to check available languages.',
  invalid_request: 'The backend rejected the request. Check the text and output language.',
  request_too_large: 'The request is too large. Shorten the text before trying again.',
  image_input_unavailable:
    'Image analysis is not enabled on this backend. Paste the reviewed text instead.',
  image_not_admitted:
    'The image was not accepted. Re-attach it and try again, or paste the reviewed text.',
  image_unreadable:
    'The image wording could not be read. Try a clearer screenshot, or paste the reviewed text.',
  invalid_image_output:
    'The image could not be read safely. Paste the reviewed text instead, or try another screenshot.',
};
export class ApiError extends Error {}
export function safeErrorMessage(code: string): string {
  return (
    errorMessages[code] ?? 'The backend could not complete this request. No guidance was displayed.'
  );
}
const cancelled = () => new DOMException('Request cancelled.', 'AbortError');

async function readJson(response: Response, limit: number, signal: AbortSignal): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') ?? ''))
    throw new ApiError(invalid);
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit))
    throw new ApiError(invalid);
  if (!response.body) throw new ApiError(invalid);
  const reader = response.body.getReader();
  const cancelRead = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener('abort', cancelRead, { once: true });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      if (signal.aborted) throw cancelled();
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new ApiError(invalid);
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error instanceof ApiError ? error : new ApiError(invalid);
  } finally {
    signal.removeEventListener('abort', cancelRead);
    reader.releaseLock();
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  signal: AbortSignal,
  timeout: number,
  limit: number,
  parse: (body: unknown, ok: boolean) => T,
  streamReader?: (response: Response, signal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (signal.aborted) throw cancelled();
  const controller = new AbortController();
  let timedOut = false;
  let rejectAbort: (error: Error) => void = () => {};
  const abort = () => {
    controller.abort();
    rejectAbort(timedOut ? new ApiError(errorMessages.analysis_timeout) : cancelled());
  };
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    abort();
  }, timeout);
  try {
    return await Promise.race([
      new Promise<never>((_, reject) => {
        rejectAbort = reject;
      }),
      (async () => {
        const response = await fetch(path, {
          ...init,
          signal: controller.signal,
          credentials: 'omit',
          cache: 'no-store',
          redirect: 'error',
          referrerPolicy: 'no-referrer',
          headers: {
            Accept: streamReader ? 'text/event-stream, application/json' : 'application/json',
            ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          },
        });
        if (response.ok && streamReader) return await streamReader(response, controller.signal);
        const body = await readJson(response, limit, controller.signal);
        if (controller.signal.aborted) throw cancelled();
        return parse(body, response.ok);
      })(),
    ]);
  } catch (error) {
    controller.abort();
    if (signal.aborted) throw cancelled();
    if (timedOut) throw new ApiError(errorMessages.analysis_timeout);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Could not reach the local backend. Check that it is running and try again explicitly.',
    );
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}

export function getCapabilities(signal: AbortSignal): Promise<ValidatedCapabilities> {
  return requestJson(
    '/api/v1/capabilities',
    { method: 'GET' },
    signal,
    15_000,
    16_384,
    (body, ok) => {
      const parsed = capabilitiesSchema.safeParse(body);
      if (!ok || !parsed.success)
        throw new ApiError(
          'Backend capabilities are unavailable or invalid. Analysis is disabled; reload after checking setup.',
        );
      return parsed.data;
    },
  );
}

function analyzeStream(
  payload: string,
  language: OutputLanguage,
  signal: AbortSignal,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  return requestJson(
    '/api/v1/analyze/stream',
    { method: 'POST', body: payload },
    signal,
    ANALYSIS_TIMEOUT_MS,
    RESPONSE_BYTE_LIMIT,
    (body) => {
      const result = liveResponseSchema.safeParse(body);
      if (result.success && result.data.language === language && result.data.error)
        throw new ApiError(safeErrorMessage(result.data.error.code));
      const transport = transportErrorSchema.safeParse(body);
      if (transport.success) throw new ApiError(safeErrorMessage(transport.data.error.code));
      throw new ApiError(invalid);
    },
    async (response, requestSignal) => {
      if (
        !/^text\/event-stream(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '') ||
        !response.body
      )
        throw new ApiError(invalid);
      const length = response.headers.get('content-length');
      if (length !== null && (!/^\d+$/.test(length) || Number(length) > RESPONSE_BYTE_LIMIT))
        throw new ApiError(invalid);
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
          else throw new ApiError(invalid);
        }
        if (!event && !data) return;
        if (final || !data) throw new ApiError(invalid);
        const value: unknown = JSON.parse(data);
        if (event === 'activity') {
          const parsed = activitySchema.safeParse(value);
          if (!parsed.success || ++activities > 128) throw new ApiError(invalid);
          if (!requestSignal.aborted) onActivity(parsed.data);
        } else if (event === 'result') {
          const parsed = liveResponseSchema.safeParse(value);
          if (!parsed.success || parsed.data.language !== language) throw new ApiError(invalid);
          final = parsed.data;
        } else throw new ApiError(invalid);
      };
      try {
        while (true) {
          if (requestSignal.aborted) throw cancelled();
          const { done, value } = await reader.read();
          if (requestSignal.aborted) throw cancelled();
          if (value) {
            size += value.byteLength;
            if (size > RESPONSE_BYTE_LIMIT) throw new ApiError(invalid);
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
            'The analysis stream ended without a complete validated result. No guidance was displayed.',
          );
        const result = final as AnalyzeResponse;
        if (result.error) throw new ApiError(safeErrorMessage(result.error.code));
        return result;
      } catch (error) {
        cancelRead();
        throw error instanceof ApiError ? error : new ApiError(invalid);
      } finally {
        requestSignal.removeEventListener('abort', cancelRead);
        reader.releaseLock();
      }
    },
  );
}

export function analyzeTextStream(
  text: string,
  language: OutputLanguage,
  signal: AbortSignal,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  const validation = validateInput(text, language);
  if (validation) return Promise.reject(new ApiError(validation));
  return analyzeStream(
    JSON.stringify({ text: text.trim(), language }),
    language,
    signal,
    onActivity,
  );
}

/**
 * POST /api/v1/images/uploads, then PUT the reviewed bytes straight to private storage,
 * then analyze by opaque object key. The image is an alternative to text, never an addition,
 * and nothing is sent until the caller has an explicit approval.
 */
export function createImageUpload(
  language: OutputLanguage,
  contentType: string,
  signal: AbortSignal,
): Promise<UploadTicket> {
  return requestJson(
    '/api/v1/images/uploads',
    { method: 'POST', body: JSON.stringify({ language, content_type: contentType }) },
    signal,
    20_000,
    4_096,
    (value, ok) => {
      const parsed = uploadTicketSchema.safeParse(value);
      if (ok && parsed.success) return parsed.data;
      const transport = transportErrorSchema.safeParse(value);
      if (transport.success) throw new ApiError(safeErrorMessage(transport.data.error.code));
      throw new ApiError(invalid);
    },
  );
}

/** Direct-to-storage upload with the presigned PUT. No credentials and no provider call. */
export async function uploadImage(
  ticket: UploadTicket,
  file: File,
  signal: AbortSignal,
): Promise<void> {
  if (file.type !== ticket.content_type)
    throw new ApiError('The image type changed before upload. Re-attach the image.');
  let response: Response;
  try {
    response = await fetch(ticket.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': ticket.content_type },
      body: file,
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new ApiError(
      'The image could not be uploaded. Check that the storage bucket allows uploads from this page.',
    );
  }
  if (!response.ok)
    throw new ApiError('The image could not be uploaded. Try again, or paste the reviewed text.');
}

export function analyzeImageStream(
  objectKey: string,
  language: OutputLanguage,
  signal: AbortSignal,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  return analyzeStream(
    JSON.stringify({ image_key: objectKey, language }),
    language,
    signal,
    onActivity,
  );
}

export function analyzeText(
  text: string,
  language: OutputLanguage,
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  const validation = validateInput(text, language);
  if (validation) return Promise.reject(new ApiError(validation));
  // Deliberate whitelist: no history, details, file metadata, images, credentials or base64.
  const body = JSON.stringify({ text: text.trim(), language });
  return requestJson(
    '/api/v1/analyze',
    { method: 'POST', body },
    signal,
    ANALYSIS_TIMEOUT_MS,
    RESPONSE_BYTE_LIMIT,
    (value, ok) => {
      const parsed = liveResponseSchema.safeParse(value);
      if (parsed.success) {
        if (parsed.data.language !== language || ok === (parsed.data.status === 'error'))
          throw new ApiError(invalid);
        if (parsed.data.error) throw new ApiError(safeErrorMessage(parsed.data.error.code));
        return parsed.data;
      }
      const transport = transportErrorSchema.safeParse(value);
      if (!ok && transport.success) throw new ApiError(safeErrorMessage(transport.data.error.code));
      throw new ApiError(invalid);
    },
  );
}
