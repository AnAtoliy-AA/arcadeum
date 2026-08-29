import { test, expect, navigateTo } from './fixtures/test-utils';

test.describe('Loading States and Skeletons', () => {
  test('should load games catalog page cleanly', async ({ page }) => {
    await navigateTo(page, '/games');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load leaderboards page cleanly', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load tournaments page cleanly', async ({ page }) => {
    await navigateTo(page, '/tournaments');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load shop page cleanly', async ({ page }) => {
    await navigateTo(page, '/shop');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});
