import { expect } from '@playwright/test';
import { test, ensureNavigationVisible } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await page.addStyleTag({
      content:
        'html body [data-reveal][data-reveal] { opacity: 1; transform: none; transition: none; }',
    });
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/(?:en|es|fr|ru|by)?\/?$/);
  });

  test('should render hero section', async ({ page }) => {
    const hero = page
      .getByTestId('page-layout')
      .filter({ visible: true })
      .first();
    await expect(hero).toBeVisible();
  });

  test('should have navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should render footer', async ({ page }) => {
    const footer = page.getByTestId('app-footer').first();
    await expect(footer).toBeVisible();
  });

  test('should have games link in navigation', async ({ page }) => {
    await ensureNavigationVisible(page);
    const gamesLink = page
      .getByRole('link', { name: /rooms/i })
      .filter({ visible: true });
    await expect(gamesLink.first()).toBeVisible();
  });

  test('should navigate to games page', async ({ page, isMobile }) => {
    await ensureNavigationVisible(page);
    const gamesLink = isMobile
      ? page.getByTestId('mobile-nav-rooms')
      : page.getByTestId('nav-games');

    await expect(gamesLink).toBeVisible();
    await gamesLink.dispatchEvent('click');

    // Desktop "Games" goes to the /games catalog; mobile "Rooms" goes to /rooms.
    await expect(page).toHaveURL(new RegExp(`${routes.games}|${routes.rooms}`));
  });

  test('should render logo with correct link', async ({ page }) => {
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');
    // Check for app name text presence, case insensitive
    await expect(logoLink).toHaveText(/Arcadeum/i);
  });

  test('should feature Critical game', async ({ page }) => {
    const criticalFeature = page
      .locator('main')
      .first()
      .getByTestId('game-title-critical_v1')
      .first();
    await expect(criticalFeature).toBeVisible();
  });

  test('should feature Sea Battle game', async ({ page }) => {
    const seaBattleFeature = page
      .locator('main')
      .first()
      .getByTestId('game-title-sea_battle_v1')
      .first();
    await expect(seaBattleFeature).toBeVisible();
  });

  test('should render hero cards stack on desktop', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Hero cards are only visible on desktop');

    // Ensure viewport is large enough for gtMd breakpoint (1151px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateTo(page, '/');

    // Use toPass to handle potential hydration delays and breakpoint updates
    await expect(async () => {
      const cardStack = page.getByTestId('hero-card-stack');
      await expect(cardStack).toBeVisible();

      const heroCards = cardStack.locator('[data-testid^="hero-card-"]');
      await expect(heroCards).toHaveCount(3);
    }).toPass({});
  });

  test('should have modernized support developers button', async ({ page }) => {
    const supportButton = page.getByTestId('hero-section').getByRole('link', {
      name: /support (the )?developers/i,
    });
    await expect(supportButton).toBeVisible();
    await expect(supportButton).toHaveAttribute('href', /\/support/);

    // Check for the icon
    const icon = supportButton.locator('svg');
    await expect(icon).toBeVisible();

    // Check it's an action (should be in the hero actions list)
    await expect(supportButton).toBeVisible();
  });

  test('should navigate to games page via Get Started button', async ({
    page,
  }) => {
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should open game picker modal via Play vs AI button and interact with filters and cards', async ({
    page,
  }) => {
    const playVsAiButton = page.getByTestId('hero-play-vs-ai-button');
    await expect(playVsAiButton).toBeVisible();
    await playVsAiButton.click();

    const modal = page.getByTestId('game-picker-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('game-picker-title')).toBeVisible();
    await expect(page.getByTestId('game-picker-search')).toBeVisible();

    const chessCard = page.getByTestId('game-picker-card-chess_v1');
    const criticalCard = page.getByTestId('game-picker-card-critical_v1');
    const heartsCard = page.getByTestId('game-picker-card-hearts_v1');
    const spadesCard = page.getByTestId('game-picker-card-spades_v1');
    const goCard = page.getByTestId('game-picker-card-go_v1');
    const pachisiCard = page.getByTestId('game-picker-card-pachisi_v1');

    await expect(chessCard).toBeVisible();
    await expect(criticalCard).toBeVisible();
    await expect(heartsCard).toBeVisible();
    await expect(spadesCard).toBeVisible();
    await expect(goCard).toBeVisible();
    await expect(pachisiCard).toBeVisible();

    const cardChip = page.getByTestId('game-picker-category-card');
    await cardChip.click();
    await expect(heartsCard).toBeVisible();
    await expect(spadesCard).toBeVisible();
    await expect(chessCard).not.toBeVisible();
    await expect(goCard).not.toBeVisible();

    const boardChip = page.getByTestId('game-picker-category-board');
    await boardChip.click();
    await expect(chessCard).toBeVisible();
    await expect(goCard).toBeVisible();
    await expect(pachisiCard).toBeVisible();
    await expect(criticalCard).not.toBeVisible();
    await expect(heartsCard).not.toBeVisible();

    const searchInput = page.getByTestId('game-picker-search');
    await searchInput.fill('Hearts');
    const allChip = page.getByTestId('game-picker-category-all');
    await allChip.click();
    await expect(heartsCard).toBeVisible();
    await expect(chessCard).not.toBeVisible();

    const closeButton = page.getByTestId('modal-close-button');
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
});
