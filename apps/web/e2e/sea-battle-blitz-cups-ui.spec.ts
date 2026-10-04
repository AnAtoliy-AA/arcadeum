import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';

test.describe('Sea Battle Weekly Blitz Cups UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/tournaments/sea-battle/blitz-cup*', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      await handleRoute(route, {
        tournament: {
          id: 'cup-blitz-e2e',
          gameType: 'sea_battle_v1',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
          registrationClosesAt: new Date(Date.now() + 80000000).toISOString(),
          maxPlayers: 16,
          prizeDescription: '500 Coins + Admiral Trophy',
          resultText: null,
          entryFeeCoins: 0,
          prizePoolCoins: 500,
          status: 'registration_open',
          effectiveStatus: 'registration_open',
          registeredCount: 6,
          waitlistCount: 0,
          isRegistered: false,
          isWaitlisted: false,
          name: 'Sea Battle Weekend Blitz Cup',
          description:
            'Weekly 16-player naval tournament with rapid-fire salvo warfare',
        },
        bracket: null,
        countdownSeconds: 86400,
        enabled: true,
        captains: [
          {
            userId: 'capt-1',
            displayName: 'Admiral Farragut',
            seed: 1,
            waitlist: false,
          },
          {
            userId: 'capt-2',
            displayName: 'Captain Nemo',
            seed: 2,
            waitlist: false,
          },
          {
            userId: 'capt-3',
            displayName: 'Commander Shepard',
            seed: 3,
            waitlist: false,
          },
          {
            userId: 'capt-4',
            displayName: 'Fleet Admiral Yi',
            seed: 4,
            waitlist: false,
          },
          {
            userId: 'capt-5',
            displayName: 'Captain Hook',
            seed: 5,
            waitlist: false,
          },
          {
            userId: 'capt-6',
            displayName: 'Captain Jack',
            seed: 6,
            waitlist: false,
          },
        ],
      });
    });
  });

  test('renders blitz cup banner on sea battle landing with captains preview and opens modal', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sea-battle');

    const banner = page
      .locator('[data-testid="sea-battle-blitz-banner"]')
      .first();
    await expect(banner).toBeVisible();

    const title = page.locator('[data-testid="blitz-cup-title"]').first();
    await expect(title).toHaveText('Sea Battle Weekend Blitz Cup');

    const captainsCount = page
      .locator('[data-testid="blitz-cup-captains-count"]')
      .first();
    await expect(captainsCount).toContainText('6 / 16');

    const preview = page
      .locator('[data-testid="blitz-cup-captains-preview"]')
      .first();
    await expect(preview).toBeVisible();

    const viewBracketButton = page
      .locator('[data-testid="blitz-cup-view-bracket"]')
      .first();
    await expect(viewBracketButton).toBeVisible();
    await viewBracketButton.click();

    const modal = page
      .locator('[data-testid="sea-battle-blitz-modal"]')
      .first();
    await expect(modal).toBeVisible();

    const pendingSection = page
      .locator('[data-testid="blitz-bracket-pending"]')
      .first();
    await expect(pendingSection).toBeVisible();

    const rosterTab = page.locator('[data-testid="blitz-tab-roster"]').first();
    await rosterTab.click();

    const rosterSection = page
      .locator('[data-testid="blitz-modal-roster-section"]')
      .first();
    await expect(rosterSection).toBeVisible();
    await expect(rosterSection).toContainText('Admiral Farragut');
    await expect(rosterSection).toContainText('Captain Nemo');
    await expect(rosterSection).toContainText('Commander Shepard');

    const intelTab = page.locator('[data-testid="blitz-tab-intel"]').first();
    await intelTab.click();

    const intelSection = page
      .locator('[data-testid="blitz-modal-intel-section"]')
      .first();
    await expect(intelSection).toBeVisible();
    await expect(intelSection).toContainText('Tournament Format');
    await expect(intelSection).toContainText('Fleet Deployment');
    await expect(intelSection).toContainText('Turn Clock');
    await expect(intelSection).toContainText('Championship Rewards');

    const closeButton = page
      .locator('[data-testid="blitz-modal-close-btn"]')
      .first();
    await closeButton.click();

    await expect(modal).not.toBeVisible();
  });
});
