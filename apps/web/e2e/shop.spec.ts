import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

// The shop page fetches catalog / inventory / wallet from a Server
// Component (`apps/web/src/app/[locale]/shop/page.tsx`), so the request
// goes Next-server → BE and `page.route` mocks (which only intercept
// browser fetches) never fire. CI runs a real BE behind the dev server,
// so these tests rely on the BE's seeded catalog (see
// `apps/be/src/shop/lib/shop-catalog.ts`) and run unauthenticated —
// catalog renders, balance defaults to 0/0, sign-in banner shows.

const FOX_AVATAR_ID = 'avatar-fox-01';

test.describe('Shop redesign · Showcase Locker', () => {
  test('renders the top bar, rail, hero, and sign-in banner anonymously', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    await expect(page.getByTestId('shop-top-bar')).toBeVisible();
    await expect(page.getByTestId('shop-rail')).toBeVisible();
    await expect(page.getByTestId('shop-stage')).toBeVisible();
    await expect(page.getByTestId('shop-hero')).toBeVisible();
    // Anonymous: no auth, wallet skipped server-side → balance chips
    // render with the default zero values, sign-in banner visible.
    await expect(page.getByTestId('shop-balance-coins')).toBeVisible();
    await expect(page.getByTestId('shop-balance-gems')).toBeVisible();
    await expect(page.getByTestId('shop-signin-banner')).toBeVisible();
  });

  test('hovering a card switches the panel into preview mode', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    const foxCard = page.getByTestId(`shop-card-${FOX_AVATAR_ID}`);
    await expect(foxCard).toBeVisible();
    await foxCard.hover();
    await expect(page.getByTestId('shop-action-panel')).toHaveAttribute(
      'data-mode',
      'preview',
    );
    // The Buy & equip / Equip / Unequip button lives on the card itself
    // (not the rail panel) since the action-on-card refactor.
    await expect(
      page.getByTestId(`shop-card-action-${FOX_AVATAR_ID}`),
    ).toBeVisible();
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
