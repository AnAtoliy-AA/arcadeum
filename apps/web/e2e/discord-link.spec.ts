import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Discord Links', () => {
  test.describe.configure({ mode: 'serial' });

  test('profile menu should render discord link with correct attributes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/');
    await expect(page.getByTestId('header-discord-link')).toHaveCount(0);
    const profileMenu = page.getByTestId('profile-menu');
    await profileMenu.click();
    const discordLink = page.getByTestId('profile-discord-link');
    await expect(discordLink).toBeVisible();
    await expect(discordLink).toHaveAttribute('href', /discord\.(gg|com)/);
    await expect(discordLink).toHaveAttribute('target', '_blank');
    await expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('mobile menu should render discord link with correct attributes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/');
    const menuButton = page.getByTestId('mobile-menu-button');
    await menuButton.click({ force: true });
    const discordMobileLink = page.getByTestId('mobile-discord-link');
    await expect(discordMobileLink).toBeVisible();
    await expect(discordMobileLink).toHaveAttribute(
      'href',
      /discord\.(gg|com)/,
    );
    await expect(discordMobileLink).toHaveAttribute('target', '_blank');
    await expect(discordMobileLink).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });
});
