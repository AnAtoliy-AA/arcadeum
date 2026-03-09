import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  getIsMobile,
} from './fixtures/test-utils';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Auth Extended', () => {
  test('should validate registration fields', async ({ page }) => {
    await navigateTo(page, '/auth');

    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    if (await toggleBtn.isVisible()) {
      const text = (await toggleBtn.textContent()) || '';
      if (
        /need|регистрация|account/i.test(text) &&
        !/already|уже/i.test(text)
      ) {
        await toggleBtn.click({ force: true });
      }
    }

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click({ force: true });

    await expect(page.locator('form')).toBeVisible();
  });

  test('should show error on password mismatch', async ({ page }) => {
    await navigateTo(page, '/auth');

    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await expect(toggleBtn).toBeEnabled({ timeout: 10000 });
    const text = (await toggleBtn.textContent()) || '';
    if (/need|регистрация|account/i.test(text) && !/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }

    // Wait for form to actually switch mode
    const form = page.locator('form');
    await expect(form).toHaveAttribute('data-mode', 'register', {
      timeout: 10000,
    });

    const confirmInput = page.getByTestId('auth-confirm-password-input');
    await expect(confirmInput).toBeVisible({ timeout: 10000 });

    const passwordInput = page.getByTestId('auth-password-input');

    await passwordInput.fill('password123');
    await confirmInput.fill('password456');
    // The password mismatch error should appear immediately
    await expect(page.getByText(/do not match|не совпадают/i)).toBeVisible();

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
    await expect(page).toHaveURL(/\/settings/);
    await page.reload();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should handle logout', async ({ page }) => {
    await mockSession(page, { persistent: false });
    await navigateTo(page, '/settings');

    if (getIsMobile(page)) {
      // 1. Open mobile menu
      await ensureNavigationVisible(page);
    } else {
      // 1. Open profile menu
      const menuToggle = page.getByTestId('header-username');
      await expect(menuToggle).toBeVisible({ timeout: 10000 });
      await menuToggle.click({ force: true });
    }

    // 2. Click logout (disambiguate from desktop/mobile menus)
    const logoutBtn = getIsMobile(page)
      ? page.getByTestId('mobile-logout-button')
      : page.getByTestId('desktop-logout-button');

    // Wait for button to be ready (especially on Mobile Safari)
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // 3. Verify session is cleared and redirected
    await Promise.all([
      page.waitForURL(/\/(auth|login)?$/, { timeout: 30000 }),
      logoutBtn.click({ force: true }),
    ]);
  });
});
