import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

const ZERO_STATS = {
  onlineUsers: 0,
  totalUsers: 10,
  totalMatches: 10,
  totalSubscribers: 0,
  platformSubscribers: {},
  activeGames: 0,
  waitingRooms: 0,
  waitingPlayers: 0,
  matchesToday: 0,
  popularGames: [],
  openRooms: [],
  recentActivity: [],
};

test.describe('Home page clarity (empty states and 360px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/games/live-info', (route) =>
      route.fulfill({ json: ZERO_STATS }),
    );
  });

  test('zero live stats explain themselves and each offer a next action', async ({
    page,
  }) => {
    await navigateTo(page, '/en');
    const section = page.getByTestId('home-live-pulse-section');
    await expect(section).toBeVisible();

    await expect(section).toContainText(
      'No open lobbies right now. Create a room or play a bot.',
    );
    await expect(section).toContainText(
      'Matchmaking pairs you with a player who wants the same game',
    );

    for (const id of [
      'live-online-card',
      'live-active-games-card',
      'live-waiting-rooms-card',
      'live-waiting-players-card',
      'live-matches-today-card',
    ]) {
      const card = page.getByTestId(id);
      await expect(card).toBeVisible();
      await expect(card.locator('a, button').first()).toBeVisible();
    }

    await expect(page.getByTestId('live-waiting-rooms-action')).toHaveText(
      'Create a room',
    );
    await expect(page.getByTestId('live-waiting-players-action')).toHaveText(
      'Quick Match',
    );
  });

  test('home page has no horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await navigateTo(page, '/en');
    await expect(page.getByTestId('home-live-pulse-section')).toBeVisible();

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(0);

    const box = await page.getByTestId('live-waiting-rooms-card').boundingBox();
    expect(box).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360);
  });
});
