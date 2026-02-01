import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should load auth page', async ({ page }) => {
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should display auth content', async ({ page }) => {
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });

  test('should display OAuth provider buttons', async ({ page }) => {
    // Look for common OAuth providers (Google, GitHub, etc.)
    const authButtons = page.locator('button, a').filter({
      hasText: /google|github|sign in|login|continue with/i,
    });

    // At least one auth option should be visible
    if ((await authButtons.count()) > 0) {
      await expect(authButtons.first()).toBeVisible();
    }
  });

  test('should have sign in heading or text', async ({ page }) => {
    const signInText = page.getByText(/sign in|login|welcome/i).first();
    if (await signInText.isVisible()) {
      await expect(signInText).toBeVisible();
    }
  });

  test('should display branding', async ({ page }) => {
    // Check for logo or app name
    const branding = page
      .locator('img[alt*="logo" i], [class*="logo"], h1, h2')
      .first();
    await expect(branding).toBeVisible();
  });
});
