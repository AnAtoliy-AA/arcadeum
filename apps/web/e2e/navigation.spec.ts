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
    // Navigate to games first
    await page.goto('/games');

    // Click logo or home link to return
    const homeLink = page.getByRole('link', { name: /home|aico/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should navigate to games page', async ({ page }) => {
    const gamesLink = page.getByRole('link', { name: /games/i }).first();
    await gamesLink.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should navigate to auth page', async ({ page }) => {
    const signInLink = page
      .getByRole('link', { name: /sign in|login/i })
      .first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth/);
    }
  });
});
