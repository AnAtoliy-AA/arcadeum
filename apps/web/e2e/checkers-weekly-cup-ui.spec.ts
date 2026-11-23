import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

const players = ['Ada', 'Grace', 'Linus', 'Margaret'].map((name, i) => ({
  userId: `player-${i + 1}`,
  displayName: name,
  seed: i + 1,
  waitlist: false,
}));

function cupPayload(overrides: { enabled?: boolean } = {}) {
  return {
    tournament: {
      id: 'cup-checkers-e2e',
      gameType: 'checkers_v1',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
      registrationClosesAt: new Date(Date.now() + 80000000).toISOString(),
      maxPlayers: 16,
      prizeDescription: '400 Coins + Crown Trophy',
      resultText: null,
      entryFeeCoins: 0,
      prizePoolCoins: 400,
      status: 'registration_open',
      effectiveStatus: 'registration_open',
      registeredCount: players.length,
      waitlistCount: 0,
      isRegistered: false,
      isWaitlisted: false,
      name: 'Checkers Weekly Cup',
      description: 'Weekly single-elimination checkers tournament',
    },
    bracket: null,
    countdownSeconds: 86400,
    enabled: overrides.enabled ?? true,
    captains: players,
  };
}

test.describe('Checkers Weekly Cup UI', () => {
  test('renders the weekly cup banner on the checkers landing and opens the modal', async ({
    page,
  }) => {
    await page.route('**/tournaments/weekly-cups/checkers*', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      await handleRoute(route, cupPayload());
    });

    await navigateTo(page, '/en/games/checkers');

    const banner = page
      .locator('[data-testid="checkers-weekly-cup-banner"]')
      .first();
    await expect(banner).toBeVisible();
    await expect(
      page.locator('[data-testid="blitz-cup-title"]').first(),
    ).toHaveText('Checkers Weekly Cup');
    await expect(
      page.locator('[data-testid="blitz-cup-captains-count"]').first(),
    ).toContainText('4 / 16');

    await page
      .locator('[data-testid="blitz-cup-view-bracket"]')
      .first()
      .click({ force: true });

    const modal = page
      .locator('[data-testid="checkers-weekly-cup-modal"]')
      .first();
    await expect(modal).toBeVisible();
    await expect(
      page.locator('[data-testid="blitz-bracket-pending"]').first(),
    ).toBeVisible();

    await page
      .locator('[data-testid="blitz-tab-roster"]')
      .first()
      .click({ force: true });
    const roster = page
      .locator('[data-testid="blitz-modal-roster-section"]')
      .first();
    await expect(roster).toContainText('Ada');
    await expect(roster).toContainText('Grace');

    await page
      .locator('[data-testid="blitz-tab-intel"]')
      .first()
      .click({ force: true });
    await expect(
      page.locator('[data-testid="blitz-modal-intel-section"]').first(),
    ).toContainText('Board and Rules');
  });

  test('hides the banner when the checkers cup is disabled', async ({
    page,
  }) => {
    await page.route('**/tournaments/weekly-cups/checkers*', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      await handleRoute(route, cupPayload({ enabled: false }));
    });

    await navigateTo(page, '/en/games/checkers');
    await expect(
      page.locator('[data-testid="checkers-weekly-cup-banner"]'),
    ).toHaveCount(0);
  });

  test('does not show the checkers cup banner on the sea battle landing', async ({
    page,
  }) => {
    await page.route('**/tournaments/weekly-cups/checkers*', async (route) => {
      await handleRoute(route, cupPayload());
    });
    await navigateTo(page, '/en/games/sea-battle');
    await expect(
      page.locator('[data-testid="checkers-weekly-cup-banner"]'),
    ).toHaveCount(0);
  });
});
