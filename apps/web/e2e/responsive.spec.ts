import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Responsive Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should show mobile-friendly navigation on small screens', async ({
    page,
  }) => {
    await navigateTo(page, '/');
    await page.waitForLoadState('networkidle');

    // Wait for header to be visible
    await expect(page.locator('header')).toBeVisible();

    // Check for hamburger menu
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();

    // Open menu
    await menuButton.click({ force: true });

    // Wait for animation frame or transition
    // Adding a small delay to allow CSS transitions to start/finish in slower environments
    await page.waitForTimeout(1000);

    // Wait for the menu container to be visible first
    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible({ timeout: 15000 });

    // Then check for the link
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
    // Example: some sidebar titles or large banners might be hidden
    // We'll just check if common desktop patterns are modified
    const desktopOnly = page.locator('.desktop-only, [class*="DesktopOnly"]');
    if ((await desktopOnly.count()) > 0) {
      await expect(desktopOnly.first()).not.toBeVisible();
    }
  });
});
