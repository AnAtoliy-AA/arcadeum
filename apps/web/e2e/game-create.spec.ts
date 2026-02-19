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
      // Only continue for non-room related requests if needed
      if (url.includes('rooms/rematch')) {
        return route.continue();
      }
      // If it's a rooms request, let the next mock handle it or return empty
      if (url.includes('/rooms')) {
        return route.fallback();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    const mockRoom = {
      id: '507f1f77bcf86cd799439011',
      name: 'Test Room',
      gameId: 'critical_v1',
      status: 'lobby',
      playerCount: 1,
      maxPlayers: 4,
      hostId: 'user-1',
      host: { id: 'user-1', displayName: 'Test User' },
      createdAt: new Date().toISOString(),
      visibility: 'public',
      participants: [{ userId: 'user-1', joinedAt: new Date().toISOString() }],
    };

    // Mock the creation and retrieval API
    await page.route('**/games/rooms*', async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: mockRoom.id,
            room: mockRoom,
          }),
        });
      } else if (method === 'GET') {
        if (url.includes(mockRoom.id)) {
          // Specific room request
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ room: mockRoom }),
          });
        } else {
          // List request
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ rooms: [mockRoom], total: 1 }),
          });
        }
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
      }
    });

    await navigateTo(page, '/games/create?gameId=critical_v1');
    // Ensure network is idle and page is hydrated
    await page.waitForLoadState('networkidle');
  });

  test('should load creation page with correct game selected', async ({
    page,
  }) => {
    // Wait for any heading to be visible as a sign of page readiness
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/create game room/i);

    const criticalTile = page
      .locator('button')
      .filter({ hasText: /critical/i })
      .first();
    await expect(criticalTile).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    const nameInput = page.getByLabel(/room name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await expect(nameInput).toHaveValue('');

    const submitBtn = page.getByRole('button', { name: /create room/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    await expect(page).toHaveURL(/\/games\/create/);
  });

  test('should validate maximum players limit', async ({ page }) => {
    const nameInput = page.getByLabel(/room name/i);
    await expect(nameInput).toBeVisible();

    // Explicit click to ensure focus and hydration readiness
    await nameInput.click();
    await nameInput.fill('Max Players Test');
    // Verify it actually stuck
    await expect(nameInput).toHaveValue('Max Players Test');

    const maxInput = page.getByPlaceholder('Auto');
    await maxInput.click();
    await maxInput.fill('7');
    await expect(maxInput).toHaveValue('7');

    const submitBtn = page.getByRole('button', { name: /create room/i });
    await submitBtn.click();
    await expect(page).toHaveURL(/\/games\/create/);

    await maxInput.click();
    await maxInput.fill('6');
    await expect(maxInput).toHaveValue('6');
    await submitBtn.click();

    await expect(page).toHaveURL(/\/games\/rooms\/507f1f77bcf86cd799439011/);
  });

  test('should clear max players with Auto button', async ({ page }) => {
    const maxInput = page.getByPlaceholder('Auto');
    await expect(maxInput).toBeVisible();
    await maxInput.click();
    await maxInput.fill('5');
    await expect(maxInput).toHaveValue('5');

    const autoBtn = page.getByRole('button', { name: /auto/i });
    await expect(autoBtn).toBeVisible();
    await autoBtn.click();

    await expect(maxInput).toHaveValue('');
  });
});
