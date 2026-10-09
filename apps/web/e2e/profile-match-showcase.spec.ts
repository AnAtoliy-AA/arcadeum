import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Profile Match Showcase & Head to Head', () => {
  const targetUserId = 'target_user_456';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route(`**/auth/users/${targetUserId}`, async (route) => {
      await handleRoute(route, {
        id: targetUserId,
        username: 'grandmaster',
        displayName: 'Grand Master',
        role: 'pro',
        xp: 15400,
        level: 16,
        prestige: 1,
        equippedAvatarId: null,
        equippedBadgeId: null,
        equippedNameColorId: null,
        equippedFrameId: null,
        equippedAuraId: null,
        equippedBannerId: null,
        countryCode: 'US',
        createdAt: '2025-01-15T10:00:00.000Z',
      });
    });

    await page.route(`**/friends/user/${targetUserId}`, async (route) => {
      await handleRoute(route, []);
    });

    await page.route('**/friends/pending', async (route) => {
      await handleRoute(route, { incoming: [], outgoing: [] });
    });

    await page.route(`**/achievements/user/${targetUserId}`, async (route) => {
      await handleRoute(route, [
        {
          achievementId: 'first_win',
          name: 'First Victory',
          rarity: 'common',
          iconUrl: null,
        },
        {
          achievementId: 'streak_master',
          name: 'Streak Master',
          rarity: 'legendary',
          iconUrl: null,
        },
      ]);
    });

    await page.route(`**/games/stats/user/${targetUserId}`, async (route) => {
      await handleRoute(route, {
        totalGames: 42,
        wins: 28,
        losses: 14,
        winRate: 67,
        byGameType: [
          {
            gameId: 'chess',
            totalGames: 30,
            wins: 20,
            winRate: 67,
          },
          {
            gameId: 'sea_battle_v1',
            totalGames: 12,
            wins: 8,
            winRate: 67,
          },
        ],
        currentStreak: 4,
        currentStreakType: 'won',
        bestWinStreak: 9,
        favoriteGame: 'chess',
      });
    });

    await page.route(
      `**/games/stats/user/${targetUserId}/trends*`,
      async (route) => {
        await handleRoute(route, {
          records: [
            { result: 'won', timestamp: Date.now() - 1000, sessionId: 's1' },
            { result: 'won', timestamp: Date.now() - 2000, sessionId: 's2' },
            { result: 'lost', timestamp: Date.now() - 3000, sessionId: 's3' },
            { result: 'won', timestamp: Date.now() - 4000, sessionId: 's4' },
          ],
          winRate: 75,
          currentStreak: 2,
          currentStreakType: 'won',
        });
      },
    );

    await page.route(`**/games/stats/head-to-head*`, async (route) => {
      await handleRoute(route, {
        player1: { wins: 5, losses: 3, draws: 1 },
        player2: { wins: 3, losses: 5, draws: 1 },
        totalGames: 9,
      });
    });

    await page.route(
      `**/games/history/user/${targetUserId}*`,
      async (route) => {
        await handleRoute(route, {
          entries: [
            {
              roomId: 'room-alpha-1',
              sessionId: 'sess-1',
              gameId: 'chess',
              roomName: 'Grandmaster Blitz',
              status: 'completed',
              startedAt: '2026-10-01T12:00:00.000Z',
              completedAt: '2026-10-01T12:15:00.000Z',
              lastActivityAt: '2026-10-01T12:15:00.000Z',
              host: {
                id: targetUserId,
                username: 'grandmaster',
                email: null,
                isHost: true,
              },
              participants: [
                {
                  id: targetUserId,
                  username: 'grandmaster',
                  email: null,
                  isHost: true,
                },
                {
                  id: 'rival-1',
                  username: 'challenger_one',
                  email: null,
                  isHost: false,
                },
              ],
            },
          ],
          total: 1,
          hasMore: false,
          page: 0,
        });
      },
    );
  });

  test('displays player stats, head-to-head rival card, and match history feed', async ({
    page,
  }) => {
    await navigateTo(page, `/profile/${targetUserId}`);

    await expect(page.getByText('Grand Master').first()).toBeVisible();
    await expect(page.getByText('@grandmaster')).toBeVisible();

    const shareBtn = page.getByTestId('profile-share-button');
    await expect(shareBtn).toBeVisible();

    await expect(page.getByText('Grandmaster Blitz')).toBeVisible();
    await expect(page.getByText('vs challenger_one')).toBeVisible();

    await expect(page.getByText('First Victory')).toBeVisible();
    await expect(page.getByText('Streak Master')).toBeVisible();
  });
});
