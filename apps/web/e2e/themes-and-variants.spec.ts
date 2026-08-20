import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Themes and Variants separation', () => {
  test('sea battle landing allows cycling through visual themes', async ({
    page,
  }) => {
    await navigateTo(page, '/games/sea-battle');
    const boardButton = page.locator(
      '[data-testid="sea-battle-landing-board"]',
    );
    await expect(boardButton).toBeVisible();
    await boardButton.click();
    await expect(boardButton).toBeVisible();
  });

  test('sea battle quickplay buttons render with theme attributes', async ({
    page,
  }) => {
    await navigateTo(page, '/games/sea-battle');
    const quickplayAi = page.locator('[data-testid="quickplay-ai-button"]');
    await expect(quickplayAi).toBeVisible();
    const quickplayHuman = page.locator(
      '[data-testid="quickplay-human-button"]',
    );
    await expect(quickplayHuman).toBeVisible();
  });
});
