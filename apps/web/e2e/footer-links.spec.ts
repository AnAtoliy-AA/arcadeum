import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Footer Links', () => {
  test('should have working legal links in footer', async ({ page }) => {
    await navigateTo(page, '/');

    const footer = page.locator('footer');
    const termsLink = footer.getByRole('link', { name: /terms|условия/i });
    const privacyLink = footer.getByRole('link', {
      name: /privacy|конфиденциальность/i,
    });

    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });

  test('should have contact link in footer', async ({ page }) => {
    await navigateTo(page, '/');
    const contactLink = page
      .locator('footer')
      .getByRole('link', { name: /contact|контакт/i });
    await expect(contactLink).toBeVisible();
  });

  test('should show copyright information', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('footer')).toContainText(/©|2026|Arcadeum/);
  });
});
