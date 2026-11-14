import { defineConfig } from '@playwright/test';

/**
 * Browser suite for MedOrch.
 *
 * Runs against a production `next start` server backed by the disposable
 * *_test database (see scripts/start-test-server.mjs). It uses the Chrome
 * already installed on the machine through Playwright's `chrome` channel, so
 * no browser download is required and CI can use the same configuration.
 *
 * Workers are pinned to one: the suite exercises shared operational records
 * (equipment status, alert read state) and must observe its own mutations.
 */
const PORT = Number(process.env.E2E_PORT || 5301);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'auth',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['auth'],
    },
  ],

  webServer: {
    command: 'node scripts/start-test-server.mjs',
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      E2E_PORT: String(PORT),
    },
  },
});
