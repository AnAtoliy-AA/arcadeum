import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Community Game Nights', () => {
  test('events list page renders with title and filter tabs', async ({
    page,
  }) => {
    await page.route('**/*', async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.resourceType() === 'fetch' &&
        (url.endsWith('/events') || url.includes('/events?'))
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mock-event-1',
              title: 'Friday Night Blitz Chess',
              description: 'Weekly blitz competition.',
              gameType: 'chess',
              status: 'active',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 3600000).toISOString(),
              prizeBadge: 'champion_crown',
              participantCount: 8,
              activeGamesCount: 3,
              mvpUserId: null,
              mvpDisplayName: null,
              mvpPoints: 0,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'mock-event-2',
              title: 'Sea Battle Armada Clash',
              description: 'Fleet commanders clash.',
              gameType: 'sea-battle',
              status: 'upcoming',
              startTime: new Date(Date.now() + 86400000).toISOString(),
              endTime: new Date(Date.now() + 90000000).toISOString(),
              prizeBadge: 'admiral_ribbon',
              participantCount: 0,
              activeGamesCount: 0,
              mvpUserId: null,
              mvpDisplayName: null,
              mvpPoints: 0,
              createdAt: new Date().toISOString(),
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/events');

    await expect(
      page
        .getByText(
          /Community Game Nights|Игровые Вечера|Noches de Juego|Soirées de Jeux|Гульнявыя Вечары/i,
        )
        .first(),
    ).toBeVisible();

    await expect(page.getByTestId('events-grid')).toBeVisible();
    await expect(page.getByTestId('event-card-mock-event-1')).toBeVisible();
    await expect(page.getByTestId('event-card-mock-event-2')).toBeVisible();

    const allTab = page.getByRole('button', { name: /all/i });
    await expect(allTab).toBeVisible();
  });

  test('event detail page renders info and leaderboard', async ({ page }) => {
    await page.route('**/*', async (route) => {
      const req = route.request();
      const url = req.url();
      if (req.resourceType() === 'fetch' && url.includes('/events/mock-event-1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-event-1',
            title: 'Friday Night Blitz Chess',
            description: 'Weekly blitz competition.',
            gameType: 'chess',
            status: 'active',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            prizeBadge: 'champion_crown',
            participantCount: 2,
            activeGamesCount: 1,
            mvpUserId: 'user-alex',
            mvpDisplayName: 'GrandmasterAlex',
            mvpPoints: 12,
            createdAt: new Date().toISOString(),
            participants: [
              {
                userId: 'user-alex',
                displayName: 'GrandmasterAlex',
                avatarUrl: null,
                gamesPlayed: 4,
                wins: 4,
                points: 12,
                registeredAt: new Date().toISOString(),
              },
              {
                userId: 'user-knight',
                displayName: 'KnightRider',
                avatarUrl: null,
                gamesPlayed: 3,
                wins: 2,
                points: 7,
                registeredAt: new Date().toISOString(),
              },
            ],
            leaderboard: [
              {
                userId: 'user-alex',
                displayName: 'GrandmasterAlex',
                avatarUrl: null,
                gamesPlayed: 4,
                wins: 4,
                points: 12,
                registeredAt: new Date().toISOString(),
              },
              {
                userId: 'user-knight',
                displayName: 'KnightRider',
                avatarUrl: null,
                gamesPlayed: 3,
                wins: 2,
                points: 7,
                registeredAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/events/mock-event-1');

    await expect(page.getByTestId('event-detail-page')).toBeVisible();
    await expect(page.getByText('Friday Night Blitz Chess')).toBeVisible();
    await expect(page.getByText('GrandmasterAlex').first()).toBeVisible();
    await expect(page.getByText('KnightRider')).toBeVisible();
    await expect(page.getByTestId('event-play-now-button')).toBeVisible();
  });

  test('home page renders event banner when featured event exists', async ({
    page,
  }) => {
    await page.route('**/*', async (route) => {
      const req = route.request();
      const url = req.url();
      if (req.resourceType() === 'fetch' && url.includes('/events/featured')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-event-1',
            title: 'Friday Night Blitz Chess',
            description: 'Live community tournament in progress.',
            gameType: 'chess',
            status: 'active',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            prizeBadge: 'champion_crown',
            participantCount: 12,
            activeGamesCount: 4,
            mvpUserId: null,
            mvpDisplayName: null,
            mvpPoints: 0,
            createdAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/');

    await expect(page.getByTestId('event-banner')).toBeVisible();
    await expect(page.getByText('Friday Night Blitz Chess')).toBeVisible();
  });
});
