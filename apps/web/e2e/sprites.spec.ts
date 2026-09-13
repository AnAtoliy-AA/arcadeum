import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Sprite sheets rendering', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page, {
      xp: 250,
      level: 5,
      role: 'free',
    });

    await page.route('**/games/stats', async (route) => {
      await handleRoute(route, {
        totalGames: 5,
        wins: 3,
        losses: 2,
        winRate: 60,
        byGameType: [
          {
            gameId: 'critical_v1',
            totalGames: 5,
            wins: 3,
            winRate: 60,
          },
        ],
      });
    });
  });

  test('renders milestone badges from sprite sheet', async ({ page }) => {
    await navigateTo(page, '/stats');

    const myStatsTab = page.getByTestId('stats-tab-my-stats');
    await expect(myStatsTab).toBeVisible();

    if ((await myStatsTab.getAttribute('aria-pressed')) !== 'true') {
      await myStatsTab.click({ force: true });
    }

    const badge1 = page.getByTestId('milestone-badge-img-1');
    await expect(badge1).toBeVisible();

    const bgImage = await badge1.evaluate(
      (el) => window.getComputedStyle(el).backgroundImage,
    );
    expect(bgImage).toContain('badges_spritesheet');
  });
});
