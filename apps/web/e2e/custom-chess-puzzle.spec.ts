import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Custom Chess Puzzle Experience', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders custom puzzle page with tabs and empty state or list', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/custom');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Custom Chess Puzzles' }),
    ).toBeVisible();

    const tabs = page.getByTestId('chess-puzzle-tabs');
    await expect(tabs).toBeVisible();
    await expect(page.getByTestId('chess-puzzle-tab-custom')).toBeVisible();
    await expect(page.getByTestId('create-puzzle-btn')).toBeVisible();
  });

  test('opens puzzle creator, validates moves, and saves custom puzzle', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/puzzles/custom');

    const createBtn = page.getByTestId('create-puzzle-btn');
    await createBtn.click();

    await expect(page.getByTestId('custom-puzzle-creator')).toBeVisible();
    await expect(page.getByTestId('validation-success-banner')).toBeVisible();

    const titleInput = page.getByTestId('custom-puzzle-title-input');
    await titleInput.fill('Back Rank Tester');

    const saveBtn = page.getByTestId('save-custom-puzzle-btn');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    const backBtn = page.getByTestId('back-to-custom-puzzles-btn');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.getByText('Back Rank Tester')).toBeVisible();
  });

  test('exports and imports custom puzzle json data', async ({ page }) => {
    await navigateTo(page, '/en/games/chess/puzzles/custom');

    const importBtn = page.getByTestId('import-puzzles-btn');
    await importBtn.click();

    await expect(page.getByTestId('import-json-card')).toBeVisible();
    const textarea = page.getByTestId('import-json-textarea');
    const sampleJson = JSON.stringify([
      {
        puzzleId: 'imported_custom_test_1',
        fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
        moves: ['e1e8'],
        rating: 1600,
        themes: ['backRankMate'],
        openingTags: ['Imported Mate Test'],
      },
    ]);

    await textarea.fill(sampleJson);
    const confirmBtn = page.getByTestId('confirm-import-btn');
    await confirmBtn.click();

    await expect(page.getByText('Imported Mate Test')).toBeVisible();
  });
});
