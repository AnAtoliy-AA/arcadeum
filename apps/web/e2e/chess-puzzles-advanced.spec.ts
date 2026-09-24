import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Advanced Chess Puzzles Suite', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  it('toggles blindfold visualization mode and reveals peek button', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles');

    const blindfoldBtn = page.getByTestId('toggle-blindfold-btn');
    await expect(blindfoldBtn).toBeVisible();
    await blindfoldBtn.click();

    await expect(page.getByTestId('blindfold-banner')).toBeVisible();
    const peekBtn = page.getByTestId('peek-blindfold-btn');
    await expect(peekBtn).toBeVisible();

    await peekBtn.click();
    await expect(peekBtn).toHaveText(/Peeking/);
  });

  it('displays tactical elo rating chart inside analytics modal', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles');

    const analyticsBtn = page.getByTestId('chess-puzzle-tab-analytics');
    await analyticsBtn.click();

    const chart = page.getByTestId('puzzle-rating-chart');
    await expect(chart).toBeVisible();
    await expect(page.getByText('Tactical Elo Rating')).toBeVisible();

    const closeBtn = page.getByTestId('close-analytics-modal');
    await closeBtn.click();
  });

  it('imports classical study via PGN importer on custom puzzles page', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/custom');

    const importPgnBtn = page.getByTestId('import-pgn-btn');
    await expect(importPgnBtn).toBeVisible();
    await importPgnBtn.click();

    await expect(page.getByTestId('pgn-puzzle-importer')).toBeVisible();
    const philidorBtn = page.getByText('Smothered Philidor Defense');
    await philidorBtn.click();

    const submitBtn = page.getByTestId('import-pgn-submit-btn');
    await submitBtn.click();

    await expect(page.getByTestId('pgn-import-status')).toBeVisible();
    await expect(page.getByTestId('pgn-import-status')).toContainText(
      'Successfully imported',
    );
  });

  it('switches to 1v1 online duel and creates room code', async ({ page }) => {
    await navigateTo(page, '/en/games/chess/puzzles/duel');

    const onlineTab = page.getByTestId('tab-duel-online');
    await expect(onlineTab).toBeVisible();
    await onlineTab.click();

    await expect(page.getByTestId('online-puzzle-duel')).toBeVisible();
    const createBtn = page.getByTestId('create-room-btn');
    await createBtn.click();

    await expect(page.getByTestId('room-code-display')).toBeVisible();
    await expect(page.getByTestId('copy-room-link-btn')).toBeVisible();
  });

  it('opens daily speed-run leaderboard modal on daily puzzle page', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/daily');

    const lbBtn = page.getByTestId('open-speed-leaderboard-btn');
    await expect(lbBtn).toBeVisible();
    await lbBtn.click();

    const modal = page.getByTestId('daily-leaderboard-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Daily Solvers Leaderboard')).toBeVisible();

    const closeBtn = page.getByTestId('close-leaderboard-btn');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
