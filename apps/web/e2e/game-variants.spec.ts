import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Unified Game Variants', () => {
  test('home page featured games render unified variants', async ({ page }) => {
    await navigateTo(page, '/');
    const gamesSection = page.locator('#games');
    await expect(gamesSection).toBeVisible();
  });

  test('sea battle landing page displays unified theme preview', async ({
    page,
  }) => {
    await navigateTo(page, '/games/sea-battle');
    const preview = page
      .locator('[data-testid="color-preview-container"]')
      .first();
    await expect(preview).toBeVisible();
  });
});
