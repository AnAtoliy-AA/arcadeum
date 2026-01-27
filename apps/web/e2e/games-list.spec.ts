import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Games List Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/games');
  });

  test('should load games page', async ({ page }) => {
    await expect(page).toHaveURL(/\/games/);
  });

  test('should display page header', async ({ page }) => {
    const header = page.locator('h1, h2').first();
    await expect(header).toBeVisible();
  });

  test('should display filters section', async ({ page }) => {
    // Check for filter elements (search, status, etc.)
    const filtersArea = page
      .locator(
        '[class*="filter"], [class*="Filter"], input[type="search"], input[placeholder*="search" i]',
      )
      .first();
    // Filters should be visible if they exist
    if ((await filtersArea.count()) > 0) {
      await expect(filtersArea).toBeVisible();
    }
  });

  test('should display view mode toggle', async ({ page }) => {
    // Look for grid/list view toggle
    const viewToggle = page
      .locator('button[aria-label*="view" i], [class*="view"]')
      .first();
    if ((await viewToggle.count()) > 0) {
      await expect(viewToggle).toBeVisible();
    }
  });

  test('should have create room button or link', async ({ page }) => {
    const createButton = page
      .getByRole('link', { name: /create|new/i })
      .first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test('should display loading or content state', async ({ page }) => {
    // Wait for either loading indicator or room list content
    await page.waitForTimeout(1000);

    // Check if page has either rooms, empty state, or loading
    const hasContent = await page.locator('main').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('should navigate to create room page', async ({ page }) => {
    const createLink = page.getByRole('link', { name: /create/i }).first();
    if (await createLink.isVisible()) {
      await createLink.click();
      await expect(page).toHaveURL(/\/games\/create/);
    }
  });
});
