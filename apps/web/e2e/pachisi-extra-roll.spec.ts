import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Pachisi Extra Roll After Six', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('retains player six and bonus roll badge when moving again after rolling six', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Six Bonus Room',
        gameId: 'pachisi_v1',
        gameOptions: {
          variant: 'adventure',
          theme: 'adventure',
          mode: 'standard',
        },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'pachisi_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: {
          variant: 'adventure',
          theme: 'adventure',
          mode: 'standard',
        },
        session: {
          id: 'sess-pachisi-bonus-6',
          status: 'active',
          state: {
            phase: 'roll',
            options: {
              theme: 'adventure',
              variant: 'adventure',
              mode: 'standard',
            },
            seats: { [userId]: 0, [oppId]: 2 },
            tokens: {
              [userId]: [
                { id: 0, progress: 0 },
                { id: 1, progress: -1 },
                { id: 2, progress: -1 },
                { id: 3, progress: -1 },
              ],
              [oppId]: [
                { id: 0, progress: -1 },
                { id: 1, progress: -1 },
                { id: 2, progress: -1 },
                { id: 3, progress: -1 },
              ],
            },
            die: null,
            lastDie: 6,
            lastRollerId: userId,
            consecutiveSixes: 1,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              { playerId: userId, seat: 0, color: 'red', alive: true },
              { playerId: oppId, seat: 2, color: 'yellow', alive: true },
            ],
            winnerId: null,
            winnerIds: [],
            isDraw: false,
            logs: [
              {
                id: 'log-1',
                type: 'action',
                message: 'Player rolled a 2.',
                createdAt: new Date().toISOString(),
                senderId: oppId,
              },
              {
                id: 'log-2',
                type: 'action',
                message: 'Player rolled a 6.',
                createdAt: new Date().toISOString(),
                senderId: userId,
              },
              {
                id: 'log-3',
                type: 'action',
                message: 'Move at (0, 0) Moved token to position 0.',
                createdAt: new Date().toISOString(),
                senderId: userId,
              },
            ],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const badge = page.getByTestId('pachisi-extra-roll-badge');
    await expect(badge).toBeVisible();

    const previousRollHint = page.getByTestId('pachisi-previous-roll-hint');
    await expect(previousRollHint).toBeVisible();
    await expect(previousRollHint).toContainText('6');
    await expect(previousRollHint).not.toContainText('2');

    const rollButton = page.getByTestId('pachisi-roll-button');
    await expect(rollButton).toBeVisible();
  });
});
