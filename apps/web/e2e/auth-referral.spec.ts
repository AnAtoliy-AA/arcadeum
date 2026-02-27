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
    const toggleBtn = page.getByRole('button', {
      name: /need an account|регистрация|account/i,
    });
    await toggleBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    if (await toggleBtn.isVisible()) {
      const text = (await toggleBtn.textContent()) || '';
      if (!/already|уже/i.test(text)) {
        await toggleBtn.click();
      }
    }

    // 2. Locate fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[placeholder*="confirm" i]');
    const usernameInput = page.locator('input[placeholder*="username" i]');
    const referralCodeInput = page.locator('input[placeholder*="Referral" i]');
    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();

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

    // 2. The form should automatically be in register mode.
    // We can verify this by checking if the username or confirm password fields are visible
    // or if the submit button says "Sign up" / "Register".
    // We use a generic locator and wait for the text to change to the "register" label
    // since the mode toggle happens asynchronously in an useEffect.
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toHaveText(
      /create account|register|sign up|зарегистрироваться/i,
      { timeout: 10000 },
    );
    await expect(submitBtn).toBeVisible();

    // 3. Locate the referral code input
    const referralCodeInput = page.locator('input[placeholder*="Referral" i]');

    // 4. It should be visible and its value should be pre-filled
    await expect(referralCodeInput).toBeVisible();
    await expect(referralCodeInput).toHaveValue('FRIEND_CODE_123');
  });
});
