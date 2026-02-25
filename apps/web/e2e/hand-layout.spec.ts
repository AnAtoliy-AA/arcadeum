import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  waitForRoomReady,
  mockGameSocket,
  closeRulesModal,
} from './fixtures/test-utils';

test.describe('Hand Layout', () => {
  const roomId = '507f1f77bcf86cd799439011';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, 'user-1');

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'in_progress',
        members: [{ id: 'user-1', displayName: 'Me', isHost: false }],
        gameOptions: {
          cardVariant: 'default',
        },
      },
      session: {
        sessionId: 'sess-1',
        roomId: roomId,
        userId: 'user-1',
        state: {
          players: [
            {
              playerId: 'user-1',
              alive: true,
              hand: [
                'strike',
                'cancel',
                'evade',
                'reorder',
                'trade',
                'neutralizer',
                'collection_alpha',
                'collection_beta',
                'collection_gamma',
                'collection_delta',
              ],
              stash: [],
            },
          ],
          playerOrder: ['user-1'],
          currentTurnIndex: 0,
          deck: [],
          discardPile: [],
          logs: [],
        },
      },
    });
  });

  test('should allow switching grid layouts', async ({ page }) => {
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Ensure rules modal is closed before interacting with layout
    await closeRulesModal(page);
    // Extra safety for WebKit interception
    const modal = page.getByTestId('rules-modal');
    if (await modal.isVisible()) {
      await modal.evaluate((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    }

    const turnText = page.getByText(/Your turn/i).first();
    await expect(turnText).toBeVisible({ timeout: 15000 });

    // Locate the layout trigger
    const layoutTrigger = page.getByTestId('layout-trigger');
    await expect(layoutTrigger).toBeVisible();

    // 1. Initial State: Grid
    const grid = page.getByTestId('hand-grid');
    await expect(grid).toBeVisible();

    // 2. Switch to Grid 4x
    await layoutTrigger.click();
    await page.getByRole('button', { name: 'Grid 4x' }).click();

    // Verify trigger text contains Grid 4x
    await expect(layoutTrigger).toHaveText(/Grid 4x/i);

    // Verify grid columns (computed pixels for 4 columns)
    // WebKit often returns computed pixels instead of 'repeat(4, 1fr)'
    await expect(grid).toHaveCSS(
      'grid-template-columns',
      /repeat\(4, 1fr\)|(\d+(\.\d+)?px\s*){4}/,
    );

    // 3. Switch to Linear (Scroll)
    await layoutTrigger.click();
    await page.getByRole('button', { name: /Scroll/i }).click();

    // Verify trigger text contains Scroll
    await expect(layoutTrigger).toHaveText(/Scroll/i);

    // Verify layout is flex
    await expect(grid).toHaveCSS('display', 'flex');
  });
});
