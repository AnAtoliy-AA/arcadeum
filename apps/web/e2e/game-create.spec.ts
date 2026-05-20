import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, mockSession, handleRoute } from './fixtures/test-utils';

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
      await handleRoute(route, {});
    });

    const mockRoom = {
      id: '507f1f77bcf86cd799439011',
      name: 'Test Room',
      gameId: 'critical_v1',
      status: 'lobby',
      playerCount: 1,
      maxPlayers: 4,
      hostId: '507f191e810c19729de860ea',
      host: { id: '507f191e810c19729de860ea', displayName: 'Test User' },
      createdAt: new Date().toISOString(),
      visibility: 'public',
      participants: [
        {
          userId: '507f191e810c19729de860ea',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    // Mock the creation and retrieval API
    await page.route('**/games/rooms*', async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'POST') {
        await handleRoute(
          route,
          {
            id: mockRoom.id,
            room: mockRoom,
          },
          201,
        );
      } else if (method === 'GET') {
        if (url.includes(mockRoom.id)) {
          // Specific room request
          await handleRoute(route, { room: mockRoom });
        } else {
          // List request
          await handleRoute(route, { rooms: [mockRoom], total: 1 });
        }
      } else {
        await handleRoute(route, {});
      }
    });

    await navigateTo(page, '/games/create?gameId=critical_v1');
    // Wait for page to be hydrated by checking for a visible element
    await expect(page.locator('h1, h2, [class*="Title"]').first()).toBeVisible(
      {},
    );
    // Wait for dynamic component to mount and set the default variant in URL
    await expect(page).toHaveURL(/variant=/);
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
    await nameInput.fill('');
    await expect(nameInput).toHaveValue('');

    const submitBtn = page.getByTestId('create-room-button');
    await expect(submitBtn).toBeVisible();
    await submitBtn.dispatchEvent('click');

    // On failure to create, we should still be on the same page
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
    // pressSequentially fires per-keystroke input events, which propagate
    // reliably to React's controlled-input state. `fill()` on number
    // inputs occasionally lands the value in the DOM without triggering
    // React's onChange in Firefox, leaving the maxPlayers state at ''.
    await maxInput.pressSequentially('7');
    await expect(maxInput).toHaveValue('7');

    const submitBtn = page.getByRole('button', { name: /create room/i });
    await submitBtn.dispatchEvent('click');
    await expect(page).toHaveURL(/\/games\/create/);

    await maxInput.click();
    await maxInput.fill('');
    await maxInput.pressSequentially('6');
    await expect(maxInput).toHaveValue('6');
    await submitBtn.dispatchEvent('click');

    await expect(page).toHaveURL(
      /\/games\/rooms\/507f1f77bcf86cd799439011/,
      {},
    );
  });

  test('should clear max players with Auto button', async ({ page }) => {
    const maxInput = page.getByPlaceholder('Auto');
    await expect(maxInput).toBeVisible();
    await maxInput.click();
    // pressSequentially — see comment in 'should validate maximum players
    // limit' above. Necessary for the Auto button to render, which is
    // conditional on `maxPlayers` truthy in the React state.
    await maxInput.pressSequentially('5');
    await expect(maxInput).toHaveValue('5');

    const autoBtn = page.getByTestId('auto-max-players-button');
    await expect(autoBtn).toBeVisible();
    await autoBtn.click();

    await expect(maxInput).toHaveValue('');
  });
});
