import { test as base } from '@playwright/test';
import { checkNoBackendErrors } from './backend';
import { handleRoute } from './network';

// Turbopack dev server occasionally truncates chunk responses (Firefox surfaces
// this as NS_ERROR_NET_PARTIAL_TRANSFER, Chromium as net::ERR_HTTP2_PROTOCOL_ERROR).
// The page recovers via navigateTo()'s reload, but the listeners below still
// print loud BROWSER/NETWORK lines that look like real failures in reports.
// Suppress only when running against the dev server — CI/E2E_PROD use the
// production build where a chunk failure is a real regression.
const IS_DEV_E2E = !process.env.CI && !process.env.E2E_PROD;

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
          (/font|geist|preload/i.test(text) &&
            /(download failed|rejected|decode|preloaded with link preload was not used)/i.test(
              text,
            )) ||
          (IS_DEV_E2E &&
            /Loading failed for the <script>/i.test(text) &&
            /_next\/static\/chunks\//.test(text)) ||
          // Firefox flags forced reflow inside Playwright's own page.evaluate
          // calls (the script source is reported as "debugger eval code"). Not
          // an app bug — it's the test harness measuring layout state.
          /Layout was forced before the page was fully loaded/i.test(text)
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

        // Ignore intentional 4xx noise from flows that mock-fulfill error
        // responses or auth-gated specs where mockSession is in effect but the
        // BE rejects the fake bearer token (BalanceChip/auth-blocked/etc fire
        // header calls on every page). Allowlist by the page URL the noise
        // emits from. Every auth-gated route in the app needs to be here —
        // the header/shop-balance-chip widgets fire `/wallet/balance`,
        // `/auth/check/*`, `/notifications/*`, etc. on every page render
        // and the fake JWT from mockSession always 401s against the real BE.
        if (
          type === 'error' &&
          /Failed to load resource.*status of 4\d{2}/i.test(text) &&
          (/\/(?:wallet|payment|payments|gems|games|auth|settings|chat|chats|leaderboards|stats|history|notifications|notes|referrals|rewards|tournaments|shop|profile|players|admin|community|developers|help|contact|support|blog|cookies|privacy|terms|legal|home)/.test(
            page.url(),
          ) ||
            /^https?:\/\/[^/]+\/?$/.test(page.url()) ||
            /^https?:\/\/[^/]+\/(?:en|es|fr|ru|by)\/?$/.test(page.url()))
        ) {
          return;
        }

        // Ignore BE socket.io websocket handshake failures. Many specs don't
        // mock the socket gateway and just navigate through pages that
        // initialize a socket.io client; the unauthenticated handshake then
        // logs identical noise across every browser ("Firefox can't establish
        // a connection…", "WebSocket connection to … failed: WebSocket is
        // closed before the connection is established", etc.). Firefox uses
        // a Unicode right-single-quote in "can't", so we match a stable
        // substring instead of the contraction.
        if (
          /(?:WebSocket connection to .* failed|establish a connection.*server.*ws:\/\/|WebSocket is closed before)/i.test(
            text,
          ) &&
          /socket\.io\//.test(text) &&
          /(?:localhost|127\.0\.0\.1):4000/.test(text)
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

        // Mobile Safari fires "due to access control checks" / "Fetch API
        // cannot load" when an in-flight Next.js RSC fetch is cancelled by a
        // subsequent navigation. The `?_rsc=` query is the unambiguous signal.
        if (
          (text.includes('due to access control checks') ||
            text.includes('Fetch API cannot load')) &&
          /[?&]_rsc=/.test(text)
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
        const lowerErr = failure.errorText.toLowerCase();
        if (
          failure.errorText === 'NS_BINDING_ABORTED' ||
          failure.errorText === 'net::ERR_ABORTED' ||
          // Mobile Safari surfaces aborts as "Load request cancelled" /
          // WebKit "canceled" / Firefox "cancelled". Substring covers all
          // wordings — these are mid-navigation cancellations, not real
          // network failures.
          lowerErr.includes('canceled') ||
          lowerErr.includes('cancelled') ||
          lowerErr.includes('navigation cancel') ||
          url.includes('accounts.google.com') ||
          url.includes('__nextjs_original-stack-frames') ||
          (IS_DEV_E2E &&
            url.includes('/_next/static/chunks/') &&
            /NS_ERROR_NET_PARTIAL_TRANSFER|ERR_HTTP2_PROTOCOL_ERROR|ERR_CONTENT_LENGTH_MISMATCH|ERR_INCOMPLETE_CHUNKED_ENCODING/i.test(
              failure.errorText,
            ))
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
        msg.includes('webpack-hmr') ||
        (IS_DEV_E2E &&
          (msg.includes('ChunkLoadError') ||
            msg.includes('Failed to load chunk') ||
            msg.includes('Module factory not available')))
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
