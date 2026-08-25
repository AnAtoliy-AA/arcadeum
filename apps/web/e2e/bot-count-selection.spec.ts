import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
  waitForRoomReady,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Bot Count Selection', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting bot count and starting game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Bot Count Test',
        maxPlayers: 5,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
        playerCount: 1,
      },
    });

    // Mock socket to handle join and start
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'critical_v1', maxPlayers: 5 },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await page.waitForFunction(() => window.gameSocket);
    await page.evaluate(() => {
      const socket = window.gameSocket;
      if (!socket) return;
      const originalEmit = socket.emit.bind(socket);
      socket.emit = (event: string, payload?: unknown) => {
        if (event === 'games.session.start') {
          (
            window as unknown as { __lastStartPayload: unknown }
          ).__lastStartPayload = payload;
        }
        return originalEmit(event, payload);
      };
    });

    await expect(page.getByText(/Number of bots/i)).toBeVisible({});

    // Select 3 bots — use direct DOM click to avoid the sticky start
    // button (position: fixed; z-index: 150) intercepting the Playwright
    // click event at these coordinates.
    const botButton3 = page.getByTestId('bot-count-3');
    await expect(botButton3).toBeVisible({});
    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="bot-count-3"]',
      ) as HTMLElement | null;
      btn?.click();
    });

    // Start button should update label
    const startBtn = page.getByTestId('start-with-bots-button');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText(/3/);
    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="start-with-bots-button"]',
      ) as HTMLElement | null;
      btn?.click();
    });

    // Verify payload
    const lastPayload = await page.evaluate(
      () =>
        (window as unknown as { __lastStartPayload: unknown })
          .__lastStartPayload,
    );
    expect(lastPayload).toMatchObject({
      withBots: true,
      botCount: 3,
    });
  });
});
