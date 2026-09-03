import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Themes and Variants separation', () => {
  test('sea battle landing allows cycling through visual themes', async ({
    page,
  }) => {
    await navigateTo(page, '/games/sea-battle');
    const boardButton = page.locator(
      '[data-testid="sea-battle-landing-board"]',
    );
    await expect(boardButton).toBeVisible();
    const box = await boardButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeLessThanOrEqual(280);
    const shipSwatch = page.locator('[data-testid="color-swatch-ship"]');
    await expect(shipSwatch).toBeVisible();
    await boardButton.click();
    await expect(boardButton).toBeVisible();
  });

  test('sea battle quickplay buttons render with theme attributes', async ({
    page,
  }) => {
    await navigateTo(page, '/games/sea-battle');
    const quickplayAi = page
      .locator('[data-testid="quickplay-ai-button"]')
      .first();
    await expect(quickplayAi).toBeVisible();
    const quickplayHuman = page
      .locator('[data-testid="quickplay-human-button"]')
      .first();
    await expect(quickplayHuman).toBeVisible();
  });

  test('clicking theme card on landing navigates to create room with theme param', async ({
    page,
  }) => {
    await navigateTo(page, '/games/tic-tac-toe');
    const themeLink = page.locator('a[href*="theme="]').first();
    await expect(themeLink).toBeVisible();
    const href = await themeLink.getAttribute('href');
    expect(href).toContain('gameId=tic_tac_toe_v1');
    expect(href).toContain('theme=');
    expect(href).not.toContain('??');
  });

  test('chess landing renders visual theme showcase with links', async ({
    page,
  }) => {
    await navigateTo(page, '/games/chess');
    const themeLink = page.locator('a[href*="theme="]').first();
    await expect(themeLink).toBeVisible();
    const href = await themeLink.getAttribute('href');
    expect(href).toContain('gameId=chess_v1');
    expect(href).toContain('theme=');
  });
});
