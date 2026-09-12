import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'ui.spec.ts',
  fullyParallel: true,
  outputDir: 'test-results/preview',
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5183',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command:
      "node --input-type=module -e \"import {createServer} from 'vite'; const server = await createServer({envDir:false,server:{host:'127.0.0.1',port:5183,strictPort:true}}); await server.listen();\"",
    env: { VITE_PREVIEW_ONLY: 'true', VITE_API_BASE_URL: '' },
    url: 'http://127.0.0.1:5183',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
