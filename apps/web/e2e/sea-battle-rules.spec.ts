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

test.describe('Sea Battle Rules Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show rules modal automatically when entering game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Rules Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
      },
    });

    await mockGameSocket(page, roomId, userId, { gameId: 'sea_battle_v1' });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page, { autoCloseRules: false });

    // Check for modal presence using specialized locator
    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });
    await expect(modal).toContainText(/objective|gameplay|battle/i);
  });

  test('should be able to close and reopen rules modal', async ({ page }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Rules Toggle Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
      },
    });

    await mockGameSocket(page, roomId, userId, { gameId: 'sea_battle_v1' });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page, { autoCloseRules: false });

    // Initial modal visible
    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });
    await expect(modal).toContainText(/objective/i);

    // Close using standard close method
    const closeBtn = page
      .getByText('×')
      .first()
      .or(page.getByRole('button', { name: 'Close' }).first())
      .or(page.getByTestId('modal-close-button').first());
    await closeBtn.click({ force: true, timeout: 15000 });

    // Wait for modal to hide
    await expect(modal).not.toBeVisible({ timeout: 15000 });

    // Now find the button to reopen it
    const rulesBtn = page
      .getByRole('button', { name: /Game Rules|📖/i })
      .first();
    await rulesBtn.click({ force: true, timeout: 15000 });

    // Check it reopened
    await expect(modal).toBeVisible({ timeout: 15000 });
    await expect(modal).toContainText(/objective/i);
  });

  test('should be able to view rules from create game screen', async ({
    page,
  }) => {
    await navigateTo(page, '/games/create?gameId=sea_battle_v1');
    await page.waitForLoadState('networkidle');

    // Look for rules button on create screen
    const rulesBtn = page
      .getByRole('button', { name: /Game Rules|📖/i })
      .first();
    await expect(rulesBtn).toBeVisible({ timeout: 15000 });

    // Click to open rules modal
    await rulesBtn.click({ force: true, timeout: 10000 });

    // Check modal
    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });
    await expect(modal).toContainText(/objective/i);

    // Close it
    const closeBtn = page
      .getByText('×')
      .first()
      .or(page.getByRole('button', { name: 'Close' }).first())
      .or(page.getByTestId('modal-close-button').first());
    await closeBtn.click({ force: true, timeout: 15000 });

    await expect(modal).not.toBeVisible({ timeout: 15000 });
  });
});
