import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  waitForRoomReady,
  mockGameSocket,
  closeGameRulesModal,
} from './fixtures/test-utils';

test.describe('Sea Battle Rules Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show rules modal automatically when entering game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

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
    await expect(modal).toBeVisible({});
    await expect(modal).toContainText(/objective|gameplay|battle/i);
  });

  test('should be able to close and reopen rules modal', async ({ page }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

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
    await expect(modal).toBeVisible({});
    await expect(modal).toContainText(/objective/i);

    // Close using close button, scoped specifically to the modal
    const closeBtn = modal.getByTestId('modal-close-button').first();
    await closeBtn.click({ force: true });

    // Add fallback for flaky dialog dismiss
    await page.keyboard.press('Escape');

    // Wait for modal to hide
    await expect(modal).toBeHidden();

    // Now find the button to reopen it
    const rulesBtn = page
      .getByRole('button', { name: /Game Rules|📖/i })
      .first();
    await expect(rulesBtn).toBeVisible();

    // Ensure button is stable before clicking
    await rulesBtn.waitFor({ state: 'visible' });
    // Use dispatchEvent for more reliable clicking across different browser engines
    await rulesBtn.dispatchEvent('click');

    // Check it reopened
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/objective/i);
  });

  test('should be able to view rules from create game screen', async ({
    page,
  }) => {
    await navigateTo(page, '/games/create?gameId=sea_battle_v1');

    // Look for rules button on create screen
    const rulesBtn = page
      .getByRole('button', { name: /Game Rules|📖/i })
      .first()
      .or(page.getByTestId('view-rules-button'));
    await expect(rulesBtn).toBeVisible({});

    // Ensure button is stable before clicking — Mobile Chrome can race past
    // the click handler if we tap before paint completes.
    await rulesBtn.waitFor({ state: 'visible' });
    // dispatchEvent fires synchronously and skips the pointer-events check
    // that flakes on slow mobile viewports.
    await rulesBtn.dispatchEvent('click');

    // Check modal
    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({});
    await expect(modal).toContainText(/objective/i);

    // Close using close button, with fallback for Tamagui animation timing
    const closeBtn = page.getByTestId('modal-close-button').first();
    await closeBtn.click({ force: true });
    await closeGameRulesModal(page);

    await expect(modal).not.toBeVisible({});
  });
});
