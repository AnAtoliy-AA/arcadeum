import { expect } from '@playwright/test';
import { test, handleRoute } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

// Covers the /auth/forgot + /auth/reset routes wired in ARC-748. Each test
// owns its mocks so the BE never has to be live: the FE only needs to know
// the request shape and the success/failure status code.

test.describe('Password reset flow', () => {
  test('sign-in form links to /auth/forgot', async ({ page }) => {
    await navigateTo(page, '/auth');
    // The forgot-password link only renders in sign-in mode (the default).
    const link = page.getByRole('link', {
      name: /forgot password|забыли пароль|забылі пароль|mot de passe|olvidaste/i,
    });
    await expect(link.first()).toBeVisible();
    await expect(link.first()).toHaveAttribute('href', /\/auth\/forgot$/);
  });

  test('forgot page rejects invalid email and accepts valid email', async ({
    page,
  }) => {
    let forgotPosts = 0;
    await page.route('**/auth/forgot', async (route) => {
      if (route.request().method() === 'POST') {
        forgotPosts += 1;
        await route.fulfill({ status: 204, body: '' });
        return;
      }
      await route.continue();
    });

    await navigateTo(page, '/auth/forgot');

    const emailInput = page.getByTestId('forgot-password-email');
    const submit = page.getByTestId('forgot-password-submit');

    // Invalid email → client-side validation, no network call.
    await emailInput.fill('not-an-email');
    await submit.click();
    await expect(page.getByTestId('forgot-password-error')).toBeVisible();
    expect(forgotPosts).toBe(0);

    // Valid email → BE call, success view.
    await emailInput.fill('player@example.com');
    await submit.click();
    await expect(page.getByTestId('forgot-password-success')).toBeVisible();
    expect(forgotPosts).toBe(1);
  });

  test('reset page without token surfaces a clear error', async ({ page }) => {
    await navigateTo(page, '/auth/reset');
    await expect(page.getByTestId('reset-password-error')).toBeVisible();
    await expect(page.getByTestId('reset-password-submit')).toBeDisabled();
  });

  test('reset page flags mismatched passwords before calling BE', async ({
    page,
  }) => {
    let resetPosts = 0;
    await page.route('**/auth/reset', async (route) => {
      if (route.request().method() === 'POST') {
        resetPosts += 1;
        await handleRoute(route, { ok: true });
        return;
      }
      await route.continue();
    });

    await navigateTo(page, '/auth/reset?token=any-token-here-is-fine');

    const password = page.getByTestId('reset-password-input');
    const confirm = page.getByTestId('reset-password-confirm');
    const submit = page.getByTestId('reset-password-submit');

    await password.fill('newpassword1');
    await confirm.fill('different-one');
    await submit.click();

    await expect(page.getByTestId('reset-password-error')).toBeVisible();
    expect(resetPosts).toBe(0);
  });

  test('reset page surfaces invalid-token error on 401', async ({ page }) => {
    await page.route('**/auth/reset', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid or expired reset token' }),
        });
        return;
      }
      await route.continue();
    });

    await navigateTo(page, '/auth/reset?token=expired-token');

    const password = page.getByTestId('reset-password-input');
    const confirm = page.getByTestId('reset-password-confirm');
    await password.fill('newpassword1');
    await confirm.fill('newpassword1');
    await page.getByTestId('reset-password-submit').click();

    const err = page.getByTestId('reset-password-error');
    await expect(err).toBeVisible();
    await expect(err).toContainText(/invalid|expired|истекл|нядзейс|expir|caducad/i);
  });

  test('reset page shows success state on 200', async ({ page }) => {
    await page.route('**/auth/reset', async (route) => {
      if (route.request().method() === 'POST') {
        await handleRoute(route, { ok: true });
        return;
      }
      await route.continue();
    });

    await navigateTo(page, '/auth/reset?token=good-token-here');

    const password = page.getByTestId('reset-password-input');
    const confirm = page.getByTestId('reset-password-confirm');
    await password.fill('newpassword1');
    await confirm.fill('newpassword1');
    await page.getByTestId('reset-password-submit').click();

    await expect(page.getByTestId('reset-password-success')).toBeVisible();
    await expect(page.getByTestId('reset-password-signin-cta')).toBeVisible();
  });
});
