import { defineConfig } from '@playwright/test';
const liveBaseURL = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: liveBaseURL ?? 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    proxy: liveBaseURL && process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined,
  },
  webServer: liveBaseURL ? undefined : {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI,
  },
});
