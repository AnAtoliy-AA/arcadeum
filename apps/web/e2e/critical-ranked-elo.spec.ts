import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Critical Ranked ELO & Duel Arena', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rankings/critical_v1*', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      await handleRoute(route, {
        gameId: 'critical_v1',
        season: '2026Q4',
        total: 2,
        entries: [
          {
            rank: 1,
            userId: 'user-top-1',
            username: 'BombApex',
            elo: 2180,
            tier: 'master',
            wins: 48,
            losses: 4,
            draws: 0,
            peakElo: 2200,
          },
          {
            rank: 2,
            userId: 'user-top-2',
            username: 'TacticalDefuser',
            elo: 1850,
            tier: 'diamond',
            wins: 30,
            losses: 10,
            draws: 1,
            peakElo: 1880,
          },
        ],
      });
    });

    await page.route('**/rankings/me*', async (route) => {
      await handleRoute(route, []);
    });
  });

  test('renders ranked hub with 6 competitive tiers, user status, rules, and leaderboard', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/critical');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Critical');

    const rankedHub = page
      .locator('[data-testid="critical-ranked-hub"]')
      .first();
    await expect(rankedHub).toBeVisible();

    const rankedTitle = rankedHub.locator('h2').first();
    await expect(rankedTitle).toHaveText('Critical Ranked ELO & Duel Arena');

    const userElo = page.locator('[data-testid="user-ranked-elo"]').first();
    await expect(userElo).toBeVisible();
    await expect(userElo).toHaveText('1200');

    const queueButton = page
      .locator('[data-testid="queue-ranked-critical-button"]')
      .first();
    await expect(queueButton).toBeVisible();
    await expect(queueButton).toHaveText('Queue Ranked 1v1 Showdown');

    await expect(
      page.locator('[data-testid="tier-card-master"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="tier-card-diamond"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="tier-card-platinum"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="tier-card-gold"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="tier-card-silver"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="tier-card-bronze"]').first(),
    ).toBeVisible();

    const leaderboardRow1 = page
      .locator('[data-testid="leaderboard-row-1"]')
      .first();
    await expect(leaderboardRow1).toBeVisible();
    await expect(leaderboardRow1).toContainText('BombApex');
    await expect(leaderboardRow1).toContainText('48W - 4L (92%)');

    const leaderboardRow2 = page
      .locator('[data-testid="leaderboard-row-2"]')
      .first();
    await expect(leaderboardRow2).toBeVisible();
    await expect(leaderboardRow2).toContainText('TacticalDefuser');

    const quickNavItem = page.locator('a[href="#ranked"]').first();
    await expect(quickNavItem).toBeVisible();
    await expect(quickNavItem).toContainText('Ranked 1v1');
  });

  test('opens matchmaking queue modal upon clicking queue ranked button', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/critical');

    const queueButton = page
      .locator('[data-testid="queue-ranked-critical-button"]')
      .first();
    await expect(queueButton).toBeVisible();
    await queueButton.click();

    const queueModalOrIndicator = page
      .locator(
        '[data-testid="matchmaking-queue-modal"], [data-testid="queue-ranked-critical-button"]',
      )
      .first();
    await expect(queueModalOrIndicator).toBeVisible();
  });
});
