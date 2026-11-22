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

test.describe('Pachisi Layout Stability', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('maintains stable status strip layout without move hints causing screen jump', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Stable Layout Room',
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
          id: 'sess-pachisi-stable',
          status: 'active',
          state: {
            phase: 'move',
            options: {
              theme: 'adventure',
              variant: 'adventure',
              mode: 'standard',
            },
            seats: { [userId]: 0, [oppId]: 2 },
            tokens: {
              [userId]: [
                { id: 0, progress: 5 },
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
            die: 4,
            consecutiveSixes: 0,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                seat: 0,
                color: 'red',
                alive: true,
              },
              {
                playerId: oppId,
                seat: 2,
                color: 'yellow',
                alive: true,
              },
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

    const board = page.getByTestId('pachisi-board');
    await expect(board).toBeVisible();

    const moveHint = page.getByTestId('pachisi-move-hint');
    await expect(moveHint).not.toBeAttached();

    const waitingText = page.getByTestId('pachisi-waiting');
    await expect(waitingText).not.toBeAttached();

    const statusLastRoll = page.getByTestId('pachisi-status-last-roll');
    await expect(statusLastRoll).toBeVisible();
    await expect(statusLastRoll).toContainText('4');
  });

  test('displays auto-pass button and timer indicator when player has no legal moves', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi No Moves Room',
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
          id: 'sess-pachisi-no-moves',
          status: 'active',
          state: {
            phase: 'move',
            options: {
              theme: 'adventure',
              variant: 'adventure',
              mode: 'standard',
            },
            seats: { [userId]: 0, [oppId]: 2 },
            tokens: {
              [userId]: [
                { id: 0, progress: -1 },
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
            die: 3,
            consecutiveSixes: 0,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                seat: 0,
                color: 'red',
                alive: true,
              },
              {
                playerId: oppId,
                seat: 2,
                color: 'yellow',
                alive: true,
              },
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

    const noMovesBanner = page.getByTestId('pachisi-no-moves');
    await expect(noMovesBanner).toBeVisible();

    const passButton = page.getByTestId('pachisi-pass-button');
    await expect(passButton).toBeVisible();

    const autoPassTimer = passButton.locator('.pachisi-auto-pass-timer');
    await expect(autoPassTimer).toBeAttached();
  });
});
