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

test.describe('Backgammon Gameplay Styles and Themes', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders cyberpunk board with correct theme data attribute and board elements', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Backgammon Cyberpunk Room',
        gameId: 'backgammon_v1',
        gameOptions: { variant: 'cyberpunk', theme: 'cyberpunk' },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: { variant: 'cyberpunk', theme: 'cyberpunk' },
        session: {
          id: 'sess-1',
          status: 'active',
          state: {
            phase: 'roll',
            options: { theme: 'cyberpunk', variant: 'cyberpunk' },
            points: Array.from({ length: 24 }, (_, i) => {
              if (i === 23) return { playerId: userId, count: 2 };
              if (i === 0) return { playerId: oppId, count: 2 };
              return { playerId: null, count: 0 };
            }),
            bar: { [userId]: 0, [oppId]: 0 },
            borneOff: { [userId]: 0, [oppId]: 0 },
            dice: [],
            rolledDice: null,
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                color: 'white',
                alive: true,
                bar: 0,
                borneOff: 0,
                pipCount: 46,
              },
              {
                playerId: oppId,
                color: 'black',
                alive: true,
                bar: 0,
                borneOff: 0,
                pipCount: 46,
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

    const board = page.getByTestId('backgammon-board');
    await expect(board).toBeVisible();
    await expect(board).toHaveAttribute('data-theme', 'cyberpunk');
    await expect(board).toHaveClass(/backgammon-board/);

    const rollBtn = page.getByTestId('roll-dice-btn');
    await expect(rollBtn).toBeVisible();

    const barZone = page.getByTestId('bar-zone');
    await expect(barZone).toBeVisible();

    const bearOffZone = page.getByTestId('bear-off-zone');
    await expect(bearOffZone).toBeVisible();

    const point23 = page.getByTestId('point-23');
    await expect(point23).toBeVisible();
  });

  test('renders board with underwater and western themes', async ({ page }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    for (const themeId of ['underwater', 'western']) {
      await mockRoomInfo(page, {
        room: {
          id: roomId,
          name: `Backgammon ${themeId} Room`,
          gameId: 'backgammon_v1',
          gameOptions: { variant: themeId, theme: themeId },
          status: 'active',
          playerCount: 2,
        },
      });

      await mockGameSocket(page, roomId, userId, {
        gameId: 'backgammon_v1',
        roomJoinedPayload: {
          status: 'active',
          gameOptions: { variant: themeId, theme: themeId },
          session: {
            id: `sess-${themeId}`,
            status: 'active',
            state: {
              phase: 'roll',
              options: { theme: themeId, variant: themeId },
              points: Array.from({ length: 24 }, () => ({
                playerId: null,
                count: 0,
              })),
              bar: { [userId]: 0, [oppId]: 0 },
              borneOff: { [userId]: 0, [oppId]: 0 },
              dice: [],
              rolledDice: null,
              currentTurnIndex: 0,
              playerOrder: [userId, oppId],
              players: [
                {
                  playerId: userId,
                  color: 'white',
                  alive: true,
                  bar: 0,
                  borneOff: 0,
                  pipCount: 0,
                },
                {
                  playerId: oppId,
                  color: 'black',
                  alive: true,
                  bar: 0,
                  borneOff: 0,
                  pipCount: 0,
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

      const board = page.getByTestId('backgammon-board');
      await expect(board).toBeVisible();
      await expect(board).toHaveAttribute('data-theme', themeId);
    }
  });

  test('displays checkers and allows point interaction in move phase', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Backgammon Move Room',
        gameId: 'backgammon_v1',
        gameOptions: { variant: 'fantasy', theme: 'fantasy' },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: { variant: 'fantasy', theme: 'fantasy' },
        session: {
          id: 'sess-move',
          status: 'active',
          state: {
            phase: 'move',
            options: { theme: 'fantasy', variant: 'fantasy' },
            points: Array.from({ length: 24 }, (_, i) => {
              if (i === 23) return { playerId: userId, count: 2 };
              return { playerId: null, count: 0 };
            }),
            bar: { [userId]: 0, [oppId]: 0 },
            borneOff: { [userId]: 0, [oppId]: 0 },
            dice: [3],
            rolledDice: [3, 0],
            currentTurnIndex: 0,
            playerOrder: [userId, oppId],
            players: [
              {
                playerId: userId,
                color: 'white',
                alive: true,
                bar: 0,
                borneOff: 0,
                pipCount: 46,
              },
              {
                playerId: oppId,
                color: 'black',
                alive: true,
                bar: 0,
                borneOff: 0,
                pipCount: 46,
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

    const point23 = page.getByTestId('point-23');
    await expect(point23).toBeVisible();

    await point23.click();

    const point20 = page.getByTestId('point-20');
    await expect(point20).toBeVisible();
    await expect(point20).toContainText('+3');
  });
});
