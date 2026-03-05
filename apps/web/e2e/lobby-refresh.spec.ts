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

    // Mock the room-info API again with a modified state to verify refresh
    let refreshCalled = false;
    await page.route('**/games/room-info', async (route) => {
      refreshCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
          session: null,
        }),
      });
    });

    // Click refresh
    await refreshButton.click();

    // Verify API was called
    expect(refreshCalled).toBe(true);

    // Verify UI updated with new room name
    await expect(page.getByText('Refreshed Name')).toBeVisible();
  });
});
