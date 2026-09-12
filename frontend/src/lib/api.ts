import { responseSchema, type AnalyzeResponse, type Language } from './contracts';

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
      'Could not reach the analysis service. Check that the backend is running, VITE_API_BASE_URL matches, and CORS_ORIGINS includes this exact page origin.',
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
      'Could not reach the analysis service. Check that the backend is running, VITE_API_BASE_URL matches, and CORS_ORIGINS includes this exact page origin.',
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
