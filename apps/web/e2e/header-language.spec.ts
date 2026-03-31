import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

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

    // Wait for the trigger to be visible
    await expect(languageSwitcher).toBeVisible();

    // Default language from text
    await expect(languageSwitcher).toContainText('EN');

    // Change language to Spanish
    await languageSwitcher.click();
    await page.getByRole('option', { name: 'ES' }).click();

    // The value should be updated
    await expect(languageSwitcher).toContainText('ES', { timeout: 10000 });
  });

  test('should display language switcher in header and not in mobile menu on mobile devices', async ({
    page,
  }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 1. Check it's visible in the header
    const headerLanguageSwitcher = page
      .locator('header')
      .getByTestId('header-language-switcher');
    await expect(headerLanguageSwitcher).toBeVisible();

    // 2. Open mobile menu
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // The mobile menu should be open
    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    // 3. Verify it's NOT in the mobile menu
    const menuLanguageSwitcher = mobileNav.getByTestId(
      'header-language-switcher',
    );
    await expect(menuLanguageSwitcher).not.toBeVisible();

    // 4. Change language from header while menu is open
    await headerLanguageSwitcher.click();
    await page.getByRole('option', { name: 'FR' }).click();

    // Verify language changed (header text should update)
    await expect(headerLanguageSwitcher).toContainText('FR', {
      timeout: 10000,
    });
  });
});
