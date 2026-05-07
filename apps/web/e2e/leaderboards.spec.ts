import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Leaderboards page', () => {
  test('renders cup countdown, mythic spotlight, and table', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    await expect(page.getByTestId('cup-countdown-seconds')).toBeVisible();
    await expect(
      page.getByTestId('leaderboard-mythic-spotlight'),
    ).toBeVisible();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(page.getByTestId('leaderboard-row-1')).toBeVisible();
  });

  test('switching mode updates the first row name', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    const firstRow = page.getByTestId('leaderboard-row-1');
    const before = (await firstRow.textContent()) ?? '';
    await page.getByTestId('mode-tab-mafia').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(firstRow).not.toHaveText(before);
  });

  test('mode tabs are keyboard navigable (ArrowRight)', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const all = page.getByTestId('mode-tab-all');
    await all.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('mode-tab-mafia')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('pinned self row stays in viewport on scroll', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const self = page.getByTestId('leaderboard-self-row');
    await expect(self).toBeVisible();
    await page.mouse.wheel(0, 2000);
    await expect(self).toBeInViewport();
  });

  test('cup countdown ticks within 2s', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const clock = page.getByTestId('cup-countdown-seconds');
    await expect(clock).toBeVisible();
    const before = await clock.textContent();
    await page.waitForTimeout(1500);
    const after = await clock.textContent();
    expect(after).not.toEqual(before);
  });
});
