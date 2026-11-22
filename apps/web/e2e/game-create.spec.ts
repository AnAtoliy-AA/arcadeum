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
    const submitBtn = page.getByTestId('create-room-button').first();
    await expect(submitBtn).toBeVisible();
    // Type then clear so React state updates even if the first fill landed
    // before hydration (WebKit).
    await expect(async () => {
      await nameInput.fill('x');
      await nameInput.fill('');
      await expect(nameInput).toHaveValue('');
      await expect(submitBtn).toBeDisabled({ timeout: 2000 });
    }).toPass({ timeout: 20000 });

    await expect(page).toHaveURL(/\/games\/create/);
  });

  test('should fill notes and submit room', async ({ page }) => {
    const nameInput = page.getByLabel(/room name/i).first();
    await nameInput.fill('Notes Test Room');

    await page.getByTestId('more-options-toggle').click();
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

  test('should explain why create is disabled and show a name error', async ({
    page,
  }) => {
    const nameInput = page.getByTestId('room-name-input').first();
    const submitBtn = page.getByTestId('create-room-button').first();
    await expect(async () => {
      await nameInput.fill('x');
      await nameInput.fill('');
      await nameInput.blur();
      await expect(submitBtn).toBeDisabled({ timeout: 2000 });
      await expect(page.getByTestId('create-disabled-reason')).toBeVisible({
        timeout: 2000,
      });
      await expect(page.getByTestId('room-name-error')).toBeVisible({
        timeout: 2000,
      });
    }).toPass({ timeout: 20000 });

    await nameInput.fill('Friendly table');
    await expect(page.getByTestId('room-name-error')).toHaveCount(0);
    await expect(submitBtn).toBeEnabled();
  });

  test('should apply a starting setup and keep it explained', async ({
    page,
  }) => {
    const friends = page.getByTestId('preset-friends');
    await expect(async () => {
      await friends.click();
      await expect(friends).toHaveAttribute('aria-checked', 'true', {
        timeout: 2000,
      });
    }).toPass({ timeout: 20000 });
    await expect(page.getByTestId('visibility-unlisted')).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await page.getByTestId('visibility-private').click();
    await expect(page.getByTestId('preset-custom-note')).toBeVisible();
  });

  test('should switch game inline without leaving the page', async ({
    page,
  }) => {
    await page.getByTestId('change-game-link').first().click();
    await expect(page.getByTestId('game-picker')).toBeVisible();
    await page.getByTestId('game-tile-chess_v1').click();

    await expect(page).toHaveURL(/\/games\/create.*gameId=chess_v1/);
    await expect(page.getByTestId('selected-game-card')).toContainText(
      /chess/i,
    );
    await expect(page.getByTestId('game-picker')).toHaveCount(0);
    await expect(page.getByTestId('theme-picker-chess')).toBeVisible();
  });

  test('should change the theme from the theme step', async ({ page }) => {
    const group = page.getByTestId('theme-picker-critical');
    await expect(group).toBeVisible();
    const cards = group.getByRole('radio');
    const second = cards.nth(1);
    await second.click();
    await expect(second).toHaveAttribute('aria-checked', 'true');
  });
});
