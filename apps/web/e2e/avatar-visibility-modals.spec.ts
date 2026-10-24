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
import { routes } from '../src/shared/config/routes';

test.describe('Universal Avatar Visibility across Lobbies and Pods', () => {
  const roomId = '507f191e810c19729de860ef';

  test('should display in-game avatars in lobby player list and rematch invited lists', async ({
    page,
  }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Avatar Visibility Room',
        gameId: 'hearts_v1',
        status: 'lobby',
        hostId: MOCK_OBJECT_ID,
        playerCount: 1,
        maxPlayers: 4,
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'HostPlayer',
            isHost: true,
          },
        ],
        rematchInvitedUsers: [
          {
            id: '507f191e810c19729de860f0',
            displayName: 'InvitedPlayer',
          },
        ],
        rematchDeclinedUsers: [
          {
            id: '507f191e810c19729de860f1',
            displayName: 'DeclinedPlayer',
          },
        ],
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const hostName = page.getByText('HostPlayer');
    await expect(hostName).toBeVisible();

    const invitedName = page.getByText('InvitedPlayer');
    await expect(invitedName).toBeVisible();

    const declinedName = page.getByText('DeclinedPlayer');
    await expect(declinedName).toBeVisible();
  });
});
