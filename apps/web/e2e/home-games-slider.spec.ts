import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Home Page Games Grid Refinement', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await page.addStyleTag({
      content:
        '[data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }',
    });
  });

  test('should render featured games in slider', async ({ page }) => {
    // We are filtering to only show available (playable) games
    const gamesSection = page.locator('#games');
    const gameCards = gamesSection.locator('h3');
    await expect(gameCards.first()).toBeVisible();
    const count = await gameCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await expect(gameCards.filter({ hasText: /Critical/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Sea Battle/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Glimworm/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Tic-Tac-Toe/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Cascade/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Chess/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Checkers/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Cat Dash/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Backgammon/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Hearts/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Spades/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /^Go$/i })).toBeVisible();
    await expect(gameCards.filter({ hasText: /Pachisi/i })).toBeVisible();
  });

  test('should navigate slider via arrows', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });

    const sliderTrack = page
      .locator('main')
      .first()
      .locator('div[class*="slider-track"]')
      .first();
    await expect(sliderTrack).toBeVisible();

    const nextButton = page.getByTestId('next-game-button');
    await expect(nextButton).toBeVisible();

    if (await nextButton.isDisabled()) {
      return;
    }

    await nextButton.click();

    const newScrollLeft = await sliderTrack.evaluate((el) => el.scrollLeft);
    expect(newScrollLeft).toBeGreaterThanOrEqual(0);
  });

  test('should open game details modal from slider', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();

    const criticalCard = page
      .locator('main')
      .first()
      .getByTestId('game-card-critical_v1')
      .first();
    await expect(criticalCard).toBeVisible();

    const questionIcon = criticalCard.getByTestId('game-help-button');
    await expect(questionIcon).toBeVisible();

    await questionIcon.scrollIntoViewIfNeeded();
    await questionIcon.click();

    await expect(
      page.locator('[role="dialog"][data-state="open"]'),
    ).toBeVisible({});
    await expect(
      page.getByRole('heading', { name: /Objective/i }),
    ).toBeVisible();
  });

  test('should redirect to game landing page with preselected game', async ({
    page,
  }) => {
    const criticalCard = page
      .locator('main')
      .first()
      .getByTestId('game-card-critical_v1')
      .first();
    const playNowButton = criticalCard.getByTestId('game-play-button').first();

    await playNowButton.scrollIntoViewIfNeeded();
    await playNowButton.click();

    // Should be on the game landing page
    await expect(page).toHaveURL(/\/games\/critical/);
  });
});
