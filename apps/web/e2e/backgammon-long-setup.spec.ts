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

test.describe('Backgammon Long Setup', () => {
  test('sets up players in opposite corners for long backgammon mode', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const oppId = '507f191e810c19729de860eb';

    await mockSession(page);

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Long Backgammon Room',
        gameId: 'backgammon_v1',
        gameOptions: { mode: 'long' },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: { mode: 'long' },
        session: {
          id: 'sess-long-1',
          status: 'active',
          state: {
            phase: 'roll',
            options: { mode: 'long' },
            points: Array.from({ length: 24 }, (_, i) => {
              if (i === 23) return { playerId: userId, count: 15 };
              if (i === 11) return { playerId: oppId, count: 15 };
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
                bar: 0,
                borneOff: 0,
                pipCount: 360,
                alive: true,
              },
              {
                playerId: oppId,
                color: 'black',
                bar: 0,
                borneOff: 0,
                pipCount: 360,
                alive: true,
              },
            ],
            winnerId: null,
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const board = page.locator('[data-testid="backgammon-board"]');
    await expect(board).toBeVisible();

    const p0Point = page.locator('[data-testid="point-23"]');
    await expect(p0Point).toBeVisible();
    await expect(
      p0Point.locator('.backgammon-checker-p0').first(),
    ).toBeVisible();

    const p1Point = page.locator('[data-testid="point-11"]');
    await expect(p1Point).toBeVisible();
    await expect(
      p1Point.locator('.backgammon-checker-p1').first(),
    ).toBeVisible();

    const emptyCornerPoint = page.locator('[data-testid="point-0"]');
    await expect(emptyCornerPoint).toBeVisible();
    await expect(
      emptyCornerPoint.locator('.backgammon-checker-p1'),
    ).toHaveCount(0);
  });

  test('keeps opposite corner setup unflipped when viewed by player 2', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const p1Id = '507f191e810c19729de860ea';
    const p2Id = '507f191e810c19729de860eb';

    await mockSession(page, { userId: p2Id });

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Long Backgammon Room P2',
        gameId: 'backgammon_v1',
        gameOptions: { mode: 'long' },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, p2Id, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: { mode: 'long' },
        session: {
          id: 'sess-long-2',
          status: 'active',
          state: {
            phase: 'move',
            options: { mode: 'long' },
            points: Array.from({ length: 24 }, (_, i) => {
              if (i === 23) return { playerId: p1Id, count: 15 };
              if (i === 11) return { playerId: p2Id, count: 15 };
              return { playerId: null, count: 0 };
            }),
            bar: { [p1Id]: 0, [p2Id]: 0 },
            borneOff: { [p1Id]: 0, [p2Id]: 0 },
            dice: [2],
            rolledDice: [2, 0],
            currentTurnIndex: 1,
            playerOrder: [p1Id, p2Id],
            players: [
              {
                playerId: p1Id,
                color: 'white',
                bar: 0,
                borneOff: 0,
                pipCount: 360,
                alive: true,
              },
              {
                playerId: p2Id,
                color: 'black',
                bar: 0,
                borneOff: 0,
                pipCount: 360,
                alive: true,
              },
            ],
            winnerId: null,
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const board = page.locator('[data-testid="backgammon-board"]');
    await expect(board).toBeVisible();

    const p0Point = page.locator('[data-testid="point-23"]');
    await expect(p0Point).toBeVisible();
    await expect(
      p0Point.locator('.backgammon-checker-p0').first(),
    ).toBeVisible();

    const p2Point = page.locator('[data-testid="point-11"]');
    await expect(p2Point).toBeVisible();
    await expect(
      p2Point.locator('.backgammon-checker-p1').first(),
    ).toBeVisible();

    await p2Point.click();
    const targetPoint = page.locator('[data-testid="point-9"]');
    await expect(targetPoint).toBeVisible();
    await expect(targetPoint.locator('text=+2')).toBeVisible();
  });
});
