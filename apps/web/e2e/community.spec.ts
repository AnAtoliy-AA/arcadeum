import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Community Page', () => {
  test('should display community page title, subtitle, and stats', async ({
    page,
  }) => {
    await navigateTo(page, '/community');

    await expect(
      page
        .locator('main')
        .getByText(/join the community/i)
        .first(),
    ).toBeVisible();

    await expect(
      page.getByText(/connect with fellow gamers worldwide/i),
    ).toBeVisible();

    await expect(page.getByText(/global ecosystem/i)).toBeVisible();
    await expect(page.getByTestId('community-stat-players')).toBeVisible();
    await expect(page.getByTestId('community-stat-discord')).toBeVisible();
    await expect(page.getByTestId('community-stat-github')).toBeVisible();
    await expect(page.getByText(/active players/i)).toBeVisible();
    await expect(page.getByText(/discord gamers/i)).toBeVisible();
  });

  test('should display grid with all community networks', async ({ page }) => {
    await navigateTo(page, '/community');

    const networksGrid = page.getByTestId('community-networks-grid');
    await expect(networksGrid).toBeVisible();

    const expectedNetworks = [
      'discord',
      'telegram',
      'twitter',
      'github',
      'youtube',
      'instagram',
      'tiktok',
      'threads',
      'facebook',
      'linkedin',
    ];

    for (const net of expectedNetworks) {
      const card = page.getByTestId(`network-card-${net}`);
      await expect(card).toBeVisible();
    }
  });

  test('network cards should have valid external links', async ({ page }) => {
    await navigateTo(page, '/community');

    const githubCard = page.getByTestId('network-card-github');
    await expect(githubCard).toHaveAttribute('href', /github\.com/);
    await expect(githubCard).toHaveAttribute('target', '_blank');

    const discordCard = page.getByTestId('network-card-discord');
    await expect(discordCard).toHaveAttribute('href', /discord/);

    const telegramCard = page.getByTestId('network-card-telegram');
    await expect(telegramCard).toHaveAttribute('href', /t\.me|telegram/);
  });
});
