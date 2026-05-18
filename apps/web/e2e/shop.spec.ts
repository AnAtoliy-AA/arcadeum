import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

const CATALOG = [
  {
    id: 'fox01',
    category: 'avatar',
    rarity: 'rare',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/test-fox.png',
    defaultPriceAmount: 100,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 100,
    priceCurrency: 'coins',
    overridden: false,
  },
  {
    id: 'champion',
    category: 'badge',
    rarity: 'epic',
    nameKey: 'items.badge.champion.name',
    descKey: 'items.badge.champion.desc',
    assetUrl: '/test-champion.png',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 200,
    priceCurrency: 'coins',
    overridden: false,
  },
  {
    id: 'cosmic01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.cosmic01.name',
    descKey: 'items.avatar.cosmic01.desc',
    assetUrl: '/test-cosmic.png',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
    available: true,
    priceAmount: 50,
    priceCurrency: 'gems',
    overridden: false,
  },
];

test.describe('Shop redesign · Showcase Locker', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/shop/catalog**', (route) =>
      handleRoute(route, CATALOG),
    );
    await page.route('**/shop/inventory', (route) =>
      handleRoute(route, {
        items: [],
        equipped: {
          avatar: null,
          badge: null,
          name_color: null,
          game_skin: null,
        },
      }),
    );
    await page.route('**/wallet/balance', (route) =>
      handleRoute(route, { coins: 500, gems: 25 }),
    );
    await page.route('**/wallet/conversion-rate', (route) =>
      handleRoute(route, { rate: 100 }),
    );
    await page.route('**/payments/gems/packages', (route) =>
      handleRoute(route, [
        {
          id: 'starter',
          name: 'Starter',
          gems: 100,
          bonusGems: 0,
          priceUsdCents: 199,
          displayOrder: 1,
        },
        {
          id: 'bundle',
          name: 'Bundle',
          gems: 500,
          bonusGems: 50,
          priceUsdCents: 999,
          displayOrder: 2,
        },
      ]),
    );
  });

  test('renders the top bar, hero, and mannequin rail', async ({ page }) => {
    await navigateTo(page, '/shop');
    await expect(page.getByTestId('shop-top-bar')).toBeVisible();
    await expect(page.getByTestId('shop-rail')).toBeVisible();
    await expect(page.getByTestId('shop-stage')).toBeVisible();
    await expect(page.getByTestId('shop-hero')).toBeVisible();
    await expect(page.getByTestId('shop-balance-coins')).toContainText('500');
    await expect(page.getByTestId('shop-balance-gems')).toContainText('25');
  });

  test('hovering a card switches the mannequin into try-on mode', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    const foxCard = page.getByTestId('shop-card-fox01');
    await expect(foxCard).toBeVisible();
    await foxCard.hover();
    await expect(page.getByTestId('shop-action-panel')).toHaveAttribute(
      'data-mode',
      'preview',
    );
    await expect(page.getByTestId('shop-action-buy-equip')).toBeVisible();
  });

  test('clicking a slot ring tile activates the matching row halo', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    await page.getByTestId('shop-slot-badge').click();
    await expect(page.getByTestId('shop-row-row-badges')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('hero buy button opens the purchase confirm dialog', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    await page.getByTestId('shop-hero-buy').click();
    await expect(page.getByTestId('purchase-confirm-dialog')).toBeVisible();
  });
});
