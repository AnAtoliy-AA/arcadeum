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

test.describe('Rematch & Play Again Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('handles rematch invitation and navigation to new room', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const rematchRoomId = '507f191e810c19729de860ee';
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await page.route(
      `**/api/games/history/${roomId}/rematch`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ room: rematchRoomId }),
        });
      },
    );

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'TicTacToe Showdown',
        gameId: 'tic-tac-toe_v1',
        status: 'completed',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'tic-tac-toe_v1',
      roomJoinedPayload: {
        status: 'completed',
        session: {
          id: 'sess-ttt-end',
          status: 'completed',
          state: {
            phase: 'finished',
            grid: ['X', 'O', 'X', 'O', 'X', 'O', 'X', null, null],
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              { playerId: userId, symbol: 'X', alive: true },
              { playerId: oppId, symbol: 'O', alive: true },
            ],
            winnerId: userId,
            gameResult: {
              winnerIds: [userId],
              isDraw: false,
            },
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const rematchButton = page.locator('[data-testid="rematch-button"]');
    await expect(rematchButton).toBeVisible();

    await rematchButton.click();

    await expect.poll(() => page.url()).toContain(rematchRoomId);
  });
});
