import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Header Decluttering for Authenticated User', () => {
  test('authenticated user header hides top-level language switcher and discord link', async ({
    page,
    viewport,
  }) => {
    test.skip(
      !!viewport && viewport.width < 768,
      'Desktop header declutter test',
    );
    await mockSession(page, { displayName: 'Tester', role: 'player' });
    await navigateTo(page, '/');

    const profileMenu = page.getByTestId('profile-menu');
    await expect(profileMenu).toBeVisible();

    const headerAvatar = page.getByTestId('header-equipped-avatar');
    await expect(headerAvatar).toBeVisible();

    const streakBadge = page.getByTestId('header-streak-badge');
    await expect(streakBadge).not.toBeVisible();

    const discordHeaderLink = page.getByTestId('header-discord-link');
    await expect(discordHeaderLink).not.toBeVisible();

    const langSwitcher = page.getByTestId('header-language-switcher');
    await expect(langSwitcher).not.toBeVisible();

    const trigger = page.locator('[data-profile-menu] button').first();
    await trigger.click();

    const profileDiscordLink = page.getByTestId('profile-discord-link');
    await expect(profileDiscordLink).toBeVisible();
    await expect(profileDiscordLink).toHaveAttribute(
      'href',
      /discord\.(gg|com)/,
    );

    const profileLeaderboardsLink = page.getByTestId(
      'profile-leaderboards-link',
    );
    await expect(profileLeaderboardsLink).toBeVisible();
    await expect(profileLeaderboardsLink).toHaveAttribute(
      'href',
      /leaderboards/,
    );
  });

  test('guest header renders language switcher, no discord link, and allows opening profile menu', async ({
    page,
    viewport,
  }) => {
    test.skip(!!viewport && viewport.width < 768, 'Desktop header guest test');
    await navigateTo(page, '/');

    const discordHeaderLink = page.getByTestId('header-discord-link');
    await expect(discordHeaderLink).not.toBeVisible();

    const langSwitcher = page.getByTestId('header-language-switcher');
    await expect(langSwitcher).toBeVisible();

    const profileMenu = page.getByTestId('profile-menu');
    await expect(profileMenu).toBeVisible();

    const trigger = page.locator('[data-profile-menu] button').first();
    await trigger.click();

    const loginLink = page.getByTestId('profile-login-link');
    await expect(loginLink).toBeVisible();

    const leaderboardsLink = page.getByTestId('profile-leaderboards-link');
    await expect(leaderboardsLink).toBeVisible();

    const profileDiscordLink = page.getByTestId('profile-discord-link');
    await expect(profileDiscordLink).toBeVisible();

    const logoutButton = page.getByTestId('desktop-logout-button');
    await expect(logoutButton).not.toBeVisible();
  });

  test('guest mobile menu shows user profile card with fallback avatar and guest name', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateTo(page, '/');

    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();

    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    const userCard = page.getByTestId('mobile-user-card');
    await expect(userCard).toBeVisible();
    await expect(userCard).toContainText(/Guest/);

    const loginButton = page.getByTestId('mobile-login-button');
    await expect(loginButton).toBeVisible();
  });
});
