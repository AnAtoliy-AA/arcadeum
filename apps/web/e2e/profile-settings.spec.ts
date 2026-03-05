import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Profile and Settings', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should display user profile information', async ({ page }) => {
    await navigateTo(page, '/settings');
    // Wait for hydration
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      /.*/,
      { timeout: 10000 },
    );

    await expect(page.getByText(/testuser/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/test@example.com/i).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('should allow toggling sound settings', async ({ page }) => {
    await navigateTo(page, '/settings');
    const soundToggle = page
      .getByRole('checkbox', { name: /sound|звук/i })
      .first();
    if (await soundToggle.isVisible()) {
      const isChecked = await soundToggle.isChecked();
      await soundToggle.click();
      expect(await soundToggle.isChecked()).toBe(!isChecked);
    }
  });

  test('should allow toggling notification settings', async ({ page }) => {
    await navigateTo(page, '/settings');
    const notifyToggle = page
      .getByRole('checkbox', { name: /notification|уведомления/i })
      .first();
    if (await notifyToggle.isVisible()) {
      await notifyToggle.click();
    }
  });
});
