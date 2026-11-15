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

test.describe('First Move Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders first move badge when match begins', async ({ page }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Checkers Duel',
        gameId: 'checkers_v1',
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'checkers_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'sess-checkers-start',
          status: 'active',
          state: {
            phase: 'playing',
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                color: 'light',
                piecesRemaining: 12,
                alive: true,
              },
              {
                playerId: oppId,
                color: 'dark',
                piecesRemaining: 12,
                alive: true,
              },
            ],
            winnerId: null,
            isDraw: false,
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const turnBadge = page.locator('[data-testid="turn-indicator-label"]');
    await expect(turnBadge).toBeVisible();
  });
});
