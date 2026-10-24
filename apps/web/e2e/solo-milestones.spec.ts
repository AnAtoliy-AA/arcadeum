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
      const solution = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3,
        4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1,
        2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5,
        9, 1, 2, 3, 4, 5, 6, 7, 8,
      ];
      const givens = solution.map((val, i) => (i < 40 ? val : 0));
      const cells = solution.map((val, i) => (i < 60 ? val : 0));

      const persistedState = {
        state: {
          game: {
            difficulty: 'easy',
            solution,
            givens,
            cells,
            notes: Array.from({ length: 81 }, () => []),
            status: 'playing',
            mistakes: 0,
          },
          startedAt: Date.now() - 30000,
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
          reachedMilestones: [],
          activeMilestone: null,
        },
        version: 0,
      };

      localStorage.setItem(
        'arcadeum_sudoku_game_v1',
        JSON.stringify(persistedState),
      );
    });

    await page.reload({ waitUntil: 'load' });
    await expect(grid).toBeVisible();

    const hintButton = page.getByTestId('sudoku-hint-button');
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    const applyHintButton = page.getByTestId('sudoku-apply-hint-button');
    await expect(applyHintButton).toBeVisible();
    await applyHintButton.click();

    const toast = page.getByTestId('sudoku-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('sudoku-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click({ force: true });

    await expect(toast).not.toBeVisible();
  });

  test('Solitaire displays milestone popup at 26 cards foundation and dismisses cleanly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/solitaire/play');

    const board = page.getByTestId('solitaire-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const f0 = Array.from({ length: 13 }, (_, i) => ({
        id: `spades-${i + 1}`,
        suit: 'spades' as const,
        rank: i + 1,
        faceUp: true,
      }));
      const f1 = Array.from({ length: 12 }, (_, i) => ({
        id: `hearts-${i + 1}`,
        suit: 'hearts' as const,
        rank: i + 1,
        faceUp: true,
      }));
      const stock = [
        ...Array.from({ length: 13 }, (_, i) => ({
          id: `diamonds-${i + 1}`,
          suit: 'diamonds' as const,
          rank: i + 1,
          faceUp: false,
        })),
        ...Array.from({ length: 13 }, (_, i) => ({
          id: `clubs-${i + 1}`,
          suit: 'clubs' as const,
          rank: i + 1,
          faceUp: false,
        })),
      ];

      const persistedState = {
        state: {
          game: {
            stock,
            waste: [],
            foundations: [f0, f1, [], []],
            tableau: [
              [
                {
                  id: 'hearts-13',
                  suit: 'hearts' as const,
                  rank: 13,
                  faceUp: true,
                },
              ],
              [],
              [],
              [],
              [],
              [],
              [],
            ],
            moves: 30,
            score: 300,
            drawMode: 'draw1',
          },
          startedAt: Date.now() - 30000,
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
          reachedMilestones: [],
          activeMilestone: null,
        },
        version: 0,
      };

      localStorage.setItem(
        'arcadeum_solitaire_game_v1',
        JSON.stringify(persistedState),
      );
    });

    await page.reload({ waitUntil: 'load' });
    await expect(board).toBeVisible();

    const hintButton = page.getByTestId('solitaire-hint-button');
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    const applyHintButton = page.getByTestId('solitaire-apply-hint-button');
    await expect(applyHintButton).toBeVisible();
    await applyHintButton.click();

    const toast = page.getByTestId('solitaire-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('solitaire-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click({ force: true });

    await expect(toast).not.toBeVisible();
  });

  test('Minesweeper displays milestone popup at 50% safe cleared and dismisses cleanly', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/minesweeper/play');

    const board = page.getByRole('grid', { name: 'Minefield' });
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const cells = [];
      for (let i = 0; i < 35; i += 1) {
        cells.push({ mine: false, adjacent: 1, state: 'revealed' as const });
      }
      cells.push({ mine: false, adjacent: 1, state: 'hidden' as const });
      for (let i = 36; i < 71; i += 1) {
        cells.push({ mine: false, adjacent: 1, state: 'hidden' as const });
      }
      for (let i = 71; i < 81; i += 1) {
        cells.push({ mine: true, adjacent: 0, state: 'hidden' as const });
      }

      const persistedState = {
        state: {
          game: {
            difficulty: 'beginner',
            width: 9,
            height: 9,
            mineCount: 10,
            cells,
            generated: true,
            status: 'playing',
            revealedCount: 35,
            flagCount: 0,
          },
          startedAt: Date.now() - 20000,
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          flaglessMode: false,
          personalBests: { beginner: null, intermediate: null, expert: null },
          personalBestsNf: { beginner: null, intermediate: null, expert: null },
          reachedMilestones: [],
          activeMilestone: null,
        },
        version: 0,
      };

      localStorage.setItem(
        'arcadeum_minesweeper_game_v1',
        JSON.stringify(persistedState),
      );
    });

    await page.reload({ waitUntil: 'load' });
    await expect(board).toBeVisible();

    const cells = board.getByRole('gridcell');
    await cells.nth(35).click();

    const toast = page.getByTestId('minesweeper-milestone-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Halfway');

    const dismissBtn = page.getByTestId('minesweeper-milestone-dismiss');
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click({ force: true });

    await expect(toast).not.toBeVisible();
  });
});
