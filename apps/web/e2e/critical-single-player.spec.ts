import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  closeRulesModal,
} from './fixtures/test-utils';

test.describe('Critical Single Player Mode', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow starting single player game with bots', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ea';
    const userId = 'user-1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-1',
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(40).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId, 'bot-1'],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Single Player Test',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    await page.evaluate(
      ({ mockState, roomId, userId }) => {
        const pollSocket = setInterval(() => {
          const socket = (
            window as unknown as {
              gameSocket: {
                emit: (e: string, p: unknown) => void;
                listeners: (e: string) => Array<(d: unknown) => void>;
              };
            }
          ).gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                // Simulate games.room.joined for the client without hitting the server
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
                return; // Don't send to real server
              }
              if (event === 'games.session.start') {
                setTimeout(() => {
                  const sessionData = {
                    session: {
                      id: 'session-1',
                      status: 'active',
                      state: mockState,
                    },
                  };
                  for (const listener of socket.listeners(
                    'games.session.started',
                  )) {
                    listener(sessionData);
                  }
                }, 100);
                return; // Don't send to real server
              }
              originalEmit(event, payload);
            };
          }
        }, 100);
      },
      { mockState, roomId, userId },
    );

    await expect(
      page.getByRole('heading', { name: /Critical/i }),
    ).toBeVisible();

    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await closeRulesModal(page);
    await expect(page.getByText(/your hand/i)).toBeVisible({ timeout: 15000 });
  });

  test('should allow playing a move in single player mode', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = 'user-1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike', 'skip'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-1',
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(40).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId, 'bot-1'],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
      session: { id: 'session-1', status: 'active', state: mockState },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    await page.evaluate(
      ({ roomId, userId, mockState }) => {
        const pollSocket = setInterval(() => {
          const socket = (
            window as unknown as {
              gameSocket: {
                emit: (e: string, p: unknown) => void;
                listeners: (e: string) => Array<(d: unknown) => void>;
              };
            }
          ).gameSocket;
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
                        status: 'active',
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
                      session: {
                        id: 'session-1',
                        status: 'active',
                        state: mockState,
                      },
                    });
                  }
                }, 100);
                return;
              }
              if (event === 'games.session.draw') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.session.drawn',
                  )) {
                    listener({ success: true });
                  }
                }, 800); // 800ms delay to ensure busy state visibility
                return; // Don't send to real server
              }
              originalEmit(event, payload);
            };
          }
        }, 100);
      },
      { roomId, userId, mockState },
    );

    await closeRulesModal(page);
    await expect(page.locator('body')).toContainText(/your turn/i);

    const drawBtn = page.getByRole('button', { name: /draw/i }).first();
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();

    // The button should be disabled and show "Drawing..." while processing
    await expect(drawBtn).toBeDisabled();
    await expect(page.getByText(/drawing/i).first()).toBeVisible();

    // After the mock response (800ms), it should be enabled again
    await expect(drawBtn).toBeEnabled({ timeout: 10000 });
  });
});
