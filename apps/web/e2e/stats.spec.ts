import { test, expect } from '@playwright/test';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Player Stats', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Prevention of 500s for other stats/games requests
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      // Allow specifics to be handled by subsequent routes (Playwright LIFO means subsequent routes check FIRST)
      if (url.includes('stats') || url.includes('leaderboard')) {
        return route.continue();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    // Mock stats API
    await page.route('**/games/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        }),
      });
    });

    // Mock leaderboard API
    await page.route('**/games/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          entries: [
            {
              rank: 1,
              playerId: 'user-1',
              username: 'testuser',
              totalGames: 10,
              wins: 7,
              losses: 3,
              winRate: 70,
            },
            {
              rank: 2,
              playerId: 'user-2',
              username: 'proplayer',
              totalGames: 20,
              wins: 12,
              losses: 8,
              winRate: 60,
            },
          ],
          hasMore: false,
          total: 2,
        }),
      });
    });
  });

  test('should display overview stats', async ({ page }) => {
    await navigateTo(page, '/stats');

    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.getByText('10', { exact: true }).first()).toBeVisible(); // Total games
    await expect(page.getByText('7', { exact: true }).first()).toBeVisible(); // Wins
    await expect(page.getByText('70%')).toBeVisible(); // Win rate
    await expect(page.getByText('Critical', { exact: true })).toBeVisible(); // Game ID should be human readable
  });

  test('should switch to leaderboard and display entries', async ({ page }) => {
    await navigateTo(page, '/stats');

    const leaderboardTab = page.getByRole('button', { name: /leaderboard/i });
    await leaderboardTab.click();

    await expect(page.getByText('proplayer')).toBeVisible();
    await expect(page.getByText('60.0%')).toBeVisible();
  });

  test('should not display anonymous users in leaderboard', async ({
    page,
  }) => {
    await page.route('**/games/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          entries: [
            {
              rank: 1,
              playerId: 'user-1',
              username: 'testuser',
              totalGames: 10,
              wins: 7,
              losses: 3,
              winRate: 70,
            },
          ],
          hasMore: false,
          total: 1,
        }),
      });
    });

    await navigateTo(page, '/stats');

    const leaderboardTab = page.getByRole('button', { name: /leaderboard/i });
    await leaderboardTab.click();

    await expect(page.getByText('testuser')).toBeVisible();
    await expect(page.getByText(/anonymous/i)).not.toBeVisible();
  });
});
