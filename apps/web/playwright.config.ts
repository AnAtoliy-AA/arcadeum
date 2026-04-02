import { defineConfig, devices } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import dotenv from 'dotenv';

/**
 * Robust port resolver to match the development scripts
 */
function getPort(
  envFile: string,
  varName: string,
  defaultPort: string,
): string {
  if (process.env[varName]) return process.env[varName]!;
  if (process.env.PORT) return process.env.PORT!;

  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    const config = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
    return config[varName] || config.PORT || defaultPort;
  }
  return defaultPort;
}

const WEB_PORT = getPort('.env.local', 'WEB_PORT', '3000');
const BE_PORT = getPort('../be/.env', 'BE_PORT', '4000');
const BASE_URL = `http://localhost:${WEB_PORT}`;
const BE_URL = `http://localhost:${BE_PORT}`;

// Export for use in tests/fixtures
process.env.WEB_PORT = WEB_PORT;
process.env.BE_PORT = BE_PORT;

/**
 * Playwright configuration for e2e tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI
    ? 1
    : process.env.PLAYWRIGHT_WORKERS
      ? parseInt(process.env.PLAYWRIGHT_WORKERS)
      : undefined,
  reporter: process.env.CI ? 'list' : 'html',
  timeout: 90000,
  expect: {
    timeout: 20000,
  },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Tablet Safari',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  webServer: [
    {
      command: process.env.CI
        ? 'pnpm --filter be start:prod'
        : 'pnpm --filter be dev',
      url: `${BE_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        WEB_PORT: WEB_PORT,
        BE_PORT: BE_PORT,
      },
    },
    {
      command:
        process.env.CI || process.env.E2E_PROD
          ? 'NEXT_PUBLIC_E2E=true npm run start'
          : 'NEXT_PUBLIC_E2E=true npm run dev:next',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        WEB_PORT: WEB_PORT,
        BE_PORT: BE_PORT,
      },
    },
  ],
});
