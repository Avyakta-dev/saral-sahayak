import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const frontend = fileURLToPath(new URL('.', import.meta.url));
const repository = fileURLToPath(new URL('..', import.meta.url));
const fixture = fileURLToPath(new URL('./scripts/fixture_backend.py', import.meta.url));
const quote = (value: string) => `"${value.replaceAll('"', '\\"')}"`;
const uvAvailable = spawnSync('uv', ['--version'], { stdio: 'ignore' }).status === 0;
// Windows Python is just the lifecycle launcher: real tools run in WSL, never
// with a Windows compatibility shim. FIXTURE_WSL_PYTHON selects existing Linux
// dependencies (e.g. /home/ctf_2820/.cache/saral-api-issue25-venv/bin/python); no installs here.
const python = process.env.FIXTURE_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const backendCommand =
  process.platform !== 'win32' && uvAvailable && !process.env.FIXTURE_PYTHON
    ? `uv run --no-sync --project ${quote(repository)} python ${quote(fixture)}`
    : `${quote(python)} ${quote(fixture)}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'api-integration.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  // Includes three axe scans, responsive screenshots and real clipboard I/O.
  // This is not the API deadline, which stays independently bounded below.
  timeout: 60_000,
  expect: { timeout: 8_000 },
  // A sibling of preview test-results: its cleanup must not delete our traces.
  outputDir: './playwright-report-api-artifacts',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'api-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'api-mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    {
      command: backendCommand,
      cwd: repository,
      url: 'http://127.0.0.1:8011/health/ready',
      reuseExistingServer: false,
      timeout: 45_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    },
    {
      // Inline Vite API avoids reading any .env file (envDir:false) or changing
      // the shared package/Vite config. Both this process and backend are owned
      // by Playwright; strictPort prevents silently choosing a different port.
      command:
        "node --input-type=module -e \"import {createServer} from 'vite'; const server = await createServer({envDir:false,server:{host:'127.0.0.1',port:5174,strictPort:true}}); await server.listen();\"",
      cwd: frontend,
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        // The shared API facade appends /api/v1 to this server root.
        VITE_API_BASE_URL: 'http://127.0.0.1:8011',
        VITE_PREVIEW_ONLY: 'false',
        VITE_API_TIMEOUT_MS: '3000',
      },
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    },
  ],
});
