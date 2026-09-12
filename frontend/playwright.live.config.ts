import { defineConfig } from '@playwright/test';
import preview from './playwright.config';

export default defineConfig({
  ...preview,
  testMatch: ['live.spec.ts', 'locales.spec.ts'],
  outputDir: 'test-results/live',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/live' }]],
  use: { ...preview.use, baseURL: 'http://127.0.0.1:5175' },
  webServer: {
    command:
      "node --input-type=module -e \"import {createServer} from 'vite'; const server = await createServer({envDir:false,mode:'live-test',server:{host:'127.0.0.1',port:5175,strictPort:true}}); await server.listen();\"",
    env: { VITE_PREVIEW_ONLY: 'false', VITE_API_BASE_URL: '', VITE_ENABLE_STREAMING: 'true' },
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
