import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  navigateTo,
  waitForRoomReady,
  mockGameSocket,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';

test.describe('Lobby Refresh', () => {
  const roomId = '507f191e810c19729de860ea';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        gameId: 'critical_v1',
        status: 'lobby',
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'Test User',
            isHost: true,
          },
        ],
      },
    });
  });

  test('should refresh room data when refresh button is clicked', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Wait for refresh button to be visible
    const refreshButton = page.getByTestId('refresh-room-button');
    await expect(refreshButton).toBeVisible();

    // Unroute the previous mock and set up a new one with the refreshed name
    await page.unroute('**/games/room-info');
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Refreshed Name',
        gameId: 'critical_v1',
        status: 'lobby',
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'Test User',
            isHost: true,
          },
        ],
      },
    });

    // Set up response listener
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/games/room-info') &&
        response.request().method() === 'POST',
    );

    // Click refresh
    await refreshButton.click();
    await responsePromise;

    // Verify UI updated
    await expect(async () => {
      const roomNameDisplay = page.getByTestId('room-name-text');
      // Use a short timeout for individual assertions so toPass can poll quickly
      await expect(roomNameDisplay).toHaveText('Refreshed Name', {
        timeout: 2000,
      });
      await expect(roomNameDisplay).toBeVisible({ timeout: 2000 });
    }).toPass();
  });
});
