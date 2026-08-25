import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Games Catalog Real Previews', () => {
  test('renders unique preview artwork for solitaire, minesweeper, sudoku, and 2048', async ({
    page,
  }) => {
    const response = await page.goto(routes.games, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);

    const solitaireCard = page.locator(
      '[data-testid="games-catalog-card-solitaire_v1"]',
    );
    await expect(solitaireCard).toBeVisible();
    await expect(solitaireCard).toContainText('KLONDIKE');

    const minesweeperCard = page.locator(
      '[data-testid="games-catalog-card-minesweeper_v1"]',
    );
    await expect(minesweeperCard).toBeVisible();
    await expect(minesweeperCard).toContainText('SWEEPER');

    const sudokuCard = page.locator(
      '[data-testid="games-catalog-card-sudoku_v1"]',
    );
    await expect(sudokuCard).toBeVisible();
    await expect(sudokuCard).toContainText('SUDOKU');

    const game2048Card = page.locator(
      '[data-testid="games-catalog-card-game_2048_v1"]',
    );
    await expect(game2048Card).toBeVisible();
    await expect(game2048Card).toContainText('2048 TILE');
  });
});
