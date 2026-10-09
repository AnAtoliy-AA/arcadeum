import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Clan Leaderboards & Community Challenges', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/clans/me', async (route) => {
      await handleRoute(route, {
        id: 'clan_123',
        name: 'Apex Titans',
        tag: 'APEX',
        description: 'Elite competitive clan on Arcadeum',
        avatarUrl: null,
        leaderId: 'test-user-id',
        memberCount: 12,
        visibility: 'public',
        inviteCode: 'apexcode',
        totalWins: 240,
        totalGames: 280,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });

    await page.route('**/clans/clan_123/members', async (route) => {
      await handleRoute(route, [
        {
          id: 'member_1',
          userId: 'test-user-id',
          username: 'ApexLeader',
          displayName: 'Apex Leader',
          equippedAvatarId: null,
          role: 'leader',
          wins: 110,
          gamesPlayed: 120,
          online: true,
          joinedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });

    await page.route('**/clans/clan_123/mvps*', async (route) => {
      await handleRoute(route, [
        {
          rank: 1,
          id: 'member_1',
          userId: 'test-user-id',
          username: 'ApexLeader',
          displayName: 'Apex Leader',
          equippedAvatarId: null,
          role: 'leader',
          wins: 110,
          gamesPlayed: 120,
          winRate: 92,
        },
      ]);
    });

    await page.route('**/clans/popular*', async (route) => {
      await handleRoute(route, []);
    });

    await page.route('**/clans/leaderboard*', async (route) => {
      await handleRoute(route, {
        total: 2,
        limit: 25,
        offset: 0,
        entries: [
          {
            rank: 1,
            id: 'clan_1',
            name: 'Apex Titans',
            tag: 'APEX',
            description: 'Elite competitive clan',
            avatarUrl: null,
            memberCount: 12,
            totalWins: 240,
            totalGames: 280,
            winRate: 86,
          },
          {
            rank: 2,
            id: 'clan_2',
            name: 'Shadow Phoenix',
            tag: 'PHNX',
            description: 'Chess and card specialists',
            avatarUrl: null,
            memberCount: 18,
            totalWins: 185,
            totalGames: 230,
            winRate: 80,
          },
        ],
      });
    });

    await page.route('**/clans/challenges*', async (route) => {
      await handleRoute(route, [
        {
          id: 'ch_fleet',
          title: 'Armada Vanguard',
          description: 'Sink 5,000 enemy warships in Sea Battle.',
          gameId: 'sea-battle',
          target: 5000,
          currentProgress: 3500,
          progressPercent: 70,
          participantsCount: 88,
          rewardTitle: 'Fleet Admiral',
          rewardBadge: 'badge_admiral',
          startDate: '2026-10-01T00:00:00.000Z',
          endDate: '2026-10-15T00:00:00.000Z',
          status: 'active',
        },
      ]);
    });

    await page.route(
      '**/clans/challenges/ch_fleet/contribute',
      async (route) => {
        await handleRoute(route, {
          id: 'ch_fleet',
          title: 'Armada Vanguard',
          description: 'Sink 5,000 enemy warships in Sea Battle.',
          gameId: 'sea-battle',
          target: 5000,
          currentProgress: 3501,
          progressPercent: 70,
          participantsCount: 89,
          rewardTitle: 'Fleet Admiral',
          rewardBadge: 'badge_admiral',
          startDate: '2026-10-01T00:00:00.000Z',
          endDate: '2026-10-15T00:00:00.000Z',
          status: 'active',
        });
      },
    );
  });

  test('Clan Ladder displays ranked clans with medals, tags, wins, and sorts seamlessly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/clans');

    const leaderboardTab = page.getByTestId('tab-leaderboard');
    await expect(leaderboardTab).toBeVisible();
    await leaderboardTab.click();

    const container = page.getByTestId('clan-leaderboard-container');
    await expect(container).toBeVisible();

    const table = page.getByTestId('clan-leaderboard-table');
    await expect(table).toBeVisible();

    const apexRow = page.getByTestId('clan-row-apex');
    await expect(apexRow).toBeVisible();
    await expect(apexRow).toContainText('Apex Titans');
    await expect(apexRow).toContainText('[APEX]');
    await expect(apexRow).toContainText('240');
    await expect(apexRow).toContainText('86%');

    const phnxRow = page.getByTestId('clan-row-phnx');
    await expect(phnxRow).toBeVisible();
    await expect(phnxRow).toContainText('Shadow Phoenix');
    await expect(phnxRow).toContainText('[PHNX]');

    const sortWinrateButton = page.getByTestId('sort-clan-winrate');
    await expect(sortWinrateButton).toBeVisible();
    await sortWinrateButton.click();
    await expect(sortWinrateButton).toHaveAttribute('aria-selected', 'true');
  });

  test('Community Challenges displays weekly goals, progress bars, rewards, and lets users contribute', async ({
    page,
  }) => {
    await navigateTo(page, '/en/clans');

    const challengesTab = page.getByTestId('tab-challenges');
    await expect(challengesTab).toBeVisible();
    await challengesTab.click();

    const container = page.getByTestId('community-challenges-container');
    await expect(container).toBeVisible();

    const card = page.getByTestId('challenge-card-ch_fleet');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Armada Vanguard');
    await expect(card).toContainText('Sink 5,000 enemy warships');
    await expect(card).toContainText('70%');
    await expect(card).toContainText('Fleet Admiral');

    const contributeBtn = page.getByTestId('contribute-button-ch_fleet');
    await expect(contributeBtn).toBeVisible();
    await contributeBtn.click();
    await expect(contributeBtn).toContainText('Contributed!');
  });

  test('My Clan overview displays MVP board with top member rankings', async ({
    page,
  }) => {
    await navigateTo(page, '/en/clans');

    const overviewTab = page.getByTestId('tab-overview');
    await expect(overviewTab).toBeVisible();

    const mvpBoard = page.getByTestId('clan-mvp-board');
    await expect(mvpBoard).toBeVisible();
    await expect(mvpBoard).toContainText('Clan MVPs');

    const mvpRow = page.getByTestId('mvp-row-apexleader');
    await expect(mvpRow).toBeVisible();
    await expect(mvpRow).toContainText('Apex Leader');
    await expect(mvpRow).toContainText('110');
    await expect(mvpRow).toContainText('92%');
  });
});
