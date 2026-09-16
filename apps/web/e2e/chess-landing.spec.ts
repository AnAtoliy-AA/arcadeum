import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Chess Landing Rework & Hierarchy', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders clear hero action hierarchy with quick navigation', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess');

    const hero = page.locator('#play');
    await expect(hero).toBeVisible();

    const heading = hero.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Chess');

    const findOpponentBtn = hero.locator(
      '[data-testid="quickplay-human-button"]',
    );
    await expect(findOpponentBtn).toBeVisible();

    const quickPlayAiBtn = hero.locator('[data-testid="quickplay-ai-button"]');
    await expect(quickPlayAiBtn).toBeVisible();

    const browseRoomsBtn = hero.getByRole('button', { name: /browse/i });
    await expect(browseRoomsBtn).toBeVisible();

    const exploreBar = hero.getByText('Explore:');
    await expect(exploreBar).toBeVisible();

    const puzzlesNav = hero.getByRole('link', { name: /chess puzzles/i });
    await expect(puzzlesNav).toBeVisible();
  });

  test('displays chess puzzles & tactics hub prominently below hero', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess');

    const puzzlesHub = page.locator('#puzzles');
    await expect(puzzlesHub).toBeVisible();

    await expect(
      puzzlesHub.getByRole('heading', {
        level: 2,
        name: /chess puzzles & tactics/i,
      }),
    ).toBeVisible();

    await expect(
      puzzlesHub.getByRole('link', { name: /daily puzzle/i }).first(),
    ).toBeVisible();
    await expect(
      puzzlesHub.getByRole('link', { name: /rated puzzles/i }).first(),
    ).toBeVisible();
    await expect(
      puzzlesHub.getByRole('link', { name: /puzzle rush/i }).first(),
    ).toBeVisible();
    await expect(
      puzzlesHub.getByRole('link', { name: /coordinates/i }),
    ).toBeVisible();

    await expect(page.getByTestId('chess-puzzle-teaser')).toBeVisible();
  });

  test('theme showcase allows clean theme selection without individual card button clutter', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess');

    const themesSection = page.locator('#themes');
    await expect(themesSection).toBeVisible();

    const cyberpunkCard = page.getByTestId('theme-card-cyberpunk');
    await expect(cyberpunkCard).toBeVisible();

    await cyberpunkCard.click();
    await expect(cyberpunkCard.getByText('Previewing')).toBeVisible();
  });
});
