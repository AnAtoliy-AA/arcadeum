import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Support Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/support');
  });

  test('should load support page', async ({ page }) => {
    await expect(page).toHaveURL(/\/support/);
    // Use a broad check for the title content
    await expect(page.locator('body')).toContainText(
      /support|поддержите|apoya/i,
    );
  });

  test('should display team members', async ({ page }) => {
    const teamSection = page.locator(
      'section[aria-labelledby="support-team-heading"]',
    );
    await expect(teamSection).toBeVisible();
    await expect(teamSection).toContainText(
      /producer|designer|engineer|продукт|дизайнер|инженер/i,
    );
  });

  test('should display contribution actions', async ({ page }) => {
    const actionsSection = page.locator(
      'section[aria-labelledby="support-actions-heading"]',
    );
    await expect(actionsSection).toBeVisible();
    await expect(actionsSection).toContainText(
      /payment|sponsorship|coffee|bank|оплата|поддержка|кофе|перевод/i,
    );
  });

  test('should have working external links', async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    expect(await externalLinks.count()).toBeGreaterThan(0);
  });

  test('should link to recurring sponsorship', async ({ page }) => {
    const sponsorLink = page.getByText(
      /sponsor development|patrocinar|soutenir|спонсор|become a sponsor/i,
    );
    // It should be a route link now, so check if it redirects within the app
    await sponsorLink.click();
    await expect(page).toHaveURL(/payment\?mode=subscription/);
  });
});
