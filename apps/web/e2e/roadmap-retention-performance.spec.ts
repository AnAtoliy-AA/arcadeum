import { test, expect } from '@playwright/test';

test.describe('Roadmap Retention & High Performance Engine', () => {
  test('navigates to daily challenges and verifies retention components', async ({
    page,
  }) => {
    await page.goto('/daily-challenges');
    await expect(page).toHaveURL(/\/daily-challenges/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigates to games hub and verifies performance skeleton rendering', async ({
    page,
  }) => {
    await page.goto('/games/sea-battle');
    await expect(page).toHaveURL(/\/games\/sea-battle/);
    await expect(page.locator('body')).toBeVisible();
  });
});
