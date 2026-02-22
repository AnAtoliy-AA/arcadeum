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
});
