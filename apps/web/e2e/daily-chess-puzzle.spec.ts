import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Daily Chess Puzzle Experience', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders daily chess puzzle page with challenge header, countdown timer, and training tabs', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Daily Chess Puzzle' }),
    ).toBeVisible();
    await expect(page.getByText('Daily Challenge')).toBeVisible();
    await expect(page.getByTestId('countdown-timer')).toBeVisible();
    await expect(page.getByTestId('daily-streak-badge')).toBeVisible();

    const tabs = page.getByTestId('chess-puzzle-tabs');
    await expect(tabs).toBeVisible();
    await expect(page.getByTestId('chess-puzzle-tab-daily')).toBeVisible();
    await expect(page.getByTestId('chess-puzzle-tab-rated')).toBeVisible();
    await expect(page.getByTestId('chess-puzzle-tab-rush')).toBeVisible();
    await expect(page.getByTestId('chess-puzzle-tab-learn')).toBeVisible();
  });

  test('navigates seamlessly between daily, rated, and rush via training tabs', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const ratedTab = page.getByTestId('chess-puzzle-tab-rated');
    await ratedTab.click();

    await expect(page).toHaveURL(/\/en\/games\/chess\/puzzles$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chess Training' }),
    ).toBeVisible();

    const themeFilters = page.getByTestId('puzzle-theme-filters');
    await expect(themeFilters).toBeVisible();
    await expect(page.getByTestId('theme-chip-fork')).toBeVisible();

    const rushTab = page.getByTestId('chess-puzzle-tab-rush');
    await rushTab.click();

    await expect(page).toHaveURL(/\/en\/games\/chess\/puzzles\/rush$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Puzzle Rush' }),
    ).toBeVisible();
    await expect(page.getByTestId('puzzle-rush-survival-btn')).toBeVisible();
    await expect(page.getByTestId('puzzle-rush-timed-btn')).toBeVisible();

    const dailyTab = page.getByTestId('chess-puzzle-tab-daily');
    await dailyTab.click();

    await expect(page).toHaveURL(/\/en\/games\/chess\/puzzles\/daily$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Daily Chess Puzzle' }),
    ).toBeVisible();
  });

  test('filters tactics by theme chip on rated puzzles page', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles');

    const forkChip = page.getByTestId('theme-chip-fork');
    await expect(forkChip).toBeVisible();
    await forkChip.click();

    await expect(page.getByTestId('puzzle-hint-btn')).toBeVisible();
  });

  test('starts a puzzle rush survival session', async ({ page }) => {
    await navigateTo(page, '/en/games/chess/puzzles/rush');

    const survivalBtn = page.getByTestId('puzzle-rush-survival-btn');
    await survivalBtn.click();

    await expect(page.getByTestId('puzzle-rush-end-run-btn')).toBeVisible();
    await expect(page.getByText('Score')).toBeHidden();
  });
});
