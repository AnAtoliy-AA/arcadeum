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
const BASE_URL = `http://127.0.0.1:${WEB_PORT}`;
const BE_URL = `http://127.0.0.1:${BE_PORT}`;

// Shared secret the web server action sends to the BE so OriginGuard
// accepts server-to-server submissions. Both BE and web servers below
// must see the same value.
const SUPPORT_INTERNAL_TOKEN =
  process.env.SUPPORT_INTERNAL_TOKEN ?? 'e2e_shared_support_token';

// Export for use in tests/fixtures
process.env.WEB_PORT = WEB_PORT;
process.env.BE_PORT = BE_PORT;
process.env.SUPPORT_INTERNAL_TOKEN = SUPPORT_INTERNAL_TOKEN;

/**
 * Playwright configuration for e2e tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  // Boots an in-memory MongoMemoryReplSet and exports MONGODB_URI on
  // process.env before the BE webServer is spawned, so e2e doesn't depend on
  // a local mongod. Honors an external MONGODB_URI when one is set.
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI hits transient dev-server slowness (especially on Mobile Safari, which
  // runs last and warms up against an already-busy Next.js dev server). One
  // retry clears those flakes without masking real regressions — failing
  // tests still need to fail twice in a row to mark the run red.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI
    ? 1
    : process.env.PLAYWRIGHT_WORKERS
      ? parseInt(process.env.PLAYWRIGHT_WORKERS)
      : undefined,
  reporter: 'list',
  // 60s is the hard ceiling for any single test. Tests that need longer are
  // usually masking dev-server compile flake or a real perf regression — surface
  // them rather than hiding under a 2-minute budget. Slow Safari variants get
  // a project-level retry below to absorb the cold-compile first attempt.
  timeout: 60000,
  expect: {
    timeout: 15000,
  },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      // Firefox surfaces Turbopack dev-server chunk truncation as
      // NS_ERROR_NET_PARTIAL_TRANSFER, which leaves the page non-hydrated and
      // makes navigateTo time out. One retry absorbs the cold-compile +
      // chunk-truncation flake without masking real regressions (a real bug
      // must fail twice in a row to mark the run red).
      retries: 1,
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'privacy.bounceTrackingProtection.enabled': false,
            'privacy.bounceTrackingProtection.hasUserInteraction.enabled':
              false,
            'privacy.bounceTrackingProtection.requireInteraction.enabled':
              false,
            'privacy.bounceTrackingProtection.bounceTrackingGracePeriodSec': 31536000,
            'network.cookie.cookieBehavior': 0,
          },
        },
      },
    },
    {
      name: 'webkit',
      // Safari + Next.js 16 dev server cold compile is reliably slow on the
      // first navigation. A second attempt against the now-warm cache passes
      // — same pattern as the CI-wide retries=1. Bumping the per-test timeout
      // gives the cold compile enough headroom that the retry isn't burnt on
      // first-hit compilation either.
      retries: 1,
      timeout: 120_000,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      // Pixel 5 emulation pays a per-test setup cost (touch + reduced viewport
      // shifts the layout/hydration tree). Combined with parallel-worker
      // contention on the dev server this reliably tips a cold-compile of
      // auth-gated routes (/wallet, /admin/users) into the 60s ceiling. Same
      // single-retry policy as Firefox/Safari — masks the dev-server flake
      // without hiding repeatable failures.
      retries: 1,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      retries: 1,
      timeout: 120_000,
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Tablet Safari',
      retries: 1,
      timeout: 120_000,
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  webServer: [
    {
      command:
        process.env.CI || process.env.E2E_PROD
          ? 'pnpm --filter be start:prod'
          : 'pnpm --filter be dev',
      url: `${BE_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        WEB_PORT: WEB_PORT,
        BE_PORT: BE_PORT,
        NODE_ENV: process.env.E2E_PROD ? 'production' : 'development',
        E2E: 'true',
        // Capture loop hits a real MongoDB cluster every 60s. In e2e it's both
        // noise (background errors when the in-memory replset is the target)
        // and a flake source (Atlas timeouts surfacing through
        // checkNoBackendErrors). Disable for the whole e2e webServer.
        LEADERBOARDS_CAPTURE_DISABLED: 'true',
        // MONGODB_URI intentionally omitted — globalSetup writes it to
        // process.env (after the in-memory replset starts), and Playwright
        // inherits process.env into the child, so the BE picks it up at
        // spawn time. Setting it statically here would freeze the value at
        // config-load, before globalSetup runs.
        AUTH_JWT_SECRET:
          process.env.AUTH_JWT_SECRET || 'test_jwt_secret_key_for_e2e_only',
        SUPPORT_INTERNAL_TOKEN,
        // E2E: never deliver to a real inbox or Discord channel. Blanking
        // these makes MailerService + DiscordNotifierService report
        // 'unconfigured' instead of dispatching. The success path is still
        // exercised end-to-end; the wire formats have their own unit tests.
        // NOTE: this only takes effect when Playwright spawns its own BE.
        // If you have `pnpm --filter be dev` running in another terminal,
        // `reuseExistingServer: !CI` will reuse that process with its
        // existing apps/be/.env — stop it first or set CI=1 to force a
        // fresh spawn.
        SMTP_HOST: '',
        SMTP_PASS: '',
        SUPPORT_EMAIL: '',
        DISCORD_SUPPORT_WEBHOOK_URL: '',
      },
    },
    {
      command:
        process.env.CI || process.env.E2E_PROD
          ? 'NEXT_PUBLIC_E2E=true pnpm run start'
          : 'NEXT_PUBLIC_E2E=true pnpm run dev:next',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        WEB_PORT: WEB_PORT,
        BE_PORT: BE_PORT,
        NODE_ENV: process.env.E2E_PROD ? 'production' : 'development',
        E2E: 'true',
        SUPPORT_INTERNAL_TOKEN,
      },
    },
  ],
});
