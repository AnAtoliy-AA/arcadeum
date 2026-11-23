import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  navigateTo,
  mockGameSocket,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

const roomId = '507f191e810c19729de860ec';
const hostId = '507f191e810c19729de860ed';

test.describe('Lobby invite participation', () => {
  test('an invited friend sees who invited them and can accept or decline', async ({
    page,
  }) => {
    let accepted = false;
    await page.route('**/games/rooms/*/invitation/accept', async (route) => {
      accepted = true;
      await route.fulfill({ status: 204 });
    });
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Friends Lobby',
        gameId: 'go_v1',
        status: 'lobby',
        visibility: 'private',
        hostId,
        playerCount: 1,
        maxPlayers: 2,
        viewerInvited: true,
        viewerRole: 'none',
        host: { id: hostId, displayName: 'HostPlayer', isHost: true },
        members: [
          {
            id: hostId,
            userId: hostId,
            displayName: 'HostPlayer',
            isHost: true,
          },
        ],
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));

    const gate = page.getByTestId('room-invitation-gate');
    await expect(gate).toBeVisible();
    await expect(gate).toContainText('HostPlayer');
    await expect(page.getByTestId('room-invitation-decline')).toBeVisible();

    await page.getByTestId('room-invitation-accept').click();
    await expect.poll(() => accepted).toBe(true);
  });

  test('the host sees pending invites with resend and cancel actions', async ({
    page,
  }) => {
    let revoked: string[] | null = null;
    await page.route('**/games/rooms/*/invitation/revoke', async (route) => {
      revoked = route.request().postDataJSON().userIds;
      await route.fulfill({ status: 204 });
    });
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Friends Lobby',
        gameId: 'go_v1',
        status: 'lobby',
        hostId: MOCK_OBJECT_ID,
        playerCount: 1,
        maxPlayers: 2,
        rematchInvitedUsers: [{ id: 'friend-1', displayName: 'Friend One' }],
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'HostPlayer',
            isHost: true,
          },
        ],
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));

    const row = page.getByTestId('lobby-invited-friend-1');
    await expect(row).toBeVisible();
    await expect(
      page.getByTestId('lobby-invite-resend-friend-1'),
    ).toBeVisible();
    await page.getByTestId('lobby-invite-cancel-friend-1').click();
    await expect.poll(() => revoked).toEqual(['friend-1']);
  });
});
