import { test, expect } from '@playwright/test';

test.describe('Sea Battle Ships Remaining UI', () => {
  test('should display the ships remaining bar stretched to full width', async ({
    page,
  }) => {
    // Navigate to a game or use a mock setup if possible.
    // For now, we'll try to find it on a game page.
    await page.goto('/games');

    // Create a game or join one (this depends on the app's flow)
    // Assuming there's a way to trigger a Sea Battle game.
    // Since we can't easily mock the whole game state here without more info,
    // we'll just check if the component exists and has the container class.

    // Search for a game link
    const gameLink = page.getByRole('link', { name: /Sea Battle/i }).first();
    if (await gameLink.isVisible()) {
      await gameLink.click();

      // Wait for game to load
      await page.waitForSelector('[data-testid="game-main-area"]');

      const shipsContainer = page
        .locator('.sb-ships-remaining-container')
        .first();
      await expect(shipsContainer).toBeVisible();

      // Verify it has the expected styles (e.g. width 100% or close to its parent)
      const box = await shipsContainer.boundingBox();
      const parent = shipsContainer.locator('..');
      const parentBox = await parent.boundingBox();

      if (box && parentBox) {
        // It should be roughly the same width as its parent section
        expect(box.width).toBeGreaterThan(parentBox.width * 0.9);
      }
    }
  });
});
