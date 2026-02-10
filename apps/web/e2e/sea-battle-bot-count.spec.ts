import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
} from './fixtures/test-utils';

test.describe('Sea Battle Bot Count Selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting 4 bots in Sea Battle and starting game', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ea';
    const userId = 'user-1';

    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      if (route.request().resourceType() === 'document')
        return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: roomId,
            name: 'Sea Battle Bot Test',
            gameId: 'sea_battle_v1',
            status: 'lobby',
            playerCount: 1,
            maxPlayers: 5,
            hostId: userId,
            members: [
              { id: userId, userId, displayName: 'Test User', isHost: true },
            ],
          },
        }),
      });
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    // Mock socket to handle join and start
    await page.evaluate(
      ({ roomId, userId }) => {
        const pollSocket = setInterval(() => {
          interface MockSocket {
            emit: (event: string, payload: unknown) => void;
            listeners: (event: string) => ((payload: unknown) => void)[];
          }
          const socket = (window as unknown as { gameSocket: MockSocket })
            .gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.room.joined',
                  )) {
                    listener({
                      success: true,
                      room: {
                        id: roomId,
                        status: 'lobby',
                        gameId: 'sea_battle_v1',
                        hostId: userId,
                        playerCount: 1,
                        members: [
                          {
                            id: userId,
                            userId,
                            displayName: 'Test User',
                            isHost: true,
                          },
                        ],
                      },
                      session: null,
                    });
                  }
                }, 100);
                return;
              }
              if (event === 'seaBattle.session.start') {
                (
                  window as unknown as { __lastStartPayload: unknown }
                ).__lastStartPayload = payload;
              }
              originalEmit(event, payload);
            };
          }
        }, 100);
      },
      { roomId, userId },
    );

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
