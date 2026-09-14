import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Level Badge Rewards', () => {
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

    await page.route('**/shop/catalog*', async (route) => {
      await handleRoute(route, [
        {
          id: 'avatar-fox-01',
          category: 'avatar',
          rarity: 'common',
          nameKey: 'items.avatar.fox.name',
          descKey: 'items.avatar.fox.desc',
          assetUrl: '/shop/avatars/fox-01.png',
          defaultPriceAmount: 200,
          defaultPriceCurrency: 'coins',
          available: true,
          priceAmount: 200,
          priceCurrency: 'coins',
          overridden: false,
        },
        {
          id: 'badge-scout',
          category: 'badge',
          rarity: 'common',
          nameKey: 'items.badge.scout.name',
          descKey: 'items.badge.scout.desc',
          assetUrl: '/shop/badges/scout.png',
          defaultPriceAmount: 0,
          defaultPriceCurrency: 'coins',
          available: true,
          purchasable: false,
          priceAmount: 0,
          priceCurrency: 'coins',
          overridden: false,
        },
      ]);
    });
  });

  test('displays milestone level badge rewards on stats page', async ({
    page,
  }) => {
    await navigateTo(page, '/stats');

    const myStatsTab = page.getByTestId('stats-tab-my-stats');
    await expect(myStatsTab).toBeVisible();

    if ((await myStatsTab.getAttribute('aria-pressed')) !== 'true') {
      await myStatsTab.click({ force: true });
    }

    await expect(page.getByTestId('level-reward-1')).toBeVisible();
    await expect(page.getByTestId('level-reward-5')).toBeVisible();

    const expandButton = page.getByRole('button', { name: /99/i });
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    await expect(page.getByTestId('level-reward-35')).toBeVisible();
    await expect(page.getByTestId('level-reward-45')).toBeVisible();
    await expect(page.getByTestId('level-reward-55')).toBeVisible();
    await expect(page.getByTestId('level-reward-65')).toBeVisible();
    await expect(page.getByTestId('level-reward-80')).toBeVisible();
    await expect(page.getByTestId('level-reward-99')).toBeVisible();
  });

  test('badges are shown in shop catalog as unpurchasable progression rewards', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');

    await expect(page.locator('#row-badges')).toBeVisible();
    await expect(page.getByTestId('shop-card-badge-scout')).toBeVisible();
    await expect(page.getByTestId('shop-card-badge-scout')).toHaveText(
      /lv\. 5/i,
    );
    await expect(page.getByTestId('shop-card-action-badge-scout')).toHaveText(
      /view in stats/i,
    );
    await expect(page.getByTestId('shop-buy-badge-scout')).toHaveCount(0);
  });

  test('milestone badges showcase is rendered and supports equipping unlocked badges', async ({
    page,
  }) => {
    await page.route('**/shop/equip', async (route) => {
      await handleRoute(route, {
        avatar: null,
        badge: 'badge-scout',
        name_color: null,
        frame: null,
        aura: null,
        banner: null,
      });
    });

    await navigateTo(page, '/stats');

    const myStatsTab = page.getByTestId('stats-tab-my-stats');
    await expect(myStatsTab).toBeVisible();
    if ((await myStatsTab.getAttribute('aria-pressed')) !== 'true') {
      await myStatsTab.click({ force: true });
    }

    await expect(page.getByTestId('milestone-badge-card-1')).toBeVisible();
    await expect(page.getByTestId('milestone-badge-card-5')).toBeVisible();
    await expect(page.getByTestId('milestone-badge-card-10')).toBeVisible();

    const action5 = page.getByTestId('badge-action-5');
    await expect(action5).toBeVisible();
    await action5.click();
    await expect(page.getByTestId('badge-action-5')).toHaveText(/equipped/i);
  });

  test('displays coins reward in level progression table', async ({ page }) => {
    await navigateTo(page, '/stats');

    const myStatsTab = page.getByTestId('stats-tab-my-stats');
    await expect(myStatsTab).toBeVisible();
    if ((await myStatsTab.getAttribute('aria-pressed')) !== 'true') {
      await myStatsTab.click({ force: true });
    }

    await expect(page.getByTestId('level-coins-1')).toBeVisible();
    await expect(page.getByTestId('level-coins-1')).toHaveText(/\+50/);
    await expect(page.getByTestId('level-coins-5')).toHaveText(/\+250/);
  });

  test('level up modal displays congratulatory message, coins reward and claims reward', async ({
    page,
  }) => {
    await page.route('**/xp/level-rewards/claim', async (route) => {
      await handleRoute(route, {
        currentLevel: 5,
        claimedLevel: 5,
        coinsAwarded: 250,
        badgesAwarded: ['badge-scout'],
        alreadyClaimed: false,
      });
    });

    await page.route('**/xp/level-rewards', async (route) => {
      await handleRoute(route, {
        currentLevel: 5,
        claimedLevel: 4,
        unclaimedLevels: [5],
        pendingCoins: 250,
        pendingBadges: ['badge-scout'],
      });
    });

    await navigateTo(page, '/stats');

    const modal = page.getByTestId('level-up-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('level-up-coins-reward')).toBeVisible();
    await expect(page.getByTestId('level-up-coins-reward')).toHaveText(/\+250/);

    const claimBtn = page.getByTestId('level-up-claim-btn');
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();

    await expect(claimBtn).toHaveText(/claimed/i);
    await expect(page.getByTestId('level-up-view-inventory-btn')).toBeVisible();
  });
});
