import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
} from './fixtures/test-utils';

test.describe('Sea Battle Ships Left', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should display Ships Left component with correct ship status', async ({
    page,
  }) => {
    const roomId = 'ships-left-test-room';
    const userId = 'user-1';
    const opponentId = 'user-2';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Ships Left Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        playerCount: 2,
        maxPlayers: 2,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Me', isHost: true },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent',
            isHost: false,
          },
        ],
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    // Mock socket/game state
    await page.evaluate(
      ({ roomId, userId, opponentId }) => {
        const emitMockResponse = (listener: (payload: unknown) => void) => {
          listener({
            success: true,
            room: {
              id: roomId,
              status: 'active',
              gameId: 'sea_battle_v1',
              hostId: userId,
              playerCount: 2,
              members: [
                { id: userId, userId, displayName: 'Me', isHost: true },
                {
                  id: opponentId,
                  userId: opponentId,
                  displayName: 'Opponent',
                  isHost: false,
                },
              ],
            },
            session: {
              id: 'session-1',
              roomId,
              status: 'active',
              state: {
                phase: 'battle',
                currentTurnIndex: 0,
                playerOrder: [userId, opponentId],
                players: [
                  {
                    playerId: userId,
                    alive: true,
                    ships: [], // My ships (irrelevant for this test focus on opponent)
                    board: [],
                    shipsRemaining: 10,
                    placementComplete: true,
                  },
                  {
                    playerId: opponentId,
                    alive: true,
                    board: [],
                    shipsRemaining: 9,
                    placementComplete: true,
                    ships: [
                      // Sunk Cruiser
                      {
                        id: 'cruiser-1',
                        name: 'Cruiser',
                        size: 3,
                        cells: [],
                        hits: 3,
                        sunk: true,
                      },
                      // Alive Battleship
                      {
                        id: 'battleship-1',
                        name: 'Battleship',
                        size: 4,
                        cells: [],
                        hits: 0,
                        sunk: false,
                      },
                    ],
                  },
                ],
                logs: [],
              },
            },
          });
        };

        const pollSocket = setInterval(() => {
          interface MockSocket {
            emit: (event: string, payload: unknown) => void;
            listeners: (event: string) => ((payload: unknown) => void)[];
          }
          const socket = (window as unknown as { gameSocket: MockSocket })
            .gameSocket;
          if (socket) {
            clearInterval(pollSocket);

            // Check if listener is already attached (race condition handling)
            const existingListeners = socket.listeners('games.room.joined');
            if (existingListeners && existingListeners.length > 0) {
              emitMockResponse(existingListeners[0]);
              return;
            }

            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                const triggerListener = (attempts = 0) => {
                  if (attempts > 100) {
                    console.error(
                      'No listeners for games.room.joined found after 100 attempts',
                    );
                    return;
                  }
                  const listeners = socket.listeners('games.room.joined');
                  if (listeners && listeners.length > 0) {
                    emitMockResponse(listeners[0]);
                  } else {
                    setTimeout(() => triggerListener(attempts + 1), 50);
                  }
                };
                setTimeout(() => triggerListener(), 50);
                return;
              }
              originalEmit(event, payload);
            };
          }
        }, 50);
      },
      { roomId, userId, opponentId },
    );

    // Wait for game to load
    await expect(page.getByText(/ships left/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Check for "Your Fleet"
    await expect(page.locator('body')).toContainText('Your Fleet');

    // Check for opponent section
    await expect(page.locator('body')).toContainText('Opponent');

    // We expect Ships Left to be present in both
    const shipsLeftSections = page.getByText(/ships left/i);

    // Asserting count 2
    await expect(shipsLeftSections).toHaveCount(2);

    // Verify Sunk Ship Visuals
    // We mocked 'cruiser-1' as sunk for opponent.

    // Strategy: Find the container that has "Opponent" (exact) but NOT "Your Fleet".
    // This isolates the Opponent's PlayerSection from the global container or user section.
    const opponentSection = page
      .locator('div')
      .filter({ has: page.getByText(/^Opponent$/) })
      .filter({ hasNot: page.getByText('Your Fleet') })
      .filter({ has: page.getByText(/ships left/i) }) // Ensure it's the section with ships
      .first();

    await expect(opponentSection).toBeVisible();

    // Within opponent section, find the Cruiser
    const cruiserWrapper = opponentSection
      .locator('div[title="Cruiser"]')
      .first();
    await expect(cruiserWrapper).toBeVisible();

    await expect(cruiserWrapper).toHaveAttribute('data-sunk', 'true');

    const battleshipWrapper = opponentSection
      .locator('div[title="Battleship"]')
      .first();
    await expect(battleshipWrapper).toBeVisible();
    await expect(battleshipWrapper).toHaveAttribute('data-sunk', 'false');
  });
});
