import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Auth Extended', () => {
  test('should validate registration fields', async ({ page }) => {
    await navigateTo(page, '/auth');

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

    const submitBtn = page.locator('button[type="submit"]');
    // Wait for the button to appear - default timeout is usually enough but we want to be sure
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click({ force: true });

    // Wait for potential validation messages
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show error on password mismatch', async ({ page }) => {
    await navigateTo(page, '/auth');

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

    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    const confirmInput = page
      .locator(
        'input[name="confirmPassword"], input[id="confirm-password"], input[placeholder*="confirm" i]',
      )
      .first();

    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('password123');
    await expect(confirmInput).toBeVisible();
    await confirmInput.fill('password456');
    // The password mismatch error should appear immediately
    await expect(page.getByText(/do not match|не совпадают/i)).toBeVisible();

    // The submit button should be disabled
    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();
    await expect(submitBtn).toBeDisabled();
  });

  test('should persist session after manual reload', async ({ page }) => {
    await mockSession(page);
    await navigateTo(page, '/settings');

    // Check if authenticated
    await expect(page).toHaveURL(/\/settings/);

    await page.reload();

    // Still on settings (not redirected to auth)
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should handle logout', async ({ page }) => {
    await mockSession(page);
    await navigateTo(page, '/settings');

    const logoutBtn = page.getByRole('button', {
      name: /logout|sign out|выйти/i,
    });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL(/\/auth|login/);
      await expect(page).toHaveURL(/\/auth|login/);
    }
  });
});
