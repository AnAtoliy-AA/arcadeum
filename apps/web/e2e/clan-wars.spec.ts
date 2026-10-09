import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Clan Wars & Inter-Clan Tournaments', () => {
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
      await handleRoute(route, []);
    });

    await page.route('**/clans/popular*', async (route) => {
      await handleRoute(route, [
        {
          id: 'clan_456',
          name: 'Shadow Phoenix',
          tag: 'PHNX',
          description: 'Rival clan',
          avatarUrl: null,
          leaderId: 'rival-leader',
          memberCount: 10,
          visibility: 'public',
          inviteCode: null,
          totalWins: 180,
          totalGames: 220,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });

    await page.route('**/clans/leaderboard*', async (route) => {
      await handleRoute(route, {
        total: 0,
        limit: 25,
        offset: 0,
        entries: [],
      });
    });

    await page.route('**/clans/challenges*', async (route) => {
      await handleRoute(route, []);
    });

    await page.route('**/clans/wars/active*', async (route) => {
      await handleRoute(route, [
        {
          id: 'war_alpha',
          initiatorClanId: 'clan_123',
          initiatorClanName: 'Apex Titans',
          initiatorClanTag: 'APEX',
          initiatorScore: 3,
          targetClanId: 'clan_456',
          targetClanName: 'Shadow Phoenix',
          targetClanTag: 'PHNX',
          targetClanScore: 2,
          targetScore: 5,
          gameId: 'sea-battle',
          status: 'active',
          winnerClanId: null,
          expiresAt: '2026-10-15T00:00:00.000Z',
          createdAt: '2026-10-08T00:00:00.000Z',
          matchLogs: [
            {
              id: 'log_1',
              playerClanId: 'clan_123',
              playerName: 'ApexLeader',
              opponentClanId: 'clan_456',
              opponentName: 'ShadowRook',
              gameId: 'sea-battle',
              winnerClanId: 'clan_123',
              timestamp: '2026-10-08T12:00:00.000Z',
            },
          ],
        },
        {
          id: 'war_beta',
          initiatorClanId: 'clan_789',
          initiatorClanName: 'Vanguard Knights',
          initiatorClanTag: 'VNG',
          initiatorScore: 5,
          targetClanId: 'clan_999',
          targetClanName: 'Mystic Order',
          targetClanTag: 'MYST',
          targetClanScore: 3,
          targetScore: 5,
          gameId: 'chess',
          status: 'completed',
          winnerClanId: 'clan_789',
          expiresAt: '2026-10-08T00:00:00.000Z',
          createdAt: '2026-10-05T00:00:00.000Z',
          matchLogs: [],
        },
      ]);
    });

    await page.route('**/clans/wars/challenge*', async (route) => {
      await handleRoute(route, {
        id: 'war_gamma',
        initiatorClanId: 'clan_123',
        initiatorClanName: 'Apex Titans',
        initiatorClanTag: 'APEX',
        initiatorScore: 0,
        targetClanId: 'clan_456',
        targetClanName: 'Shadow Phoenix',
        targetClanTag: 'PHNX',
        targetClanScore: 0,
        targetScore: 5,
        gameId: 'chess',
        status: 'active',
        winnerClanId: null,
        expiresAt: '2026-10-18T00:00:00.000Z',
        createdAt: '2026-10-08T13:00:00.000Z',
        matchLogs: [],
      });
    });

    await page.route('**/clans/wars/war_alpha/record-match', async (route) => {
      await handleRoute(route, {
        id: 'war_alpha',
        initiatorClanId: 'clan_123',
        initiatorClanName: 'Apex Titans',
        initiatorClanTag: 'APEX',
        initiatorScore: 4,
        targetClanId: 'clan_456',
        targetClanName: 'Shadow Phoenix',
        targetClanTag: 'PHNX',
        targetClanScore: 2,
        targetScore: 5,
        gameId: 'sea-battle',
        status: 'active',
        winnerClanId: null,
        expiresAt: '2026-10-15T00:00:00.000Z',
        createdAt: '2026-10-08T00:00:00.000Z',
        matchLogs: [
          {
            id: 'log_new',
            playerClanId: 'clan_123',
            playerName: 'ApexLeader',
            opponentClanId: 'clan_456',
            opponentName: 'Contender',
            gameId: 'sea-battle',
            winnerClanId: 'clan_123',
            timestamp: new Date().toISOString(),
          },
        ],
      });
    });
  });

  test('Clan Wars tab renders wars hub, counters, and matchup cards', async ({
    page,
  }) => {
    await navigateTo(page, '/en/clans');

    const warsTab = page.getByTestId('tab-wars');
    await expect(warsTab).toBeVisible();
    await warsTab.click();

    const warsHub = page.getByTestId('clan-wars-hub');
    await expect(warsHub).toBeVisible();

    const activeCounter = page.getByTestId('active-wars-counter');
    await expect(activeCounter).toHaveText('1');

    const warCardAlpha = page.getByTestId('clan-war-card-war_alpha');
    await expect(warCardAlpha).toBeVisible();
    await expect(warCardAlpha).toContainText('Apex Titans');
    await expect(warCardAlpha).toContainText('[APEX]');
    await expect(warCardAlpha).toContainText('Shadow Phoenix');
    await expect(warCardAlpha).toContainText('[PHNX]');
    await expect(warCardAlpha).toContainText('sea-battle');

    const warCardBeta = page.getByTestId('clan-war-card-war_beta');
    await expect(warCardBeta).toBeVisible();
    await expect(warCardBeta).toContainText('Vanguard Knights');
  });

  test('filters clan wars by active and resolved status', async ({ page }) => {
    await navigateTo(page, '/en/clans');

    const warsTab = page.getByTestId('tab-wars');
    await expect(warsTab).toBeVisible();
    await warsTab.click();

    const activeFilter = page.getByTestId('filter-wars-active');
    await activeFilter.click();
    await expect(page.getByTestId('clan-war-card-war_alpha')).toBeVisible();
    await expect(page.getByTestId('clan-war-card-war_beta')).not.toBeVisible();

    const completedFilter = page.getByTestId('filter-wars-completed');
    await completedFilter.click();
    await expect(page.getByTestId('clan-war-card-war_beta')).toBeVisible();
    await expect(page.getByTestId('clan-war-card-war_alpha')).not.toBeVisible();
  });

  test('declares war on rival clan through DeclareWarModal', async ({
    page,
  }) => {
    await navigateTo(page, '/en/clans');

    const warsTab = page.getByTestId('tab-wars');
    await expect(warsTab).toBeVisible();
    await warsTab.click();

    const declareBtn = page.getByTestId('declare-war-button');
    await expect(declareBtn).toBeVisible();
    await declareBtn.click();

    const modal = page.getByTestId('declare-war-modal');
    await expect(modal).toBeVisible();

    const clanSelect = page.getByTestId('select-opponent-clan');
    await clanSelect.selectOption('clan_456');

    const gameSelect = page.getByTestId('select-war-game');
    await gameSelect.selectOption('chess');

    const confirmBtn = page.getByTestId('confirm-declare-war');
    await confirmBtn.click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId('clan-war-card-war_gamma')).toBeVisible();
  });

  test('reports match victory in an active clan war', async ({ page }) => {
    await navigateTo(page, '/en/clans');

    const warsTab = page.getByTestId('tab-wars');
    await expect(warsTab).toBeVisible();
    await warsTab.click();

    const reportBtn = page.getByTestId('report-victory-war_alpha');
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    const card = page.getByTestId('clan-war-card-war_alpha');
    await expect(card).toContainText('4');
  });
});
