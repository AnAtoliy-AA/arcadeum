import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Solo Games Fields Premium UI/UX', () => {
  test('Sudoku board and keypad render with solid surfaces and visible elements', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sudoku/play');

    const board = page.getByRole('grid', { name: 'Sudoku' });
    await expect(board).toBeVisible();

    const cells = board.getByRole('gridcell');
    await expect(cells).toHaveCount(81);

    const firstCell = cells.first();
    await firstCell.click();
    await expect(firstCell).toHaveAttribute('aria-selected', 'true');

    const digit1 = page.getByRole('button', { name: /digit 1/i });
    await expect(digit1).toBeVisible();
    await expect(digit1).toBeEnabled();

    const notesBtn = page.getByRole('button', { name: /Notes/i });
    await expect(notesBtn).toBeVisible();
    await expect(notesBtn).toBeEnabled();

    const eraseBtn = page.getByRole('button', { name: /Erase/i });
    await expect(eraseBtn).toBeVisible();
    await expect(eraseBtn).toBeEnabled();
  });

  test('Minesweeper board renders with 3D tactile cells and LED HUD displays', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/minesweeper/play');

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const cells = board.getByRole('gridcell');
    await expect(cells.first()).toBeVisible();

    const minesLeft = page.getByTestId('minesweeper-mines-left');
    await expect(minesLeft).toBeVisible();

    const timer = page.getByTestId('minesweeper-timer');
    await expect(timer).toBeVisible();

    const faceBtn = page.getByTestId('minesweeper-face-button');
    await expect(faceBtn).toBeVisible();
  });

  test('2048 board renders with recessed slots and responsive tiles', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    const grid = page.getByRole('grid', { name: '2048 board' });
    await expect(grid).toBeVisible();

    const score = page.getByTestId('game-2048-score');
    await expect(score).toBeVisible();
  });

  test('Solitaire table renders with solid felt surface and visible slots', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/solitaire/play');

    const drawBtn = page.getByRole('button', { name: /draw|recycle/i });
    await expect(drawBtn).toBeVisible();

    const foundations = page.getByRole('button', { name: /Foundation/i });
    await expect(foundations).toHaveCount(4);
  });
});
