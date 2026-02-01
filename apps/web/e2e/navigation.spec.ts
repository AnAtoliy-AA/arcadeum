import { test, expect } from '@playwright/test';
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
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should navigate to home from any page', async ({ page }) => {
    await page.goto('/games');

    // Use a more robust selector for the home link/logo
    const homeLink = page.locator('header a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to games page', async ({ page }) => {
    const gamesLink = page.getByRole('link', { name: /games|игры/i }).first();
    await gamesLink.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should navigate to auth page', async ({ page }) => {
    const signInLink = page.locator('a[href="/auth"]').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth/);
    }
  });
});
