import { expect } from '@playwright/test';
import {
  test,
  handleRoute,
  navigateTo,
  mockSession,
} from './fixtures/test-utils';

test.describe('Social Network Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/social-rewards', async (route) => {
      await handleRoute(route, {
        items: [
          { platform: 'discord', gems: 1, claimed: false, claimedAt: null },
          {
            platform: 'telegram',
            gems: 1,
            claimed: true,
            claimedAt: '2026-08-31T10:00:00Z',
          },
          { platform: 'x', gems: 1, claimed: false, claimedAt: null },
          { platform: 'github', gems: 1, claimed: false, claimedAt: null },
        ],
        totalClaimed: 1,
        totalAvailable: 4,
        gemsPerSubscription: 1,
      });
    });

    await page.route('**/social-rewards/claim', async (route) => {
      await handleRoute(route, {
        success: true,
        platform: 'discord',
        gemsAwarded: 1,
        gemsBalanceAfter: 5,
        claimedAt: '2026-08-31T12:00:00Z',
      });
    });
  });

  test('displays social rewards section and cards on rewards page', async ({
    page,
  }) => {
    await navigateTo(page, '/rewards');

    const section = page.getByTestId('social-rewards-section');
    await expect(section).toBeVisible();

    const grid = page.getByTestId('social-rewards-grid');
    await expect(grid).toBeVisible();

    const discordCard = page.getByTestId('social-reward-card-discord');
    await expect(discordCard).toBeVisible();

    const telegramCard = page.getByTestId('social-reward-card-telegram');
    await expect(telegramCard).toBeVisible();
  });

  test('claims social reward on button click and shows success feedback', async ({
    page,
  }) => {
    await navigateTo(page, '/rewards');

    const discordClaimBtn = page.getByTestId('social-reward-claim-btn-discord');
    await expect(discordClaimBtn).toBeVisible();
    await expect(discordClaimBtn).toBeEnabled();

    await discordClaimBtn.click();

    const successFeedback = page.getByTestId('social-reward-success-discord');
    await expect(successFeedback).toBeVisible();
    await expect(discordClaimBtn).toBeDisabled();
  });

  test('already claimed social network card has disabled button', async ({
    page,
  }) => {
    await navigateTo(page, '/rewards');

    const telegramClaimBtn = page.getByTestId(
      'social-reward-claim-btn-telegram',
    );
    await expect(telegramClaimBtn).toBeVisible();
    await expect(telegramClaimBtn).toBeDisabled();
  });
});
