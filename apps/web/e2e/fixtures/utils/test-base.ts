import { test as base } from '@playwright/test';
import { checkNoBackendErrors } from './backend';
import { handleRoute } from './network';

export const test = base.extend({
  page: async ({ page }, run) => {
    const translationWarnings: string[] = [];

    page.on('console', (msg) => {
      // Normalize text by removing zero-width spaces and trimming
      const rawText = msg.text();
      const text = rawText.replace(/\u200B/g, '').trim();
      const type = msg.type();

      if (
        text.startsWith('[Translation]') &&
        !text.includes('Unused parameters')
      ) {
        translationWarnings.push(text);
      }

      const isErrorOrWarning = type === 'error' || type === 'warning';
      const isRelevantKeyword =
        text.includes('session') || text.includes('room');
      const isFetchNoise = text.toLowerCase().includes('fetch');

      // ALWAYS capture errors and warnings unless they are explicitly ignored
      if (isErrorOrWarning) {
        // Skip expected test crash errors or hydration noise
        if (
          text.includes('This is a test crash!') ||
          text.includes('handled by the <ErrorBoundaryHandler>') ||
          text.includes('The above error occurred in the <TestCrashContent>') ||
          text.includes(
            'hydrated but some attributes of the server rendered HTML',
          ) ||
          text.includes('was preloaded using link preload but not used') ||
          text.includes('webpack-hmr') ||
          (/font|geist/i.test(text) &&
            /(download failed|rejected|decode)/i.test(text))
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

        // Ignore Next.js stack-frame CORS errors during aborts
        if (text.includes('__nextjs_original-stack-frames')) {
          return;
        }

        // Suppress transient access control errors for endpoints we are mocking
        if (
          (text.includes('due to access control checks') ||
            text.includes('Fetch API cannot load')) &&
          (text.includes('localhost:4000') ||
            text.includes('localhost:4500') ||
            text.includes('127.0.0.1:4000') ||
            text.includes('127.0.0.1:4500') ||
            text.includes('localhost:3500') ||
            text.includes('127.0.0.1:3500'))
        ) {
          return;
        }

        console.log(`BROWSER [${type}]: ${text}`);
      } else if (isRelevantKeyword && !isFetchNoise) {
        // Log relevant room/session events if they aren't fetch noise
        console.log(`BROWSER [${type}]: ${text}`);
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      const url = request.url();
      if (failure) {
        // Ignore aborted requests which are common during navigation
        // Also ignore Next.js stack frame requests which often get cancelled on reload
        if (
          failure.errorText === 'NS_BINDING_ABORTED' ||
          failure.errorText === 'net::ERR_ABORTED' ||
          failure.errorText === 'canceled' || // Common in WebKit
          failure.errorText === 'cancelled' || // Other runtimes
          failure.errorText.toLowerCase().includes('navigation cancel') ||
          url.includes('accounts.google.com') ||
          url.includes('__nextjs_original-stack-frames')
        ) {
          return;
        }

        console.log(
          `NETWORK [error]: ${request.method()} ${url} - ${failure.errorText}`,
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
      const msg = err.message;
      if (
        msg.includes('__nextjs_original-stack-frames') ||
        msg.includes('The operation was aborted') ||
        msg.includes('AbortError') ||
        msg.includes('webpack-hmr')
      ) {
        return;
      }

      // Suppress transient access control errors and Fetch failures in pageerror too.
      // These can manifest as Unhandled Rejections in some browser environments.
      if (
        (msg.includes('due to access control checks') ||
          msg.includes('Fetch API cannot load')) &&
        (msg.includes('localhost:4000') ||
          msg.includes('localhost:4500') ||
          msg.includes('127.0.0.1:4000') ||
          msg.includes('127.0.0.1:4500') ||
          msg.includes('localhost:3500') ||
          msg.includes('127.0.0.1:3500'))
      ) {
        return;
      }

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
      await handleRoute(route, {
        referralCode: 'TESTCODE',
        totalReferrals: 0,
        rewards: [],
        tiers: [],
        nextTier: { requiredInvites: 5, remaining: 5 },
      });
    });

    await page.route('**/referrals/code', async (route) => {
      await handleRoute(route, { referralCode: 'TESTCODE' });
    });

    await page.route('**/auth/blocked', async (route) => {
      await handleRoute(route, []);
    });

    // Registration availability mocks
    await page.route('**/auth/check/username/**', async (route) => {
      await handleRoute(route, { available: true });
    });

    await page.route('**/auth/check/email/**', async (route) => {
      await handleRoute(route, { available: true });
    });

    // Global auth mocks to prevent hitting real backend during registration/login tests.
    // This removes the "Invalid referral code" warnings in the backend logs.
    await page.route('**/auth/register', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        const payload = route.request().postDataJSON() || {};
        await handleRoute(route, {
          id: 'mock-user-id',
          email: payload.email || 'mock@example.com',
          username: payload.username || 'mockuser',
          displayName: 'Mock User',
          role: null,
        });
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });

    await page.route('**/auth/login', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        const payload = route.request().postDataJSON() || {};
        await handleRoute(route, {
          accessToken: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email: payload.email || 'mock@example.com',
            username: 'mockuser',
            displayName: 'Mock User',
          },
        });
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });

    // Mock favicon and icons to reduce 404 noise
    await page.route('**/favicon.ico', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.route('**/apple-touch-icon*', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );

    // Mock Next.js Geist fonts to prevent connection refused noise in E2E
    await page.route('**/__nextjs_font/**', (route) =>
      route.fulfill({ status: 200, body: '' }),
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
