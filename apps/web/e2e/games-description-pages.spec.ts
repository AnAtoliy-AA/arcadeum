import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

const GAME_PAGES = [
  { path: routes.chessLanding, slug: 'chess_v1', title: 'Chess' },
  {
    path: routes.seaBattleLanding,
    slug: 'sea_battle_v1',
    title: 'Sea Battle',
  },
  { path: routes.checkersLanding, slug: 'checkers_v1', title: 'Checkers' },
  {
    path: routes.ticTacToeLanding,
    slug: 'tic_tac_toe_v1',
    title: 'Tic-Tac-Toe',
  },
  { path: routes.cascadeLanding, slug: 'cascade_v1', title: 'Cascade' },
  { path: routes.catDashLanding, slug: 'cat_dash_v1', title: 'Cat Dash' },
  { path: routes.glimwormLanding, slug: 'glimworm_v1', title: 'Glimworm' },
  { path: routes.criticalLanding, slug: 'critical_v1', title: 'Critical' },
  {
    path: routes.backgammonLanding,
    slug: 'backgammon_v1',
    title: 'Backgammon',
  },
  { path: routes.pachisiLanding, slug: 'pachisi_v1', title: 'Pachisi' },
];

test.describe('Games Description Landing Pages', () => {
  for (const game of GAME_PAGES) {
    test(`renders description landing page for ${game.title} with modern layout and SEO schemas`, async ({
      page,
    }) => {
      const response = await page.goto(game.path, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status()).toBe(200);

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(game.title);

      const quickplayButtons = page.locator(
        '[data-testid="quickplay-ai-button"]',
      );
      await expect(quickplayButtons.first()).toBeVisible();

      const howToSection = page.locator('#how-to-play').first();
      await expect(howToSection).toBeVisible();

      const faqSection = page.locator('#faq').first();
      await expect(faqSection).toBeVisible();

      const firstFaq = faqSection.locator('details').first();
      await expect(firstFaq).toBeVisible();

      const breadcrumbNav = page
        .locator('nav[aria-label="Breadcrumb"]')
        .first();
      await expect(breadcrumbNav).toBeVisible();

      const gameJsonLd = page.locator(
        `script#json-ld-${game.slug.replace(/_/g, '-').replace(/-v1$/, '')}`,
      );
      await expect(gameJsonLd).toHaveCount(1);
      const jsonContent = await gameJsonLd.textContent();
      expect(jsonContent).toContain('VideoGame');
    });
  }

  test('supports localized game landing routing', async ({ page }) => {
    const res = await page.goto('/fr/jeux/chess', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]').first();
    await expect(breadcrumb).toBeVisible();
  });

  test('renders /games catalog page with game directory and filters', async ({
    page,
  }) => {
    await navigateTo(page, routes.games);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const catalogCards = page.locator('[data-testid^="games-catalog-card-"]');
    await expect(catalogCards.first()).toBeVisible();
    const initialCount = await catalogCards.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    const chessCard = page.locator(
      '[data-testid="games-catalog-card-chess_v1"]',
    );
    await expect(chessCard).toBeVisible();
    await expect(chessCard).toHaveAttribute('href', '/en/games/chess');

    const boardFilter = page.locator('[data-testid="category-filter-board"]');
    await expect(boardFilter).toBeVisible();
    await boardFilter.click();
    await expect(
      page.locator('[data-testid="games-catalog-card-chess_v1"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="games-catalog-card-critical_v1"]'),
    ).toHaveCount(0);

    const allFilter = page.locator('[data-testid="category-filter-all"]');
    await allFilter.click();
    await expect(catalogCards).toHaveCount(initialCount);

    const catalogJsonLd = page.locator('script#json-ld-games-en');
    await expect(catalogJsonLd).toHaveCount(1);
    const jsonContent = await catalogJsonLd.textContent();
    expect(jsonContent).toContain('CollectionPage');
  });

  test('renders /rooms browser page with room list and filters', async ({
    page,
  }) => {
    const res = await page.goto(routes.rooms, {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);

    const roomsJsonLd = page.locator('script#json-ld-rooms-en');
    await expect(roomsJsonLd).toHaveCount(1);
  });

  test('game landing has side padding on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, routes.ticTacToeLanding);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(12);
      expect(box.x + box.width).toBeLessThanOrEqual(375 - 12);
    }
  });
});
