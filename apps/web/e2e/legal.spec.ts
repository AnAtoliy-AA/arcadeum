import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Legal and Contact Smoke Tests', () => {
  test('should load Terms of Service', async ({ page }) => {
    await navigateTo(page, '/terms');
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/terms|условия|términos/i);
  });

  test('should load Privacy Policy', async ({ page }) => {
    await navigateTo(page, '/privacy');
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(
      /privacy|конфиденциальность|privacidad/i,
    );
  });

  test('should load Contact page', async ({ page }) => {
    await navigateTo(page, '/contact');
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(
      /contact|контакт|contacto/i,
    );
  });
});
