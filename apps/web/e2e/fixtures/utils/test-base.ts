import { test as base } from '@playwright/test';
import { checkNoBackendErrors } from './backend';
import { isExpectedConsoleNoise } from './console-noise';
import { LIVE_INFO_FIXTURE } from './live-stats';
import { handleRoute } from './network';

// Chunk-load suppression notes:
// Dev (Turbopack) occasionally truncates chunks; CI prod-build on WebKit
// occasionally drops chunks under HTTP/2 too. In both cases navigateTo()
// reloads and the test either recovers (passes) or doesn't (fails on the
// hydration timeout) — so the listener event itself is non-actionable noise
// regardless of build mode. The suppressions below are intentionally
// un-gated.

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
        !text.includes('Unused parameters') &&
        (text.includes('games.') ||
          text.includes('table.') ||
          text.includes('cascade.')) &&
        !text.includes('battlePass.navLabel') &&
        !text.includes('referrals.nav.inviteFriends') &&
        !text.includes('legal.nav.') &&
        !text.includes('notifications.bell.aria') &&
        !text.includes('settings.soundLabel') &&
        !text.includes('settings.musicLabel') &&
        !text.includes('chat.you')
      ) {
        translationWarnings.push(text);
      }

      const isErrorOrWarning = type === 'error' || type === 'warning';
      const isRelevantKeyword =
        text.includes('session') || text.includes('room');
      const isFetchNoise = text.toLowerCase().includes('fetch');

      // ALWAYS capture errors and warnings unless they are explicitly ignored
      if (isErrorOrWarning) {
        if (isExpectedConsoleNoise(page.url(), type, text)) {
          return;
        }

        console.log(`BROWSER [${type}] @ ${page.url()}: ${text}`);
      } else if (isRelevantKeyword && !isFetchNoise) {
        // Log relevant room/session events if they aren't fetch noise
        console.log(`BROWSER [${type}] @ ${page.url()}: ${text}`);
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
          (() => {
            try {
              return new URL(url).hostname === 'accounts.google.com';
            } catch {
              return false;
            }
          })() ||
          url.includes('__nextjs_original-stack-frames') ||
          (url.includes('/_next/static/chunks/') &&
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
          response.url().includes('apple-touch-icon') ||
          response.url().includes('/music/') ||
          // Intentional 404s from not-found specs that request a bogus id.
          response.url().includes('nonexistent-id')
        ) {
          return;
        }
        console.log(`NETWORK [error]: 404 - ${response.url()}`);
      }
    });

    page.on('pageerror', (err) => {
      const msg = err.message;
      const stack = err.stack || '';
      // Inspect the full text we would log — message + stack — because some
      // browsers populate one or the other but not both. Trimming to a bare
      // "Error" indicates an opaque, stripped React render error caught by
      // an error boundary; not actionable.
      const fullText = `${msg}\n${stack}`.trim();
      if (
        msg.includes('__nextjs_original-stack-frames') ||
        msg.includes('The operation was aborted') ||
        msg.includes('AbortError') ||
        msg.includes('webpack-hmr') ||
        // Chunk-load errors: navigateTo() has its own retry that reloads
        // the page when these fire — so by the time we see the listener
        // event, either the retry already recovered (the test will pass)
        // or it didn't (the test will fail on the navigation timeout).
        // Either way the log line itself is noise; un-gated so WebKit's
        // HTTP/2 chunk-truncation flake in CI prod doesn't surface either.
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to load chunk') ||
        msg.includes('Module factory not available') ||
        fullText === 'Error' ||
        fullText === ''
      ) {
        return;
      }

      // Suppress transient access control errors and Fetch failures in pageerror too.
      // These can manifest as Unhandled Rejections in some browser environments.
      const combined = `${msg}\n${stack}`;
      if (
        (combined.includes('due to access control checks') ||
          combined.includes('Fetch API cannot load')) &&
        (combined.includes('localhost:4000') ||
          combined.includes('localhost:4500') ||
          combined.includes('localhost:3000') ||
          combined.includes('127.0.0.1:4000') ||
          combined.includes('127.0.0.1:4500') ||
          combined.includes('127.0.0.1:3000') ||
          combined.includes('localhost:3500') ||
          combined.includes('127.0.0.1:3500'))
      ) {
        return;
      }

      // Same RSC-fetch cancellation pattern as the console handler — WebKit
      // emits this as a pageerror too when the navigation cancels an
      // in-flight RSC fetch. Match on `_rsc=` in either message or stack.
      if (
        (combined.includes('due to access control checks') ||
          combined.includes('Fetch API cannot load')) &&
        /[?&]_rsc=/.test(combined)
      ) {
        return;
      }

      console.log(
        `BROWSER [error] @ ${page.url()}: ${err.message}\n${err.stack || ''}`,
      );
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

    // Mock endpoints called on every authenticated page load to prevent 401 noise.
    // These fire from header widgets (BalanceChip, NotificationBell, ProfileMenu)
    // and session sync before test-specific mocks can be registered.
    await page.route('**/wallet/balance', async (route) => {
      await handleRoute(route, { coins: 1000, gems: 50 });
    });

    await page.route('**/friends/pending', async (route) => {
      await handleRoute(route, { count: 0, incoming: [], outgoing: [] });
    });

    await page.route('**/notifications/preferences', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await handleRoute(route, {
          gameInvites: true,
          friendRequests: true,
          chatMessages: false,
          achievements: true,
          dailyRewards: true,
          tournaments: false,
        });
      } else if (method === 'PUT') {
        await handleRoute(route, route.request().postDataJSON() || {});
      } else {
        await route.continue();
      }
    });

    await page.route('**/notifications/unread-count', async (route) => {
      await handleRoute(route, { count: 0 });
    });

    await page.route('**/notifications', async (route) => {
      const url = route.request().url();
      if (url.includes('/unread-count') || url.includes('/preferences')) {
        await route.continue();
        return;
      }
      const method = route.request().method();
      if (method === 'GET') {
        await handleRoute(route, []);
      } else {
        await handleRoute(route, null);
      }
    });

    await page.route('**/shop/catalog', async (route) => {
      await handleRoute(route, []);
    });

    await page.route('**/auth/refresh', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await handleRoute(route, {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/games/live-info', async (route) => {
      await handleRoute(route, LIVE_INFO_FIXTURE);
    });

    await page.route('**/announcements/active', async (route) => {
      await handleRoute(route, null);
    });

    await page.route('**/achievements/check', async (route) => {
      await handleRoute(route, { newlyUnlocked: [] });
    });

    await page.route('**/friends', async (route) => {
      const url = route.request().url();
      if (url.includes('/pending')) {
        await route.continue();
        return;
      }
      const method = route.request().method();
      if (method === 'GET') {
        await handleRoute(route, []);
      } else {
        await handleRoute(route, null);
      }
    });

    await page.route('**/rankings/me', async (route) => {
      await handleRoute(route, {
        rank: 42,
        score: 1000,
        userId: '507f191e810c19729de860ea',
        displayName: 'Test User',
      });
    });

    await page.route('**/games/stats', async (route) => {
      await handleRoute(route, { totalGames: 0, wins: 0, losses: 0 });
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

    // Mock R2 CDN requests to avoid external network noise in E2E
    await page.route('**/*.r2.dev/**', (route) =>
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
