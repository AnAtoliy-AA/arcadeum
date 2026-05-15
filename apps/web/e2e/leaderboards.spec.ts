import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { getMockLeaderboard } from '@/shared/api/leaderboard';

test.describe('Leaderboards page', () => {
  // The leaderboards UI is data-driven (ticker only renders with events,
  // self row + jump-to-me only render when `data.self` is set, etc.). The
  // app has a built-in `getMockLeaderboard` gated on NEXT_PUBLIC_E2E, but
  // the env var doesn't reach a reused dev server, and the real BE either
  // has no Mongo or no auto-seed in CI. Serve the same mock snapshot at
  // the network layer so every project gets a deterministic dataset.
  test.beforeEach(async ({ page }) => {
    const snapshot = await getMockLeaderboard({ selfId: 'e2e-self' });
    await page.route('**/leaderboards*', async (route) => {
      // Don't intercept the page navigation — `**/leaderboards*` also matches
      // the document request to /leaderboards on the web origin and would
      // hand the browser JSON instead of HTML, breaking hydration.
      if (route.request().resourceType() === 'document') {
        return route.fallback();
      }
      const url = new URL(route.request().url());
      if (!url.pathname.endsWith('/leaderboards')) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot),
      });
    });
  });

  test('hero, ticker, cup, mythic spotlight, runner-ups, table all render', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    await expect(page.getByTestId('leaderboard-hero')).toBeVisible();
    await expect(page.getByTestId('leaderboard-ticker')).toBeVisible();
    await expect(page.getByTestId('cup-coming-soon')).toBeVisible();
    await expect(
      page.getByTestId('leaderboard-mythic-spotlight'),
    ).toBeVisible();
    await expect(page.getByTestId('runner-up-2')).toBeVisible();
    await expect(page.getByTestId('runner-up-3')).toBeVisible();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(page.getByTestId('leaderboard-row-1')).toBeVisible();
  });

  test('mythic spotlight exposes the profile CTA', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    await expect(page.getByTestId('mythic-challenge')).toBeVisible();
  });

  test('switching mode updates the first row', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const firstRow = page.getByTestId('leaderboard-row-1');
    const before = (await firstRow.textContent()) ?? '';
    await page.getByTestId('mode-tab-critical').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(firstRow).not.toHaveText(before);
  });

  test('mode tabs are keyboard navigable', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const all = page.getByTestId('mode-tab-all');
    await all.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('mode-tab-critical')).toHaveAttribute(
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
    // mouse.wheel isn't supported in mobile WebKit; window.scrollBy works
    // across every project we run e2e on.
    await page.evaluate(() => window.scrollBy(0, 2000));
    await expect(self).toBeInViewport();
  });

  test('tournament section shows coming-soon placeholder', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const panel = page.getByTestId('cup-coming-soon');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(/coming soon/i);
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
