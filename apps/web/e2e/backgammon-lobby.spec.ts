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

test.describe('Backgammon Lobby Options', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders theme picker and allows host to change theme in Backgammon lobby', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Backgammon Test Room',
        gameId: 'backgammon_v1',
        gameOptions: { theme: 'cyberpunk' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'cyberpunk' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const cyberpunkChip = page.getByTestId('theme-cyberpunk');
    await expect(cyberpunkChip).toBeVisible();
    await expect(cyberpunkChip).toHaveAttribute('aria-checked', 'true', {});

    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="theme-underwater"]',
      ) as HTMLElement | null;
      btn?.click();
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'backgammon_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'underwater' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    await expect(page.getByTestId('theme-underwater')).toHaveAttribute(
      'aria-checked',
      'true',
      {},
    );
    await expect(
      page.getByTestId('theme-cyberpunk').first(),
    ).not.toHaveAttribute('aria-checked', 'true', {});
  });
});
