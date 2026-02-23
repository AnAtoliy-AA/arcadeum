import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Sea Battle Single Player Mode', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow starting sea battle with bots and placing ships', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';

    const generateBoard = () =>
      Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    const mockPlacementState = {
      phase: 'placement',
      players: [
        {
          playerId: userId,
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: false,
        },
        {
          playerId: 'bot-1',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
      ],
      playerOrder: [userId, 'bot-1'],
      currentTurnIndex: 0,
      logs: [],
    };

    const mockBattleState = {
      ...mockPlacementState,
      phase: 'battle',
      players: mockPlacementState.players.map((p) => ({
        ...p,
        placementComplete: true,
        shipsRemaining: 10,
      })),
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Test',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'sea_battle_v1' },
      handlers: {
        'seaBattle.session.start': {
          responseEvent: 'games.session.started',
          responseData: {
            session: {
              id: 'session-1',
              status: 'active',
              state: mockPlacementState,
            },
          },
        },
        'seaBattle.session.auto_place': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                ...mockPlacementState,
                players: mockPlacementState.players.map(
                  (p: { playerId: string }) =>
                    p.playerId === userId
                      ? {
                          ...p,
                          placementComplete: false,
                          ships: [
                            { id: 'battleship-1', size: 4 },
                            { id: 'cruiser-1', size: 3 },
                            { id: 'cruiser-2', size: 3 },
                            { id: 'destroyer-1', size: 2 },
                            { id: 'destroyer-2', size: 2 },
                            { id: 'destroyer-3', size: 2 },
                            { id: 'submarine-1', size: 1 },
                            { id: 'submarine-2', size: 1 },
                            { id: 'submarine-3', size: 1 },
                            { id: 'submarine-4', size: 1 },
                          ].map((config, i) => ({
                            ...config,
                            name: 'Ship',
                            cells: [{ row: i, col: 0 }],
                            hits: 0,
                            sunk: false,
                          })),
                        }
                      : p,
                ),
              },
            },
          },
        },
        'seaBattle.session.confirm_placement': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'session-1',
              status: 'active',
              state: mockBattleState,
            },
          },
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    await expect(
      page.getByRole('heading', { name: /Sea Battle/i }),
    ).toBeVisible();

    // Start with bots
    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await closeRulesModal(page);

    // Verify placement phase
    await expect(page.getByText(/place your ships/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Auto place
    const autoPlaceBtn = page
      .getByRole('button', { name: /auto place/i })
      .first();
    await autoPlaceBtn.click();

    // Confirm
    const confirmBtn = page.getByRole('button', { name: /confirm/i }).first();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Verify battle phase
    await expect(page.getByText(/your turn/i).first()).toBeVisible();
  });

  test('should allow attacking in sea battle', async ({ page }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = 'user-1';

    const generateBoard = () =>
      Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    const mockBattleState = {
      phase: 'battle',
      players: [
        {
          playerId: userId,
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
        {
          playerId: 'bot-1',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
      ],
      playerOrder: [userId, 'bot-1'],
      currentTurnIndex: 0,
      logs: [],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        gameId: 'sea_battle_v1',
        status: 'active',
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: mockBattleState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        gameId: 'sea_battle_v1',
        session: {
          id: 'session-1',
          status: 'active',
          state: mockBattleState,
        },
      },
      handlers: {
        'seaBattle.session.attack': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId: '507f1f77bcf86cd799439011',
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                ...mockBattleState,
                currentTurnIndex: 1,
                logs: [
                  {
                    id: '1',
                    type: 'action',
                    message: 'Test User attacked bot-1',
                    createdAt: new Date().toISOString(),
                  },
                ],
              },
            },
          },
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    await expect(page.getByText(/your turn/i).first()).toBeVisible();

    // Attack a cell on the opponent's board (the one with $isClickable=true)
    const cell = page.locator('div[data-row="0"][data-col="0"]').first();
    await expect(cell).toBeVisible();
    await cell.click();

    // Wait for turn change
    await expect(page.locator('body')).toContainText(/Waiting for/i, {
      timeout: 15000,
    });
  });
});
