import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Referral Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/referrals/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          referralCode: 'ABCD1234',
          totalReferrals: 4,
          rewards: [
            {
              rewardId: 'badge_social_butterfly',
              rewardType: 'badge',
              unlockedAt: '2026-02-10T12:00:00Z',
              tier: 1,
            },
          ],
          tiers: [
            {
              tier: 1,
              requiredInvites: 3,
              rewards: [
                {
                  rewardId: 'badge_social_butterfly',
                  rewardType: 'badge',
                  label: 'Social Butterfly',
                },
              ],
              unlocked: true,
            },
            {
              tier: 2,
              requiredInvites: 5,
              rewards: [
                {
                  rewardId: 'early_access_heist',
                  rewardType: 'early_access',
                  label: 'Early Access: The Heist',
                },
              ],
              unlocked: false,
            },
            {
              tier: 3,
              requiredInvites: 10,
              rewards: [
                {
                  rewardId: 'early_access_cursed_banquet',
                  rewardType: 'early_access',
                  label: 'Early Access: The Cursed Banquet',
                },
                {
                  rewardId: 'badge_legend_recruiter',
                  rewardType: 'badge',
                  label: 'Legend Recruiter',
                },
              ],
              unlocked: false,
            },
          ],
          nextTier: {
            requiredInvites: 5,
            remaining: 1,
          },
        }),
      });
    });

    await page.route('**/referrals/code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ referralCode: 'ABCD1234' }),
      });
    });
  });

  test('should display referral dashboard with user code', async ({ page }) => {
    await navigateTo(page, '/referrals');

    await expect(page.getByTestId('referral-code')).toBeVisible();
    await expect(page.getByTestId('referral-code')).toHaveText('ABCD1234');
  });

  test('should show progress toward next reward', async ({ page }) => {
    await navigateTo(page, '/referrals');

    await expect(page.getByTestId('referral-count')).toBeVisible();
    await expect(page.getByTestId('referral-count')).toHaveText('4');
  });

  test('should display unlocked and locked rewards', async ({ page }) => {
    await navigateTo(page, '/referrals');

    const tier1 = page.getByTestId('tier-1');
    await expect(tier1).toBeVisible();
    await expect(tier1).toHaveAttribute('data-unlocked', 'true');

    const tier2 = page.getByTestId('tier-2');
    await expect(tier2).toBeVisible();
    await expect(tier2).toHaveAttribute('data-unlocked', 'false');

    const tier3 = page.getByTestId('tier-3');
    await expect(tier3).toBeVisible();
    await expect(tier3).toHaveAttribute('data-unlocked', 'false');
  });

  test('should have copy referral button', async ({ page }) => {
    await navigateTo(page, '/referrals');

    const copyBtn = page.getByTestId('copy-referral-btn');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(page.getByText(/copied|скопировано|copié/i)).toBeVisible();
  });

  test('should show invite friends link in profile menu', async ({ page }) => {
    await navigateTo(page, '/referrals');

    const profileMenu = page.locator('[data-profile-menu]');
    if (await profileMenu.isVisible()) {
      const userInfo = page.getByTestId('header-username');
      await userInfo.click();
      await expect(
        profileMenu.getByText(/invite friends|пригласить друзей|inviter/i),
      ).toBeVisible();
    }
  });

  test('should display earned cosmetic badges on dashboard', async ({
    page,
  }) => {
    await navigateTo(page, '/referrals');
    const dashboard = page.getByTestId('referral-dashboard');
    const badge = dashboard.getByTestId(
      'cosmetic-badge-badge_social_butterfly',
    );
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Social Butterfly');
  });
});
