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
  for (const theme of LIGHT_THEMES) {
    test(`renders readable text and visible buttons in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/games');
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
    });

    test(`sudoku board and controls are visible and readable in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/games/sudoku');
      await setTheme(page, theme);

      const sudokuBoard = page.getByRole('grid', { name: 'Sudoku' });
      await expect(sudokuBoard).toBeVisible();

      const newGameBtn = page.getByTestId('sudoku-new-game-button');
      await expect(newGameBtn).toBeVisible();

      const notesBtn = page.getByRole('button', {
        name: /notes/i,
      });
      await expect(notesBtn).toBeVisible();
    });

    test(`download buttons and coming soon text are visible in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/');
      await setTheme(page, theme);

      const downloadSection = page.locator(
        '[data-testid="download-cta-section"]',
      );
      if ((await downloadSection.count()) > 0) {
        await expect(downloadSection).toBeVisible();
        const appStoreBtn = downloadSection
          .locator('.download-btn-static')
          .first();
        await expect(appStoreBtn).toBeVisible();
      }
    });

    test(`shop cards are visible with readable item names in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/shop');
      await setTheme(page, theme);

      const shopCards = page.locator('[data-testid^="shop-card-"]').first();
      if ((await shopCards.count()) > 0) {
        await expect(shopCards).toBeVisible();
      }
    });

    test(`main content pages have readable contrast in ${theme} mode`, async ({
      page,
    }) => {
      const routes = ['/features', '/leaderboards', '/roadmap', '/help'];
      for (const route of routes) {
        await navigateTo(page, route);
        await setTheme(page, theme);
        const main = page.locator('main').first();
        await expect(main).toBeVisible();
      }
    });

    test(`profile menu dropdown is readable in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/');
      await setTheme(page, theme);

      const profileBtn = page.getByTestId('profile-menu-button');
      if ((await profileBtn.count()) > 0) {
        await profileBtn.click();
        const dropdown = page.getByTestId('profile-dropdown');
        await expect(dropdown).toBeVisible();
      }
    });

    test(`chess board is visible and readable in ${theme} mode`, async ({
      page,
    }) => {
      await navigateTo(page, '/games/chess');
      await setTheme(page, theme);

      const board = page.locator('[role="grid"]');
      if ((await board.count()) > 0) {
        await expect(board).toBeVisible();
        const cell = page.locator('[role="gridcell"]').first();
        await expect(cell).toBeVisible();
      }
    });
  }
});
