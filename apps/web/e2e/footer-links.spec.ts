import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Footer Links', () => {
  // Footer tests are sensitive to slow page loads across parallel browsers.
  test.describe.configure({ mode: 'serial' });

  // Navigate and scroll to footer, waiting for it to render
  async function scrollToFooter(page: import('@playwright/test').Page) {
    await navigateTo(page, '/');
    await page.waitForLoadState('load');
    // Ensure the footer is attached to the DOM
    const footer = page.locator('footer.home-footer-root').first();
    await footer.waitFor({ state: 'attached' });

    // Scroll to the bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify visibility using standard assertion
    await expect(footer).toBeVisible();
  }

  test('should show copyright information', async ({ page }) => {
    await scrollToFooter(page);
    await expect(page.locator('footer.home-footer-root').first()).toContainText(
      /©|2026|Arcadeum/,
      {},
    );
  });

  test('should show app version', async ({ page }) => {
    await scrollToFooter(page);
    await expect(page.locator('footer.home-footer-root').first()).toContainText(
      /\d+\.\d+\.\d+/,
      {},
    );
  });

  test('should show legal links in footer and not in header', async ({
    page,
  }) => {
    await scrollToFooter(page);

    const footer = page.locator('footer.home-footer-root').first();
    // On mobile, footer sections are collapsible - expand Legal section if needed
    const privacyLink = footer.locator('a[href="/privacy"]');
    if (!(await privacyLink.isVisible())) {
      const legalToggle = footer
        .getByText('LEGAL')
        .or(footer.getByText('Legal'))
        .or(footer.getByText('legal'))
        .first();
      if (await legalToggle.isVisible({}).catch(() => false)) {
        await legalToggle.click({ force: true });
      }
    }
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible({});
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
    await expect(footer.locator('a[href="/contact"]')).toBeVisible();

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
    await scrollToFooter(page);

    const footer = page.locator('footer.home-footer-root').first();
    // On mobile, footer sections may be collapsed - expand "Follow Us" if needed
    const socialLinks = footer.locator('[data-testid^="footer-social-"]');
    if (
      !(await socialLinks
        .first()
        .isVisible({})
        .catch(() => false))
    ) {
      const followToggle = footer.getByText(/follow us/i).first();
      if (await followToggle.isVisible({}).catch(() => false)) {
        await followToggle.click({ force: true });
      }
    }

    await expect(socialLinks.first()).toBeVisible({});
  });
});
