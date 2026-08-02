import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Matchmaking Queue', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should open matchmaking modal when playing vs human and support cancellation', async ({
    page,
  }) => {
    // Navigate to a game page (e.g. Sea Battle)
    await navigateTo(page, '/games/sea-battle');

    // Click "Play vs Human" or the quickplay human button
    const humanBtn = page.getByTestId('quickplay-human-button').first();
    await expect(humanBtn).toBeVisible();
    await humanBtn.click();

    // Verify Matchmaking Queue modal appears
    const modal = page.locator('text=Searching for Opponent');
    await expect(modal).toBeVisible();

    // Verify timer starts displaying elapsed time
    const timer = page.locator('text=00:');
    await expect(timer).toBeVisible();

    // Click Cancel Matchmaking
    const cancelBtn = page.locator('button:has-text("Cancel Matchmaking")');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Verify Matchmaking Queue modal disappears
    await expect(modal).not.toBeVisible();
  });
});
