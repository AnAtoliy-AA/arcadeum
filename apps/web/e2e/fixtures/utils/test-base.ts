import { test as base } from '@playwright/test';
import { checkNoBackendErrors } from './backend';

export const test = base.extend({
  page: async ({ page }, run) => {
    const translationWarnings: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.startsWith('[Translation]') &&
        !text.includes('Unused parameters')
      ) {
        translationWarnings.push(text);
      }

      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        // Skip expected test crash errors or hydration noise
        if (
          text.includes('This is a test crash!') ||
          text.includes('handled by the <ErrorBoundaryHandler>') ||
          text.includes('The above error occurred in the <TestCrashContent>') ||
          text.includes(
            'hydrated but some attributes of the server rendered HTML',
          ) ||
          text.includes('was preloaded using link preload but not used')
        ) {
          return;
        }

        // Ignore intentional 500 errors in payment notes page tests
        if (
          type === 'error' &&
          text.includes('500') &&
          page.url().includes('/notes')
        ) {
          return;
        }

        console.log(`BROWSER [${type}]: ${text}`);
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure) {
        // Ignore aborted requests which are common during navigation
        if (
          failure.errorText === 'NS_BINDING_ABORTED' ||
          failure.errorText === 'net::ERR_ABORTED'
        ) {
          return;
        }
        console.log(
          `NETWORK [error]: ${request.method()} ${request.url()} - ${failure.errorText}`,
        );
      }
    });

    page.on('response', (response) => {
      if (response.status() === 404) {
        // Ignore known harmless 404s
        if (
          response.url().includes('favicon.ico') ||
          response.url().includes('apple-touch-icon')
        ) {
          return;
        }
        console.log(`NETWORK [error]: 404 - ${response.url()}`);
      }
    });

    page.on('pageerror', (err) => {
      console.log(`BROWSER [error]: ${err.message}\n${err.stack || ''}`);
    });

    await page.addInitScript(() => {
      window.isPlaywright = true;
      // Force disable encryption for E2E mocks
      window.process = window.process || {
        env: { NODE_ENV: 'development' },
      };
      if (window.process.env) {
        window.process.env.NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED = 'false';
        window.process.env.NODE_ENV = 'development';
      }

      window._playwrightMocks = window._playwrightMocks || { handlers: {} };
    });

    // Harmless global mocks to prevent 401/CORS noise on localhost:4000
    // These do not define a session, so they won't break guest tests.
    await page.route('**/referrals/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          referralCode: 'TESTCODE',
          totalReferrals: 0,
          rewards: [],
          tiers: [],
          nextTier: { requiredInvites: 5, remaining: 5 },
        }),
      });
    });

    await page.route('**/referrals/code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ referralCode: 'TESTCODE' }),
      });
    });

    await page.route('**/auth/blocked', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Registration availability mocks
    await page.route('**/auth/check/username/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.route('**/auth/check/email/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    // Mock favicon and icons to reduce 404 noise
    await page.route('**/favicon.ico', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.route('**/apple-touch-icon*', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.route('**/manifest.json', (route) =>
      route.fulfill({ status: 200, body: '{}' }),
    );

    // Global payment gateway mocks to prevent 404s and external network noise
    await page.route(
      /.*(?:checkout\.stripe\.com|sandbox\.paypal\.com).*/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<!DOCTYPE html><html><body><h1>Mock Payment Gateway</h1></body></html>',
        });
      },
    );

    await run(page);

    checkNoBackendErrors();

    if (translationWarnings.length > 0) {
      const uniqueWarnings = Array.from(new Set(translationWarnings));
      throw new Error(
        `E2E Test failed due to missing translations:\n${uniqueWarnings.join('\n')}`,
      );
    }
  },
});
