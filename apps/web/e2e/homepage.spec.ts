import { expect } from '@playwright/test';
import { test, ensureNavigationVisible } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await page.addStyleTag({
      content: '[data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }',
    });
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveURL('/');
  });

  test('should render hero section', async ({ page }) => {
    const hero = page.getByTestId('page-layout').filter({ visible: true }).first();
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
    await ensureNavigationVisible(page);
    const gamesLink = page.getByRole('link', { name: /games/i }).filter({ visible: true });
    await expect(gamesLink.first()).toBeVisible();
  });

  test('should navigate to games page', async ({ page, isMobile }) => {
    await ensureNavigationVisible(page);
    const gamesLink = isMobile 
      ? page.getByTestId('mobile-nav-games') 
      : page.getByTestId('nav-games');
    
    await expect(gamesLink).toBeVisible();
    await gamesLink.dispatchEvent('click');
    
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
    const criticalFeature = page.getByTestId('game-title-critical_v1');
    await expect(criticalFeature).toBeVisible();
  });

  test('should feature Sea Battle game', async ({ page }) => {
    const seaBattleFeature = page.getByTestId('game-title-sea_battle_v1');
    await expect(seaBattleFeature).toBeVisible();
  });

  test('should render hero cards stack on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hero cards are only visible on desktop');
    const cardStack = page.locator('.hero-card-stack').first();
    await expect(cardStack).toBeVisible();
    
    // Check that there are at least 3 cards built
    const heroCards = cardStack.locator('> div');
    await expect(heroCards).toHaveCount(3);
  });
});
