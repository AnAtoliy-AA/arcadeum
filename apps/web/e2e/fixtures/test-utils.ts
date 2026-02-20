import { expect, type Page } from '@playwright/test';

/**
 * Shared test utilities for e2e tests
 */

/**
 * Wait for page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('load');
}

/**
 * Check if an element is visible on the page
 */
export async function isElementVisible(
  page: Page,
  selector: string,
): Promise<boolean> {
  const element = page.locator(selector);
  return element.isVisible();
}

/**
 * Navigate and wait for load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Assert page title contains text
 */
export async function assertTitleContains(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
}

/**
 * Assert element with text is visible
 */
export async function assertTextVisible(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page.getByText(text, { exact: false })).toBeVisible();
}

/**
 * Get all links from the page
 */
export async function getPageLinks(
  page: Page,
): Promise<{ href: string; text: string }[]> {
  const links = await page.locator('a[href]').all();
  const results: { href: string; text: string }[] = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (href) {
      results.push({ href, text: text?.trim() || '' });
    }
  }

  return results;
}
/**
 * Mock a logged-in session in localStorage
 */
export async function mockSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const mockSnapshot = {
      state: {
        snapshot: {
          provider: 'local',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          tokenType: 'Bearer',
          accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          role: 'user',
        },
      },
      version: 0,
    };
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify(mockSnapshot),
    );
  });
}

/**
 * Close Sea Battle rules modal if it's visible.
 * This is useful to clear the screen for interaction in E2E tests.
 */
export async function closeRulesModal(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: '×' });
  try {
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click({ force: true });
    await closeButton.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // Modal might not have appeared or already closed
  }
}

/**
 * Mock room info response for POST /games/room-info
 */
export async function mockRoomInfo(
  page: Page,
  overrides: {
    room?: Record<string, unknown>;
    session?: Record<string, unknown> | null;
  } = {},
): Promise<void> {
  const { room: roomOverrides = {}, session = null } = overrides;

  const defaultRoom = {
    id: 'test-room',
    name: 'Test Room',
    gameId: 'critical_v1',
    status: 'lobby',
    playerCount: 1,
    maxPlayers: 4,
    hostId: 'user-1',
    members: [
      {
        id: 'user-1',
        userId: 'user-1',
        displayName: 'Test User',
        isHost: true,
      },
    ],
  };

  const room = { ...defaultRoom, ...roomOverrides };

  await page.route('**/games/room-info', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room, session }),
    });
  });
}
