import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Solo Games Intelligent Assistants & QoL', () => {
  test('Sudoku auto-notes, intelligent hints, and error toggle operate seamlessly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sudoku/play');

    const board = page.getByRole('grid', { name: 'Sudoku' });
    await expect(board).toBeVisible();

    const autoNotesButton = page.getByTestId('sudoku-auto-notes-button');
    await expect(autoNotesButton).toBeVisible();
    await autoNotesButton.click();

    const hintButton = page.getByTestId('sudoku-hint-button');
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    const hintCallout = page.getByTestId('sudoku-hint-callout');
    await expect(hintCallout).toBeVisible();

    const applyHintButton = page.getByTestId('sudoku-apply-hint-button');
    await expect(applyHintButton).toBeVisible();
    await applyHintButton.click();

    await expect(hintCallout).not.toBeVisible();

    const toggleErrorsButton = page.getByTestId('sudoku-toggle-errors-button');
    await expect(toggleErrorsButton).toBeVisible();
    await expect(toggleErrorsButton).toHaveAttribute('aria-pressed', 'true');
    await toggleErrorsButton.click();
    await expect(toggleErrorsButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('Minesweeper safe cells counter, face reset, and R key restart operate correctly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/minesweeper/play');

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const safeCounter = page.getByTestId('minesweeper-safe-left');
    await expect(safeCounter).toBeVisible();
    await expect(safeCounter).toContainText('71');

    const cells = board.getByRole('gridcell');
    await cells.first().click();

    const faceButton = page.getByTestId('minesweeper-face-button');
    await expect(faceButton).toBeVisible();

    await page.keyboard.press('r');
    await expect(safeCounter).toContainText('71');
  });

  test('2048 milestone celebration toast triggers on reaching target tile and dismisses', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const persistedState = {
        state: {
          grid: [512, 512, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          score: 512,
          best: 512,
          status: 'playing',
          keepPlayingFlag: false,
          moves: 20,
          startedAt: Date.now() - 10000,
          finishedAt: null,
          finished: null,
          reachedMilestones: [],
          activeMilestone: null,
        },
        version: 0,
      };
      localStorage.setItem(
        'arcadeum_game_2048_v1',
        JSON.stringify(persistedState),
      );
    });

    await page.reload({ waitUntil: 'load' });
    await expect(board).toBeVisible();

    await page.keyboard.press('ArrowLeft');

    const toast = page.getByTestId('game-2048-milestone-toast');
    await expect(toast).toBeVisible();

    const dismissButton = page.getByTestId('game-2048-milestone-dismiss');
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();

    await expect(toast).not.toBeVisible();
  });

  test('Solitaire draw mode toggle and smart hint engine operate correctly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/solitaire/play');

    const board = page.getByTestId('solitaire-board');
    await expect(board).toBeVisible();

    const drawModeBtn = page.getByTestId('solitaire-draw-mode-button');
    await expect(drawModeBtn).toBeVisible();
    await drawModeBtn.click();
    await expect(drawModeBtn).toContainText('3');

    const hintBtn = page.getByTestId('solitaire-hint-button');
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();

    const hintCallout = page.getByTestId('solitaire-hint-callout');
    await expect(hintCallout).toBeVisible();
  });

  test('Sudoku digit-first mode toggle operates seamlessly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sudoku/play');

    const board = page.getByRole('grid', { name: 'Sudoku' });
    await expect(board).toBeVisible();

    const modeBtn = page.getByTestId('sudoku-input-mode-button');
    await expect(modeBtn).toBeVisible();
    await modeBtn.click();

    const digitPad1 = page.getByTestId('sudoku-digit-1');
    await expect(digitPad1).toBeVisible();
    await digitPad1.click();
  });

  test('Minesweeper flagless NF mode toggles correctly', async ({ page }) => {
    await navigateTo(page, '/en/games/minesweeper/play');

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const nfBtn = page.getByTestId('minesweeper-flagless-button');
    await expect(nfBtn).toBeVisible();
    await expect(nfBtn).toHaveAttribute('aria-pressed', 'false');

    await nfBtn.click();
    await expect(nfBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
