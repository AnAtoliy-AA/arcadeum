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

  test('navigates seamlessly between daily and rated puzzles via training tabs', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const ratedTab = page.getByTestId('chess-puzzle-tab-rated');
    await ratedTab.click();

    await expect(page).toHaveURL(/\/en\/games\/chess\/puzzles$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chess Training' }),
    ).toBeVisible();

    const dailyTab = page.getByTestId('chess-puzzle-tab-daily');
    await dailyTab.click();

    await expect(page).toHaveURL(/\/en\/games\/chess\/puzzles\/daily$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Daily Chess Puzzle' }),
    ).toBeVisible();
  });
});
