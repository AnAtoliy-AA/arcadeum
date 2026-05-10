import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Profile Menu Modernization', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await navigateTo(page, '/');
  });

  test('profile menu should open and display bold items', async ({ page }) => {
    const trigger = page.locator('[data-profile-menu] button').first();
    await trigger.click();

    const dropdown = page.locator('[data-profile-menu] > div').last();
    await expect(dropdown).toBeVisible();

    // Verify glassmorphism / dark background
    const backgroundColor = await dropdown.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // rgba(12, 14, 15, 0.98)
    expect(backgroundColor).toContain('rgb(12, 14, 15)');

    // Verify border radius
    const borderRadius = await dropdown.evaluate(
      (el) => window.getComputedStyle(el).borderRadius,
    );
    expect(borderRadius).toBe('20px'); // $5 radius is 20px

    // Verify bold links
    const firstLink = dropdown.getByText(/Admin/i).first();
    await expect(firstLink).toBeVisible();

    const fontWeight = await firstLink.evaluate(
      (el) => window.getComputedStyle(el).fontWeight,
    );
    // Weight 800
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(800);
  });

  test('admin link should be visible only for admins', async ({ page }) => {
    // Already logged in as admin in beforeEach
    await page.locator('[data-profile-menu] button').first().click();
    await expect(page.getByText(/Admin/i)).toBeVisible();

    // Now mock as a regular user
    await mockSession(page, { role: 'free' });
    await page.reload();
    await page.locator('[data-profile-menu] button').first().click();
    await expect(page.getByText(/Admin/i)).not.toBeVisible();
  });

  test('menu items should have hover effects', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Firefox CI does not apply CSS :hover computed styles via synthetic mouse events',
    );

    await page.locator('[data-profile-menu] button').first().click();
    const walletLink = page
      .getByText(/Wallet/i)
      .first()
      .locator('xpath=..'); // Parent XStack

    await walletLink.hover();

    // Wait for hover state to be reflected
    await expect(async () => {
      const bgColor = await walletLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      // rgba(255, 255, 255, 0.05)
      expect(bgColor).toContain('rgba(255, 255, 255, 0.05)');
    }).toPass();
  });
});
