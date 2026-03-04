import { test as base, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export * from './socket-mocks';

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

export const MOCK_OBJECT_ID = '507f191e810c19729de860ea';

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

  // Wait for hydration - theme provider sets these attributes in useEffect
  // This is a reliable way to ensure React has finished mounting and effects have run.
  await expect(page.locator('html'))
    .toHaveAttribute('data-theme-preference', /.*/, { timeout: 15000 })
    .catch(() => {
      // Fallback if the attribute is not set, just wait a bit more
      return page.waitForTimeout(2000);
    });
}

export interface WaitForRoomReadyOptions {
  autoCloseRules?: boolean;
}

export async function waitForRoomReady(
  page: Page,
  options: WaitForRoomReadyOptions = {},
): Promise<void> {
  const { autoCloseRules = true } = options;

  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});

  await expect(page.locator('main')).toBeVisible({ timeout: 60000 });

  await expect(page.locator('body')).not.toContainText(
    /Game is loading|Joining\.\.\.|Server is waking up\.\.\.|Loading room\.\.\.|Loading game\.\.\.|Loading\.\.\./i,
    { timeout: 60000 },
  );

  await page.waitForTimeout(1000);

  if (autoCloseRules) {
    await closeGameRulesModal(page);
  }
}

export async function mockSession(page: Page): Promise<void> {
  const snapshot = {
    provider: 'local',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    tokenType: 'Bearer',
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    refreshTokenExpiresAt: new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString(),
    updatedAt: new Date().toISOString(),
    userId: MOCK_OBJECT_ID,
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    role: null,
  };

  await page.addInitScript((s) => {
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify({ state: { snapshot: s }, version: 0 }),
    );
  }, snapshot);

  // Mock auth check
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: MOCK_OBJECT_ID,
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
        },
      }),
    });
  });

  // Mock profile
  await page.route('**/profile/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          userId: MOCK_OBJECT_ID,
          email: snapshot.email,
          username: snapshot.username,
          displayName: snapshot.displayName,
          stats: { wins: 10, totalGames: 20 },
        },
      }),
    });
  });
}

/**
 * Mocks additional data required for the settings page to prevent 401 noise
 * and provide necessary context (referrals, blocked users).
 */
export async function mockSettingsExtraData(page: Page): Promise<void> {
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
}

export async function closeGameRulesModal(page: Page): Promise<void> {
  const modalSelector = '[data-testid="rules-modal"]';
  const closeBtnSelector = `${modalSelector} [data-testid="modal-close-button"]`;

  // Check if any rules modal is visible
  const isVisible = await page
    .isVisible(modalSelector, { timeout: 2000 })
    .catch(() => false);
  if (!isVisible) return;

  // 1. Try standard click first
  const closeButtons = page.locator(closeBtnSelector);
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    await closeButtons
      .nth(i)
      .click({ force: true, timeout: 2000 })
      .catch(() => {});
  }

  // 2. Aggressive evaluate-based click
  await page.evaluate((sel) => {
    const btns = document.querySelectorAll(sel);
    btns.forEach((b) => (b as HTMLElement).click());
  }, closeBtnSelector);

  // 3. Final cleanup: manually remove from DOM if still there
  await page.evaluate((sel) => {
    const modals = document.querySelectorAll(sel);
    modals.forEach((m) => m.remove());
  }, modalSelector);

  // Wait for all rules modals to disappear (should be instant now)
  await expect
    .poll(
      async () => {
        return await page.evaluate((sel) => {
          const modals = document.querySelectorAll(sel);
          return (
            modals.length === 0 ||
            Array.from(modals).every((m) => !(m as HTMLElement).isConnected)
          );
        }, modalSelector);
      },
      {
        timeout: 10000,
        message: 'Rules modal did not close within 10 seconds',
      },
    )
    .toBe(true);
}

export const closeRulesModal = closeGameRulesModal;

export async function clickButtonByTestId(
  page: Page,
  testId: string,
): Promise<void> {
  const button = page.getByTestId(testId);
  await expect(button).toBeVisible();
  await button.click({ force: true });
}

export async function clickModalClose(page: Page): Promise<void> {
  // Try specialized close buttons first to avoid ambiguity
  const rulesClose = page
    .locator('[data-testid="rules-modal"] [data-testid="modal-close-button"]')
    .first();
  if (await rulesClose.isVisible()) {
    await rulesClose.click({ force: true, timeout: 5000 });
    return;
  }

  const closeBtn = page.getByTestId('modal-close-button').first();
  await closeBtn.click({ force: true, timeout: 5000 });
}

export interface MockRoomInfoOverrides {
  room?: Record<string, unknown>;
  session?: unknown;
}

// Create a dynamic mock for room info that uses the actual room ID from the request
export async function mockRoomInfo(
  page: Page,
  overrides: MockRoomInfoOverrides = {},
): Promise<void> {
  const { room: r = {}, session = null } = overrides;
  const room = {
    id: '507f191e810c19729de860ea',
    name: 'Test Room',
    gameId: 'critical_v1',
    status: 'lobby',
    members: [
      {
        id: '507f191e810c19729de860ea',
        userId: '507f191e810c19729de860ea',
        displayName: 'Test User',
        isHost: true,
      },
    ],
    ...r,
  };

  // Sync lastSession for socket mocks
  if (session) {
    await page.addInitScript((s) => {
      window._playwrightMocks = window._playwrightMocks || { handlers: {} };
      window._playwrightMocks.lastSession = s;
    }, session);
  }

  // Mock the room info endpoint with dynamic room ID matching
  await page.route('**/games/room-info', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();

    const postData = await route.request().postDataJSON();
    const roomId = postData?.roomId;

    // Use the actual room ID from the request if provided
    const mockRoom = {
      ...room,
      id: roomId || room.id,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room: mockRoom, session }),
    });
  });

  // Mock the create room endpoint
  await page.route('**/games/rooms', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();

    const postData = await route.request().postDataJSON();
    const roomId = postData?.gameId
      ? '507f1f77bcf86cd799439011'
      : MOCK_OBJECT_ID;

    const createdRoom = {
      ...room,
      id: roomId,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room: createdRoom }),
    });
  });
}

export function checkNoBackendErrors() {
  const logPath = path.join(process.cwd(), '../be/backend-e2e-errors.log');
  if (fs.existsSync(logPath)) {
    const errors = fs.readFileSync(logPath, 'utf8');
    if (errors.trim()) {
      fs.writeFileSync(logPath, '');
      throw new Error(`Backend Errors: ${errors}`);
    }
  }
}
