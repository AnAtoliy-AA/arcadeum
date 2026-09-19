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

test.describe('Pachisi Multi-Token Stacking and Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('keeps all tokens visible when sharing home lane and track cells', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Stacking Room',
        gameId: 'pachisi_v1',
        gameOptions: {
          variant: 'fantasy',
          theme: 'fantasy',
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
          variant: 'fantasy',
          theme: 'fantasy',
          mode: 'standard',
        },
        session: {
          id: 'sess-pachisi-multi',
          status: 'active',
          state: {
            phase: 'move',
            options: {
              theme: 'fantasy',
              variant: 'fantasy',
              mode: 'standard',
            },
            seats: { [userId]: 0, [oppId]: 2 },
            tokens: {
              [userId]: [
                { id: 0, progress: 52 },
                { id: 1, progress: 52 },
                { id: 2, progress: 5 },
                { id: 3, progress: 5 },
              ],
              [oppId]: [
                { id: 0, progress: -1 },
                { id: 1, progress: -1 },
                { id: 2, progress: -1 },
                { id: 3, progress: -1 },
              ],
            },
            die: 2,
            lastDie: 2,
            lastRollerId: userId,
            consecutiveSixes: 0,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              { playerId: userId, seat: 0, color: 'red', alive: true },
              { playerId: oppId, seat: 2, color: 'yellow', alive: true },
            ],
            winnerId: null,
            winnerIds: [],
            isDraw: false,
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const laneToken0 = page.getByTestId('lane-token-0-1');
    await expect(laneToken0).toBeVisible();

    const laneToken1 = page.getByTestId('lane-token-0-1-1');
    await expect(laneToken1).toBeVisible();

    const trackToken0 = page.getByTestId('token-cell-5-2');
    await expect(trackToken0).toBeVisible();

    const trackToken1 = page.getByTestId('token-cell-5-3');
    await expect(trackToken1).toBeVisible();

    const trackCell = page.getByTestId('cell-5');
    await expect(trackCell).toContainText('2');
  });
});
