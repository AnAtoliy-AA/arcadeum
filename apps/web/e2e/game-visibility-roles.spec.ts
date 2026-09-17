import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Game Visibility & Role Access', () => {
  test('anonymous user sees coming soon badge on cat dash landing and no quickplay button', async ({
    page,
  }) => {
    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            id: 'cat_dash_v1',
            name: 'Cat Dash',
            comingSoon: true,
            minPlayers: 2,
            maxPlayers: 6,
          },
        ],
        categories: [],
        comingSoonGames: ['cat_dash_v1'],
        featuredGames: [],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    await expect(
      page.getByTestId('game-coming-soon-badge').first(),
    ).toBeVisible();
    await expect(page.getByTestId('quickplay-button')).toBeHidden();
  });

  test('vip user sees quickplay button and can access cat dash landing', async ({
    page,
  }) => {
    await mockSession(page, { role: 'vip' });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            id: 'cat_dash_v1',
            name: 'Cat Dash',
            comingSoon: false,
            minPlayers: 2,
            maxPlayers: 6,
          },
        ],
        categories: [],
        comingSoonGames: [],
        featuredGames: [],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    await expect(page.getByTestId('quickplay-button').first()).toBeVisible();
    await expect(page.getByTestId('game-coming-soon-badge')).toBeHidden();
  });

  test('moderator user sees quickplay button and unlocked game on cat dash landing', async ({
    page,
  }) => {
    await mockSession(page, { role: 'moderator' });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            id: 'cat_dash_v1',
            name: 'Cat Dash',
            comingSoon: false,
            minPlayers: 2,
            maxPlayers: 6,
          },
        ],
        categories: [],
        comingSoonGames: [],
        featuredGames: [],
      });
    });

    await navigateTo(page, '/en/games/cat-dash');

    await expect(page.getByTestId('quickplay-button').first()).toBeVisible();
    await expect(page.getByTestId('game-coming-soon-badge')).toBeHidden();
  });

  test('admin user sees create room enabled for premium+ game', async ({
    page,
  }) => {
    await mockSession(page, { role: 'admin' });

    await page.route('**/games/catalog', async (route) => {
      await handleRoute(route, {
        games: [
          {
            id: 'cat_dash_v1',
            name: 'Cat Dash',
            comingSoon: false,
            minPlayers: 2,
            maxPlayers: 6,
          },
        ],
        categories: [],
        comingSoonGames: [],
        featuredGames: [],
      });
    });

    await navigateTo(page, '/en/games/create?gameId=cat_dash_v1');

    await expect(page.getByTestId('create-room-submit-button')).toBeVisible();
    await expect(page.getByTestId('create-room-submit-button')).toBeEnabled();
  });
});
