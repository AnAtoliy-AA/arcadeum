import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('2048 Puzzle Game', () => {
  test('renders 2048 board, HUD, and moves tiles via keyboard controls', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

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

  test('displays GameResultModal upon win with finish and continue buttons, and continues playing', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const persistedState = {
        state: {
          grid: [1024, 1024, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          score: 1024,
          best: 1024,
          status: 'playing',
          keepPlayingFlag: false,
          moves: 50,
          startedAt: Date.now() - 30000,
          finishedAt: null,
          finished: null,
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

    const resultModal = page.getByTestId('game-result-modal');
    await expect(resultModal).toBeVisible();
    await expect(resultModal).toHaveAttribute('data-tone', 'victory');

    const finishButton = page.getByTestId('finish-button');
    await expect(finishButton).toBeVisible();

    const continueButton = page.getByTestId('continue-button');
    await expect(continueButton).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(resultModal).toBeVisible();

    await continueButton.click();
    await expect(resultModal).not.toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(resultModal).not.toBeVisible();
  });

  test('clicking finish button on win screen starts a new game', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

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

    await page.reload({ waitUntil: 'load' });

    const resultModal = page.getByTestId('game-result-modal');
    await expect(resultModal).toBeVisible();

    const finishButton = page.getByTestId('finish-button');
    await expect(finishButton).toBeVisible();
    await finishButton.click();

    await expect(resultModal).not.toBeVisible();
    await expect(page.getByTestId('game-2048-score')).toContainText('0');
  });

  test('slides tiles via touch swipe on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateTo(page, '/en/games/2048/play');

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const persistedState = {
        state: {
          grid: [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          score: 0,
          best: 0,
          status: 'playing',
          keepPlayingFlag: false,
          moves: 0,
          startedAt: Date.now() - 30000,
          finishedAt: null,
          finished: null,
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

    await page.evaluate(() => {
      const board = document.querySelector('[data-testid="game-2048-board"]');
      if (!board) return;

      const createTouchPoint = (x: number, y: number) => {
        if (typeof Touch !== 'undefined') {
          try {
            return new Touch({
              identifier: 1,
              target: board,
              clientX: x,
              clientY: y,
            });
          } catch {
            return {
              identifier: 1,
              target: board,
              clientX: x,
              clientY: y,
            };
          }
        }
        return {
          identifier: 1,
          target: board,
          clientX: x,
          clientY: y,
        };
      };

      const dispatchTouch = (type: string, touch: unknown) => {
        if (typeof TouchEvent !== 'undefined') {
          try {
            const event = new TouchEvent(type, {
              touches: [touch as Touch],
              bubbles: true,
              cancelable: true,
            });
            board.dispatchEvent(event);
            return;
          } catch {
            const event = new CustomEvent(type, {
              bubbles: true,
              cancelable: true,
            });
            Object.defineProperty(event, 'touches', { value: [touch] });
            board.dispatchEvent(event);
            return;
          }
        }
        const event = new CustomEvent(type, {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(event, 'touches', { value: [touch] });
        board.dispatchEvent(event);
      };

      const t1 = createTouchPoint(200, 200);
      dispatchTouch('touchstart', t1);
      const t2 = createTouchPoint(100, 200);
      dispatchTouch('touchmove', t2);
    });

    await expect(page.getByTestId('game-2048-score')).toContainText('4');
  });
});
