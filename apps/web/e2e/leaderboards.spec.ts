import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Leaderboards page', () => {
  test('hero, ticker, cup, mythic spotlight, runner-ups, table all render', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    await expect(page.getByTestId('leaderboard-hero')).toBeVisible();
    await expect(page.getByTestId('leaderboard-ticker')).toBeVisible();
    await expect(page.getByTestId('cup-countdown-seconds')).toBeVisible();
    await expect(
      page.getByTestId('leaderboard-mythic-spotlight'),
    ).toBeVisible();
    await expect(page.getByTestId('runner-up-2')).toBeVisible();
    await expect(page.getByTestId('runner-up-3')).toBeVisible();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(page.getByTestId('leaderboard-row-1')).toBeVisible();
  });

  test('mythic spotlight has 3 CTAs', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await expect(page.getByTestId('mythic-challenge')).toBeVisible();
    await expect(page.getByTestId('mythic-watch')).toBeVisible();
    await expect(page.getByTestId('mythic-follow')).toBeVisible();
  });

  test('switching mode updates the first row', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const firstRow = page.getByTestId('leaderboard-row-1');
    const before = (await firstRow.textContent()) ?? '';
    await page.getByTestId('mode-tab-mafia').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(firstRow).not.toHaveText(before);
  });

  test('mode tabs are keyboard navigable', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const all = page.getByTestId('mode-tab-all');
    await all.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('mode-tab-mafia')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('live chip appears on at least one row', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await expect(page.getByTestId('row-live-chip').first()).toBeVisible();
  });

  test('search filters rows', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const firstRow = page.getByTestId('leaderboard-row-1');
    await expect(firstRow).toBeVisible();
    await page.getByTestId('leaderboard-search').fill('zzzznotaplayer');
    await expect(firstRow).not.toBeVisible();
  });

  test('jump-to-me brings self row into view', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await page.getByTestId('leaderboard-jump-to-me').click();
    await expect(page.getByTestId('leaderboard-self-row')).toBeInViewport();
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

  test('freshness indicator renders above the cup card', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await expect(page.getByTestId('leaderboard-freshness')).toBeVisible();
  });

  test('mythic challenge CTA navigates to /players/<id>', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await page.getByTestId('mythic-challenge').click();
    await page.waitForURL(/\/players\//);
    await expect(
      page.getByTestId(
        new RegExp('^player-profile-' + page.url().split('/players/')[1] + '$'),
      ),
    ).toBeVisible();
  });

  test('player profile back button returns to leaderboard', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');
    await page.getByTestId('mythic-challenge').click();
    await page.waitForURL(/\/players\//);
    await page.getByTestId('player-profile-back').click();
    await expect(page).toHaveURL(/\/leaderboards/);
  });
});
