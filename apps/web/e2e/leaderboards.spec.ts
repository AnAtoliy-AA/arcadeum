import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Leaderboards page', () => {
  test('renders mythic spotlight + rank table', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    await expect(
      page.getByTestId('leaderboard-mythic-spotlight'),
    ).toBeVisible();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();

    const firstRow = page.getByTestId('leaderboard-row-1');
    await expect(firstRow).toBeVisible();
  });

  test('switching mode keeps table visible', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    await page.getByTestId('mode-tab-mafia').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();

    await page.getByTestId('mode-tab-all').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
  });

  test('cup countdown ticks', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const clock = page.getByTestId('cup-countdown-seconds');
    await expect(clock).toBeVisible();

    const a = await clock.textContent();
    await page.waitForTimeout(1200);
    const b = await clock.textContent();
    expect(a).not.toEqual(b);
  });
});
