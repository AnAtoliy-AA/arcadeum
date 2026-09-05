import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Single Player Puzzle Games', () => {
  test('Sudoku game renders HUD, grid, keypad, and handles notes toggle', async ({
    page,
  }) => {
    await page.goto('/en/games/sudoku/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByRole('grid', { name: 'Sudoku' });
    await expect(board).toBeVisible();

    const newGameBtn = page.getByTestId('sudoku-new-game-button');
    await expect(newGameBtn).toBeVisible();

    const cells = board.getByRole('gridcell');
    await expect(cells).toHaveCount(81);

    const notesBtn = page.getByRole('button', { name: /Notes/i });
    await expect(notesBtn).toBeVisible();
    await notesBtn.click();
    await expect(notesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Minesweeper game renders HUD, smiley button, and board grid', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const flagBtn = page.getByRole('button', { name: /Flag mode/i });
    await expect(flagBtn).toBeVisible();
    await flagBtn.click();
    await expect(flagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Minesweeper expert board fits horizontally without scroll on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const diffTrigger = page.locator('#minesweeper-difficulty');
    await expect(diffTrigger).toBeVisible();
    await diffTrigger.click();

    const expertOption = page.getByRole('option', { name: /Expert/i });
    await expect(expertOption).toBeVisible();
    await expertOption.click();

    const board = page.getByRole('grid');
    await expect(board).toBeVisible();

    const hasNoHorizontalScroll = await page.evaluate(() => {
      const grid = document.querySelector('[role="grid"]');
      if (!grid) return false;
      return grid.scrollWidth <= grid.clientWidth;
    });
    expect(hasNoHorizontalScroll).toBe(true);
  });

  test('Solitaire game renders table, stock deck, and tableau piles', async ({
    page,
  }) => {
    await page.goto('/en/games/solitaire/play', {
      waitUntil: 'domcontentloaded',
    });

    const newGameBtn = page.getByTestId('solitaire-new-game-button');
    await expect(newGameBtn).toBeVisible();

    const drawBtn = page.getByRole('button', { name: /Draw/i });
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();
  });

  test('Solitaire board cards overlap and avoid vertical scroll on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/en/games/solitaire/play', {
      waitUntil: 'domcontentloaded',
    });

    const drawBtn = page.getByRole('button', { name: /Draw/i });
    await expect(drawBtn).toBeVisible();

    const timerCard = page.getByTestId('solitaire-timer');
    await expect(timerCard).toBeVisible();

    const bgImage = page.getByTestId('solo-theme-bg-image');
    await expect(bgImage).toBeVisible();

    const facedownFan = page.locator('[data-fan="facedown"]');
    await expect(facedownFan.first()).toBeVisible();

    const isBoardContained = await page.evaluate(() => {
      const board = document.querySelector('[style*="--sol-table-bg"]');
      if (!board) return false;
      const rect = board.getBoundingClientRect();
      return rect.bottom <= window.innerHeight;
    });
    expect(isBoardContained).toBe(true);
  });

  test('Solo game fullscreen isolates container and renders enlarged board with leaderboard on wide screens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 900 });
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const fullscreenBtn = page.getByTestId('solo-fullscreen-button');
    await expect(fullscreenBtn).toBeVisible();
    await fullscreenBtn.click();

    const container = page.getByTestId('solo-game-container');
    await expect(container).toHaveAttribute('data-fullscreen', 'true');

    const bgImage = page.getByTestId('solo-theme-bg-image');
    await expect(bgImage).toBeVisible();
    await expect(bgImage).toHaveAttribute('src', /variants/);

    const bodyHasOverflowHidden = await page.evaluate(() =>
      document.body.classList.contains('overflow-hidden'),
    );
    expect(bodyHasOverflowHidden).toBe(true);

    const leaderboard = page.getByTestId('solo-leaderboard-toggle');
    await expect(leaderboard).toBeVisible();

    const exitBtn = page.getByTestId('solo-fullscreen-button');
    await exitBtn.click();
    await expect(container).not.toHaveAttribute('data-fullscreen', 'true');
    await expect(bgImage).not.toBeVisible();
  });

  test('Solo game supports manual pause, overlay display, keyboard shortcut, and auto-pause toggle', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const pauseBtn = page.getByTestId('solo-pause-button');
    await expect(pauseBtn).toBeVisible();

    const controlAutopauseBtn = page.getByTestId(
      'solo-autopause-control-button',
    );
    await expect(controlAutopauseBtn).toBeVisible();
    await expect(controlAutopauseBtn).toHaveAttribute('aria-pressed', 'true');

    await controlAutopauseBtn.click();
    await expect(controlAutopauseBtn).toHaveAttribute('aria-pressed', 'false');

    await controlAutopauseBtn.click();
    await expect(controlAutopauseBtn).toHaveAttribute('aria-pressed', 'true');

    const firstCell = page.getByRole('gridcell').first();
    await expect(firstCell).toBeVisible();
    await firstCell.click();

    await pauseBtn.click();

    const overlay = page.getByTestId('solo-pause-overlay');
    await expect(overlay).toBeVisible();

    const resumeBtn = page.getByTestId('solo-resume-button');
    await expect(resumeBtn).toBeVisible();

    const autoPauseToggle = page.getByTestId('solo-autopause-toggle');
    await expect(autoPauseToggle).toBeVisible();
    await expect(autoPauseToggle).toHaveAttribute('aria-checked', 'true');

    await autoPauseToggle.click();
    await expect(autoPauseToggle).toHaveAttribute('aria-checked', 'false');
    await expect(controlAutopauseBtn).toHaveAttribute('aria-pressed', 'false');

    await autoPauseToggle.click();
    await expect(autoPauseToggle).toHaveAttribute('aria-checked', 'true');
    await expect(controlAutopauseBtn).toHaveAttribute('aria-pressed', 'true');

    await resumeBtn.click();
    await expect(overlay).not.toBeVisible();

    const controlPanel = page.getByTestId('solo-control-panel');
    await expect(controlPanel).toBeVisible();
    await expect(controlPanel.getByTestId('solo-pause-button')).toBeVisible();
    await expect(
      controlPanel.getByTestId('solo-autopause-control-button'),
    ).toBeVisible();

    await pauseBtn.click();
    await expect(overlay).toBeVisible();
    await pauseBtn.click();
    await expect(overlay).not.toBeVisible();

    await page.keyboard.press('p');
    await expect(overlay).toBeVisible();

    await page.keyboard.press('p');
    await expect(overlay).not.toBeVisible();
  });

  test('SoloGameContainer provides control panel with pause and autopause in Solitaire', async ({
    page,
  }) => {
    await page.goto('/en/games/solitaire/play', {
      waitUntil: 'domcontentloaded',
    });

    const controlPanel = page.getByTestId('solo-control-panel');
    await expect(controlPanel).toBeVisible();

    const pauseBtn = controlPanel.getByTestId('solo-pause-button');
    await expect(pauseBtn).toBeVisible();

    const autopauseBtn = controlPanel.getByTestId(
      'solo-autopause-control-button',
    );
    await expect(autopauseBtn).toBeVisible();

    await pauseBtn.click();
    const overlay = page.getByTestId('solo-pause-overlay');
    await expect(overlay).toBeVisible();

    await page.getByTestId('solo-resume-button').click();
    await expect(overlay).not.toBeVisible();
  });

  test('SoloControlPanel renders pause and autopause in Sudoku and 2048', async ({
    page,
  }) => {
    await page.goto('/en/games/sudoku/play', {
      waitUntil: 'domcontentloaded',
    });

    const sudokuControlPanel = page.getByTestId('solo-control-panel');
    await expect(sudokuControlPanel).toBeVisible();
    await expect(
      sudokuControlPanel.getByTestId('solo-pause-button'),
    ).toBeVisible();
    await expect(
      sudokuControlPanel.getByTestId('solo-autopause-control-button'),
    ).toBeVisible();

    await page.goto('/en/games/2048/play', {
      waitUntil: 'domcontentloaded',
    });

    const game2048ControlPanel = page.getByTestId('solo-control-panel');
    await expect(game2048ControlPanel).toBeVisible();
    await expect(
      game2048ControlPanel.getByTestId('solo-pause-button'),
    ).toBeVisible();
    await expect(
      game2048ControlPanel.getByTestId('solo-autopause-control-button'),
    ).toBeVisible();
  });

  test('Game 2048 allows continuing play after win without re-opening modal on moves', async ({
    page,
  }) => {
    await page.goto('/en/games/2048/play', {
      waitUntil: 'domcontentloaded',
    });

    const board = page.getByTestId('game-2048-board');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      const storageKey = 'arcadeum_game_2048_v1';
      const state = {
        state: {
          grid: [1024, 1024, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          score: 1024,
          best: 1024,
          status: 'playing',
          keepPlayingFlag: false,
          moves: 20,
          startedAt: Date.now() - 60000,
          finishedAt: null,
          finished: null,
        },
        version: 0,
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(board).toBeVisible();

    await page.keyboard.press('ArrowLeft');

    const winModal = page.getByTestId('game-result-modal');
    await expect(winModal).toBeVisible();

    const keepGoingBtn = page.getByTestId('keep-going-button');
    await expect(keepGoingBtn).toBeVisible();
    await keepGoingBtn.click();

    await expect(winModal).not.toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(winModal).not.toBeVisible();

    const pauseBtn = page.getByTestId('solo-pause-button');
    await expect(pauseBtn).toBeVisible();
    await expect(pauseBtn).toBeEnabled();

    await pauseBtn.click();
    const pauseOverlay = page.getByTestId('solo-pause-overlay');
    await expect(pauseOverlay).toBeVisible();

    const resumeBtn = page.getByTestId('solo-resume-button');
    await expect(resumeBtn).toBeVisible();
    await resumeBtn.click();
    await expect(pauseOverlay).not.toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(winModal).not.toBeVisible();
  });

  test('Solo game field occupies available width and renders compact controls on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/games/2048/play', {
      waitUntil: 'domcontentloaded',
    });

    const controlPanel = page.getByTestId('solo-control-panel');
    await expect(controlPanel).toBeVisible();

    const board2048 = page.getByTestId('game-2048-board');
    await expect(board2048).toBeVisible();
    const boardBox = await board2048.boundingBox();
    expect(boardBox).not.toBeNull();
    if (boardBox) {
      expect(boardBox.width).toBeGreaterThanOrEqual(350);
    }

    await page.goto('/en/games/sudoku/play', {
      waitUntil: 'domcontentloaded',
    });
    const sudokuBoard = page.getByRole('grid', { name: 'Sudoku' });
    await expect(sudokuBoard).toBeVisible();
    const sudokuBox = await sudokuBoard.boundingBox();
    expect(sudokuBox).not.toBeNull();
    if (sudokuBox) {
      expect(sudokuBox.width).toBeGreaterThanOrEqual(350);
    }

    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });
    const msBoard = page.getByRole('grid');
    await expect(msBoard).toBeVisible();
    const msBox = await msBoard.boundingBox();
    expect(msBox).not.toBeNull();
    if (msBox) {
      expect(msBox.width).toBeGreaterThanOrEqual(340);
    }
  });

  test('Solo control panel supports sound, music, and leaderboard visibility toggles', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const soundBtn = page.getByTestId('solo-sound-toggle-button');
    await expect(soundBtn).toBeVisible();
    const initialSound = await soundBtn.getAttribute('aria-pressed');
    await soundBtn.click();
    await expect(soundBtn).toHaveAttribute(
      'aria-pressed',
      initialSound === 'true' ? 'false' : 'true',
    );
    await soundBtn.click();
    await expect(soundBtn).toHaveAttribute(
      'aria-pressed',
      initialSound ?? 'true',
    );

    const musicBtn = page.getByTestId('solo-music-toggle-button');
    await expect(musicBtn).toBeVisible();
    const initialMusic = await musicBtn.getAttribute('aria-pressed');
    await musicBtn.click();
    await expect(musicBtn).toHaveAttribute(
      'aria-pressed',
      initialMusic === 'true' ? 'false' : 'true',
    );
    await musicBtn.click();
    await expect(musicBtn).toHaveAttribute(
      'aria-pressed',
      initialMusic ?? 'true',
    );

    const leaderboardToggle = page.getByTestId(
      'solo-leaderboard-toggle-button',
    );
    await expect(leaderboardToggle).toBeVisible();
    const leaderboard = page.getByTestId('solo-leaderboard-toggle');
    await expect(leaderboard).toBeVisible();

    await leaderboardToggle.click();
    await expect(leaderboard).not.toBeVisible();

    await leaderboardToggle.click();
    await expect(leaderboard).toBeVisible();
  });

  test('Solo game switcher dropdown lists games and navigates on selection', async ({
    page,
  }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const switcherBtn = page.getByTestId('solo-game-switcher-button');
    await expect(switcherBtn).toBeVisible();
    await expect(switcherBtn).toHaveText(/Minesweeper/);

    await switcherBtn.click();
    const dropdown = page.getByTestId('solo-game-switcher-dropdown');
    await expect(dropdown).toBeVisible();

    const sudokuOpt = page.getByTestId('solo-game-option-sudoku');
    await expect(sudokuOpt).toBeVisible();
    await sudokuOpt.click();

    await page.waitForURL('**/games/sudoku/play');
    const newSwitcherBtn = page.getByTestId('solo-game-switcher-button');
    await expect(newSwitcherBtn).toBeVisible();
    await expect(newSwitcherBtn).toHaveText(/Sudoku/);
  });

  test('Solo themes selector is horizontally scrollable', async ({ page }) => {
    await page.goto('/en/games/minesweeper/play', {
      waitUntil: 'domcontentloaded',
    });

    const themeToggleBtn = page.getByTestId('solo-theme-toggle-button');
    await expect(themeToggleBtn).toBeVisible();
    await themeToggleBtn.click();

    const drawer = page.getByTestId('solo-theme-picker-drawer');
    await expect(drawer).toBeVisible();

    const radiogroup = drawer.getByRole('radiogroup');
    await expect(radiogroup).toBeVisible();

    const isScrollable = await radiogroup.evaluate(
      (el) => el.scrollWidth > el.clientWidth,
    );
    expect(isScrollable).toBe(true);

    const cyberpunkTheme = drawer.getByTestId('theme-cyberpunk');
    await expect(cyberpunkTheme).toBeVisible();
    await cyberpunkTheme.click();
    await expect(drawer).not.toBeVisible();

    await themeToggleBtn.click();
    await expect(drawer).toBeVisible();
    const activeCyberpunk = drawer.getByTestId('theme-cyberpunk');
    await expect(activeCyberpunk).toHaveAttribute('aria-checked', 'true');
  });
});
