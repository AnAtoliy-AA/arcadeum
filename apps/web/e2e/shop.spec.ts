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
    await expect(page.getByTestId('shop-top-bar').first()).toBeVisible();
    await expect(page.getByTestId('shop-rail')).toBeVisible();
    await expect(page.getByTestId('shop-stage')).toBeVisible();
    await expect(page.getByTestId('shop-hero')).toBeVisible();
    // Anonymous: no auth, wallet skipped server-side → balance chips
    // render with the default zero values, sign-in banner visible.
    await expect(page.getByTestId('shop-balance-coins')).toBeVisible();
    await expect(page.getByTestId('shop-balance-gems')).toBeVisible();
    await expect(page.getByTestId('shop-signin-banner')).toBeVisible();
  });

  test('triggering a card switches the panel into preview mode', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    const foxCard = page.getByTestId(`shop-card-${FOX_AVATAR_ID}`);
    await expect(foxCard).toBeVisible();
    // Mobile Chrome runs with touch emulation, where synthesized
    // `hover` events don't fire `onPointerEnter` reliably even with
    // `force: true`. The card's action button is wired with
    // `onFocus={handleEnter}` (keyboard-parity path) — focusing it
    // triggers the same preview-mode setter the cursor hover would.
    const foxAction = page.getByTestId(`shop-card-action-${FOX_AVATAR_ID}`);
    await foxAction.focus();
    await expect(page.getByTestId('shop-action-panel').first()).toHaveAttribute(
      'data-mode',
      'preview',
    );
    // The Buy & equip / Equip / Unequip button lives on the card itself
    // (not the rail panel) since the action-on-card refactor.
    await expect(foxAction).toBeVisible();
  });

  test('clicking a slot ring tile activates the matching row halo', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    await page.getByTestId('shop-slot-badge').first().click();
    await expect(page.getByTestId('shop-row-row-badges')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('hero buy button opens the purchase confirm dialog', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');
    const heroBuy = page.getByTestId('shop-hero-buy');
    await expect(heroBuy).toBeVisible();
    // Dispatch the click via the DOM so it works under Mobile Chrome's
    // touch emulation (where Playwright's synthesized click can be
    // intercepted by overlapping footer chrome). `el.click()` always
    // fires the React onClick / Tamagui onPress handler.
    await heroBuy.evaluate((el: HTMLElement) => el.click());
    await expect(page.getByTestId('purchase-confirm-dialog')).toBeVisible();
  });

  test('renders user avatar container with a circular boundary', async ({ page }) => {
    await navigateTo(page, '/leaderboards');
    const avatarContainer = page.locator('[class*="AvatarContainer"]').first();
    await expect(avatarContainer).toBeVisible();

    const borderRadius = await avatarContainer.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    // Should be rounded (e.g. '9999px' or similar, definitely not '0px')
    expect(borderRadius).not.toBe('0px');
    expect(borderRadius).not.toBe('');
  });

  test('renders and allows preview of new premium items (Cyber Wolf, Cyber Panther, Elite Shield, Mythic Star)', async ({
    page,
  }) => {
    await navigateTo(page, '/shop');

    const items = [
      { id: 'avatar-wolf-01', name: 'Cyber Wolf' },
      { id: 'avatar-panther-01', name: 'Cyber Panther' },
      { id: 'badge-elite', name: 'Elite Shield' },
      { id: 'badge-mythic', name: 'Mythic Star' },
    ];

    for (const item of items) {
      const card = page.getByTestId(`shop-card-${item.id}`);
      await expect(card).toBeVisible();

      // Focusing card action button activates preview mode
      const action = page.getByTestId(`shop-card-action-${item.id}`);
      await action.focus();
      await expect(page.getByTestId('shop-action-panel').first()).toHaveAttribute(
        'data-mode',
        'preview',
      );

      // Verify purchase confirmation dialog opens when clicking the action button
      await action.evaluate((el: HTMLElement) => el.click());
      const dialog = page.getByTestId('purchase-confirm-dialog');
      await expect(dialog).toBeVisible();

      // Dismiss by clicking the overlay (DialogShell closes when
      // e.target === e.currentTarget on the overlay div)
      await dialog.evaluate((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        el.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            clientX: rect.left + 4,
            clientY: rect.top + 4,
          }),
        );
      });
      await expect(dialog).not.toBeVisible();
    }
  });
});

