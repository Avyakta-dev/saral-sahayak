import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  probeBackendStatus,
  statusFromCapabilities,
  unavailableFailureMessage,
  unreachableStatus,
} from './backendStatus';

const originalEnv = import.meta.env.VITE_API_BASE_URL;

afterEach(() => {
  import.meta.env.VITE_API_BASE_URL = originalEnv;
  vi.unstubAllGlobals();
});

describe('statusFromCapabilities', () => {
  it('marks ready when analysis_available is true', () => {
    expect(statusFromCapabilities({ analysis_available: true }).kind).toBe('ready');
  });

  it('lists missing gates when not ready', () => {
    const status = statusFromCapabilities({
      analysis_available: false,
      checks: { model_configured: false, knowledge_structure_ready: true },
    });
    expect(status.kind).toBe('not_ready');
    expect(status.detail).toMatch(/model configuration/);
  });
});

describe('unreachableStatus', () => {
  it('mentions VITE_API_BASE_URL when unset', () => {
    import.meta.env.VITE_API_BASE_URL = '';
    expect(unreachableStatus().detail).toMatch(/VITE_API_BASE_URL/);
  });

  it('mentions CORS when a base URL is set', () => {
    import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';
    expect(unreachableStatus().detail).toMatch(/CORS_ORIGINS/);
  });
});

describe('unavailableFailureMessage', () => {
  it('includes concrete gates when present', () => {
    expect(
      unavailableFailureMessage({
        analysis_available: false,
        checks: { model_configured: false, knowledge_structure_ready: false },
      }),
    ).toMatch(/model configuration and knowledge corpus structure/);
  });
});

describe('probeBackendStatus', () => {
  it('returns unreachable when fetch fails', async () => {
    import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(probeBackendStatus()).resolves.toMatchObject({ kind: 'unreachable' });
  });

  it('maps capabilities to ready', async () => {
    import.meta.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ analysis_available: true, checks: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(probeBackendStatus()).resolves.toMatchObject({ kind: 'ready' });
  });
});
