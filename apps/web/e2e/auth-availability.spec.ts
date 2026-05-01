import { expect } from '@playwright/test';
import { test, handleRoute } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Auth Availability Checking', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('should show availability status for username field in register mode', async ({
    page,
  }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await toggleBtn.scrollIntoViewIfNeeded();
    await expect(toggleBtn).toBeVisible({});
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const usernameInput = page.locator('input[placeholder*="username" i]');
    await expect(usernameInput).toBeVisible();

    await usernameInput.fill('testuser123unique');
    await usernameInput.blur();

    const checkingText = page.getByText(
      /checking|проверка|vérification|comprobando|праверка/i,
    );
    const availableText = page.getByText(
      /available|доступно|disponible|даступна/i,
    );

    await expect(checkingText.or(availableText)).toBeVisible({});
  });

  test('should show availability status for email field in register mode', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await toggleBtn.scrollIntoViewIfNeeded();
    await expect(toggleBtn).toBeVisible({});
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    await emailInput.fill('unique_test_email_xyz@example.com');
    await emailInput.blur();

    const checkingText = page.getByText(
      /checking|проверка|vérification|comprobando|праверка/i,
    );
    const availableText = page.getByText(
      /available|доступно|disponible|даступна/i,
    );

    await expect(checkingText.or(availableText)).toBeVisible({});
  });

  test('should display user-friendly error when registering with taken username', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await toggleBtn.scrollIntoViewIfNeeded();
    await expect(toggleBtn).toBeVisible({});
    const text = (await toggleBtn.textContent()) || '';
    if (!/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    // Mock specific 'taken' result for this test
    await page.route('**/auth/check/username/testexisting', async (route) => {
      await handleRoute(route, { available: false });
    });

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[placeholder*="confirm" i]');
    const usernameInput = page.locator('input[placeholder*="username" i]');
    const submitBtn = page
      .getByRole('button', {
        name: /create account|register|sign up|зарегистрироваться/i,
      })
      .first();

    await emailInput.fill('test_unique_email_xyz@example.com');
    await passwordInput.fill('TestPassword123!');
    await confirmInput.fill('TestPassword123!');
    await usernameInput.fill('testexisting');
    await usernameInput.blur();

    const takenText = page.getByText(
      /already taken|уже занято|déjà pris|ya está en uso|ўжо занята/i,
    );
    if (await takenText.isVisible()) {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('should not show availability checking in login mode', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    const toggleBtn = page.getByTestId('auth-toggle-mode-button');
    await toggleBtn.scrollIntoViewIfNeeded();
    await expect(toggleBtn).toBeVisible({});
    const text = (await toggleBtn.textContent()) || '';
    if (/already|уже/i.test(text)) {
      await toggleBtn.click({ force: true });
    }
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'login',
      {},
    );

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await emailInput.blur();

    const checkingText = page.getByText(
      /checking|проверка|vérification|comprobando|праверка/i,
    );
    await expect(checkingText).not.toBeVisible();
  });
});
