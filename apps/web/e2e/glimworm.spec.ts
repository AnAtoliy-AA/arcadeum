import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

/**
 * Smoke coverage for the Glimworm game registry wiring.
 *
 * Full multiplayer/real-time coverage is intentionally out of scope: the BE
 * tick loop, socket gateway, variant strategies, and power-ups all have their
 * own Jest unit tests. This e2e exists to catch a regression where the game
 * card disappears from the games list, the loader fails to dynamic-import the
 * widget, or the i18n bundle drops a required key.
 */

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

  test('Glimworm appears in the create-game catalog', async ({ page }) => {
    await navigateTo(page, '/games/create');
    await expect(page).toHaveURL(/\/games\/create/);
    // The Glimworm tile should appear by name once the catalog renders.
    await expect(page.getByText(/Glimworm/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
