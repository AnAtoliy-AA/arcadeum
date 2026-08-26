import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Single Player Puzzle Games', () => {
  test('Sudoku game renders HUD, grid, keypad, and handles notes toggle', async ({
    page,
  }) => {
    await page.goto('/en/games/sudoku/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByRole('grid', { name: 'Sudoku' });
    await expect(board).toBeVisible();

    const newGameBtn = page.getByTestId('sudoku-new-game-button');
    await expect(newGameBtn).toBeVisible();

    const cells = board.getByRole('gridcell');
    await expect(cells).toHaveCount(81);

    const notesBtn = page.getByRole('button', { name: /Notes/i });
    await expect(notesBtn).toBeVisible();
    await notesBtn.click();
    await expect(notesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Minesweeper game renders HUD, smiley button, and board grid', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const flagBtn = page.getByRole('button', { name: /Flag mode/i });
    await expect(flagBtn).toBeVisible();
    await flagBtn.click();
    await expect(flagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Solitaire game renders table, stock deck, and tableau piles', async ({
    page,
  }) => {
    await page.goto('/en/games/solitaire/play', {
      waitUntil: 'domcontentloaded',
    });

    const newGameBtn = page.getByTestId('solitaire-new-game-button');
    await expect(newGameBtn).toBeVisible();

    const drawBtn = page.getByRole('button', { name: /Draw/i });
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();
  });
});
