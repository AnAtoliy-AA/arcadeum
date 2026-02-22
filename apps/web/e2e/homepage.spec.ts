import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveURL('/');
  });

  test('should render hero section', async ({ page }) => {
    const hero = page.locator('main').first();
    await expect(hero).toBeVisible();
  });

  test('should have navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should render footer', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('should have games link in navigation', async ({ page }) => {
    const gamesLink = page.getByRole('link', { name: /games/i });
    await expect(gamesLink.first()).toBeVisible();
  });

  test('should navigate to games page', async ({ page }) => {
    const gamesLink = page.getByRole('link', { name: /games/i }).first();
    await gamesLink.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should render logo with correct link', async ({ page }) => {
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');
    // Check for app name text presence, case insensitive
    await expect(logoLink).toHaveText(/Arcadeum/i);
  });

  test('should feature Critical game', async ({ page }) => {
    const criticalFeature = page.locator('h3').filter({ hasText: 'Critical' });
    await expect(criticalFeature).toBeVisible();
  });

  test('should feature Sea Battle game', async ({ page }) => {
    const seaBattleFeature = page
      .locator('h3')
      .filter({ hasText: 'Sea Battle' });
    await expect(seaBattleFeature).toBeVisible();
  });
});
