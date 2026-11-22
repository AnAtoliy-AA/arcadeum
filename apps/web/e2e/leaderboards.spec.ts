import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { getMockLeaderboard, getMockPlayer } from '@/shared/api/leaderboard';
import type { GameMode } from '@/entities/leaderboard/model/types';

test.describe('Leaderboards page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/leaderboards(\/.*)?(\?.*)?$/, async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.fallback();
      }
      const url = new URL(route.request().url());

      const playerMatch = url.pathname.match(
        /\/leaderboards\/players\/([^/]+)$/,
      );
      if (playerMatch) {
        const id = decodeURIComponent(playerMatch[1] ?? '');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockPlayer(id)),
        });
        return;
      }

      if (!url.pathname.endsWith('/leaderboards')) {
        return route.fallback();
      }
      const mode = url.searchParams.get('mode') ?? 'all';
      const page_ = Number(url.searchParams.get('page') ?? '1') || 1;
      const pageSize = Number(url.searchParams.get('pageSize') ?? '50') || 50;
      const q = url.searchParams.get('q') ?? '';
      const opponentType = (url.searchParams.get('opponentType') ?? 'all') as
        'all' | 'pvp' | 'bot';
      const snapshot = await getMockLeaderboard({
        mode: mode as GameMode,
        page: page_,
        pageSize,
        q,
        opponentType,
        selfId: 'e2e-self',
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot),
      });
    });
  });

  test('renders all leaderboard sections', async ({ page }) => {
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
    await expect(page.getByTestId('mythic-challenge')).toBeVisible();
    await expect(page.getByTestId('row-live-chip').first()).toBeVisible();
    await expect(page.getByTestId('leaderboard-freshness')).toBeVisible();
    const panel = page.getByTestId('cup-coming-soon');
    await expect(panel).toContainText(/coming soon/i);
  });

  test('filters by opponent type (all, pvp, bot)', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    const opponentSelect = page.getByTestId('opponent-type-select');
    await expect(opponentSelect).toBeVisible();
    await expect(opponentSelect).toHaveValue('all');

    await opponentSelect.selectOption('pvp');
    await expect(opponentSelect).toHaveValue('pvp');
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();

    await opponentSelect.selectOption('bot');
    await expect(opponentSelect).toHaveValue('bot');
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
  });

  test('supports mode switching, search, keyboard nav, and jump-to-me', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    const firstRow = page.getByTestId('leaderboard-row-1');
    const before = (await firstRow.textContent()) ?? '';
    await page.getByTestId('mode-tab-critical_v1').click();
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(firstRow).not.toHaveText(before);

    const all = page.getByTestId('mode-tab-all');
    await all.focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () =>
        page.getByTestId('mode-tab-critical_v1').getAttribute('aria-selected'),
      )
      .toBe('true');

    await expect(firstRow).toBeVisible();
    await page.getByTestId('leaderboard-search').fill('zzzznotaplayer');
    await expect(firstRow).not.toBeVisible();

    await page.getByTestId('leaderboard-jump-to-me').click();
    await expect(page.getByTestId('leaderboard-self-row')).toBeInViewport();

    const self = page.getByTestId('leaderboard-self-row');
    await expect(self).toBeVisible();
    await page.evaluate(() => window.scrollBy(0, 2000));
    await expect(self).toBeInViewport();
  });

  test('mythic challenge navigates to player profile and back', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    await page.getByTestId('mythic-challenge').click();
    await page.waitForURL(/\/players\//, { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByTestId(
        new RegExp('^player-profile-' + page.url().split('/players/')[1] + '$'),
      ),
    ).toBeVisible();

    await page.getByTestId('player-profile-back').click();
    await expect(page).toHaveURL(/\/leaderboards/);
  });

  test('clicking leaderboard table row navigates to player statistics profile', async ({
    page,
  }) => {
    await navigateTo(page, '/leaderboards');

    const firstRow = page.getByTestId('leaderboard-row-1');
    await expect(firstRow).toBeVisible();
    await firstRow.click();
    await page.waitForURL(/\/players\//, { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByTestId(
        new RegExp('^player-profile-' + page.url().split('/players/')[1] + '$'),
      ),
    ).toBeVisible();

    await page.getByTestId('player-profile-back').click();
    await expect(page).toHaveURL(/\/leaderboards/);
  });

  test('renders all game mode tabs with friendly names', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    const heartsTab = page.getByTestId('mode-tab-hearts_v1');
    const spadesTab = page.getByTestId('mode-tab-spades_v1');
    const goTab = page.getByTestId('mode-tab-go_v1');
    const pachisiTab = page.getByTestId('mode-tab-pachisi_v1');

    await expect(heartsTab).toBeVisible();
    await expect(spadesTab).toBeVisible();
    await expect(goTab).toBeVisible();
    await expect(pachisiTab).toBeVisible();

    await expect(heartsTab).not.toHaveText(/hearts_v1/);
    await expect(spadesTab).not.toHaveText(/spades_v1/);
    await expect(goTab).not.toHaveText(/go_v1/);
    await expect(pachisiTab).not.toHaveText(/pachisi_v1/);
  });

  test('displays full player names with title attribute', async ({ page }) => {
    await navigateTo(page, '/leaderboards');

    const nameEl = page
      .locator('[data-testid^="leaderboard-row-"] [title]')
      .first();
    await expect(nameEl).toBeVisible();
    const titleVal = await nameEl.getAttribute('title');
    expect(titleVal).toBeTruthy();
  });
});
