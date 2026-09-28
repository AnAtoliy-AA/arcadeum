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

    const d2Cell = page.getByTestId('chess-d2');
    await expect(d2Cell).toBeVisible();
    await d2Cell.click();

    await expect(d2Cell).toHaveAttribute('aria-label', /selected/);

    const d1Cell = page.getByTestId('chess-d1');
    await d1Cell.click();
    await expect(d1Cell).toHaveAttribute('aria-label', /selected/);
    await expect(d2Cell).not.toHaveAttribute('aria-label', /selected/);
  });

  test('toggles board flip without breaking piece interaction in puzzle', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const flipBtn = page.getByTestId('flip-board-btn');
    await expect(flipBtn).toBeVisible();
    await flipBtn.click();

    const d2Cell = page.getByTestId('chess-d2');
    await expect(d2Cell).toBeVisible();
    await d2Cell.click();
    await expect(d2Cell).toHaveAttribute('aria-label', /selected/);
  });
});
