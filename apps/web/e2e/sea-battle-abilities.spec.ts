import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Sea Battle Ship Abilities', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should render ship abilities panel and keep it visible', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const opponentId = 'user-2';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Abilities Test',
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
    });

    const mockState = {
      phase: 'battle',
      currentTurnIndex: 0,
      playerOrder: [userId, opponentId],
      shipAbilities: true,
      players: [
        {
          playerId: userId,
          alive: true,
          board: Array.from({ length: 10 }, () => Array(10).fill(0)),
          shipsRemaining: 2,
          placementComplete: true,
          ships: [
            {
              id: 'carrier-1',
              name: 'Carrier',
              size: 5,
              cells: [],
              hits: 0,
              sunk: false,
            },
            {
              id: 'battleship-1',
              name: 'Battleship',
              size: 4,
              cells: [],
              hits: 0,
              sunk: false,
            },
          ],
        },
        {
          playerId: opponentId,
          alive: true,
          board: Array.from({ length: 10 }, () => Array(10).fill(0)),
          shipsRemaining: 2,
          placementComplete: true,
          ships: [
            {
              id: 'destroyer-1',
              name: 'Destroyer',
              size: 2,
              cells: [],
              hits: 0,
              sunk: false,
            },
          ],
        },
      ],
      logs: [],
    };

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          roomId,
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const toggle = page.getByRole('button', { name: /Ship Abilities/i });
    await expect(toggle).toBeVisible();

    await toggle.click();

    const scoutBtn = page.getByRole('button', { name: /Scout/i });
    await expect(scoutBtn).toBeVisible();
    await expect(scoutBtn).toBeEnabled();
  });
});
