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

    // 1. Switch to Register mode via the segmented tab
    const registerTab = page.getByTestId('auth-tab-register');
    await expect(registerTab).toBeVisible({});
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    // 2. Locate fields
    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    // 3. Initially submit should be disabled (fields are empty). Tamagui
    //    Button uses aria-disabled rather than the DOM disabled attribute.
    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    // 4. Type invalid email + the rest of the required fields
    await emailInput.fill('invalid-email');
    await passwordInput.fill('Password123!');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(`user${uniqueId}`);

    // 5. Submit should remain disabled while the email is invalid
    await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    // 6. Force-clicking the disabled submit reveals the validation message
    await submitBtn.click({ force: true });
    const errorMsg = page.getByText(/valid email address|корректный адрес/i);
    await expect(errorMsg).toBeVisible();

    // 7. Correct the email — error disappears and submit becomes enabled
    await emailInput.fill(`test${uniqueId}@example.com`);
    await expect(errorMsg).not.toBeVisible();
    await expect(submitBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  // The ARC-690 redesign removed the confirm-password field from the
  // register form. The mismatch validation lives on in useAuthForm but
  // cannot be triggered from the UI; AuthFormPanel.test.tsx covers the
  // label-rendering branch directly.
  test.skip('should validate password match in registration mode', async ({
    page,
  }) => {
    await navigateTo(page, '/auth');
  });
});
