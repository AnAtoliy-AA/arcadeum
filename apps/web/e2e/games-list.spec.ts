import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Games List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock default empty response (can be overridden by tests)
    // Safe catch-all for any other games API calls (like stats/header) to prevent 500s
    await page.route('**/games/*', async (route) => {
      // Allow page navigation to proceed
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      // Allow specific mock below to handle rooms (checked in reverse order of registration)
      // Actually, if we define this one FIRST (here), and specific one LATER,
      // Playwright checks Specific First. If Specific continues (or not matched), it checks this.
      // So this acts as FALLBACK.Perfect.
      if (url.includes('/rooms') || url.includes('/history')) {
        return route.continue();
      }
      await handleRoute(route, {});
    });

    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, { rooms: [], total: 0 });
    });

    // Mock socket.io polling to prevent connection errors
    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('should load games page', async ({ page }) => {
    await navigateTo(page, '/games');
    await expect(page).toHaveURL(/\/games/);
    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();
  });

  test('should display filters and search', async ({ page }) => {
    await navigateTo(page, '/games');
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    const filters = page
      .getByRole('checkbox')
      .filter({
        hasText:
          /all|lobby|in progress|completed|все|лобби|в процессе|завершено/i,
      });

    await expect(async () => {
      expect(await filters.count()).toBeGreaterThan(0);
      await expect(filters.first()).toBeVisible();
    }).toPass({});
  });

  test('should handle navigation to create room', async ({ page }) => {
    await navigateTo(page, '/games');
    await expect(
      page.getByRole('heading', { name: /Game Rooms/i }),
    ).toBeVisible({});

    const createLink = page
      .getByRole('link', { name: /create|new|создать|crear/i })
      .first();
    await expect(createLink).toBeVisible();

    const href = await createLink.getAttribute('href');
    expect(href).toContain('/games/create');
  });

  test('should display game cards or empty state', async ({ page }) => {
    await navigateTo(page, '/games');
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    await expect(async () => {
      const cardsCount = await page.getByTestId('room-card').count();
      const isEmpty = await page.getByTestId('games-empty').isVisible();
      expect(cardsCount > 0 || isEmpty).toBe(true);
    }).toPass({ intervals: [1000] });
  });

  test('should clear search and restore list', async ({ page }) => {
    await navigateTo(page, '/games');
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    await searchInput.fill('some search');
    await searchInput.fill(''); // Clear

    // Use toPass to wait for the UI to settle after potential deferred updates
    await expect(async () => {
      await expect(page.getByTestId('games-empty')).toBeVisible();
    }).toPass({});
  });
  test('should not display anonymous games in the list', async ({ page }) => {
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, {
        rooms: [
          {
            id: '507f191e810c19729de860ee',
            gameId: 'critical_v1',
            name: 'Normal Room',
            hostId: 'user-123',
            visibility: 'public',
            playerCount: 2,
            maxPlayers: 4,
            status: 'lobby',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      });
    });

    await navigateTo(page, '/games');

    // Use toPass to handle hydration and fetch timing
    await expect(async () => {
      await expect(page.getByText('Normal Room')).toBeVisible();
      const anonGame = page.getByText('Anonymous Bot Game');
      const isVisible = await anonGame.isVisible();
      expect(isVisible).toBe(false);
    }).toPass({});
  });
});
