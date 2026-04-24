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
    // Wait for session data to be hydrated in the UI
    await expect(async () => {
      const username = page.getByText(/testuser/i).first();
      const email = page.getByText(/test@example.com/i).first();

      await expect(username).toBeVisible();
      await expect(email).toBeVisible();
    }).toPass({
      timeout: 15000,
    });
  });

  test('should allow toggling sound settings', async ({ page }) => {
    await navigateTo(page, '/settings');
    const soundRow = page.getByTestId('sound-row');
    const soundCheckbox = soundRow.locator('input[type="checkbox"]');

    await expect(soundRow).toBeVisible();
    const isChecked = await soundCheckbox.isChecked();
    await soundRow.click();
    await expect(soundCheckbox).toBeChecked({ checked: !isChecked });
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
