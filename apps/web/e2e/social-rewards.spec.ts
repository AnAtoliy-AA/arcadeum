import { expect } from '@playwright/test';
import {
  test,
  handleRoute,
  navigateTo,
  mockSession,
} from './fixtures/test-utils';

test.describe('Social Network Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('displays social rewards section and cards on rewards page', async ({
    page,
  }) => {
    await navigateTo(page, '/rewards');

    const section = page.getByTestId('social-rewards-section');
    await expect(section).toBeVisible();

    const grid = page.getByTestId('social-rewards-grid');
    await expect(grid).toBeVisible();

    const discordCard = page.getByTestId('social-reward-card-discord');
    await expect(discordCard).toBeVisible();

    const telegramCard = page.getByTestId('social-reward-card-telegram');
    await expect(telegramCard).toBeVisible();
  });

  test('displays claim buttons on social network cards', async ({ page }) => {
    await navigateTo(page, '/rewards');

    const discordClaimBtn = page.getByTestId('social-reward-claim-btn-discord');
    await expect(discordClaimBtn).toBeVisible();
  });

  test('displays rewards banner on community page linking to rewards', async ({
    page,
  }) => {
    await navigateTo(page, '/community');

    const banner = page.getByTestId('community-rewards-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute(
      'href',
      expect.stringContaining('/rewards'),
    );
  });

  test('displays earn free gems link on wallet balance summary', async ({
    page,
  }) => {
    await page.route('**/wallet/balance', async (route) => {
      await handleRoute(route, {
        coins: 100,
        gems: 10,
        arcadeum: 0,
      });
    });

    await page.route('**/wallet/history*', async (route) => {
      await handleRoute(route, {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });

    await navigateTo(page, '/wallet');

    const freeGemsLink = page.getByTestId('wallet-earn-free-gems-link');
    await expect(freeGemsLink).toBeVisible();
    await expect(freeGemsLink).toHaveAttribute(
      'href',
      expect.stringContaining('/rewards'),
    );
  });

  test('displays free rewards banner in shop page', async ({ page }) => {
    await page.route('**/shop/catalog', async (route) => {
      await handleRoute(route, []);
    });

    await page.route('**/shop/inventory', async (route) => {
      await handleRoute(route, { items: [], equipped: {} });
    });

    await navigateTo(page, '/shop');

    const shopBanner = page.getByTestId('shop-free-rewards-banner');
    await expect(shopBanner).toBeVisible();
    const cta = page.getByTestId('shop-rewards-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      expect.stringContaining('/rewards'),
    );
  });
});
