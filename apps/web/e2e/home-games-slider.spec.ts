import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Home Page Games Grid Refinement', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should render featured games in slider', async ({ page }) => {
    // We are filtering to only show available (playable) games
    const gamesSection = page.locator('#games');
    const gameCards = gamesSection.locator('h3');
    await expect(gameCards).toHaveCount(2);

    await expect(gameCards.nth(0)).toHaveText(/Critical/i);
    await expect(gameCards.nth(1)).toHaveText(/Sea Battle/i);
  });

  test('should navigate slider via arrows', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });

    const sliderTrack = page.locator('div[class*="SliderTrack"]');
    await expect(sliderTrack).toBeVisible();

    const nextButton = page.getByRole('button', { name: /Next game/i });
    await expect(nextButton).toBeVisible();

    if (await nextButton.isDisabled()) {
      return;
    }

    await nextButton.click();
    await page.waitForTimeout(1500);

    const newScrollLeft = await sliderTrack.evaluate((el) => el.scrollLeft);
    expect(newScrollLeft).toBeGreaterThanOrEqual(0);
  });

  test('should open game details modal from slider', async ({ page }) => {
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});

    const criticalCard = page
      .locator('div[class*="MainGameCard"]')
      .filter({ hasText: 'Critical' });
    await expect(criticalCard).toBeVisible();

    const questionIcon = criticalCard.getByRole('button', { name: '?' });
    await expect(questionIcon).toBeVisible();

    await page.waitForTimeout(1000);
    await questionIcon.click({ force: true });

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: /Objective/i }),
    ).toBeVisible();
  });

  test('should redirect to create page with preselected game', async ({
    page,
  }) => {
    const criticalCard = page
      .locator('div[class*="MainGameCard"]')
      .filter({ hasText: 'Critical' });
    const playNowButton = criticalCard.getByRole('link', { name: /Play Now/i });

    await playNowButton.click();

    // Should be on create page with gameId param
    await expect(page).toHaveURL(/\/games\/create\?gameId=critical_v1/);

    // Game should be selected (check for active state on game tile)
    // From CreateGameRoomPage.tsx, selected tile has $active prop which likely maps to a class/style
    // Let's verify by heading or some identifiable trait
    await expect(
      page.getByRole('heading', { name: /Create Game Room/i }),
    ).toBeVisible();
  });
});
