import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Sea Battle Bot Count Selection', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting 4 bots in Sea Battle and starting game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Bot Test',
        gameId: 'sea_battle_v1',
        maxPlayers: 5,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    // Mock socket to handle join and start
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'sea_battle_v1', maxPlayers: 5 },
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
            if (event === 'seaBattle.session.start') {
              (
                window as unknown as { __lastStartPayload: unknown }
              ).__lastStartPayload = payload;
            }
            originalEmit(event, payload);
          };
        }
      }, 100);
    });

    // Wait for the lobby to load
    await expect(page.getByText('Number of bots')).toBeVisible();

    // Select 4 bots
    const botButton4 = page.getByRole('button', { name: '4', exact: true });
    await expect(botButton4).toBeVisible();
    await botButton4.click();

    // Start button should update label
    const startBtn = page.getByRole('button', { name: /Start with 4 🤖/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await closeRulesModal(page);

    // Verify payload
    const lastPayload = await page.evaluate(
      () =>
        (window as unknown as { __lastStartPayload: unknown })
          .__lastStartPayload,
    );
    expect(lastPayload).toMatchObject({
      withBots: true,
      botCount: 4,
    });
  });
});
