import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Interactive Tutorials & Academy', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders interactive challenge board in blog guide and handles player moves', async ({
    page,
  }) => {
    await navigateTo(page, '/en/blog/how-to-win-tic-tac-toe');

    const challengeBoard = page.getByTestId('interactive-guide-board');
    await expect(challengeBoard).toBeVisible();

    const wrongCell = page.getByTestId('puzzle-cell-1');
    await wrongCell.click();

    const incorrectFeedback = page.getByTestId('puzzle-feedback-incorrect');
    await expect(incorrectFeedback).toBeVisible();

    const tryAgainBtn = page.getByRole('button', { name: 'Try Again' });
    await tryAgainBtn.click();
    await expect(incorrectFeedback).toBeHidden();

    const correctCell = page.getByTestId('puzzle-cell-2');
    await correctCell.click();

    const correctFeedback = page.getByTestId('puzzle-feedback-correct');
    await expect(correctFeedback).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Play Full Game Now' }),
    ).toBeVisible();
  });

  test('renders academy section on game landing with interactive challenge tabs', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/tic-tac-toe');

    const academySection = page.getByTestId('game-academy-section');
    await expect(academySection).toBeVisible();

    const puzzle2Tab = page.getByRole('button', { name: 'Puzzle 2' });
    await expect(puzzle2Tab).toBeVisible();
    await puzzle2Tab.click();

    await expect(
      page.getByText('Academy Challenge 2: Defend the Center Trap'),
    ).toBeVisible();
  });
});
