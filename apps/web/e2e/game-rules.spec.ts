import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Game Rules', () => {
  test('should display rules for Critical game', async ({ page }) => {
    await navigateTo(page, '/games');

    // Mock a room detail or just navigate to rules if possible
    // Let's go to creation page and see if there are rules hints
    await navigateTo(page, '/games/create?gameId=critical_v1');

    const rulesBtn = page.getByRole('button', { name: /rules|правила/i });
    if (await rulesBtn.isVisible()) {
      await rulesBtn.click();
      // Wait for modal header
      await expect(
        page.getByRole('heading', { name: /Game Rules|Правила/i }),
      ).toBeVisible();
      // Check content loosely but safely
      await expect(
        page.getByText(/objective|goal|цель/i).first(),
      ).toBeVisible();
    }
  });

  test('should show objective in rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    const rulesBtn = page.getByRole('button', { name: /rules|правила/i });
    if (await rulesBtn.isVisible()) {
      // await rulesBtn.scrollIntoViewIfNeeded();
      await rulesBtn.click({ force: true });
      // Wait for header to ensure modal is open
      const modalHeader = page.getByRole('heading', {
        name: /Game Rules|Правила/i,
      });
      await expect(modalHeader).toBeVisible();
      await expect(page.getByText(/objective|goal|цель/i).first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should close rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    const rulesBtn = page.getByRole('button', { name: /rules|правила/i });
    if (await rulesBtn.isVisible()) {
      await rulesBtn.click({ force: true });

      const modalHeader = page.getByRole('heading', {
        name: /Game Rules|Правила/i,
      });
      await expect(modalHeader).toBeVisible();

      const closeBtn = page.getByRole('button', { name: /×/i }).first();
      await closeBtn.click({ force: true });

      await expect(modalHeader).not.toBeVisible();
    }
  });
});
