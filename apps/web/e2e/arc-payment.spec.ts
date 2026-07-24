/**
 * ARC payment flow E2E tests
 *
 * Tests the Solana Pay ARC payment flow including:
 * - Gem purchase with ARC
 * - Shop item purchase with ARC
 * - Dynamic ARC pricing
 * - Geo-blocking
 */

import { expect } from '@playwright/test';
import { test, handleRoute } from '../fixtures/test-utils';
import { navigateTo, mockSession } from '../fixtures/test-utils';

const MOCK_GEM_PACKAGES = [
  {
    id: 'pkg-arc-100',
    name: 'ARC Pack',
    gems: 100,
    bonusGems: 10,
    priceUsdCents: 999,
    displayOrder: 1,
    active: true,
  },
];

const MOCK_ARC_PRICING = {
  arcUsdPrice: 0.01,
  gemToUsdRate: 0.1,
  discountPercent: 20,
};

const MOCK_SOLANA_PAY_CREATE = {
  sessionId: 'test-session-123',
  solanaPayUrl: 'solana:test-recipient?amount=80',
  amount: 80,
  tokenAddress: '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump',
  recipient: 'test-recipient',
  reference: 'test-reference',
};

const MOCK_SHOP_CATALOG = [
  {
    id: 'avatar-fox-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/shop/avatars/fox-01.png',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 200,
    priceCurrency: 'coins',
    overridden: false,
  },
];

test.describe('ARC payment flow (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/wallet/balance', async (route) => {
      await handleRoute(route, { coins: 1000, gems: 50, arcadeum: 500 });
    });

    await page.route('**/wallet/transactions**', async (route) => {
      await handleRoute(route, { items: [], nextCursor: null });
    });

    await page.route('**/solana/pricing', async (route) => {
      await handleRoute(route, MOCK_ARC_PRICING);
    });

    await page.route('**/solana/pay/create', async (route) => {
      if (route.request().method() === 'POST') {
        await handleRoute(route, MOCK_SOLANA_PAY_CREATE);
      } else {
        await route.continue();
      }
    });

    await page.route('**/solana/pay/status/**', async (route) => {
      await handleRoute(route, { status: 'pending' });
    });

    await page.route('**/payments/gems/packages', async (route) => {
      await handleRoute(route, MOCK_GEM_PACKAGES);
    });

    await page.route('**/shop/catalog', async (route) => {
      await handleRoute(route, MOCK_SHOP_CATALOG);
    });
  });

  test('ARC pricing endpoint returns dynamic prices', async ({ page }) => {
    const response = await page.request.get('/api/proxy/solana/pricing');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('arcUsdPrice');
    expect(data).toHaveProperty('gemToUsdRate');
    expect(data).toHaveProperty('discountPercent');
    expect(data.arcUsdPrice).toBeGreaterThan(0);
  });

  test('Solana Pay create endpoint returns payment request', async ({
    page,
  }) => {
    const response = await page.request.post('/api/proxy/solana/pay/create', {
      data: {
        amount: 100,
        tokenAddress: '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump',
      },
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('solanaPayUrl');
    expect(data.amount).toBe(100);
  });

  test('Solana Pay status endpoint returns payment status', async ({
    page,
  }) => {
    const response = await page.request.get(
      '/api/proxy/solana/pay/status/test-session-123',
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(['pending', 'confirmed', 'expired']).toContain(data.status);
  });

  test('gem store shows ARC price on packages', async ({ page }) => {
    await navigateTo(page, '/wallet');

    await page.waitForSelector('[data-testid="gem-store"]', { timeout: 5000 });

    const arcPrice = page.locator('[data-testid="arc-price"]').first();
    await expect(arcPrice).toBeVisible();
    await expect(arcPrice).toContainText('ARC');
  });

  test('shop shows ARC price on items', async ({ page }) => {
    await navigateTo(page, '/en/shop');

    await page.waitForSelector('[data-testid="shop-card-avatar-fox-01"]', {
      timeout: 5000,
    });

    const arcButton = page.locator(
      '[data-testid="shop-card-action-avatar-fox-01"]',
    );
    await expect(arcButton).toBeVisible();
  });
});

test.describe('ARC payment geo-blocking (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('geo-block endpoint returns blocked countries', async ({ page }) => {
    await page.route('**/admin/geo-block/countries', async (route) => {
      await handleRoute(route, [
        { countryCode: 'CN', reason: 'Crypto banned', active: true },
        { countryCode: 'DZ', reason: 'Crypto banned', active: true },
      ]);
    });

    const response = await page.request.get(
      '/api/proxy/admin/geo-block/countries',
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(2);
    expect(data[0].countryCode).toBe('CN');
  });

  test('admin can add blocked country', async ({ page }) => {
    await page.route('**/admin/geo-block/countries', async (route) => {
      if (route.request().method() === 'POST') {
        await handleRoute(route, {
          countryCode: 'XX',
          reason: 'Test block',
          active: true,
        });
      } else {
        await handleRoute(route, []);
      }
    });

    const response = await page.request.post(
      '/api/proxy/admin/geo-block/countries',
      {
        data: { countryCode: 'XX', reason: 'Test block' },
      },
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.countryCode).toBe('XX');
  });

  test('admin can remove blocked country', async ({ page }) => {
    await page.route('**/admin/geo-block/countries/XX', async (route) => {
      if (route.request().method() === 'DELETE') {
        await handleRoute(route, { statusCode: 200 });
      } else {
        await route.continue();
      }
    });

    const response = await page.request.delete(
      '/api/proxy/admin/geo-block/countries/XX',
    );
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('ARC payment wallet balance (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/wallet/balance', async (route) => {
      await handleRoute(route, { coins: 1000, gems: 50, arcadeum: 500 });
    });
  });

  test('wallet balance includes arcadeum field', async ({ page }) => {
    const response = await page.request.get('/api/proxy/wallet/balance');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('arcadeum');
    expect(data.arcadeum).toBe(500);
  });
});
