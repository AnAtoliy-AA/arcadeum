import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should validate email format in registration mode', async ({
    page,
  }) => {
    // 1. Switch to Register mode
    const registerToggle = page.getByRole('button', {
      name: /need an account|регистрация|account/i,
    });
    // If we're already in register mode, the toggle will say "Already have an account?"
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    // 2. Locate fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[placeholder*="confirm" i]');
    const usernameInput = page.locator('input[placeholder*="username" i]');
    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();

    // 3. Initially button should be disabled (fields are empty)
    await expect(submitBtn).toBeDisabled();

    // 4. Type invalid email
    await emailInput.fill('invalid-email');

    // 5. Fill other required fields
    await passwordInput.fill('Password123!');
    await confirmInput.fill('Password123!');

    // Check if username input is visible (it should be in register mode)
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('testuser');
    }

    // 6. Button should still be disabled for invalid email
    await expect(submitBtn).toBeDisabled();

    // 7. Trigger validation error by attempting to click (force click since it's disabled)
    // or by blurring. Our handleLocalSubmit shows the error if email is invalid.
    await submitBtn.click({ force: true });

    // 8. Verify error message is shown
    const errorMsg = page.getByText(/valid email address|корректный адрес/i);
    await expect(errorMsg).toBeVisible();

    // 9. Correct the email
    await emailInput.fill('test@example.com');

    // 10. Error should disappear (we hide it on change in useAuthForm)
    await expect(errorMsg).not.toBeVisible();

    // 11. Button should now be enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('should validate password match in registration mode', async ({
    page,
  }) => {
    // 1. Switch to Register mode
    const registerToggle = page.getByRole('button', {
      name: /need an account|регистрация|account/i,
    });
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[placeholder*="confirm" i]');
    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();

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
