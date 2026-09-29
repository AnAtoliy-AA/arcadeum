import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Shared Checkerboard Field Experience', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders chess puzzle with visible squares and allows interaction', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const chessBoard = page.getByRole('grid', { name: 'Chess puzzle board' });
    await expect(chessBoard).toBeVisible();

    const playerPieces = page.locator('[role="gridcell"][draggable="true"]');
    const firstPiece = playerPieces.first();
    await expect(firstPiece).toBeVisible();
    await firstPiece.click();

    await expect(firstPiece).toHaveAttribute('aria-label', /selected/);

    const pieceCount = await playerPieces.count();
    if (pieceCount > 1) {
      const secondPiece = playerPieces.nth(1);
      await secondPiece.click();
      await expect(secondPiece).toHaveAttribute('aria-label', /selected/);
      await expect(firstPiece).not.toHaveAttribute('aria-label', /selected/);
    }
  });

  test('toggles board flip without breaking piece interaction in puzzle', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const flipBtn = page.getByTestId('flip-board-btn');
    await expect(flipBtn).toBeVisible();

    const playerPieces = page.locator('[role="gridcell"][draggable="true"]');
    const firstPiece = playerPieces.first();
    await expect(firstPiece).toBeVisible();

    await flipBtn.click();

    await expect(firstPiece).toBeVisible();
    await firstPiece.click();
    await expect(firstPiece).toHaveAttribute('aria-label', /selected/);
  });
});
