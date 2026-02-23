import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Footer Links', () => {
  test('should show copyright information', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('footer')).toContainText(/©|2026|Arcadeum/);
  });

  test('should show app version', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('footer')).toContainText(/v\d+\.\d+\.\d+/);
  });

  test('should show social links', async ({ page }) => {
    await navigateTo(page, '/');
    // We check for aria-labels of social links
    // Since env vars are empty by default, we expect no social links except support
    await expect(page.locator('footer a[aria-label="Support"]')).toBeVisible();
  });
});
