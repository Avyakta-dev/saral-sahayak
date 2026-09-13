import { fetchCapabilities, type Capabilities, getApiBaseUrl } from './api';
import { translate, type UiLocale } from './i18n';
import type { MessageKey } from './i18n/en';

export type BackendStatusKind = 'checking' | 'unreachable' | 'not_ready' | 'ready';
export type BackendStatus = {
  kind: BackendStatusKind;
  /** Host-authored localized label; never includes secrets or user text. */
  label: string;
  detail?: string;
};

function missingGates(checks: Record<string, boolean> | undefined) {
  const model = checks?.model_configured === false;
  const knowledge = checks?.knowledge_structure_ready === false;
  return model && knowledge ? 'Both' : model ? 'Model' : knowledge ? 'Knowledge' : null;
}

export function statusFromCapabilities(
  capabilities: Capabilities,
  locale: UiLocale = 'en',
): BackendStatus {
  const gates = missingGates(capabilities.checks);
  return capabilities.analysis_available
    ? {
        kind: 'ready',
        label: translate(locale, 'backendReady'),
        detail: translate(locale, 'backendReadyDetail'),
      }
    : {
        kind: 'not_ready',
        label: translate(locale, 'backendNotReady'),
        detail: gates ? translate(locale, `waiting${gates}`) : undefined,
      };
}

export function unreachableStatus(cause?: unknown, locale: UiLocale = 'en'): BackendStatus {
  const base = getApiBaseUrl();
  void cause;
  return {
    kind: 'unreachable',
    label: translate(locale, 'backendUnreachable'),
    detail: base
      ? translate(locale, 'unreachableBase', { base })
      : translate(locale, 'unreachableSameOrigin'),
  };
}

/** One-shot capabilities probe. Locale never changes the request or gates. */
export async function probeBackendStatus(
  signal?: AbortSignal,
  locale: UiLocale = 'en',
): Promise<BackendStatus> {
  try {
    return statusFromCapabilities(await fetchCapabilities(signal), locale);
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    return unreachableStatus(cause, locale);
  }
}

export function unavailableFailureMessage(
  capabilities?: Capabilities | null,
  locale: UiLocale = 'en',
): string {
  const gates =
    capabilities && !capabilities.analysis_available ? missingGates(capabilities.checks) : null;
  return translate(locale, gates ? `unavailable${gates}` : 'unavailableGeneric');
}

/** Legacy host-error facade; classify known errors, never display caller prose. */
export function liveTransportFailureMessage(raw: string, locale: UiLocale = 'en'): string {
  const message = raw.trim();
  if (!message) return translate(locale, 'transportUnreachable');
  const lower = message.toLowerCase();
  if (lower.includes('cors_origins') || lower.includes('could not reach the analysis service'))
    return translate(locale, 'transportUnreachable');
  if (lower.includes('access denied') || lower.includes('access_denied'))
    return translate(locale, 'transportAccess');
  if (
    lower.includes('capacity is limited') ||
    lower.includes('analysis_capacity') ||
    /\b429\b/.test(lower)
  )
    return translate(locale, 'transportCapacity');
  if (lower.includes('timed out') || lower.includes('timeout') || /\b504\b/.test(lower))
    return translate(locale, 'transportTimeout');
  return translate(locale, 'failureUnknown');
}

// Never display transport bodies, configuration values or arbitrary exception messages.
export function failureKey(code: string): MessageKey {
  switch (code) {
    case 'invalid_configuration':
      return 'failureConfiguration';
    case 'access_denied':
      return 'failureAccess';
    case 'analysis_capacity':
      return 'failureCapacity';
    case 'request_timeout':
    case 'analysis_timeout':
    case 'timeout':
      return 'failureTimeout';
    case 'cancelled':
    case 'aborted':
      return 'failureCancelled';
    case 'invalid_request':
    case 'request_too_large':
      return 'failureRequest';
    case 'language_disabled':
      return 'failureLanguage';
    case 'model_not_configured':
    case 'knowledge_unavailable':
      return 'failureReadiness';
    case 'budget_exhausted':
      return 'failureBudget';
    case 'invalid_response':
    case 'response_too_large':
      return 'failureResponse';
    default:
      return 'failureUnknown';
  }
}
