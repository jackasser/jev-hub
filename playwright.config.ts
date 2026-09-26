import { defineConfig, devices } from '@playwright/test';
import { BASE_ROOT } from './site.config.mjs';

/**
 * `astro preview` daemonises and returns, which Playwright reads as an early exit, so the
 * server is started separately and reused:
 *
 *   npx astro preview --port 4399
 *   npm run test:e2e
 *
 * Port 4399 rather than 4321 so a preview of another checkout is never tested by mistake.
 * The preview server binds IPv6 only here, so the base URL is localhost rather than 127.0.0.1.
 * R-12: the base URL carries the deployment base, so specs navigate with relative paths.
 */
const PORT = 4399;
const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `${ORIGIN}${BASE_ROOT}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `${ORIGIN}${BASE_ROOT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
