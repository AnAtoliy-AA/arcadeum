import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
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
    const userId = 'user-1';

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

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Mock socket to handle join and start
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'critical_v1', maxPlayers: 5 },
    });

    await page.evaluate(() => {
      const pollSocket = setInterval(() => {
        const socket = (
          window as unknown as {
            gameSocket: { emit: (event: string, payload: unknown) => void };
          }
        ).gameSocket;
        if (socket) {
          clearInterval(pollSocket);
          const originalEmit = socket.emit.bind(socket);
          socket.emit = (event: string, payload: unknown) => {
            if (event === 'games.session.start') {
              (
                window as unknown as { __lastStartPayload: unknown }
              ).__lastStartPayload = payload;
            }
            originalEmit(event, payload);
          };
        }
      }, 100);
    });

    await expect(page.getByText('Number of bots')).toBeVisible();

    // Select 3 bots
    const botButton3 = page.getByRole('button', { name: '3', exact: true });
    await expect(botButton3).toBeVisible();
    await botButton3.click();

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
