import { expect } from '@playwright/test';
import { test, handleRoute } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Mock games list with samples to ensure layout tests have elements to check
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, {
        rooms: [
          {
            id: 'room-1',
            name: 'Room 1',
            gameId: 'critical_v1',
            status: 'lobby',
            playerCount: 1,
            maxPlayers: 5,
            hostId: 'user-1',
          },
          {
            id: 'room-2',
            name: 'Room 2',
            gameId: 'critical_v1',
            status: 'lobby',
            playerCount: 2,
            maxPlayers: 5,
            hostId: 'user-2',
          },
        ],
        total: 2,
      });
    });

    // Mock socket.io polling to prevent connection errors
    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should show mobile-friendly navigation on small screens', async ({
    page,
  }) => {
    await navigateTo(page, '/');

    await expect(page.locator('header')).toBeVisible();

    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();

    await menuButton.click({ force: true });

    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toHaveCSS('opacity', '1', {});
    await expect(mobileNav).toBeVisible();

    const navLink = mobileNav.getByRole('link').first();
    await expect(navLink).toBeVisible({});
  });

  test('should adjust grid layout on mobile', async ({ page }) => {
    await navigateTo(page, '/games');

    // In mobile, cards usually go full width (1 column)
    // Wait for at least one card to be visible before proceeding
    const roomCards = page.getByTestId('room-card');
    await expect(roomCards.first()).toBeVisible();

    const count = await roomCards.count();
    if (count >= 2) {
      const firstCardLocator = roomCards.nth(0);
      const secondCardLocator = roomCards.nth(1);

      await firstCardLocator.waitFor({ state: 'visible' });
      await secondCardLocator.waitFor({ state: 'visible' });

      const firstCard = await firstCardLocator.boundingBox();
      const secondCard = await secondCardLocator.boundingBox();

      if (firstCard && secondCard) {
        // Should be stacked vertically
        expect(secondCard.y).toBeGreaterThan(firstCard.y);
        // And roughly same X
        expect(Math.abs(firstCard.x - secondCard.x)).toBeLessThan(20);
      }
    }
  });

  test('should hide desktop-only elements', async ({ page }) => {
    await navigateTo(page, '/');
    const desktopOnly = page.locator('.desktop-only, [class*="DesktopOnly"]');
    if ((await desktopOnly.count()) > 0) {
      await expect(desktopOnly.first()).not.toBeVisible();
    }
  });
});
