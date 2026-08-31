import { expect } from '@playwright/test';
import { test, navigateTo, getIsMobile } from './fixtures/test-utils';
import { mockSession } from './fixtures/utils/auth';
import { handleRoute } from './fixtures/utils/network';

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
    await expect(page.getByTestId('notification-popover')).toHaveCount(0);
    await expect(page.getByTestId('notification-bell-badge')).toHaveCount(0);
    if (getIsMobile(page)) return;
  });

  test('authenticated user sees notification bell and unread badge', async ({
    page,
  }) => {
    if (getIsMobile(page)) return;
    await page.route('**/notifications/unread-count', async (route) => {
      await handleRoute(route, { count: 2 });
    });
    await page.route('**/notifications/preferences', async (route) => {
      await handleRoute(route, {});
    });
    await page.route(/\/notifications(\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await handleRoute(route, [
          {
            id: 'notif-1',
            category: 'daily_reward_ready',
            titleKey: 'notifications.daily_reward_ready.title',
            bodyKey: 'notifications.daily_reward_ready.body',
            i18nParams: {},
            url: '/games',
            data: {},
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      await route.continue();
    });

    await mockSession(page);
    await navigateTo(page, '/');

    const bell = page.getByTestId('notification-bell');
    await expect(bell).toBeVisible();

    const badge = page.getByTestId('notification-bell-badge');
    await expect(badge).toHaveText('2');

    await bell.click();
    await expect(page.getByTestId('notification-popover')).toBeVisible();
    await expect(page.getByTestId('notification-row')).toBeVisible();
  });
});
