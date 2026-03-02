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
  clickButtonByTestId,
} from './fixtures/test-utils';

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
      },
    });

    // Mock socket to handle join and start
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'critical_v1', maxPlayers: 5 },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await page.waitForFunction(() => window.gameSocket);
    await page.evaluate(() => {
      const socket = window.gameSocket;
      if (!socket) return;
      const originalEmit = socket.emit.bind(socket);
      socket.emit = (event: string, ...args: unknown[]) => {
        if (event === 'games.session.start') {
          (
            window as unknown as { __lastStartPayload: unknown }
          ).__lastStartPayload = args[0];
        }
        return originalEmit(event, ...args);
      };
    });

    await expect(page.getByText(/Number of bots/i)).toBeVisible({
      timeout: 15000,
    });

    // Select 3 bots
    const botButton3 = page.getByTestId('bot-count-3');
    await expect(botButton3).toBeVisible({ timeout: 10000 });
    await clickButtonByTestId(page, 'bot-count-3');

    // Start button should update label
    const startBtn = page.getByRole('button', { name: /Start with 3 🤖/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

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
