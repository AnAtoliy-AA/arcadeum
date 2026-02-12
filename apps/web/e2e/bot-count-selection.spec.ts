import { test, expect } from '@playwright/test';
import { mockSession, navigateTo } from './fixtures/test-utils';

test.describe('Bot Count Selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting bot count and starting game', async ({
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
            name: 'Bot Count Test',
            gameId: 'critical_v1',
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
                        gameId: 'critical_v1',
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
              if (event === 'games.session.start') {
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
