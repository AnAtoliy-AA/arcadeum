import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Solo Puzzle Games Milestone Popups', () => {
  test('Sudoku displays milestone popup at 50% solved and dismisses cleanly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sudoku/play');

    const grid = page.getByRole('grid', { name: 'Sudoku' });
    await expect(grid).toBeVisible();

    await page.evaluate(() => {
      const stored = localStorage.getItem('arcadeum_sudoku_game_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state = {
          ...parsed.state,
          activeMilestone: 50,
          reachedMilestones: [50],
        };
        localStorage.setItem('arcadeum_sudoku_game_v1', JSON.stringify(parsed));
      }
    });

    await page.reload({ waitUntil: 'load' });
    await expect(grid).toBeVisible();

    const toast = page.getByTestId('sudoku-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('sudoku-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    await expect(toast).not.toBeVisible();
  });

  test('Solitaire displays milestone popup at 26 cards foundation and dismisses cleanly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/solitaire/play');

    const board = page.getByTestId('solitaire-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const stored = localStorage.getItem('arcadeum_solitaire_game_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state = {
          ...parsed.state,
          activeMilestone: 26,
          reachedMilestones: [26],
        };
        localStorage.setItem(
          'arcadeum_solitaire_game_v1',
          JSON.stringify(parsed),
        );
      }
    });

    await page.reload({ waitUntil: 'load' });
    await expect(board).toBeVisible();

    const toast = page.getByTestId('solitaire-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('solitaire-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    await expect(toast).not.toBeVisible();
  });

  test('Minesweeper displays milestone popup at 50% safe cleared and dismisses cleanly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/minesweeper/play');

    const board = page.getByRole('grid', { name: 'Minefield' });
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const stored = localStorage.getItem('arcadeum_minesweeper_game_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state = {
          ...parsed.state,
          activeMilestone: 50,
          reachedMilestones: [50],
        };
        localStorage.setItem(
          'arcadeum_minesweeper_game_v1',
          JSON.stringify(parsed),
        );
      }
    });

    await page.reload({ waitUntil: 'load' });
    await expect(board).toBeVisible();

    const toast = page.getByTestId('minesweeper-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('minesweeper-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    await expect(toast).not.toBeVisible();
  });
});
