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

test.describe('Pachisi Gameplay Styles, Fullscreen and Dice', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders pachisi board with scoped styling and roll button on roll turn', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Cyberpunk Room',
        gameId: 'pachisi_v1',
        gameOptions: {
          variant: 'cyberpunk',
          theme: 'cyberpunk',
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
          variant: 'cyberpunk',
          theme: 'cyberpunk',
          mode: 'standard',
        },
        session: {
          id: 'sess-pachisi-1',
          status: 'active',
          state: {
            phase: 'roll',
            options: {
              theme: 'cyberpunk',
              variant: 'cyberpunk',
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
            die: null,
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
    await expect(board).toHaveClass(/pachisi-board/);

    const rollBtn = page.getByTestId('pachisi-roll-button');
    await expect(rollBtn).toBeVisible();

    const emptyDie = page.getByTestId('pachisi-die');
    await expect(emptyDie).toHaveCount(0);

    const fullscreenBtn = page.getByTestId('widget-fullscreen-button');
    await expect(fullscreenBtn).toBeVisible();
    await fullscreenBtn.click();

    await expect(board).toBeVisible();
    await fullscreenBtn.click();
  });

  test('displays die during move and highlights movable yard tokens on rolling 6', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Move Room',
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
          id: 'sess-pachisi-2',
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
            die: 6,
            consecutiveSixes: 1,
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

    const die = page.getByTestId('pachisi-die');
    await expect(die).toBeVisible();

    const yardToken = page.getByTestId('yard-token-0-0');
    await expect(yardToken).toBeVisible();
    await expect(yardToken).toHaveClass(/animate-bounce/);
  });
});
