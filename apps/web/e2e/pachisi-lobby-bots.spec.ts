import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
  waitForRoomReady,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

/**
 * Regression: the host could add only one bot, so a Pachisi lobby with two
 * humans and a bot could never reach a 4th player.
 */
test.describe('Pachisi lobby add bot', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('host can still add a bot with 3 of 4 seats taken (one is a bot)', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        gameId: 'pachisi_v1',
        name: 'Pachisi 4th seat',
        maxPlayers: 4,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
          { id: 'u-2', userId: 'u-2', displayName: 'Friend' },
          { id: 'bot-abc', userId: 'bot-abc', displayName: 'Bot' },
        ],
        playerCount: 3,
      },
    });
    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: { gameId: 'pachisi_v1', maxPlayers: 4 },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await expect(page.getByTestId('player-count-heading')).toContainText('3/4');
    await expect(page.getByTestId('add-bot-button')).toBeVisible();
  });
});
