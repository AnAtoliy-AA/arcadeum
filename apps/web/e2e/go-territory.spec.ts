import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  mockGameSocket,
  handleRoute,
} from './fixtures/test-utils';

const MOCK_ROOM_ID = '507f1f77bcf86cd799439099';
const USER_BLACK_ID = '507f191e810c19729de860ea';
const USER_WHITE_ID = '507f1f77bcf86cd799439012';

function createBoardWithEnclosedTerritory(size: number) {
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  board[0][1] = 'black';
  board[1][0] = 'black';
  return board;
}

function createGoSessionState(currentTurnIndex: number) {
  return {
    phase: 'playing',
    options: {
      theme: 'adventure',
      boardSize: 9,
    },
    boardSize: 9,
    board: createBoardWithEnclosedTerritory(9),
    players: [
      { playerId: USER_BLACK_ID, color: 'black', alive: true },
      { playerId: USER_WHITE_ID, color: 'white', alive: true },
    ],
    captures: { black: 0, white: 0 },
    consecutivePasses: 0,
    koPoint: null,
    lastMove: { row: 1, col: 0 },
    playerOrder: [USER_BLACK_ID, USER_WHITE_ID],
    currentTurnIndex,
    winnerId: null,
    isDraw: false,
    scores: null,
    logs: [],
  };
}

test.describe('Go Territory Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page, {
      id: USER_BLACK_ID,
      email: 'black@arcadeum.games',
      displayName: 'Black Master',
    });

    await page.route('**/games/rooms/join', async (route) => {
      await handleRoute(route, { roomId: MOCK_ROOM_ID });
    });

    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      return handleRoute(route, {});
    });
  });

  test('keeps territory toggle visible on player turn and displays enclosed territory', async ({
    page,
  }) => {
    await mockRoomInfo(page, {
      room: {
        id: MOCK_ROOM_ID,
        gameId: 'go_v1',
        name: 'Go Territory Match',
        status: 'playing',
        playerCount: 2,
        maxPlayers: 2,
      },
    });

    await mockGameSocket(page, MOCK_ROOM_ID, USER_BLACK_ID, {
      gameId: 'go_v1',
      roomJoinedPayload: {
        id: MOCK_ROOM_ID,
        gameId: 'go_v1',
        status: 'playing',
        members: [
          {
            id: USER_BLACK_ID,
            userId: USER_BLACK_ID,
            displayName: 'Black Master',
            isHost: true,
          },
          {
            id: USER_WHITE_ID,
            userId: USER_WHITE_ID,
            displayName: 'White Opponent',
            isHost: false,
          },
        ],
        session: {
          id: 'session-go-1',
          roomId: MOCK_ROOM_ID,
          gameId: 'go_v1',
          status: 'playing',
          state: createGoSessionState(0),
        },
      },
    });

    await navigateTo(page, `/rooms/${MOCK_ROOM_ID}`);

    const territoryBtn = page.getByTestId('go-territory-toggle');
    await expect(territoryBtn).toBeVisible();

    const cornerCell = page.getByTestId('go-cell-0-0');
    await expect(cornerCell).toBeVisible();
    await expect(
      cornerCell.locator('[data-testid="go-territory-black"]'),
    ).toHaveCount(0);

    await territoryBtn.click();
    await expect(
      cornerCell.locator('[data-testid="go-territory-black"]'),
    ).toBeVisible();

    await territoryBtn.click();
    await expect(
      cornerCell.locator('[data-testid="go-territory-black"]'),
    ).toHaveCount(0);
  });

  test('keeps territory toggle visible and operable even when it is opponent turn', async ({
    page,
  }) => {
    await mockRoomInfo(page, {
      room: {
        id: MOCK_ROOM_ID,
        gameId: 'go_v1',
        name: 'Go Territory Match',
        status: 'playing',
        playerCount: 2,
        maxPlayers: 2,
      },
    });

    await mockGameSocket(page, MOCK_ROOM_ID, USER_BLACK_ID, {
      gameId: 'go_v1',
      roomJoinedPayload: {
        id: MOCK_ROOM_ID,
        gameId: 'go_v1',
        status: 'playing',
        members: [
          {
            id: USER_BLACK_ID,
            userId: USER_BLACK_ID,
            displayName: 'Black Master',
            isHost: true,
          },
          {
            id: USER_WHITE_ID,
            userId: USER_WHITE_ID,
            displayName: 'White Opponent',
            isHost: false,
          },
        ],
        session: {
          id: 'session-go-2',
          roomId: MOCK_ROOM_ID,
          gameId: 'go_v1',
          status: 'playing',
          state: createGoSessionState(1),
        },
      },
    });

    await navigateTo(page, `/rooms/${MOCK_ROOM_ID}`);

    const passBtn = page.getByTestId('go-pass-button');
    await expect(passBtn).toHaveCount(0);

    const territoryBtn = page.getByTestId('go-territory-toggle');
    await expect(territoryBtn).toBeVisible();

    const cornerCell = page.getByTestId('go-cell-0-0');
    await expect(
      cornerCell.locator('[data-testid="go-territory-black"]'),
    ).toHaveCount(0);

    await territoryBtn.click();
    await expect(
      cornerCell.locator('[data-testid="go-territory-black"]'),
    ).toBeVisible();
  });
});
