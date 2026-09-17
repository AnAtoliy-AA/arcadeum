import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Game Visibility & Role Access', () => {
  test('anonymous user sees disabled quickplay on cat dash landing when coming soon', async ({
    page,
  }) => {
    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            gameId: 'cat_dash_v1',
            comingSoon: true,
            variants: [],
            rules: [],
          },
        ],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    const playBtn = page.getByTestId('quickplay-human-button').first();
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeDisabled();
  });

  test('vip user sees enabled quickplay on cat dash landing', async ({
    page,
  }) => {
    await mockSession(page, { role: 'vip' });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            gameId: 'cat_dash_v1',
            comingSoon: false,
            variants: [],
            rules: [],
          },
        ],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    const playBtn = page.getByTestId('quickplay-human-button').first();
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeEnabled();
  });

  test('moderator user sees enabled quickplay on cat dash landing', async ({
    page,
  }) => {
    await mockSession(page, { role: 'moderator' });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            gameId: 'cat_dash_v1',
            comingSoon: false,
            variants: [],
            rules: [],
          },
        ],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    const playBtn = page.getByTestId('quickplay-human-button').first();
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeEnabled();
  });

  test('admin user sees create room enabled for premium+ game', async ({
    page,
  }) => {
    await mockSession(page, { role: 'admin' });

    await page.route('**/games/my-room-count', async (route) => {
      await handleRoute(route, { count: 0, nextRoomNumber: 1 });
    });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            gameId: 'cat_dash_v1',
            comingSoon: false,
            variants: [],
            rules: [],
          },
        ],
      });
    });

    await navigateTo(page, '/en/games/create?gameId=cat_dash_v1');

    const submitBtn = page.getByTestId('create-room-button').first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });
});
