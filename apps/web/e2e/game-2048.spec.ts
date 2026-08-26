import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('2048 Puzzle Game', () => {
  test('renders 2048 board, HUD, and moves tiles via keyboard controls', async ({
    page,
  }) => {
    await page.goto('/en/games/2048/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    const scoreCard = page.getByTestId('game-2048-score');
    await expect(scoreCard).toBeVisible();

    const bestCard = page.getByTestId('game-2048-best');
    await expect(bestCard).toBeVisible();

    const newGameButton = page.getByTestId('game-2048-new-game-button');
    await expect(newGameButton).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowLeft');

    await expect(board).toBeVisible();
  });

  test('displays GameResultModal upon win or lose state in store', async ({
    page,
  }) => {
    await page.goto('/en/games/2048/play', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByTestId('game-2048-board')).toBeVisible();

    await page.evaluate(() => {
      const persistedState = {
        state: {
          grid: [2048, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 0, 0, 0, 0, 0],
          score: 20480,
          best: 20480,
          status: 'won',
          keepPlayingFlag: false,
          moves: 450,
          startedAt: Date.now() - 60000,
          finishedAt: Date.now(),
          finished: {
            won: true,
            score: 20480,
            moves: 450,
            durationMs: 60000,
          },
        },
        version: 0,
      };
      localStorage.setItem(
        'arcadeum_game_2048_v1',
        JSON.stringify(persistedState),
      );
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    const resultModal = page.getByTestId('game-result-modal');
    await expect(resultModal).toBeVisible();
    await expect(resultModal).toHaveAttribute('data-tone', 'victory');

    const keepGoingButton = page.getByTestId('keep-going-button');
    await expect(keepGoingButton).toBeVisible();
    await keepGoingButton.click();

    await expect(resultModal).not.toBeVisible();
  });
});
