import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Footer Links', () => {
  test('should show copyright information', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('footer')).toContainText(/©|2026|Arcadeum/);
  });

  test('should show app version', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('footer')).toContainText(/version/i);
    await expect(page.locator('footer')).toContainText(/\d+\.\d+\.\d+/);
  });

  test('should show legal links in footer and not in header', async ({
    page,
  }) => {
    await navigateTo(page, '/');
    // Scroll to bottom and wait a bit for footer to be stable
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check footer contains legal links
    const footer = page.locator('footer');
    await expect(
      footer.locator('[data-testid="footer-legal-privacy"]'),
    ).toBeVisible();
    await expect(
      footer.locator('[data-testid="footer-legal-terms"]'),
    ).toBeVisible();
    await expect(
      footer.locator('[data-testid="footer-legal-contact"]'),
    ).toBeVisible();

    // Check header does not contain legal links (desktop)
    const header = page.locator('header');
    await expect(
      header.getByRole('link', { name: /privacy/i }),
    ).not.toBeVisible();
    await expect(
      header.getByRole('link', { name: /terms/i }),
    ).not.toBeVisible();
  });

  test('should show social or support links', async ({ page }) => {
    await navigateTo(page, '/');
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    const supportLink = footer.locator('[data-testid="footer-social-support"]');
    const socialLinks = footer.locator('[data-testid^="footer-social-"]');

    await expect(supportLink.or(socialLinks).first()).toBeVisible();
  });
});
