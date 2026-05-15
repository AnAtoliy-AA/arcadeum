import { expect } from '@playwright/test';
import { test, navigateTo, getIsMobile } from './fixtures/test-utils';

test.describe('Sign-in redesign (ARC-690)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('renders brand panel + auth card + PWA strip', async ({ page }) => {
    await expect(page.getByTestId('auth-page-root')).toBeVisible();
    await expect(page.getByTestId('auth-form-panel')).toBeVisible();
    await expect(page.getByTestId('auth-tab-signin')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    if (!getIsMobile(page)) {
      await expect(page.getByTestId('auth-brand-panel')).toBeVisible();
    }
  });

  test('switches to register mode when the Create account tab is clicked', async ({
    page,
  }) => {
    await page.getByTestId('auth-tab-register').click();
    await expect(page.getByTestId('auth-tab-register')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByTestId('auth-username-input')).toBeVisible();
  });

  test('Apple and Discord OAuth buttons are disabled placeholders', async ({
    page,
  }) => {
    await expect(page.getByTestId('auth-oauth-apple')).toBeDisabled();
    await expect(page.getByTestId('auth-oauth-discord')).toBeDisabled();
    await expect(page.getByTestId('auth-oauth-google')).toBeEnabled();
  });

  test('magic-link CTA shows the success screen and can be backed out', async ({
    page,
  }) => {
    await page.getByTestId('auth-email-input').fill('player@example.com');
    await page.getByTestId('auth-magic-link-cta').click();
    await expect(page.getByTestId('auth-magic-link-success')).toBeVisible();
    await expect(page.getByText('Check your inbox')).toBeVisible();
    await page.getByTestId('auth-magic-link-back').click();
    await expect(page.getByTestId('auth-form-panel')).toBeVisible();
  });

  test('show/hide password toggle flips the password input type', async ({
    page,
  }) => {
    const password = page.getByTestId('auth-password-input');
    await password.fill('hunter2');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByTestId('auth-password-toggle').click();
    await expect(password).toHaveAttribute('type', 'text');
  });
});
