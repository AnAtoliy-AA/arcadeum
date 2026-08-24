import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Glimworm — registry wiring', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      if (url.includes('/rooms') || url.includes('/history')) {
        return route.continue();
      }
      await handleRoute(route, {});
    });
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, { rooms: [], total: 0 });
    });
  });

  test('Glimworm appears on the create-game page', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=glimworm_v1');
    await expect(page).toHaveURL(/\/games\/create/);
    await expect(page.getByText(/Glimworm/i).first()).toBeVisible({});
  });
});
