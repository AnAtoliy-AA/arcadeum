import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Referral Code Registration', () => {
  test('should allow entering a referral code during registration', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString(36);
    await navigateTo(page, '/auth');

    // 1. Switch to Register mode
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
      // Wait for form to actually switch mode
      await expect(page.locator('form')).toHaveAttribute(
        'data-mode',
        'register',
        { timeout: 10000 },
      );
    }

    // 2. Locate fields
    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const confirmInput = page.getByTestId('auth-confirm-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const referralCodeInput = page.getByTestId('auth-referral-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    // 3. Optional Referral Code Input should be visible
    await expect(referralCodeInput).toBeVisible();

    // 4. Fill required fields
    await emailInput.fill(`test_ref_${uniqueId}@example.com`);
    await passwordInput.fill('Password123!');
    await confirmInput.fill('Password123!');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(`user_${uniqueId}`);
    }

    // Wait for validation to pass (debounced checks)
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    // 5. Fill referral code
    await referralCodeInput.fill('SOME_REFERRAL_CODE');

    // 6. Submit the form and intercept the network request
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/auth/register') && request.method() === 'POST',
    );

    await submitBtn.click();

    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || '{}');

    // 7. Assert that the referralCode was sent in the payload
    expect(postData.referralCode).toBe('SOME_REFERRAL_CODE');
  });

  test('should pre-fill referral code from URL query parameter', async ({
    page,
  }) => {
    // 1. Navigate directly with the query parameter
    await navigateTo(page, '/auth?ref=FRIEND_CODE_123');

    // 2. Wait for registration mode to be active
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    // In register mode, the toggle button should offer to go back to login
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      { timeout: 10000 },
    );

    // 3. Locate the referral code input
    const referralCodeInput = page.getByTestId('auth-referral-input');

    // 4. It should be visible and its value should be pre-filled
    await expect(referralCodeInput).toBeVisible();
    await expect(referralCodeInput).toHaveValue('FRIEND_CODE_123');
  });
});
