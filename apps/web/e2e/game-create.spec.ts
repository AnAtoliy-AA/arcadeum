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
    // ARC-744 redesign: max players is now a stepper, not a number input.
    // The stepper enforces the per-game cap via a disabled increment button,
    // so the test now asserts that visible cap + a valid submission.
    const nameInput = page.getByLabel(/room name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.click();
    await nameInput.fill('Max Players Test');
    await expect(nameInput).toHaveValue('Max Players Test');

    const incBtn = page.getByTestId('stepper-inc');
    await expect(incBtn).toBeVisible();
    // Critical max is 6; the stepper starts at "auto" → 2 → 3 → … → 6 then
    // disables. Click until disabled to prove the cap is enforced.
    for (let i = 0; i < 10; i++) {
      if (await incBtn.isDisabled()) break;
      await incBtn.click();
    }
    await expect(incBtn).toBeDisabled();

    const submitBtn = page.getByTestId('create-room-button');
    await submitBtn.dispatchEvent('click');

    await expect(page).toHaveURL(
      /\/games\/rooms\/507f1f77bcf86cd799439011/,
      {},
    );
  });

  test('should clear max players with Auto button', async ({ page }) => {
    // ARC-744 redesign: there's no standalone "Auto" reset button — the
    // stepper cycles back to "Auto" when the user decrements below the
    // game minimum. Drive that path directly.
    const incBtn = page.getByTestId('stepper-inc');
    const decBtn = page.getByTestId('stepper-dec');
    const stepper = page.getByTestId('max-players-stepper');

    await incBtn.click();
    // Stepper starts at Auto → first click yields the game min (2 for
    // Critical), so the visible value is a number now.
    await expect(stepper).not.toContainText(/auto/i);

    // Decrement once: at the minimum the stepper snaps back to Auto.
    await decBtn.click();
    await expect(stepper).toContainText(/auto/i);
  });
});
