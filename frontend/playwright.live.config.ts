import { defineConfig } from '@playwright/test';
import preview from './playwright.config';

export default defineConfig({
  ...preview,
  testMatch: ['live.spec.ts', 'locales.spec.ts'],
  outputDir: 'test-results/live',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/live' }]],
  use: { ...preview.use, baseURL: 'http://127.0.0.1:5175' },
  webServer: {
    command: 'npm run dev -- --mode live-test --port 5175',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
