import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Game Room Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the rooms API
    await page.route('**/games/rooms*', async (route) => {
      const url = route.request().url();
      if (url.includes('empty-game')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            rooms: [],
            total: 0,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            rooms: [
              {
                id: 'room-1',
                name: 'Mock Room',
                gameId: 'sample-game-id',
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
          }),
        });
      }
    });
  });

  test('should load game detail page', async ({ page }) => {
    // Navigate to a sample game ID
    await navigateTo(page, '/games/sample-game-id');

    // Check for page title or header
    await expect(page.locator('h1, h2')).toContainText(/game rooms/i);

    // Check for "Create Room" button
    const createRoomBtn = page.getByRole('link', { name: /create room/i });
    await expect(createRoomBtn).toBeVisible();
    await expect(createRoomBtn).toHaveAttribute(
      'href',
      /\/games\/create\?gameId=sample-game-id/,
    );
  });

  test('should display empty state if no rooms', async ({ page }) => {
    // Navigate to a game that likely has no rooms
    await navigateTo(page, '/games/empty-game');

    // Verify empty state message
    await expect(page.getByText(/no rooms found for this game/i)).toBeVisible();
  });

  test('should navigate to create room page', async ({ page }) => {
    await navigateTo(page, '/games/sample-game-id');
    const createRoomBtn = page.getByRole('link', { name: /create room/i });
    await createRoomBtn.click();

    await expect(page).toHaveURL(/\/games\/create/);
    await expect(page).toHaveURL(/\?gameId=sample-game-id/);
  });
});
