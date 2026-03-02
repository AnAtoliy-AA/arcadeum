import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should validate email format in registration mode', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString(36);

    // 1. Switch to Register mode
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      { timeout: 10000 },
    );
    const confirmInput = page.getByTestId('auth-confirm-password-input');

    // 2. Locate fields
    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    // 3. Initially button should be disabled (fields are empty)
    await expect(submitBtn).toBeDisabled();

    // 4. Type invalid email
    await emailInput.fill('invalid-email');

    // 5. Fill other required fields
    await passwordInput.fill('Password123!');
    await confirmInput.fill('Password123!');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(`user${uniqueId}`);

    // 6. Button should still be disabled for invalid email
    await expect(submitBtn).toBeDisabled();

    // 7. Trigger validation error by attempting to click (force click since it's disabled)
    // or by blurring. Our handleLocalSubmit shows the error if email is invalid.
    await submitBtn.click({ force: true });

    // 8. Verify error message is shown
    const errorMsg = page.getByText(/valid email address|корректный адрес/i);
    await expect(errorMsg).toBeVisible();

    // 9. Correct the email with a unique value
    await emailInput.fill(`test${uniqueId}@example.com`);

    // 10. Error should disappear (we hide it on change in useAuthForm)
    await expect(errorMsg).not.toBeVisible();

    // 11. Button should now be enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('should validate password match in registration mode', async ({
    page,
  }) => {
    // 1. Switch to Register mode
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      { timeout: 10000 },
    );

    const confirmInput = page.getByTestId('auth-confirm-password-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    // 2. Fill mismatched passwords
    await passwordInput.fill('password123');
    await confirmInput.fill('password456');

    // 3. Verify error message for mismatch
    const mismatchMsg = page.getByText(/do not match|не совпадают/i);
    await expect(mismatchMsg).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // 4. Correct the password
    await confirmInput.fill('password123');

    // 5. Mismatch should disappear
    await expect(mismatchMsg).not.toBeVisible();
  });
});
