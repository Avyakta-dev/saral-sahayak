import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Production/Vercel and legacy tests stay preview-only even with a local opt-in file.
  define:
    mode === 'production' || mode === 'preview-test' || mode === 'test'
      ? { 'import.meta.env.VITE_ENABLE_ANALYSIS': JSON.stringify('false') }
      : mode === 'live-test'
        ? { 'import.meta.env.VITE_ENABLE_ANALYSIS': JSON.stringify('true') }
        : {},
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy:
      mode === 'development'
        ? { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false } }
        : undefined,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
}));
