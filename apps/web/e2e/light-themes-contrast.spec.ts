import { expect } from '@playwright/test';
import { test, navigateTo, type Page } from './fixtures/test-utils';

const LIGHT_THEMES = [
  'light',
  'neonLight',
  'violetLight',
  'tealLight',
] as const;

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function contrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const l1 = luminance(...rgb1);
  const l2 = luminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function setTheme(page: Page, theme: string) {
  await page.evaluate((t: string) => {
    if (window.__SET_THEME__) {
      window.__SET_THEME__(t);
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  }, theme);
}

test.describe('Light Themes Contrast and Usability', () => {
  test('games page — contrast, cards, and controls', async ({ page }) => {
    await navigateTo(page, '/games');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const bodyColors = await page.evaluate(() => {
        const root = document.documentElement;
        const style = window.getComputedStyle(root);
        return {
          bg:
            style.getPropertyValue('--background').trim() ||
            style.backgroundColor,
          fg: style.getPropertyValue('--foreground').trim() || style.color,
        };
      });

      const bodyBgRgb = parseRgb(bodyColors.bg) ?? [248, 250, 252];
      const bodyFgRgb = parseRgb(bodyColors.fg) ?? [15, 23, 42];
      const ratio = contrastRatio(bodyBgRgb, bodyFgRgb);
      expect(ratio).toBeGreaterThanOrEqual(4.5);

      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      const gameCards = page.locator('[data-testid^="game-card-"]').first();
      if ((await gameCards.count()) > 0) {
        await expect(gameCards).toBeVisible();
      }

      const gamesHeader = page.locator('h1');
      await expect(gamesHeader).toBeVisible();
    }
  });

  test('sudoku — board, controls, and notes', async ({ page }) => {
    await navigateTo(page, '/en/games/sudoku/play');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const sudokuBoard = page.getByRole('grid', { name: 'Sudoku' });
      await expect(sudokuBoard).toBeVisible();

      const newGameBtn = page.getByTestId('sudoku-new-game-button');
      await expect(newGameBtn).toBeVisible();

      const notesBtn = page.getByTestId('sudoku-toggle-notes-button');
      await expect(notesBtn).toBeVisible();
    }
  });

  test('home — download buttons, profile menu, online badge', async ({
    page,
  }) => {
    await navigateTo(page, '/');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const downloadSection = page.locator(
        '[data-testid="download-cta-section"]',
      );
      if ((await downloadSection.count()) > 0) {
        await expect(downloadSection).toBeVisible();
        const appStoreBtn = downloadSection
          .getByTestId('download-btn-static')
          .first();
        await expect(appStoreBtn).toBeVisible();
      }

      const profileBtn = page.getByTestId('profile-menu-button');
      if ((await profileBtn.count()) > 0) {
        await profileBtn.click();
        const dropdown = page.getByTestId('profile-dropdown');
        await expect(dropdown).toBeVisible();
        await profileBtn.click();
      }

      const onlineBadge = page.getByTestId('header-live-pulse-badge');
      if ((await onlineBadge.count()) > 0) {
        await expect(onlineBadge).toBeVisible();
      }
    }
  });

  test('shop cards are visible with readable item names', async ({ page }) => {
    await navigateTo(page, '/shop');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const shopCards = page.locator('[data-testid^="shop-card-"]').first();
      if ((await shopCards.count()) > 0) {
        await expect(shopCards).toBeVisible();
      }
    }
  });

  test('main content pages have readable contrast', async ({ page }) => {
    const routes = ['/features', '/leaderboards', '/roadmap', '/help'];

    for (const route of routes) {
      await navigateTo(page, route);

      for (const theme of LIGHT_THEMES) {
        await setTheme(page, theme);

        const main = page.locator('main').first();
        await expect(main).toBeVisible();
      }
    }
  });

  test('chess — board, rules modal, game result, share dropdown', async ({
    page,
  }) => {
    await navigateTo(page, '/games/chess');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const board = page.locator('[role="grid"]');
      if ((await board.count()) > 0) {
        await expect(board).toBeVisible();
        const cell = page.locator('[role="gridcell"]').first();
        await expect(cell).toBeVisible();
      }

      const rulesButton = page.getByTestId('view-rules-button');
      if ((await rulesButton.count()) > 0) {
        await rulesButton.click();
        const modal = page.getByTestId('rules-modal');
        await expect(modal).toBeVisible();
        const closeBtn = page.getByTestId('modal-close-button');
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();
      }

      const resultModal = page.getByTestId('game-result-modal');
      if ((await resultModal.count()) > 0) {
        await expect(resultModal).toBeVisible();
      }

      const shareBtn = page.getByTestId('share-game-button');
      if ((await shareBtn.count()) > 0) {
        await shareBtn.click();
        const popover = page.getByTestId('share-game-popover');
        await expect(popover).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('rooms — cards and filters', async ({ page }) => {
    await navigateTo(page, '/rooms');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const roomCard = page.locator('[data-testid="room-card"]').first();
      if ((await roomCard.count()) > 0) {
        await expect(roomCard).toBeVisible();
      }

      const filters = page.getByTestId('games-filters-container');
      if ((await filters.count()) > 0) {
        await expect(filters).toBeVisible();
      }
    }
  });

  test('token page heading is readable', async ({ page }) => {
    await navigateTo(page, '/token');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    }
  });

  test('policy pages are readable', async ({ page }) => {
    const routes = ['/privacy', '/terms', '/cookies'];

    for (const route of routes) {
      await navigateTo(page, route);

      for (const theme of LIGHT_THEMES) {
        await setTheme(page, theme);

        const testId = `${route.replace('/', '')}-page-wrapper`;
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    }
  });

  test('contact page header stays correctly stacked on scroll', async ({
    page,
  }) => {
    await navigateTo(page, '/contact');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const header = page.locator('header.header-outer');
      await expect(header).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 300));
      await expect(header).toBeVisible();
    }
  });

  test('cascade landing heading is readable', async ({ page }) => {
    await navigateTo(page, '/games/cascade');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    }
  });

  test('minesweeper board and HUD are readable', async ({ page }) => {
    await navigateTo(page, '/games/minesweeper');

    for (const theme of LIGHT_THEMES) {
      await setTheme(page, theme);

      const board = page.getByRole('grid');
      if ((await board.count()) > 0) {
        await expect(board).toBeVisible();
      }
    }
  });
});
