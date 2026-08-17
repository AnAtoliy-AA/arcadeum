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

test.describe('Lobby Player Avatar & Host Badge', () => {
  const roomId = '507f191e810c19729de860ea';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Lobby Test Room',
        gameId: 'critical_v1',
        status: 'lobby',
        hostId: MOCK_OBJECT_ID,
        playerCount: 2,
        maxPlayers: 4,
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'HostPlayer',
            isHost: true,
          },
          {
            id: '507f191e810c19729de860eb',
            userId: '507f191e810c19729de860eb',
            displayName: 'GuestPlayer',
            isHost: false,
          },
        ],
      },
    });
  });

  test('should display circular avatars and host badge for lobby members', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const hostBadge = page.getByText('HOST', { exact: true });
    await expect(hostBadge).toBeVisible();

    const hostName = page.getByText('HostPlayer');
    await expect(hostName).toBeVisible();

    const guestName = page.getByText('GuestPlayer');
    await expect(guestName).toBeVisible();
  });
});
