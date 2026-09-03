import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Game Room Creation', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/games/my-room-count', async (route) => {
      await handleRoute(route, { count: 0, nextRoomNumber: 1 });
    });

    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      if (url.includes('rooms/rematch')) {
        return route.continue();
      }
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
      notes: 'Welcome friends',
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
          await handleRoute(route, { room: mockRoom });
        } else {
          await handleRoute(route, { rooms: [mockRoom], total: 1 });
        }
      } else {
        await handleRoute(route, {});
      }
    });

    await navigateTo(page, '/games/create?gameId=critical_v1');
    await expect(page.locator('h1, h2, [class*="Title"]').first()).toBeVisible(
      {},
    );
    await expect(page.getByTestId('room-name-input').first()).toBeVisible();
    await expect(page.getByTestId('room-name-input').first()).toHaveValue(
      /game #\d+/i,
    );
    await expect(page.getByTestId('preview-room-title').first()).toContainText(
      /game #\d+/i,
    );
    await expect(page).toHaveURL(/theme=/);
  });

  test('should load creation page with correct game selected', async ({
    page,
  }) => {
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/create game room/i);

    const selectedGameCard = page.getByTestId('selected-game-card').first();
    await expect(selectedGameCard).toBeVisible();
    await expect(selectedGameCard).toContainText(/critical/i);
    await expect(page.getByTestId('change-game-link').first()).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    const nameInput = page.getByLabel(/room name/i).first();
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await expect(nameInput).toHaveValue('');

    const submitBtn = page.getByTestId('create-room-button').first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    await expect(page).toHaveURL(/\/games\/create/);
  });

  test('should fill notes and submit room', async ({ page }) => {
    const nameInput = page.getByLabel(/room name/i).first();
    await nameInput.fill('Notes Test Room');

    const notesInput = page.getByTestId('notes-input').first();
    await expect(notesInput).toBeVisible();
    await notesInput.fill('Custom host notes for testing <script>');
    await expect(notesInput).toHaveValue(
      'Custom host notes for testing <script>',
    );

    const submitBtn = page.getByTestId('create-room-button').first();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page).toHaveURL(/\/rooms\/507f1f77bcf86cd799439011/);
  });

  test('should clear max players with Auto button', async ({ page }) => {
    const incBtn = page.getByTestId('stepper-inc').first();
    const autoBtn = page.getByTestId('stepper-auto').first();

    await expect(incBtn).toBeVisible();
    await expect(incBtn).toBeEnabled();
    await incBtn.click();
    await expect(autoBtn).toBeVisible();

    await autoBtn.click();
    await expect(autoBtn).not.toBeVisible();
  });
});
