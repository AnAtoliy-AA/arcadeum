import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Game Rules', () => {
  test('should display rules for Critical game', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await page.waitForLoadState('networkidle');

    const rulesBtn = page
      .getByRole('button', { name: /rules|правила|📖/i })
      .or(page.getByTestId('view-rules-button'));
    await expect(rulesBtn).toBeVisible({ timeout: 15000 });
    await rulesBtn.click({ force: true });

    // Check for modal presence using testId
    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });

    // Check content loosely but safely
    await expect(modal.getByText(/objective|goal|цель/i).first()).toBeVisible();
  });

  test('should show objective in rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await page.waitForLoadState('networkidle');

    const rulesBtn = page.getByRole('button', { name: /rules|правила|📖/i });
    await expect(rulesBtn).toBeVisible({ timeout: 15000 });
    await rulesBtn.click({ force: true });

    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });
    await expect(modal.getByText(/objective|goal|цель/i).first()).toBeVisible();
  });

  test('should close rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await page.waitForLoadState('networkidle');

    const rulesBtn = page.getByRole('button', { name: /rules|правила|📖/i });
    await expect(rulesBtn).toBeVisible({ timeout: 15000 });
    await rulesBtn.click({ force: true });

    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });

    await page.waitForTimeout(1000);
    const closeBtn = modal.getByTestId('modal-close-button').first();
    await closeBtn.click({ force: true });

    await expect(modal).not.toBeVisible({ timeout: 15000 });
  });
});
