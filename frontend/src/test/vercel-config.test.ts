import { describe, expect, it } from 'vitest';
import config from '../../../vercel.json';

// Offline configuration checks only: Vite/Playwright do not emulate Vercel routing or headers.
describe('preview-only Vercel hosting configuration', () => {
  it('builds from the repository root and publishes only the frontend output', () => {
    expect(config.$schema).toBe('https://openapi.vercel.sh/vercel.json');
    expect(config.framework).toBe('vite');
    expect(config.installCommand).toBe('npm --prefix frontend ci');
    expect(config.buildCommand).toBe('npm --prefix frontend run build');
    expect(config.outputDirectory).toBe('frontend/dist');
    // Root builds retain docs/examples, imported outside frontend by the existing demo tests.
    for (const key of ['env', 'build', 'builds', 'functions', 'routes', 'redirects']) {
      expect(config).not.toHaveProperty(key);
    }
  });

  it('has only the documented local SPA fallback, not an API/provider proxy', () => {
    expect(config.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }]);
  });

  it('applies conservative headers without adding CORS or disabling local file/copy controls', () => {
    expect(config.headers).toEqual([
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
        ],
      },
    ]);
  });
});
