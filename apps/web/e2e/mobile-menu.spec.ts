import { test, expect } from '@playwright/test';

test.describe('Mobile Menu', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear state before each test
    await context.clearCookies();

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate first to establish origin
    await page.goto('/');

    // Wait for hydration (robust method)
    await page.waitForSelector('html[data-app-ready="true"]');

    // Now safe to clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should open and close the mobile menu', async ({ page }) => {
    const menuButton = page.getByTestId('mobile-menu-button');

    // Initially menu should be closed
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await menuButton.click({ force: true });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    // Close menu by clicking the toggle again
    await menuButton.click({ force: true });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should navigate and close menu when a link is clicked', async ({
    page,
  }) => {
    const menuButton = page.getByTestId('mobile-menu-button');
    await menuButton.click({ force: true });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const gamesLink = page.getByTestId('mobile-nav-games');
    await expect(gamesLink).toBeVisible();
    await gamesLink.click();

    // Should navigate to /games
    await expect(page).toHaveURL(/\/games/);

    // Menu should be closed
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
