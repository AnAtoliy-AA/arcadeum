import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Referral Code Registration', () => {
  // The ARC-690 redesign removed the in-form referral input — referral
  // capture is being moved to onboarding (see TODOs in useAuthForm.ts).
  // Manual entry from the sign-up card is no longer a supported flow.
  test.skip(
    'should allow entering a referral code during registration',
    async ({ page }) => {
      await navigateTo(page, '/auth');
    },
  );

  test('should forward URL referral code into the register payload', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString(36);

    // 1. Navigate with the referral query parameter
    await navigateTo(page, '/auth?ref=FRIEND_CODE_123');

    // 2. The hook auto-switches to register mode when a referral param is
    //    present.
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    // 3. Fill the visible required fields
    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    await emailInput.fill(`test_ref_${uniqueId}@example.com`);
    await passwordInput.fill('Password123!');
    await usernameInput.fill(`user_${uniqueId}`);
    await usernameInput.blur();

    // 4. Intercept the register POST and assert the referral was forwarded
    //    from the URL, even though no UI input exposes it.
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/auth/register') && request.method() === 'POST',
    );

    // Tamagui Button uses aria-disabled rather than the disabled attribute;
    // force-click to avoid waiting on the visual disabled state.
    await submitBtn.click({ force: true });

    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || '{}');

    expect(postData.referralCode).toBe('FRIEND_CODE_123');
  });
});
