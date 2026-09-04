import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Solo Games Themes and Leaderboards', () => {
  test('2048 displays theme toggle and toggles theme drawer', async ({
    page,
  }) => {
    await page.goto('/en/games/2048/play', {
      waitUntil: 'networkidle',
    });

    const themeBtn = page.getByTestId('solo-theme-toggle-button');
    await expect(themeBtn).toBeVisible();

    await themeBtn.click();
    const themeDrawer = page.getByTestId('solo-theme-picker-drawer');
    await expect(themeDrawer).toBeVisible();

    const cyberpunkOption = themeDrawer.getByTestId('theme-cyberpunk');
    await expect(cyberpunkOption).toBeVisible();
    await cyberpunkOption.click();

    await expect(themeDrawer).not.toBeVisible();
  });

  test('Solo game displays rules modal and toggles fullscreen mode', async ({
    page,
  }) => {
    await page.goto('/en/games/2048/play', {
      waitUntil: 'networkidle',
    });

    const rulesBtn = page.getByTestId('solo-rules-button');
    await expect(rulesBtn).toBeVisible();
    await rulesBtn.click();

    const rulesModal = page.getByTestId('rules-modal');
    await expect(rulesModal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(rulesModal).not.toBeVisible();

    const fsBtn = page.getByTestId('solo-fullscreen-button');
    await expect(fsBtn).toBeVisible();
    await fsBtn.click();
    await expect(fsBtn).toContainText('Exit');
    await fsBtn.click();
    await expect(fsBtn).toContainText('Full');
  });

  test('Minesweeper displays solo leaderboard panel and switches tabs', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'networkidle',
    });

    const toggleBtn = page.getByTestId('solo-leaderboard-toggle');
    await expect(toggleBtn).toBeVisible();

    const content = page.getByTestId('solo-leaderboard-content');
    await expect(content).toBeVisible();

    const globalTab = page.getByTestId('tab-global-leaderboard');
    await expect(globalTab).toBeVisible();
    await globalTab.click();

    const personalTab = page.getByTestId('tab-personal-bests');
    await expect(personalTab).toBeVisible();
    await personalTab.click();

    await toggleBtn.click();
    await expect(content).not.toBeVisible();
  });

  test('Mobile viewport renders responsive touch controls and theme picker', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/games/2048/play', {
      waitUntil: 'networkidle',
    });

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    const padUp = page.getByTestId('pad-up');
    await expect(padUp).toBeVisible();
    await padUp.click();

    const padDown = page.getByTestId('pad-down');
    await expect(padDown).toBeVisible();
    await padDown.click();

    const themeBtn = page.getByTestId('solo-theme-toggle-button');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    const drawer = page.getByTestId('solo-theme-picker-drawer');
    await expect(drawer).toBeVisible();
  });

  test('Standalone solo leaderboards page displays game tabs and changes game and difficulty', async ({
    page,
  }) => {
    await page.goto('/en/leaderboards/solo', {
      waitUntil: 'networkidle',
    });

    const minesweeperTab = page.getByTestId('solo-game-tab-minesweeper_v1');
    await expect(minesweeperTab).toBeVisible();

    const intermediateDiff = page.getByTestId('solo-diff-tab-intermediate');
    await expect(intermediateDiff).toBeVisible();
    await intermediateDiff.click();

    const sudokuTab = page.getByTestId('solo-game-tab-sudoku_v1');
    await expect(sudokuTab).toBeVisible();
    await sudokuTab.click();

    const hardDiff = page.getByTestId('solo-diff-tab-hard');
    await expect(hardDiff).toBeVisible();
    await hardDiff.click();
  });
});
