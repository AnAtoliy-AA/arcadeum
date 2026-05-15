import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  getIsMobile,
} from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockSettingsExtraData,
} from './fixtures/test-utils';

test.describe('Auth Extended', () => {
  // The ARC-690 sign-in redesign deliberately dropped the confirm-password
  // field from the register form (referral capture moves to onboarding). The
  // mismatch error path stays in useAuthForm but is no longer reachable from
  // the UI, so this scenario is covered by AuthFormPanel.test.tsx instead.
  test.skip(
    'should validate registration fields',
    async ({ page }) => {
      await navigateTo(page, '/auth');
    },
  );

  test('should persist session after manual reload', async ({ page }) => {
    await mockSession(page);
    await mockSettingsExtraData(page);
    await navigateTo(page, '/settings');
    await expect(page).toHaveURL(/\/settings/);

    // Setup listener before reloading to avoid race conditions.
    // We use a promise so we can wait for it after the reload action starts.
    const responsePromise = page
      .waitForResponse((res) => res.url().includes('auth/blocked'), {})
      .catch(() => null);

    await page.reload();
    await expect(page).toHaveURL(/\/settings/);

    // Wait for the background fetches to settle
    await responsePromise;
  });

  test('should handle logout', async ({ page }) => {
    await navigateTo(page, '/auth');
    await mockSession(page, { persistent: false });
    await mockSettingsExtraData(page);
    await navigateTo(page, '/settings');

    if (getIsMobile(page)) {
      // 1. Open mobile menu
      await ensureNavigationVisible(page);
    } else {
      // 1. Open profile menu
      const menuToggle = page.getByTestId('header-username');
      await expect(menuToggle).toBeVisible({});
      await menuToggle.click({ force: true });
    }

    // 2. Click logout (disambiguate from desktop/mobile menus)
    const logoutBtn = getIsMobile(page)
      ? page.getByTestId('mobile-logout-button')
      : page.getByTestId('desktop-logout-button');

    // Wait for button to be ready (especially on Mobile Safari where Zustand
    // rehydration + React reconciliation can take a moment)
    await expect(logoutBtn).toBeVisible({});

    // 3. Verify session is cleared and redirected
    await Promise.all([
      page.waitForURL(/\/(auth|login)?$/, {}),
      logoutBtn.click({ force: true }),
    ]);
  });
});
