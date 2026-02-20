import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
} from './fixtures/test-utils';

interface MockSocket {
  listeners: (event: string) => Array<(data: unknown) => void>;
  emit: (event: string, payload: unknown) => void;
}

test.describe('Sea Battle Single Player Mode', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow starting sea battle with bots and placing ships', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ea';
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

    await page.addInitScript(
      ({ roomId, userId, mockPlacementState, mockBattleState }) => {
        const emitMockResponse = (
          event: string,
          payload: unknown,
          attempts = 0,
        ) => {
          const socket = (window as unknown as { gameSocket: MockSocket })
            .gameSocket;
          if (attempts > 100 || !socket) return;

          const listeners = socket.listeners(event);
          if (listeners && listeners.length > 0) {
            for (const listener of listeners) {
              listener(payload);
            }
          } else {
            setTimeout(
              () => emitMockResponse(event, payload, attempts + 1),
              50,
            );
          }
        };

        const pollSocket = setInterval(() => {
          const socket = (window as unknown as { gameSocket: MockSocket })
            .gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                emitMockResponse('games.room.joined', {
                  success: true,
                  room: {
                    id: roomId,
                    status: 'lobby',
                    gameId: 'sea_battle_v1',
                    hostId: userId,
                    playerCount: 1,
                    members: [
                      {
                        id: userId,
                        userId,
                        displayName: 'Test User',
                        isHost: true,
                      },
                    ],
                  },
                  session: null,
                });
                return;
              }

              if (event === 'seaBattle.session.start') {
                emitMockResponse('games.session.started', {
                  session: {
                    id: 'session-1',
                    status: 'active',
                    state: mockPlacementState,
                  },
                });
                return;
              }

              if (event === 'seaBattle.session.auto_place') {
                const shipConfigs = [
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
                ];

                const ships = shipConfigs.map((config, i) => ({
                  ...config,
                  name: 'Ship',
                  cells: [{ row: i, col: 0 }],
                  hits: 0,
                  sunk: false,
                }));

                const updatedState = {
                  ...mockPlacementState,
                  players: mockPlacementState.players.map((p) =>
                    p.playerId === userId
                      ? { ...p, placementComplete: false, ships }
                      : p,
                  ),
                };
                emitMockResponse('games.session.snapshot', {
                  roomId,
                  session: { state: updatedState },
                });
                return;
              }

              if (event === 'seaBattle.session.confirm_placement') {
                emitMockResponse('games.session.snapshot', {
                  roomId,
                  session: { state: mockBattleState },
                });
                return;
              }

              originalEmit(event, payload);
            };
          }
        }, 50);
      },
      { roomId, userId, mockPlacementState, mockBattleState },
    );

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

    await page.addInitScript(
      ({ roomId, userId, mockBattleState }) => {
        const emitMockResponse = (
          socket: MockSocket,
          event: string,
          payload: unknown,
          attempts = 0,
        ) => {
          if (attempts > 100) return;
          const listeners = socket.listeners(event);
          if (listeners && listeners.length > 0) {
            for (const listener of listeners) {
              listener(payload);
            }
          } else {
            setTimeout(
              () => emitMockResponse(socket, event, payload, attempts + 1),
              50,
            );
          }
        };

        const pollSocket = setInterval(() => {
          const socket = (window as unknown as { gameSocket: MockSocket })
            .gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                emitMockResponse(socket, 'games.room.joined', {
                  success: true,
                  room: {
                    id: roomId,
                    status: 'active',
                    gameId: 'sea_battle_v1',
                    hostId: userId,
                    playerCount: 1,
                    members: [
                      {
                        id: userId,
                        userId,
                        displayName: 'Test User',
                        isHost: true,
                      },
                    ],
                  },
                  session: {
                    id: 'session-1',
                    status: 'active',
                    state: mockBattleState,
                  },
                });
                return;
              }

              if (event === 'seaBattle.session.attack') {
                const updatedState = {
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
                };
                emitMockResponse(socket, 'games.session.snapshot', {
                  roomId,
                  session: { state: updatedState },
                });
                return;
              }
              originalEmit(event, payload);
            };
          }
        }, 50);
      },
      { roomId, userId, mockBattleState },
    );

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    await expect(page.getByText(/your turn/i).first()).toBeVisible();

    // Attack a cell on the opponent's board
    const cell = page.locator('div[data-row="0"][data-col="0"]').first();
    await expect(cell).toBeVisible();
    await cell.click();

    // Wait for turn change
    await expect(page.locator('body')).toContainText(/Waiting for/i, {
      timeout: 15000,
    });
  });
});
