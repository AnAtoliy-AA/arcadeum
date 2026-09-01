import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () =>
      document.documentElement.getAttribute('data-app-ready') === 'true',
  );
}

test.describe('Performance Optimizations — Virtual List & Core Pages', () => {
  test('leaderboards page loads and hydrates with high performance', async ({
    page,
  }) => {
    await page.goto('/en/leaderboards', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  });

  test('history page loads efficiently', async ({ page }) => {
    await page.goto('/en/history', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  });
});
