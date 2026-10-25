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

test.describe('Lobby Random First Move Option', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('toggles random first move checkbox and syncs with first player selection', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const hostId = '507f191e810c19729de860ea';
    const player2Id = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Checkers Turn Order Room',
        gameId: 'checkers_v1',
        hostId,
        status: 'lobby',
        playerCount: 2,
        maxPlayers: 2,
        gameOptions: {
          firstPlayer: 'host',
        },
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

    let patchedOptions: Record<string, unknown> | null = null;
    await page.route(`**/games/rooms/${roomId}/options`, async (route) => {
      if (route.request().method() === 'PATCH') {
        patchedOptions = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: {
              id: roomId,
              gameOptions: patchedOptions,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const randomCheckbox = page.getByTestId('random-first-player-checkbox');
    const firstPlayerSelect = page.getByTestId('first-player-select');

    await expect(randomCheckbox).toBeVisible();
    await expect(randomCheckbox).not.toBeChecked();
    await expect(firstPlayerSelect).toHaveValue('host');

    await randomCheckbox.click();
    await expect(randomCheckbox).toBeChecked();
    await expect(firstPlayerSelect).toHaveValue('random');

    await firstPlayerSelect.selectOption('host');
    await expect(randomCheckbox).not.toBeChecked();
    await expect(firstPlayerSelect).toHaveValue('host');
  });
});
