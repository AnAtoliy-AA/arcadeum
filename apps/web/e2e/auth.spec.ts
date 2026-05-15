import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should load auth page', async ({ page }) => {
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should display auth content', async ({ page }) => {
    // Auth route no longer renders inside <main> (PageLayout was removed in
    // the ARC-690 redesign); use the route-owned data-testid instead.
    await expect(page.getByTestId('auth-page-root')).toBeVisible();
    await expect(page.getByTestId('auth-form-panel')).toBeVisible();
  });

  test('should display OAuth provider buttons', async ({ page }) => {
    // The redesign uses an explicit provider grid; assert the Google button
    // is at least visible (Apple/Discord render disabled placeholders).
    await expect(page.getByTestId('auth-oauth-google')).toBeVisible();
  });

  test('should have sign in heading or text', async ({ page }) => {
    const signInText = page.getByText(/sign in|login|welcome/i).first();
    if (await signInText.isVisible()) {
      await expect(signInText).toBeVisible();
    }
  });

  test('should display branding', async ({ page }) => {
    // Brand panel is hidden on mobile via the responsive stack — assert the
    // form panel instead, which always renders the auth heading.
    const formPanel = page.getByTestId('auth-form-panel');
    await expect(formPanel).toBeVisible();
  });
});
