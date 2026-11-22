import { test, expect } from '@playwright/test';

test.describe('Blog Interactive Strategy Guide Practice Drills', () => {
  test('solves tic-tac-toe fork drill with incorrect and correct move flows', async ({
    page,
  }) => {
    await page.goto('/en/blog/how-to-win-tic-tac-toe', {
      waitUntil: 'domcontentloaded',
    });

    const forkDrill = page.locator('#fork-challenge-1');
    await expect(forkDrill).toBeVisible();
    await forkDrill.scrollIntoViewIfNeeded();

    const cell1 = forkDrill.getByTestId('puzzle-cell-1');
    const incorrectFeedback = forkDrill.getByTestId(
      'puzzle-feedback-incorrect',
    );

    await expect
      .poll(async () => {
        await cell1.click();
        return incorrectFeedback.isVisible();
      })
      .toBe(true);

    await expect(incorrectFeedback).toBeVisible();
    await expect(
      forkDrill.getByText('Not quite! That leaves an opening.'),
    ).toBeVisible();

    await forkDrill.getByRole('button', { name: 'Try Again' }).click();
    await expect(incorrectFeedback).not.toBeVisible();

    const cell2 = forkDrill.getByTestId('puzzle-cell-2');
    const correctFeedback = forkDrill.getByTestId('puzzle-feedback-correct');

    await expect
      .poll(async () => {
        await cell2.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(forkDrill.getByText('Correct Move!')).toBeVisible();
    await expect(
      forkDrill.getByRole('button', { name: 'Play Full Game Now' }),
    ).toBeVisible();
  });

  test('solves chess royal knight fork tactical drill', async ({ page }) => {
    await page.goto('/en/blog/how-to-play-chess', {
      waitUntil: 'domcontentloaded',
    });

    const chessDrill = page.locator('#drill-knight-fork');
    await expect(chessDrill).toBeVisible();
    await chessDrill.scrollIntoViewIfNeeded();

    const wrongSquare = chessDrill.getByTestId('puzzle-cell-0');
    const incorrectFeedback = chessDrill.getByTestId(
      'puzzle-feedback-incorrect',
    );

    await expect
      .poll(async () => {
        await wrongSquare.click();
        return incorrectFeedback.isVisible();
      })
      .toBe(true);

    await expect(incorrectFeedback).toBeVisible();

    await chessDrill.getByRole('button', { name: 'Try Again' }).click();
    await expect(incorrectFeedback).not.toBeVisible();

    const forkSquare = chessDrill.getByTestId('puzzle-cell-10');
    const correctFeedback = chessDrill.getByTestId('puzzle-feedback-correct');

    await expect
      .poll(async () => {
        await forkSquare.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(chessDrill.getByText('Correct Move!')).toBeVisible();
    await expect(
      chessDrill.getByText('Nc7+ forks king, queen, and rook!'),
    ).toBeVisible();
  });

  test('solves sea battle battleship hunt strike drill', async ({ page }) => {
    await page.goto('/en/blog/sea-battle-best-strategies-and-placements', {
      waitUntil: 'domcontentloaded',
    });

    const seaBattleDrill = page.locator('#drill-sea-battle-hunt');
    await expect(seaBattleDrill).toBeVisible();
    await seaBattleDrill.scrollIntoViewIfNeeded();

    const strikeCell = seaBattleDrill.getByTestId('puzzle-cell-33');
    const correctFeedback = seaBattleDrill.getByTestId(
      'puzzle-feedback-correct',
    );

    await expect
      .poll(async () => {
        await strikeCell.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(seaBattleDrill.getByText('Direct hit on D4!')).toBeVisible();
  });

  test('solves minesweeper 1-2-1 safe reveal pattern drill', async ({
    page,
  }) => {
    await page.goto('/en/blog/how-to-play-minesweeper', {
      waitUntil: 'domcontentloaded',
    });

    const minesweeperDrill = page.locator('#drill-minesweeper-121');
    await expect(minesweeperDrill).toBeVisible();
    await minesweeperDrill.scrollIntoViewIfNeeded();

    const safeCell = minesweeperDrill.getByTestId('puzzle-cell-4');
    const correctFeedback = minesweeperDrill.getByTestId(
      'puzzle-feedback-correct',
    );

    await expect
      .poll(async () => {
        await safeCell.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(
      minesweeperDrill.getByText('Square E1 is 100% safe!'),
    ).toBeVisible();
  });

  test('solves checkers mandatory jump tactical drill', async ({ page }) => {
    await page.goto('/en/blog/how-to-play-checkers', {
      waitUntil: 'domcontentloaded',
    });

    const checkersDrill = page.locator('#drill-checkers-jump');
    await expect(checkersDrill).toBeVisible();
    await checkersDrill.scrollIntoViewIfNeeded();

    const jumpLanding = checkersDrill.getByTestId('puzzle-cell-28');
    const correctFeedback = checkersDrill.getByTestId(
      'puzzle-feedback-correct',
    );

    await expect
      .poll(async () => {
        await jumpLanding.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(
      checkersDrill.getByText('Landing on e5 leaps over d4'),
    ).toBeVisible();
  });

  test('renders localized practice drill in Russian locale', async ({
    page,
  }) => {
    await page.goto('/ru/blog/how-to-play-chess', {
      waitUntil: 'domcontentloaded',
    });

    const russianChessDrill = page.locator('#drill-knight-fork-ru');
    await expect(russianChessDrill).toBeVisible();
    await russianChessDrill.scrollIntoViewIfNeeded();

    await expect(
      russianChessDrill.getByText(
        'Практическая задача: королевская вилка конём',
      ),
    ).toBeVisible();
    await expect(
      russianChessDrill.getByText('Интерактивная задача'),
    ).toBeVisible();

    const forkSquare = russianChessDrill.getByTestId('puzzle-cell-10');
    const correctFeedback = russianChessDrill.getByTestId(
      'puzzle-feedback-correct',
    );

    await expect
      .poll(async () => {
        await forkSquare.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(russianChessDrill.getByText('Верный ход!')).toBeVisible();
    await expect(
      russianChessDrill.getByRole('button', { name: 'Играть сейчас' }),
    ).toBeVisible();
  });

  test('solves go atari capture tactical drill', async ({ page }) => {
    await page.goto('/en/blog/how-to-play-go', {
      waitUntil: 'domcontentloaded',
    });

    const goDrill = page.locator('#drill-go-atari');
    await expect(goDrill).toBeVisible();
    await goDrill.scrollIntoViewIfNeeded();

    const captureCell = goDrill.getByTestId('puzzle-cell-49');
    const correctFeedback = goDrill.getByTestId('puzzle-feedback-correct');

    await expect
      .poll(async () => {
        await captureCell.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(goDrill.getByText('Correct Move!')).toBeVisible();
    await expect(
      goDrill.getByText('Playing at E4 removes the last remaining liberty'),
    ).toBeVisible();
  });

  test('solves sudoku naked single logic drill', async ({ page }) => {
    await page.goto('/en/blog/how-to-play-sudoku', {
      waitUntil: 'domcontentloaded',
    });

    const sudokuDrill = page.locator('#drill-sudoku-naked-single');
    await expect(sudokuDrill).toBeVisible();
    await sudokuDrill.scrollIntoViewIfNeeded();

    const lastSingleCell = sudokuDrill.getByTestId('puzzle-cell-80');
    const correctFeedback = sudokuDrill.getByTestId('puzzle-feedback-correct');

    await expect
      .poll(async () => {
        await lastSingleCell.click();
        return correctFeedback.isVisible();
      })
      .toBe(true);

    await expect(correctFeedback).toBeVisible();
    await expect(sudokuDrill.getByText('Correct Move!')).toBeVisible();
    await expect(
      sudokuDrill.getByText('Cell I9 (Row 9, Column 9) has every other digit'),
    ).toBeVisible();
  });
});
