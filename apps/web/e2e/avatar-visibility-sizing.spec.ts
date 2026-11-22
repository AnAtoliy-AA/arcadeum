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

test.describe('Avatar Visibility and Sizing (ARC-1001)', () => {
  const roomId = '507f191e810c19729de860ea';

  test('lobby members render visible avatar discs with proper dimensions', async ({
    page,
  }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Avatar Sizing Test Room',
        gameId: 'critical_v1',
        status: 'lobby',
        hostId: MOCK_OBJECT_ID,
        playerCount: 2,
        maxPlayers: 4,
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'HostHero',
            isHost: true,
          },
          {
            id: '507f191e810c19729de860eb',
            userId: '507f191e810c19729de860eb',
            displayName: 'GuestHero',
            isHost: false,
          },
        ],
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const hostName = page.getByText('HostHero');
    await expect(hostName).toBeVisible();

    const avatarDisc = page.locator('main [data-avatar-disc]').first();
    await expect(avatarDisc).toBeVisible();

    const box = await avatarDisc.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(40);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('profile menu renders enlarged identity avatar', async ({
    page,
    viewport,
    browserName,
  }) => {
    test.skip(
      !!viewport && viewport.width < 768,
      'Profile menu is hidden on small screens',
    );
    await mockSession(page, { displayName: 'TesterPro' });
    await navigateTo(page, '/');

    const trigger = page.locator('[data-profile-menu] button').first();
    await expect(trigger).toBeVisible();
    if (browserName === 'webkit') {
      await trigger.dispatchEvent('click');
    } else {
      await trigger.click();
    }

    const dropdown = page.getByTestId('profile-dropdown');
    await dropdown.waitFor({ state: 'visible' });
    await expect(dropdown).toBeVisible();

    const identityAvatar = dropdown.locator('[data-avatar-disc]').first();
    await expect(identityAvatar).toBeVisible();

    const box = await identityAvatar.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
