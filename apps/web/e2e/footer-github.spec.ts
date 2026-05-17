import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Footer GitHub Link', () => {
  test.describe.configure({ mode: 'serial' });

  async function scrollToFooter(page: import('@playwright/test').Page) {
    await navigateTo(page, '/');
    await page.waitForLoadState('load');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    await expect(page.locator('footer').first()).toBeVisible({});
  }

  test('should show github link in footer', async ({ page }) => {
    await scrollToFooter(page);
    const githubLink = page.locator('[data-testid="footer-social-github"]');

    // Check if it's visible (might need to expand on mobile, but social icons are usually top-level in Footer.tsx)
    await expect(githubLink).toBeVisible({});

    // Verify href
    const href = await githubLink.getAttribute('href');
    expect(href).toBe('https://github.com/AnAtoliy-AA/arcadeum');
  });
});
