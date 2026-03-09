import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  getIsMobile,
} from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display header with logo', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    if (getIsMobile(page)) {
      const menuButton = page.getByTestId('mobile-menu-button');
      await expect(menuButton).toBeVisible();
    } else {
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    }
  });

  test('should navigate to home from any page', async ({ page }) => {
    await page.goto('/games', { waitUntil: 'domcontentloaded' });

    // Use a more robust selector for the home link/logo
    const homeLink = page.locator('header a[href="/"]').first();
    await expect(homeLink).toBeVisible();

    // Ensure the link is stable and clickable
    await homeLink.waitFor({ state: 'visible' });
    await homeLink.click();

    // Increased timeout for navigation and ensure we wait for URL to be exactly /
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('should navigate to games page', async ({ page }) => {
    await ensureNavigationVisible(page);
    const gamesLink = page.getByRole('link', { name: /games|игры/i }).first();
    await gamesLink.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should navigate to auth page', async ({ page }) => {
    if (getIsMobile(page)) {
      // On mobile, use the specific login indicator
      const loginLink = page.getByTestId('mobile-login-indicator').first();
      await expect(loginLink).toBeVisible();
      await loginLink.click();
      await expect(page).toHaveURL(/\/auth/);
    } else {
      const loginLink = page.getByTestId('desktop-login-button');
      await expect(loginLink).toBeVisible();
      await loginLink.click();
      await expect(page).toHaveURL(/\/auth/);
    }
  });
});
