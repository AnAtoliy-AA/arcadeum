import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  handleRoute,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
  closeGameRulesModal,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

interface MockSocket {
  trigger: (event: string, payload?: unknown) => void;
}

interface TestWindow {
  gameSocket?: MockSocket;
}

test.describe('Sea Battle Opponent Confirm Placement', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('does not reset player ships when opponent confirms placement', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const opponentId = 'user-2';

    const generateBoard = () =>
      Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    const defaultShips = [
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
    }));

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
          playerId: opponentId,
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: false,
        },
      ],
      playerOrder: [userId, opponentId],
      currentTurnIndex: 0,
      logs: [],
      gridSize: 10,
      shipCount: 10,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Placement Isolation Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        playerCount: 2,
        maxPlayers: 2,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Me', isHost: true },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent',
            isHost: false,
          },
        ],
      },
      session: {
        id: 'session-1',
        status: 'active',
        state: mockPlacementState,
      },
    });

    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, {
        session: {
          id: 'session-1',
          status: 'active',
          state: mockPlacementState,
        },
      });
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          roomId,
          status: 'active',
          state: mockPlacementState,
        },
      },
      handlers: {
        'seaBattle.session.auto_place': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                ...mockPlacementState,
                players: mockPlacementState.players.map((p) =>
                  p.playerId === userId
                    ? {
                        ...p,
                        placementComplete: false,
                        ships: defaultShips,
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
              state: {
                ...mockPlacementState,
                phase: 'battle',
                players: mockPlacementState.players.map((p) => ({
                  ...p,
                  placementComplete: true,
                })),
              },
            },
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    await expect(page.getByText(/place your ships/i).first()).toBeVisible();

    const autoPlaceBtn = page
      .getByRole('button', { name: /auto place/i })
      .or(page.getByText(/auto place/i))
      .first();
    await autoPlaceBtn.dispatchEvent('click');

    const confirmBtn = page
      .getByRole('button', { name: /confirm/i })
      .or(page.getByText(/confirm/i))
      .first();
    await expect(confirmBtn).toBeEnabled();

    await page.evaluate(
      ({ roomId, state, opponentId, defaultShips }) => {
        const testWindow = window as unknown as TestWindow;
        testWindow.gameSocket?.trigger('games.session.snapshot', {
          roomId,
          session: {
            id: 'session-1',
            status: 'active',
            state: {
              ...state,
              players: state.players.map((p: { playerId: string }) =>
                p.playerId === opponentId
                  ? { ...p, placementComplete: true }
                  : { ...p, ships: defaultShips, placementComplete: false },
              ),
            },
          },
        });
      },
      { roomId, state: mockPlacementState, opponentId, defaultShips },
    );

    await expect(confirmBtn).toBeEnabled();
    await expect(page.getByText(/place your ships/i).first()).toBeVisible();

    await confirmBtn.dispatchEvent('click');
    await expect(page.getByText(/waiting for|battle/i).first()).toBeVisible();
  });
});
