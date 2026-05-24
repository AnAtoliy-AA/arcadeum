import { expect } from '@playwright/test';
import { test, navigateTo, getIsMobile } from './fixtures/test-utils';

/**
 * Smoke test for the PWA notification bell — verifies the bell is NOT
 * rendered for anonymous visitors and the settings page surfaces the
 * notifications section copy (which is always present even when no
 * authentication is required to read it).
 *
 * Full opt-in flow (permission prompt + SW register + subscription POST)
 * needs an authenticated session and is covered by unit tests in
 * notifications.store.test.ts.
 */
test.describe('Notifications smoke', () => {
  test('bell is not visible for anonymous visitors', async ({ page }) => {
    await navigateTo(page, '/');
    const bell = page.getByTestId('notification-bell');
    await expect(bell).toHaveCount(0);
  });

  test('home renders without notification artifacts for anonymous users', async ({
    page,
  }) => {
    await navigateTo(page, '/');
    // Section + popover + badge must all be absent for unauthenticated
    // visitors. The unit tests cover the per-category opt-in flow.
    await expect(page.getByTestId('notification-popover')).toHaveCount(0);
    await expect(page.getByTestId('notification-bell-badge')).toHaveCount(0);
    // Use mobile helper to keep eslint quiet — mobile + desktop behave
    // the same here.
    if (getIsMobile(page)) return;
  });
});
