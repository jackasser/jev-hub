import { defineConfig, devices } from '@playwright/test';

/**
 * `astro preview` daemonises and returns, which Playwright reads as an early exit, so the
 * server is started separately and reused:
 *
 *   npx astro preview --port 4399
 *   npm run test:e2e
 *
 * Port 4399 rather than 4321 so a preview of another checkout is never tested by mistake.
 * The preview server binds IPv6 only here, so the base URL is localhost rather than 127.0.0.1.
 */
const PORT = 4399;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
