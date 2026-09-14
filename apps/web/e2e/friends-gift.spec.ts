import { expect } from '@playwright/test';
import { test, handleRoute } from './fixtures/test-utils';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Friends Gifting', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/friends/pending', async (route) => {
      await handleRoute(route, { incoming: [], outgoing: [] });
    });

    await page.route('**/friends', async (route) => {
      if (
        route.request().resourceType() === 'document' ||
        route.request().headers()['next-action']
      ) {
        await route.continue();
        return;
      }
      const url = route.request().url();
      if (url.includes('/pending')) {
        await route.continue();
        return;
      }
      if (route.request().method() === 'GET') {
        await handleRoute(route, [
          {
            id: 'fr-1',
            userId: 'user-bob',
            username: 'bob',
            displayName: 'Bob Builder',
            equippedAvatarId: 'avatar-default-01',
            online: true,
          },
        ]);
      } else {
        await route.continue();
      }
    });

    await page.route('**/shop/catalog**', async (route) => {
      await handleRoute(route, [
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
      ]);
    });

    await page.route('**/shop/inventory**', async (route) => {
      await handleRoute(route, {
        items: [
          {
            rowId: 'row-1',
            itemId: 'avatar-fox-01',
            purchaseId: 'p1',
            acquiredVia: 'coins',
            paidAmount: 200,
            paidCurrency: 'coins',
            soldAt: null,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        equipped: {
          avatar: null,
          badge: null,
          name_color: null,
          game_skin: null,
          banner: null,
          aura: null,
          frame: null,
          background: null,
        },
      });
    });

    await page.route('**/shop/gift', async (route) => {
      await handleRoute(route, {
        inventoryItem: {
          rowId: 'row-2',
          itemId: 'avatar-fox-01',
          purchaseId: 'p2',
          acquiredVia: 'gift',
          paidAmount: null,
          paidCurrency: null,
          soldAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
    });
  });

  test('displays gift button on friends list and previews item in gift dialog', async ({
    page,
  }) => {
    await navigateTo(page, '/en/friends');

    const giftButton = page.getByTestId('gift-user-bob');
    await expect(giftButton).toBeVisible();
    await giftButton.click();

    const giftDialog = page.getByTestId('gift-dialog');
    await expect(giftDialog).toBeVisible();

    const giftItem = page.getByTestId('gift-item-avatar-fox-01');
    await expect(giftItem).toBeVisible();
    await expect(giftItem.getByText('Fox', { exact: true })).toBeVisible();
    await expect(giftItem.getByText('avatar-fox-01')).toBeVisible();

    await giftItem.click();

    const messageInput = page.getByTestId('gift-message-input');
    await messageInput.fill('Enjoy your new avatar!');

    const sendButton = page.getByTestId('gift-send-button');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText(/Gift sent!/i)).toBeVisible();
  });
});
