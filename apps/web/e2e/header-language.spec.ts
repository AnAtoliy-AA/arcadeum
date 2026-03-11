import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Header Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display language switcher on header for all devices and change language', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

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

  test('should display language switcher and change language on mobile menu', async ({
    page,
  }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Open mobile menu
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // The mobile menu should be open
    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    const trigger = mobileNav.getByTestId('header-language-switcher');
    await expect(trigger).toBeVisible();

    // Default language
    await expect(trigger).toContainText('EN');

    // Change language to French
    await trigger.click();
    await page.getByRole('option', { name: 'FR' }).click();

    // The value should be updated — check the header trigger which is always visible
    const headerTrigger = page
      .locator('header')
      .getByTestId('header-language-switcher');
    await expect(headerTrigger).toContainText('FR', { timeout: 10000 });
  });
});
