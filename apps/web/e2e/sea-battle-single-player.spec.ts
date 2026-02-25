import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';

test.describe('Sea Battle Single Player Mode', () => {
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

    // Set up room info mock BEFORE navigating to the page
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Test',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
        status: 'waiting',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        gameId: 'sea_battle_v1',
        room: {
          id: roomId,
          name: 'Sea Battle Test',
          gameId: 'sea_battle_v1',
          gameOptions: { variant: 'classic' },
          status: 'waiting',
          hostId: userId,
          members: [
            { id: userId, userId, displayName: 'Test User', isHost: true },
          ],
        },
      },
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
    await waitForRoomReady(page);
    await closeRulesModal(page);

    await expect(
      page.getByRole('heading', { name: /Sea Battle/i }),
    ).toBeVisible({ timeout: 15000 });

    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();
    await closeRulesModal(page);

    // Increased timeout for placement phase
    await expect(page.getByText(/place your ships/i).first()).toBeVisible({
      timeout: 20000,
    });

    // More flexible auto place button selection
    const autoPlaceBtn = page
      .getByRole('button', { name: /auto place/i })
      .or(page.getByText(/auto place/i))
      .first();
    await autoPlaceBtn.click({ timeout: 15000 });

    // More flexible confirm button selection
    const confirmBtn = page
      .getByRole('button', { name: /confirm/i })
      .or(page.getByText(/confirm/i))
      .first();
    await expect(confirmBtn).toBeEnabled({ timeout: 15000 });
    await confirmBtn.click({ timeout: 15000 });

    // Increased timeout for battle phase
    await expect(page.getByText(/your turn/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('should allow attacking in sea battle', async ({ page }) => {
    const roomId = MOCK_OBJECT_ID;
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

    // Set up room info mock BEFORE navigating to the page
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Attack Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
          { id: 'bot-1', userId: 'bot-1', displayName: 'Bot', isHost: false },
        ],
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
        room: {
          id: roomId,
          name: 'Sea Battle Attack Test',
          gameId: 'sea_battle_v1',
          status: 'active',
          hostId: userId,
          members: [
            { id: userId, userId, displayName: 'Test User', isHost: true },
            { id: 'bot-1', userId: 'bot-1', displayName: 'Bot', isHost: false },
          ],
        },
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
            roomId: roomId,
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
    await waitForRoomReady(page);
    await closeRulesModal(page);

    // Increased timeout for battle phase
    await expect(page.getByText(/your turn/i).first()).toBeVisible({
      timeout: 20000,
    });

    // More flexible cell selection
    const cell = page
      .locator('div[data-row="0"][data-col="0"]')
      .first()
      .or(page.getByTestId('board-cell-0-0'))
      .first();
    await expect(cell).toBeVisible({ timeout: 15000 });
    await cell.click({ timeout: 15000 });

    // More flexible waiting text
    await expect(page.locator('body')).toContainText(
      /waiting for|opponent's turn/i,
      {
        timeout: 20000,
      },
    );
  });
});
