import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Header Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display language switcher on header for all devices and change language', async ({
    page,
  }) => {
    const languageSwitcher = page
      .locator('header')
      .getByTestId('header-language-switcher');
    await expect(languageSwitcher).toBeVisible();

    // Default language is typically en
    await expect(languageSwitcher).toHaveValue('en');

    // Change language to Spanish
    await languageSwitcher.selectOption('es');

    // The value should be updated
    await expect(languageSwitcher).toHaveValue('es');
  });

  test('should display language switcher and change language on mobile menu', async ({
    page,
  }) => {
    // We conditionally test the mobile menu without skipping
    // to prevent Playwright warning about skipped tests.
    // If it's a desktop browser, we don't have a mobile menu toggle button visible,
    // so we can just assert that and exit cleanly or resize the viewport.

    // Resize to mobile viewport to enforce mobile menu visibility across all environments
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow viewport recalculations

    // Open mobile menu
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await menuButton.dispatchEvent('click');

    // The mobile menu should be open
    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    const languageSwitcher = mobileNav.locator('select');
    await expect(languageSwitcher).toBeVisible();

    // Default language
    await expect(languageSwitcher).toHaveValue('en');

    // Change language to French
    await languageSwitcher.selectOption('fr');

    // The value should be updated
    await expect(languageSwitcher).toHaveValue('fr');
  });
});
