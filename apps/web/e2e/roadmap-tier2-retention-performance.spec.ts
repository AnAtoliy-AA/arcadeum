import { test, expect } from '@playwright/test';

test.describe('Tier 2 Retention and Performance Suite', () => {
  test('validates core app shell and health endpoint', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
  });

  test('navigates to roadmap and verifies tier 8 and 9 statuses', async ({
    page,
  }) => {
    await page.goto('/en/roadmap');
    await expect(page.locator('h1')).toContainText('Roadmap');
    await expect(page.locator('text=Daily Habit System')).toBeVisible();
    await expect(page.locator('text=Web Worker AI')).toBeVisible();
  });
});
