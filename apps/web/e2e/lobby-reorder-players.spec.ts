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

test.describe('Lobby Player Seat Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('allows room host to view reorder controls and swap player seat positions', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const hostId = '507f191e810c19729de860ea';
    const player2Id = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Seat Parity Checkers Room',
        gameId: 'checkers_v1',
        hostId,
        status: 'lobby',
        playerCount: 2,
        maxPlayers: 2,
        members: [
          {
            id: hostId,
            displayName: 'Alice Host',
            isHost: true,
            isReady: true,
          },
          {
            id: player2Id,
            displayName: 'Bob Guest',
            isHost: false,
            isReady: true,
          },
        ],
      },
    });

    await mockGameSocket(page, roomId, hostId, {
      gameId: 'checkers_v1',
      roomJoinedPayload: {
        status: 'lobby',
        hostId,
        members: [
          {
            id: hostId,
            displayName: 'Alice Host',
            isHost: true,
            isReady: true,
          },
          {
            id: player2Id,
            displayName: 'Bob Guest',
            isHost: false,
            isReady: true,
          },
        ],
      },
    });

    let reorderPayload: { userIds?: string[] } | null = null;
    await page.route(`**/games/rooms/${roomId}/participants`, async (route) => {
      if (route.request().method() === 'POST') {
        reorderPayload = route.request().postDataJSON() as {
          userIds?: string[];
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: {
              id: roomId,
              members: [
                {
                  id: player2Id,
                  displayName: 'Bob Guest',
                  isHost: false,
                  isReady: true,
                },
                {
                  id: hostId,
                  displayName: 'Alice Host',
                  isHost: true,
                  isReady: true,
                },
              ],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, routes.game(roomId));
    await waitForRoomReady(page);

    const moveDownBtn = page.getByTestId(`player-move-down-${hostId}`);
    await expect(moveDownBtn).toBeVisible();

    await moveDownBtn.click();

    await expect
      .poll(() => reorderPayload?.userIds)
      .toEqual([player2Id, hostId]);
  });
});
