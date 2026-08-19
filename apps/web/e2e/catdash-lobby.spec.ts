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

test.describe('Cat Dash Lobby Options', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders shared chip groups and lets the host change the theme', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Cat Dash Lobby Test Room',
        gameId: 'cat_dash_v1',
        gameOptions: { theme: 'neon' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'cat_dash_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'neon' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    // All three shared chip groups render
    await expect(page.getByTestId('catdash-theme-neon')).toBeVisible();
    await expect(page.getByTestId('catdash-columns-10')).toBeVisible();
    await expect(page.getByTestId('catdash-track-60')).toBeVisible();

    // Default theme is active
    await expect(page.getByTestId('catdash-theme-neon')).toHaveAttribute(
      'data-active',
      'on',
      {},
    );

    // Simulate the host switching theme: the lobby emits `games.room.set_option`
    // and the room updates server-side. Re-mock with the new theme and re-enter
    // the room to verify the UI reflects it (same pattern as sea-battle-lobby-colors).
    await page.getByTestId('catdash-theme-space').click();

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'cat_dash_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'space' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await expect(page.getByTestId('catdash-theme-space')).toHaveAttribute(
      'data-active',
      'on',
      {},
    );
    await expect(page.getByTestId('catdash-theme-neon')).not.toHaveAttribute(
      'data-active',
      'on',
      {},
    );
  });
});
