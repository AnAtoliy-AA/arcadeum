import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  getIsMobile,
} from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockSettingsExtraData,
} from './fixtures/test-utils';

test.describe('Auth Extended', () => {
  test('should validate registration fields', async ({ page }) => {
    await navigateTo(page, '/auth');
    await page.waitForLoadState('networkidle');

    const toggleBtn = page.getByTestId('auth-toggle-mode-button').first();
    await expect(toggleBtn).toBeEnabled({});
    const text = (await toggleBtn.textContent()) || '';
    if (/need|регистрация|account/i.test(text) && !/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }

    // Wait for form to actually switch mode
    const form = page.locator('form');
    await expect(form).toHaveAttribute('data-mode', 'register', {});

    const confirmInput = page.getByTestId('auth-confirm-password-input');
    await expect(confirmInput).toBeVisible({});

    const passwordInput = page.getByTestId('auth-password-input');

    await passwordInput.fill('password123');
    await confirmInput.fill('password456');
    await confirmInput.blur();
    // The password mismatch error should appear immediately
    await expect(page.getByText(/do not match|не совпадают/i)).toBeVisible({});

    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();
    await expect(submitBtn).toBeDisabled({});
  });

  test('should persist session after manual reload', async ({ page }) => {
    await mockSession(page);
    await mockSettingsExtraData(page);
    await navigateTo(page, '/settings');
    await expect(page).toHaveURL(/\/settings/);

    // Setup listener before reloading to avoid race conditions.
    // We use a promise so we can wait for it after the reload action starts.
    const responsePromise = page
      .waitForResponse((res) => res.url().includes('auth/blocked'), {})
      .catch(() => null);

    await page.reload();
    await expect(page).toHaveURL(/\/settings/);

    // Wait for the background fetches to settle
    await responsePromise;
  });

  test('should handle logout', async ({ page }) => {
    await navigateTo(page, '/auth');
    await page.waitForLoadState('networkidle');
    await mockSession(page, { persistent: false });
    await mockSettingsExtraData(page);
    await navigateTo(page, '/settings');

    if (getIsMobile(page)) {
      // 1. Open mobile menu
      await ensureNavigationVisible(page);
    } else {
      // 1. Open profile menu
      const menuToggle = page.getByTestId('header-username');
      await expect(menuToggle).toBeVisible({});
      await menuToggle.click({ force: true });
    }

    // 2. Click logout (disambiguate from desktop/mobile menus)
    const logoutBtn = getIsMobile(page)
      ? page.getByTestId('mobile-logout-button')
      : page.getByTestId('desktop-logout-button');

    // Wait for button to be ready (especially on Mobile Safari where Zustand
    // rehydration + React reconciliation can take a moment)
    await expect(logoutBtn).toBeVisible({});

    // 3. Verify session is cleared and redirected
    await Promise.all([
      page.waitForURL(/\/(auth|login)?$/, {}),
      logoutBtn.click({ force: true }),
    ]);
  });
});
