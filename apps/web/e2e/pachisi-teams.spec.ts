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

const userId = '507f191e810c19729de860ea';
const rightId = '507f191e810c19729de860eb'; // seat 1 (opponent)
const partnerId = '507f191e810c19729de860ec'; // seat 2 (partner)
const leftId = '507f191e810c19729de860ed'; // seat 3 (opponent)

const yard = () => [0, 1, 2, 3].map((id) => ({ id, progress: -1 }));
const home = () => [0, 1, 2, 3].map((id) => ({ id, progress: 56 }));

test.describe('Pachisi teams (2v2)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('shows team labels and lets a finished player move the partner token', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const options = {
      variant: 'adventure',
      theme: 'adventure',
      mode: 'standard',
      teams: true,
    };
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Pachisi Teams Room',
        gameId: 'pachisi_v1',
        gameOptions: options,
        status: 'active',
        playerCount: 4,
      },
    });
    await mockGameSocket(page, roomId, userId, {
      gameId: 'pachisi_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: options,
        session: {
          id: 'sess-pachisi-teams',
          status: 'active',
          state: {
            phase: 'move',
            options: { ...options },
            seats: { [userId]: 0, [rightId]: 1, [partnerId]: 2, [leftId]: 3 },
            tokens: {
              [userId]: home(),
              [rightId]: yard(),
              [partnerId]: yard(),
              [leftId]: yard(),
            },
            die: 6,
            lastDie: 6,
            lastRollerId: userId,
            consecutiveSixes: 1,
            currentTurnIndex: 0,
            playerOrder: [userId, rightId, partnerId, leftId],
            players: [
              { playerId: userId, seat: 0, color: 'red', alive: true, team: 0 },
              {
                playerId: rightId,
                seat: 1,
                color: 'green',
                alive: true,
                team: 1,
              },
              {
                playerId: partnerId,
                seat: 2,
                color: 'yellow',
                alive: true,
                team: 0,
              },
              {
                playerId: leftId,
                seat: 3,
                color: 'blue',
                alive: true,
                team: 1,
              },
            ],
            winnerId: null,
            winnerIds: [],
            isDraw: false,
            teamMode: true,
            winnerTeam: null,
            logs: [],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await expect(page.getByTestId('pachisi-yard-team-0')).toBeVisible();
    await expect(page.getByTestId('pachisi-yard-team-2')).toBeVisible();
    await expect(
      page.getByTestId('pachisi-moving-partner-badge'),
    ).toBeVisible();
    // Partner yard token is highlighted as movable and flagged as partner.
    const partnerToken = page.getByTestId('yard-token-2-0');
    await expect(partnerToken).toHaveAttribute('data-partner', 'true');
    await expect(partnerToken).toBeEnabled();
  });
});
