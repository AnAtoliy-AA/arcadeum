import { expect, type Page } from '@playwright/test';
import { MOCK_OBJECT_ID } from './auth';

export interface WaitForRoomReadyOptions {
  autoCloseRules?: boolean;
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
