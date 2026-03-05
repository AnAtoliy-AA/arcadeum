import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Responsive Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should show mobile-friendly navigation on small screens', async ({
    page,
  }) => {
    await navigateTo(page, '/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header')).toBeVisible();

    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();

    await menuButton.click({ force: true });

    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toHaveCSS('opacity', '1', { timeout: 15000 });
    await expect(mobileNav).toBeVisible();

    const navLink = mobileNav.getByRole('link').first();
    await expect(navLink).toBeVisible({ timeout: 5000 });
  });

  test('should adjust grid layout on mobile', async ({ page }) => {
    await navigateTo(page, '/games');

    // In mobile, cards usually go full width (1 column)
    const roomCards = page.getByTestId('room-card');
    if ((await roomCards.count()) > 1) {
      const firstCard = await roomCards.nth(0).boundingBox();
      const secondCard = await roomCards.nth(1).boundingBox();
      if (firstCard && secondCard) {
        // Should be stacked vertically
        expect(secondCard.y).toBeGreaterThan(firstCard.y);
        // And roughly same X
        expect(Math.abs(firstCard.x - secondCard.x)).toBeLessThan(20);
      }
    }
  });

  test('should hide desktop-only elements', async ({ page }) => {
    await navigateTo(page, '/');
    const desktopOnly = page.locator('.desktop-only, [class*="DesktopOnly"]');
    if ((await desktopOnly.count()) > 0) {
      await expect(desktopOnly.first()).not.toBeVisible();
    }
  });
});
