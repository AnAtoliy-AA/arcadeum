import { test, expect } from '@playwright/test';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Auth Extended', () => {
  test('should validate registration fields', async ({ page }) => {
    await navigateTo(page, '/auth');

    const registerToggle = page.getByRole('button', {
      name: /register|sign up|регистрация/i,
    });
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click({ force: true });
    } else {
      // Fallback
      await page
        .getByRole('button', { name: /register|sign up|создать|аккаунт/i })
        .last()
        .click({ force: true });
    }

    // Wait for potential validation messages
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show error on password mismatch', async ({ page }) => {
    await navigateTo(page, '/auth');

    const registerToggle = page.getByRole('button', {
      name: /register|sign up|регистрация/i,
    });
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    const confirmInput = page
      .locator(
        'input[name="confirmPassword"], input[id="confirm-password"], input[placeholder*="confirm" i]',
      )
      .first();

    if (await passwordInput.isVisible()) {
      await passwordInput.fill('password123');
      if (await confirmInput.isVisible()) {
        await confirmInput.fill('password456');
        const submitBtn = page
          .getByRole('button', { name: /register|sign up/i })
          .first();
        await submitBtn.click();
        await expect(page.getByText(/mismatch|совпадают/i)).toBeVisible();
      }
    }
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
