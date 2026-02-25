import { test as base, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export * from './socket-mocks';

export const test = base.extend({
  page: async ({ page }, run) => {
    const translationWarnings: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('[Translation]')) {
        translationWarnings.push(text);
      }
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

    await page.route('**/referrals/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, count: 0, points: 0 }),
      });
    });

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
  await page.goto(path);
  await page.waitForLoadState('load');
}

export interface WaitForRoomReadyOptions {
  autoCloseRules?: boolean;
}

export async function waitForRoomReady(
  page: Page,
  options: WaitForRoomReadyOptions = {},
): Promise<void> {
  const { autoCloseRules = true } = options;

  await expect(page.locator('body')).not.toContainText(
    /Game is loading|Joining...|Server is waking up...|Loading room.../i,
    { timeout: 60000 },
  );
  await expect(page.locator('main')).toBeVisible({ timeout: 60000 });

  // Safety wait for any transitions to settle
  await page.waitForTimeout(1000);

  if (autoCloseRules) {
    // Proactively close Rules Modal if it appears automatically
    await closeRulesModal(page);
  }
}

export async function mockSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
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
      userId: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      role: null,
    };
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify({ state: { snapshot }, version: 0 }),
    );
  });
}

export async function closeRulesModal(page: Page): Promise<void> {
  const modal = page.getByTestId('rules-modal');
  const closeButton = modal.locator('button').filter({ hasText: '×' }).first();

  try {
    // Wait up to 5s if it appears
    if (await modal.isVisible({ timeout: 5000 })) {
      // Try close button first
      if (await closeButton.isVisible()) {
        await closeButton.click({ force: true });
      } else {
        // Click overlay as fallback
        await modal.click({ position: { x: 1, y: 1 }, force: true });
      }

      // Force hide via evaluate if still visible after 2s
      // This is a last resort for WebKit click issues
      await page.waitForTimeout(1000);
      if (await modal.isVisible()) {
        await modal.evaluate((el) => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.pointerEvents = 'none';
        });
      }

      // Wait for it to be TRULY gone from the DOM or hidden
      await expect(modal).not.toBeVisible({ timeout: 5000 });
      // Safety wait for backdrop fade out
      await page.waitForTimeout(500);
    }
  } catch (_e) {
    // If it didn't appear or failed to close, we log but continue
  }
}

export interface MockRoomInfoOverrides {
  room?: Record<string, unknown>;
  session?: unknown;
}

export async function mockRoomInfo(
  page: Page,
  overrides: MockRoomInfoOverrides = {},
): Promise<void> {
  const { room: r = {}, session = null } = overrides;
  const room = {
    id: MOCK_OBJECT_ID,
    name: 'Test Room',
    gameId: 'critical_v1',
    status: 'lobby',
    members: [
      {
        id: 'user-1',
        userId: 'user-1',
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

  await page.route('**/games/room-info', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room, session }),
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
