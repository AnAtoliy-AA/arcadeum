import { expect } from '@playwright/test';
import { test, getIsMobile } from './fixtures/test-utils';
import { navigateTo, mockSession, handleRoute } from './fixtures/test-utils';

test.describe('Player Stats', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Prevention of 500s for other stats/games requests
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      if (url.includes('stats') || url.includes('leaderboard')) {
        return route.continue();
      }
      await handleRoute(route, {});
    });

    // Mock stats API
    await page.route('**/games/stats', async (route) => {
      await handleRoute(route, {
        totalGames: 10,
        wins: 7,
        losses: 3,
        winRate: 70,
        byGameType: [
          {
            gameId: 'critical_v1',
            totalGames: 10,
            wins: 7,
            winRate: 70,
          },
        ],
      });
    });

    // Mock leaderboard API
    await page.route('**/games/leaderboard*', async (route) => {
      await handleRoute(route, {
        entries: [
          {
            rank: 1,
            playerId: '507f191e810c19729de860ea',
            username: 'testuser',
            totalGames: 10,
            wins: 7,
            losses: 3,
            winRate: 70,
          },
          {
            rank: 2,
            playerId: '507f191e810c19729de860e2',
            username: 'proplayer',
            totalGames: 20,
            wins: 12,
            losses: 8,
            winRate: 60,
          },
        ],
        hasMore: false,
        total: 2,
      });
    });
  });

  test('should display overview stats', async ({ page }) => {
    await navigateTo(page, '/stats');

    // Stats page now defaults to the leaderboard tab — switch to My Stats
    // before asserting on the overview metrics.
    const myStatsTab = page.getByTestId('stats-tab-my-stats');
    await myStatsTab
      .click({ force: true })
      .catch(() => myStatsTab.dispatchEvent('click'));

    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.getByTestId('stats-total-games')).toHaveText('10'); // Total games
    await expect(page.getByTestId('stats-wins')).toHaveText('7'); // Wins
    await expect(page.getByText('70%').first()).toBeVisible(); // Win rate

    // Use a more specific locator for the game name in the breakdown table
    await expect(
      page.locator('.stats-breakdown-row').getByText('Critical'),
    ).toBeVisible();
  });

  test('should switch to leaderboard and display entries', async ({ page }) => {
    await navigateTo(page, '/stats');

    // 2. Click Leaderboard tab using data-testid
    const leaderboardTab = page.getByTestId('stats-tab-leaderboard');
    await leaderboardTab
      .click({ force: true })
      .catch(() => leaderboardTab.dispatchEvent('click'));

    // Wait for leaderboard to be active and loading complete
    await expect(async () => {
      // Ensure tab is actually active
      if ((await leaderboardTab.getAttribute('aria-pressed')) !== 'true') {
        await leaderboardTab
          .click({ force: true })
          .catch(() => leaderboardTab.dispatchEvent('click'));
      }
      // Check for entries
      await expect(page.getByText('proplayer')).toBeVisible({});

      // Win rate is hidden on mobile (max-width: 768px)
      if (!getIsMobile(page)) {
        await expect(page.getByText(/60(\.0)?%/)).toBeVisible({});
      }
    }).toPass({});
  });

  test('should not display anonymous users in leaderboard', async ({
    page,
  }) => {
    await page.route('**/games/leaderboard*', async (route) => {
      await handleRoute(route, {
        entries: [
          {
            rank: 1,
            playerId: '507f191e810c19729de860ea',
            username: 'testuser',
            totalGames: 10,
            wins: 7,
            losses: 3,
            winRate: 70,
          },
        ],
        hasMore: false,
        total: 1,
      });
    });

    await navigateTo(page, '/stats');

    const leaderboardTab = page.getByTestId('stats-tab-leaderboard');
    await expect(async () => {
      if ((await leaderboardTab.getAttribute('aria-pressed')) !== 'true') {
        await leaderboardTab
          .click({ force: true })
          .catch(() => leaderboardTab.dispatchEvent('click'));
      }
      const row = page
        .locator('div.stats-leaderboard-row')
        .filter({ hasText: 'testuser' });
      await expect(row).toBeVisible({});
    }).toPass({});

    // Check that 'anonymous' text is not present in the leaderboard rows
    const leaderboardRows = page.locator('.stats-leaderboard-row');
    await expect(leaderboardRows).not.toContainText(/anonymous|аноним/i);
  });
});
