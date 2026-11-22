import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

const room = (over: Record<string, unknown>) => ({
  id: 'room-1',
  gameId: 'chess_v1',
  name: 'Open table',
  hostId: 'host-1',
  visibility: 'public',
  playerCount: 1,
  maxPlayers: 2,
  createdAt: new Date().toISOString(),
  status: 'lobby',
  members: [],
  ...over,
});

test.describe('Rooms browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('shows join and spectate on an open lobby card, and the bot badge', async ({
    page,
  }) => {
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, {
        rooms: [
          room({}),
          room({ id: 'room-2', name: 'Bot table', hostId: 'bot-abc' }),
        ],
        total: 2,
      });
    });
    await navigateTo(page, routes.rooms);

    await expect(page.getByTestId('room-card')).toHaveCount(2);
    await expect(page.getByTestId('bot-room-badge')).toHaveCount(1);
    await expect(
      page.getByTestId('room-card').first().getByRole('link'),
    ).toHaveCount(2);
  });

  test('applies the open seats filter to the request', async ({ page }) => {
    const urls: string[] = [];
    await page.route('**/games/rooms*', async (route) => {
      urls.push(route.request().url());
      await handleRoute(route, { rooms: [], total: 0 });
    });
    await navigateTo(page, routes.rooms);
    await page.getByTestId('rooms-filter-open-seats').click();
    await expect
      .poll(() => urls.some((u) => u.includes('openSeats=true')))
      .toBe(true);
    await expect(page.getByTestId('games-empty')).toBeVisible();
  });

  test('shows a retryable error state', async ({ page }) => {
    await page.route('**/games/rooms*', async (route) => {
      await route.fulfill({ status: 500, body: '{}' });
    });
    await navigateTo(page, routes.rooms);
    await expect(page.getByTestId('games-error')).toBeVisible();
  });

  test('quick join reports when no open rooms exist', async ({ page }) => {
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, { rooms: [], total: 0 });
    });
    await navigateTo(page, routes.rooms);
    await page.getByTestId('rooms-quick-join').click();
    await expect(page.getByTestId('rooms-quick-join-message')).toBeVisible();
  });
});
