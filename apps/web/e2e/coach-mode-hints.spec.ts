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

test.describe('Coach Mode Server and Client Hints', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('displays coach controls in active checkers game and provides hint on demand', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    board[2][1] = { playerId: userId, type: 'man' };
    board[5][0] = { playerId: oppId, type: 'man' };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Checkers Coach Room',
        gameId: 'checkers_v1',
        gameOptions: { ranked: false },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'checkers_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: { ranked: false },
        session: {
          id: 'sess-checkers-1',
          status: 'active',
          state: {
            phase: 'playing',
            options: {
              theme: 'classic',
              mode: 'american',
              forcedCaptures: true,
              backwardCaptures: false,
            },
            board,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                color: 'light',
                alive: true,
                piecesRemaining: 1,
              },
              {
                playerId: oppId,
                color: 'dark',
                alive: true,
                piecesRemaining: 1,
              },
            ],
            winnerId: null,
            isDraw: false,
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const toggle = page.getByTestId('coach-toggle');
    await expect(toggle).toBeVisible();

    const hintButton = page.getByTestId('coach-hint-button');
    await expect(hintButton).toBeVisible();

    await hintButton.click();

    const hintText = page.getByTestId('coach-hint-text');
    await expect(hintText).toBeVisible();
    await expect(hintText).toContainText('Suggested move');

    await toggle.click();
    await expect(hintButton).toBeHidden();
  });
});
