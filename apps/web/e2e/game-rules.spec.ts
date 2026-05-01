import { expect, type Page } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Game Rules', () => {
  // The "View Game Rules" button lives below the fold on mobile, so we
  // scroll it into view before clicking. Using the testid (added in
  // CriticalGame/CreationConfig.tsx) avoids strict-mode hits from other
  // role-based matches like the lobby's GamesControlPanel rules icon.
  async function openRulesModal(page: Page) {
    const rulesBtn = page.getByTestId('view-rules-button');
    await expect(rulesBtn).toBeAttached({});
    await rulesBtn.scrollIntoViewIfNeeded();
    await expect(rulesBtn).toBeVisible({});
    await rulesBtn.click();
  }

  test('should display rules for Critical game', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await openRulesModal(page);

    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({});
    await expect(modal.getByText(/objective|goal|цель/i).first()).toBeVisible();
  });

  test('should show objective in rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await openRulesModal(page);

    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({});
    await expect(modal.getByText(/objective|goal|цель/i).first()).toBeVisible();
  });

  test('should close rules modal', async ({ page }) => {
    await navigateTo(page, '/games/create?gameId=critical_v1');
    await openRulesModal(page);

    const modal = page.getByTestId('rules-modal');
    await expect(modal).toBeVisible({});

    const closeBtn = modal.getByTestId('modal-close-button').first();
    await closeBtn.click({ force: true });

    await expect(modal).not.toBeVisible({});
  });
});
