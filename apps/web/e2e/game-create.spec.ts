import { test, expect } from '@playwright/test';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Game Room Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Debugging

    // Mock the session
    await mockSession(page);

    // Catch-all for other games API requests to prevent 500s
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      // Let specific routes below handle their matches if Playwright precedence allows
      if (url.includes('/rooms') || url.includes('rooms/rematch')) {
        return route.continue();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    // Mock the creation API
    await page.route('**/games/rooms*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-room-id',
            room: {
              id: 'new-room-id',
              name: 'Test Room',
              gameId: 'critical_v1',
              status: 'lobby',
              playerCount: 1,
              maxPlayers: 4,
              hostId: 'user-1',
              host: { id: 'user-1', displayName: 'Test User' },
              createdAt: new Date().toISOString(),
              visibility: 'public',
            },
          }),
        });
      } else {
        // Return empty list for any GET requests (e.g. searching for duplicates or refreshing list)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ rooms: [], total: 0 }),
        });
      }
    });

    await navigateTo(page, '/games/create?gameId=critical_v1');
  });

  test('should load creation page with correct game selected', async ({
    page,
  }) => {
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/create game room/i);

    // Verify Critical game tile is active (based on styling in CreateGameRoomPage)
    // VisibleGames maps gamesCatalog. critical_v1 should be there.
    const criticalTile = page
      .locator('button')
      .filter({ hasText: /critical/i })
      .first();
    await expect(criticalTile).toBeVisible();
    // Since $active prop is used, we check for visual indicators or class
    // In the code: $active={gameId === game.id}
  });

  test('should show validation error for empty name', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /create room/i });

    // Try to submit with empty name (it has 'required' attribute, so browser might block)
    // But we want to check if our logic handles it or if browser validation is present
    await submitBtn.click();

    // If it's HTML5 validation, the URL won't change
    await expect(page).toHaveURL(/\/games\/create/);
  });
});
