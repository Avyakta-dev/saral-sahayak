import { fetchCapabilities, type Capabilities } from './api';
import { getApiBaseUrl } from './api';

export type BackendStatusKind = 'checking' | 'unreachable' | 'not_ready' | 'ready';

export type BackendStatus = {
  kind: BackendStatusKind;
  /** Short judge-facing label; never includes secrets or user text. */
  label: string;
  detail?: string;
};

function gateDetail(checks: Record<string, boolean> | undefined): string | undefined {
  if (!checks) return undefined;
  const missing: string[] = [];
  if (checks.model_configured === false) missing.push('model configuration');
  if (checks.knowledge_structure_ready === false) missing.push('knowledge corpus structure');
  if (!missing.length) return undefined;
  return `Waiting on: ${missing.join(' and ')}.`;
}

export function statusFromCapabilities(capabilities: Capabilities): BackendStatus {
  if (!capabilities.analysis_available) {
    return {
      kind: 'not_ready',
      label: 'Backend reachable — analysis not ready',
      detail: gateDetail(capabilities.checks),
    };
  }
  return {
    kind: 'ready',
    label: 'Analysis available (config + structure only)',
    detail: 'Not a policy, connectivity, or language-quality certificate. Synthetic inputs only.',
  };
}

export function unreachableStatus(cause?: unknown): BackendStatus {
  const base = getApiBaseUrl();
  const hint = base
    ? `Could not reach ${base}. Is the API running, and does CORS_ORIGINS include this page origin?`
    : 'No separate API base (same-origin). Start the backend and set VITE_API_BASE_URL for local demos.';
  void cause;
  return {
    kind: 'unreachable',
    label: 'Analysis backend unreachable',
    detail: hint,
  };
}

/** One-shot capabilities probe for the demo status line. */
export async function probeBackendStatus(signal?: AbortSignal): Promise<BackendStatus> {
  try {
    const capabilities = await fetchCapabilities(signal);
    return statusFromCapabilities(capabilities);
  } catch (cause) {
    if (
      (cause instanceof DOMException && cause.name === 'AbortError') ||
      (cause instanceof Error && cause.name === 'AbortError')
    ) {
      throw cause;
    }
    return unreachableStatus(cause);
  }
}

export function unavailableFailureMessage(capabilities?: Capabilities | null): string {
  if (capabilities && !capabilities.analysis_available) {
    const detail = gateDetail(capabilities.checks);
    return detail
      ? `Analysis is not available on this server right now (${detail.replace(/^Waiting on: /, '').replace(/\.$/, '')}). Your message was not turned into guidance.`
      : 'Analysis is not available on this server right now (model configuration or knowledge gates). Your message was not turned into guidance.';
  }
  return 'Analysis is not available on this server right now (model configuration or knowledge gates). Your message was not turned into guidance.';
}

/** Judge-facing clarification for analyze/capabilities transport failures (no secrets). */
export function liveTransportFailureMessage(raw: string): string {
  const message = raw.trim();
  if (!message) {
    return 'The analysis service could not be reached.';
  }
  const lower = message.toLowerCase();
  if (lower.includes('cors_origins') || lower.includes('could not reach the analysis service')) {
    return message;
  }
  if (lower.includes('access denied') || lower.includes('access_denied')) {
    return 'Analysis access was denied by the server (protected mode). Browser demos must not send ANALYSIS_ACCESS_TOKEN; use local mode or a gateway.';
  }
  if (
    lower.includes('capacity is limited') ||
    lower.includes('analysis_capacity') ||
    /\b429\b/.test(lower)
  ) {
    return 'Analysis capacity is limited right now (HTTP 429). Wait briefly, then retry once; do not spam Send.';
  }
  if (lower.includes('timed out') || lower.includes('timeout') || /\b504\b/.test(lower)) {
    return 'Analysis timed out before a complete answer. Raise reviewed budgets only when authorized; do not invent success.';
  }
  return message;
}
