import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should validate email format in registration mode', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString(36);

    const registerTab = page.getByTestId('auth-tab-register');
    await expect(registerTab).toBeVisible({});
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');
    const ageTermsCheckbox = page.getByTestId('auth-age-terms-checkbox');

    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    await emailInput.fill('invalid-email');
    await passwordInput.fill('Password123!');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(`user${uniqueId}`);
    await usernameInput.blur();
    await expect(ageTermsCheckbox).toBeVisible();
    await ageTermsCheckbox.click();

    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    await submitBtn.click({ force: true });
    const errorMsg = page.getByText(/valid email address|корректный адрес/i);
    await expect(errorMsg).toBeVisible();

    await emailInput.fill(`test${uniqueId}@example.com`);
    await emailInput.blur();
    await expect(errorMsg).not.toBeVisible();
    await expect(submitBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('should require 18+ and terms agreement checkbox in registration mode', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString(36);

    const registerTab = page.getByTestId('auth-tab-register');
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');
    const ageTermsCheckbox = page.getByTestId('auth-age-terms-checkbox');

    await emailInput.fill(`user_${uniqueId}@example.com`);
    await passwordInput.fill('Password123!');
    await usernameInput.fill(`user${uniqueId}`);
    await usernameInput.blur();

    await expect(ageTermsCheckbox).toBeVisible();
    await expect(ageTermsCheckbox).toHaveAttribute('aria-checked', 'false');
    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    await ageTermsCheckbox.click();
    await expect(ageTermsCheckbox).toHaveAttribute('aria-checked', 'true');
    await expect(submitBtn).not.toHaveAttribute('aria-disabled', 'true');

    await ageTermsCheckbox.click();
    await expect(ageTermsCheckbox).toHaveAttribute('aria-checked', 'false');
    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
  });
});
