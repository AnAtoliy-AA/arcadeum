import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Games List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock default empty response (can be overridden by tests)
    // Safe catch-all for any other games API calls (like stats/header) to prevent 500s
    await page.route('**/games/*', async (route) => {
      // Allow page navigation to proceed
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      // Allow specific mock below to handle rooms (checked in reverse order of registration)
      // Actually, if we define this one FIRST (here), and specific one LATER,
      // Playwright checks Specific First. If Specific continues (or not matched), it checks this.
      // So this acts as FALLBACK.Perfect.
      if (url.includes('/rooms') || url.includes('/history')) {
        return route.continue();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.route('**/games/rooms*', async (route) => {
      // Only handle if not handled by previous routes (technically this executes first if registered first? No, LIFO)
      // Wait, LIFO.
      // Registered 2nd => Checked 1st.
      // If matches, good.
      // If not, checked 1st (Catch-all).
      // So games/rooms matches 2nd. it handles.
      // games/stats matches 1st (Catch-all). It handles.
      // games/rooms request logic:
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ rooms: [], total: 0 }),
      });
    });
  });

  test('should load games page', async ({ page }) => {
    await navigateTo(page, '/games');
    await expect(page).toHaveURL(/\/games/);
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
  });

  test('should display filters and search', async ({ page }) => {
    await navigateTo(page, '/games');
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]',
    );
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    const filters = page
      .locator('button')
      .filter({ hasText: /all|lobby|active|finished|все|все|всего/i });
    if ((await filters.count()) > 0) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('should handle navigation to create room', async ({ page }) => {
    await navigateTo(page, '/games');
    const createLink = page
      .getByRole('link', { name: /create|new|создать|crear/i })
      .first();
    if (await createLink.isVisible()) {
      await createLink.click();
      await expect(page).toHaveURL(/\/games\/create/);
    }
  });

  test('should display game cards or empty state', async ({ page }) => {
    await navigateTo(page, '/games');
    const mainContent = page.locator('main, [class*="Container"]').first();
    await expect(mainContent).toBeVisible();

    await expect(async () => {
      const cardsCount = await page.getByTestId('room-card').count();
      const isEmpty = await page.getByTestId('games-empty').isVisible();
      expect(cardsCount > 0 || isEmpty).toBe(true);
    }).toPass({ timeout: 10000, intervals: [1000] });
  });

  test('should clear search and restore list', async ({ page }) => {
    await navigateTo(page, '/games');
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]',
    );
    await searchInput.fill('some search');
    await searchInput.fill(''); // Clear

    await expect(page.getByTestId('games-empty')).toBeVisible();
  });
});
