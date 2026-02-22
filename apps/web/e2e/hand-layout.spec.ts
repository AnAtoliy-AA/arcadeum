import { test, expect } from '@playwright/test';
import { mockSession, navigateTo, mockRoomInfo } from './fixtures/test-utils';

test.describe('Hand Layout', () => {
  const roomId = '507f1f77bcf86cd799439011';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);

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

    // Wait for game to load
    // Wait for game to load

    // Wait for some text that definitely comes from the game/header
    await page.waitForSelector('text=Arcadeum', { timeout: 15000 });

    // Close any visible modal that intercepts pointer events
    // The modal container class was observed in error logs
    const modalContainer = page.locator('[class*="modals__Modal"]').first();

    // Wait a moment for the modal to potentially appear
    await page.waitForTimeout(1000);

    // Try to close any visible modal
    if (await modalContainer.isVisible().catch(() => false)) {
      // Try pressing Escape to close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // If still visible, try clicking the close button
      if (await modalContainer.isVisible().catch(() => false)) {
        const closeBtn = page.getByRole('button', { name: '×' }).first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
        }
      }

      // Wait for modal to be hidden
      await expect(modalContainer).not.toBeVisible({ timeout: 5000 });
    }

    // Wait for "Your turn"
    const turnText = page.getByText('Your turn', { exact: true }).first();
    await expect(turnText).toBeVisible({ timeout: 15000 });

    // Locate the layout trigger
    const layoutTrigger = page.getByTestId('layout-trigger');
    await expect(layoutTrigger).toBeVisible();

    // 1. Initial State: Grid
    const grid = page.getByTestId('hand-grid');
    await expect(grid).toBeVisible();

    // 2. Switch to Grid 4x
    await layoutTrigger.dispatchEvent('click');
    await page.getByRole('button', { name: 'Grid 4x' }).dispatchEvent('click');

    // Verify trigger text contains Grid 4x
    await expect(layoutTrigger).toHaveText(/Grid 4x/i);

    // Verify grid columns (computed pixels for 4 columns)
    await expect(grid).toHaveCSS(
      'grid-template-columns',
      /^([\d\.]+px\s?){4}$/,
    );

    // 3. Switch to Linear (Scroll)
    await layoutTrigger.dispatchEvent('click');
    await page.getByRole('button', { name: /Scroll/i }).dispatchEvent('click');

    // Verify trigger text contains Scroll
    await expect(layoutTrigger).toHaveText(/Scroll/i);

    // Verify layout is flex
    await expect(grid).toHaveCSS('display', 'flex');
  });
});
