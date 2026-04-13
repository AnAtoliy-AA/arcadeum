import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Game Room Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the rooms API
    await page.route('**/games/rooms*', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }

      const url = route.request().url();
      if (url.includes('empty-game')) {
        await handleRoute(route, {
          rooms: [],
          total: 0,
        });
      } else {
        await handleRoute(route, {
          rooms: [
            {
              id: '507f191e810c19729de860ed',
              name: 'Mock Room',
              gameId: 'critical_v1',
              status: 'lobby',
              playerCount: 1,
              maxPlayers: 4,
              hostId: 'host-1',
              host: { id: 'host-1', displayName: 'Mock Host' },
              createdAt: new Date().toISOString(),
              visibility: 'public',
            },
          ],
          total: 1,
        });
      }
    });
  });

  test('should load game detail page', async ({ page }) => {
    // Navigate to a sample game ID
    await navigateTo(page, '/games/critical_v1');

    // Check for page title or header
    await expect(page.locator('h1, h2').first()).toContainText(/game rooms/i);

    // Check for "Create Room" button
    const createRoomBtn = page
      .getByRole('link', { name: /create room/i })
      .or(page.getByTestId('create-room-link'));
    await expect(createRoomBtn).toBeVisible();
    await expect(createRoomBtn).toHaveAttribute(
      'href',
      /\/games\/create\?gameId=critical_v1/,
    );
  });

  test('should display empty state if no rooms', async ({ page }) => {
    // Navigate to a game that likely has no rooms
    await navigateTo(page, '/games/empty-game');

    // Verify empty state message
    await expect(
      page
        .getByRole('main')
        .getByText(/no rooms found for this game/i)
        .first(),
    ).toBeVisible();
  });

  test('should navigate to create room page', async ({ page }) => {
    await navigateTo(page, '/games/critical_v1');
    const createRoomBtn = page.getByRole('link', { name: /create room/i });
    await createRoomBtn.click();

    await expect(page).toHaveURL(/\/games\/create/);
    await expect(page).toHaveURL(/\?gameId=critical_v1/);
  });
});
