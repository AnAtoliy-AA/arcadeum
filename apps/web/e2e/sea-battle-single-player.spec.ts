import { test, expect } from '@playwright/test';
import { mockSession, navigateTo } from './fixtures/test-utils';

test.describe('Sea Battle Single Player Mode', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow starting sea battle with bots and placing ships', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ea';
    const userId = 'user-1';

    const mockLobbyRoom = {
      id: roomId,
      name: 'Sea Battle Test',
      gameId: 'sea_battle_v1',
      status: 'lobby',
      playerCount: 1,
      maxPlayers: 4,
      hostId: userId,
      members: [{ id: userId, userId, displayName: 'Test User', isHost: true }],
      gameOptions: { variant: 'classic' },
    };

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

    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      if (route.request().resourceType() === 'document')
        return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ room: mockLobbyRoom, session: null }),
      });
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    await page.evaluate(
      ({ roomId, userId, mockPlacementState, mockBattleState }) => {
        const pollSocket = setInterval(() => {
          const socket = (
            window as unknown as {
              gameSocket: {
                emit: (e: string, p: unknown) => void;
                listeners: (e: string) => Array<(d: unknown) => void>;
              };
            }
          ).gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.room.joined',
                  )) {
                    listener({
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
                  }
                }, 100);
                return;
              }

              if (event === 'seaBattle.session.start') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.session.started',
                  )) {
                    listener({
                      session: {
                        id: 'session-1',
                        status: 'active',
                        state: mockPlacementState,
                      },
                    });
                  }
                }, 100);
                return;
              }

              if (event === 'seaBattle.session.auto_place') {
                setTimeout(() => {
                  // Add ships using correct IDs from SHIPS configuration
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
                  for (const listener of socket.listeners(
                    'games.session.snapshot',
                  )) {
                    listener({ roomId, session: { state: updatedState } });
                  }
                }, 100);
                return;
              }

              if (event === 'seaBattle.session.confirm_placement') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.session.snapshot',
                  )) {
                    listener({ roomId, session: { state: mockBattleState } });
                  }
                }, 100);
                return;
              }

              originalEmit(event, payload);
            };
          }
        }, 100);
      },
      { roomId, userId, mockPlacementState, mockBattleState },
    );

    await expect(
      page.getByRole('heading', { name: /Sea Battle/i }),
    ).toBeVisible();

    // Start with bots
    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

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

    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      if (route.request().resourceType() === 'document')
        return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: roomId,
            gameId: 'sea_battle_v1',
            status: 'active',
            playerCount: 1,
            hostId: userId,
            members: [
              { id: userId, userId, displayName: 'Test User', isHost: true },
            ],
          },
          session: {
            id: 'session-1',
            status: 'active',
            state: mockBattleState,
          },
        }),
      });
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    await page.evaluate(
      ({ roomId, userId, mockBattleState }) => {
        const pollSocket = setInterval(() => {
          const socket = (
            window as unknown as {
              gameSocket: {
                emit: (e: string, p: unknown) => void;
                listeners: (e: string) => Array<(d: unknown) => void>;
              };
            }
          ).gameSocket;
          if (socket) {
            clearInterval(pollSocket);
            const originalEmit = socket.emit.bind(socket);
            socket.emit = (event: string, payload: unknown) => {
              if (event === 'games.room.join') {
                setTimeout(() => {
                  for (const listener of socket.listeners(
                    'games.room.joined',
                  )) {
                    listener({
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
                  }
                }, 100);
                return;
              }

              if (event === 'seaBattle.session.attack') {
                setTimeout(() => {
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
                  for (const listener of socket.listeners(
                    'games.session.snapshot',
                  )) {
                    listener({ roomId, session: { state: updatedState } });
                  }
                }, 200);
                return;
              }
              originalEmit(event, payload);
            };
          }
        }, 100);
      },
      { roomId, userId, mockBattleState },
    );

    await expect(page.getByText(/your turn/i).first()).toBeVisible();

    // Attack a cell on the opponent's board
    // The opponent's board is usually the one where isOwn is false.
    // In AttackBoard, we see multiple boards or a selector.

    // Let's click a cell. We might need a more specific selector.
    // Assuming AttackBoard renders a grid for the opponent.
    const cell = page.locator('div[data-row="0"][data-col="0"]').first();
    await cell.click({ force: true });

    // Verify turn changed
    await expect(
      page.getByText(/waiting for.*opponent/i).first(),
    ).toBeVisible();
  });
});
