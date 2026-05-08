import { expect, type Page } from '@playwright/test';
import { MOCK_OBJECT_ID } from './auth';
import { handleRoute } from './network';

export interface WaitForRoomReadyOptions {
  autoCloseRules?: boolean;
}

export async function closeGameRulesModal(page: Page): Promise<void> {
  const modalSelector = '[data-testid="rules-modal"]';
  const closeBtnSelector = `${modalSelector} [data-testid="modal-close-button"]`;

  // 1. Wait for modal to be visible or return if it's not there
  try {
    await page.waitForSelector(modalSelector, {
      state: 'visible',
      timeout: 2000,
    });
  } catch (_e) {
    // Modal not visible, nothing to close
    return;
  }

  // 2. Click the close button
  const closeButton = page.locator(closeBtnSelector).first();
  if (await closeButton.isVisible()) {
    // Standard click first, it should trigger React state change
    await closeButton.click({ timeout: 5000 }).catch(async () => {
      // Fallback to force click if intercepted
      await closeButton.click({ force: true, timeout: 5000 }).catch(() => {});
    });
  }

  // 3. Wait for the modal to actually disappear from the DOM naturally.
  // On flaky touch-device emulators (e.g. Tablet Safari) the close click
  // sometimes doesn't propagate; we still want the safety net below to run
  // instead of throwing here.
  await page
    .locator(modalSelector)
    .waitFor({ state: 'hidden', timeout: 10000 })
    .catch(() => {});

  // 4. Final check: if it's STILL in the DOM (e.g. detached or ghost), then and only then remove it
  // But we prefer waiting for React to do its job first to avoid re-render loops.
  const stillExists = await page.evaluate((sel) => {
    return !!document.querySelector(sel);
  }, modalSelector);

  if (stillExists) {
    await page.evaluate((sel) => {
      const modals = document.querySelectorAll(sel);
      modals.forEach((m) => m.remove());
      const overlays = document.querySelectorAll(
        '[data-testid="modal-overlay"]',
      );
      overlays.forEach((o) => o.remove());
    }, modalSelector);
  }
}

export async function waitForRoomReady(
  page: Page,
  options: WaitForRoomReadyOptions = {},
): Promise<void> {
  const { autoCloseRules = true } = options;

  // We removed networkidle here as it hangs intermittently due to active socket mocks.
  // The visibility check for .games-room-container below is a more reliable ready-signal.

  // Wait for the game room container to be visible (the .games-room-container
  // class is only applied in the fully-loaded state of GameRoomPage).
  await expect(page.locator('.games-room-container')).toBeVisible({});

  await expect(page.locator('body')).not.toContainText(
    /Joining\.\.\.|Server is waking up\.\.\.|Loading room\.\.\.|Loading game\.\.\.|Loading\.\.\./i,
    {},
  );

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
  await button.click();
}

export async function clickModalClose(page: Page): Promise<void> {
  // Try specialized close buttons first to avoid ambiguity
  const rulesClose = page
    .locator('[data-testid="rules-modal"] [data-testid="modal-close-button"]')
    .first();
  if (await rulesClose.isVisible()) {
    await rulesClose.click({ force: true });
    return;
  }

  const closeBtn = page.getByTestId('modal-close-button').first();
  await closeBtn.click({ force: true });
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
    playerCount: r.members ? (r.members as unknown[]).length : 1,
    ...r,
  };

  // Sync lastSession and room state for socket mocks
  await page.addInitScript(
    ({ room, session }) => {
      window._playwrightMocks = window._playwrightMocks || { handlers: {} };
      if (session) window._playwrightMocks.lastSession = session;
      window._playwrightMocks.roomJoinedPayload = {
        ...(window._playwrightMocks.roomJoinedPayload as object),
        ...room,
      };
    },
    { room, session },
  );

  // Also update dynamic state if page is already loaded
  await page
    .evaluate(
      ({ room, session }) => {
        if (window._playwrightMocks) {
          if (session) window._playwrightMocks.lastSession = session;
          window._playwrightMocks.roomJoinedPayload = {
            ...(window._playwrightMocks.roomJoinedPayload as object),
            ...room,
          };
        }
      },
      { room, session },
    )
    .catch(() => {});

  // Mock the room info endpoint with dynamic room ID matching
  await page.route('**/games/room-info', async (route) => {
    const method = route.request().method();
    if (method !== 'POST' && method !== 'OPTIONS') return route.continue();

    if (method === 'OPTIONS') {
      await handleRoute(route, null);
      return;
    }

    const postData = await route.request().postDataJSON();
    const roomId = postData?.roomId;

    // Use the actual room ID from the request if provided
    const mockRoom = {
      ...room,
      id: roomId || room.id,
    };

    await handleRoute(route, { room: mockRoom, session });
  });

  // Mock the create room endpoint
  await page.route('**/games/rooms', async (route) => {
    const method = route.request().method();
    if (method !== 'POST' && method !== 'OPTIONS') return route.continue();

    if (method === 'OPTIONS') {
      await handleRoute(route, null);
      return;
    }

    const postData = await route.request().postDataJSON();
    const roomId = postData?.gameId
      ? '507f1f77bcf86cd799439011'
      : MOCK_OBJECT_ID;

    const createdRoom = {
      ...room,
      id: roomId,
    };

    await handleRoute(route, { room: createdRoom });
  });
}
