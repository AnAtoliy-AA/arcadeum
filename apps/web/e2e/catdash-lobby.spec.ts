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
        gameOptions: { theme: 'adventure' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'cat_dash_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'adventure' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    // The shared GameThemePicker renders shared themes; default is active
    const adventureChip = page.getByTestId('theme-adventure').first();
    await expect(adventureChip).toBeVisible();
    await expect(adventureChip).toHaveAttribute('aria-checked', 'true', {});
    await expect(page.getByTestId('catdash-columns-10')).toBeVisible();
    await expect(page.getByTestId('catdash-track-60')).toBeVisible();

    // Simulate the host switching theme: the lobby emits `games.room.set_option`
    // and the room updates server-side. Re-mock with the new theme and re-enter
    // the room to verify the UI reflects it (same pattern as sea-battle-lobby-colors).
    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="theme-cyberpunk"]',
      ) as HTMLElement | null;
      btn?.click();
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'cat_dash_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'cyberpunk' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await expect(page.getByTestId('theme-cyberpunk').first()).toHaveAttribute(
      'aria-checked',
      'true',
      {},
    );
    await expect(
      page.getByTestId('theme-adventure').first(),
    ).not.toHaveAttribute('aria-checked', 'true', {});
  });
});
