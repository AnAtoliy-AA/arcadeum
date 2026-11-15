import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Chess Puzzle Duel and Tactical Analytics', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders puzzle duel page and selects difficulty to start match', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/duel');

    await expect(
      page.getByRole('heading', { level: 1, name: '1v1 Puzzle Duel' }),
    ).toBeVisible();

    const lobby = page.getByTestId('puzzle-duel-lobby');
    await expect(lobby).toBeVisible();

    const hardDiff = page.getByTestId('duel-diff-hard');
    await hardDiff.click();

    const startBtn = page.getByTestId('start-duel-btn');
    await startBtn.click();

    await expect(page.getByTestId('puzzle-duel-match')).toBeVisible();
    await expect(page.getByTestId('duel-timer')).toBeVisible();
  });

  test('toggles zen mode and board flipping on rated puzzle game', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles');

    const zenBtn = page.getByTestId('toggle-zen-btn');
    await expect(zenBtn).toBeVisible();
    await zenBtn.click();
    await expect(page.getByText('Exit Zen [Z]')).toBeVisible();

    const flipBtn = page.getByTestId('flip-board-btn');
    await expect(flipBtn).toBeVisible();
    await flipBtn.click();
  });

  test('opens tactical analytics modal and displays stats and radar tabs', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles');

    const analyticsTab = page.getByTestId('chess-puzzle-tab-analytics');
    await expect(analyticsTab).toBeVisible();
    await analyticsTab.click();

    const modal = page.getByTestId('puzzle-analytics-modal');
    await expect(modal).toBeVisible();
    await expect(
      page.getByText('Tactical Performance & Analytics'),
    ).toBeVisible();

    const mistakesTab = page.getByTestId('tab-mistakes');
    await mistakesTab.click();
    await expect(page.getByTestId('empty-mistakes-state')).toBeVisible();

    const closeBtn = page.getByTestId('close-analytics-modal');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
