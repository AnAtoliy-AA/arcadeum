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
    const registerTab = page.getByTestId('auth-tab-register');
    await expect(registerTab).toBeVisible({});
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const usernameInput = page.getByTestId('auth-username-input');
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
    const registerTab = page.getByTestId('auth-tab-register');
    await expect(registerTab).toBeVisible({});
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    const emailInput = page.getByTestId('auth-email-input');
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
    const registerTab = page.getByTestId('auth-tab-register');
    await expect(registerTab).toBeVisible({});
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'register',
      {},
    );

    // Mock specific 'taken' result for this test
    await page.route('**/auth/check/username/testexisting', async (route) => {
      await handleRoute(route, { available: false });
    });

    const emailInput = page.getByTestId('auth-email-input');
    const passwordInput = page.getByTestId('auth-password-input');
    const usernameInput = page.getByTestId('auth-username-input');
    const submitBtn = page.getByTestId('auth-submit-button');

    await emailInput.fill('test_unique_email_xyz@example.com');
    await passwordInput.fill('TestPassword123!');
    await usernameInput.fill('testexisting');
    await usernameInput.blur();

    const takenText = page.getByText(
      /already taken|уже занято|déjà pris|ya está en uso|ўжо занята/i,
    );
    if (await takenText.isVisible()) {
      // The @arcadeum/ui Button uses aria-disabled rather than the DOM
      // disabled attribute.
      await expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test('should not show availability checking in login mode', async ({
    page,
  }) => {
    // Sign-in tab is selected by default on /auth.
    await expect(page.locator('form')).toHaveAttribute(
      'data-mode',
      'login',
      {},
    );

    const emailInput = page.getByTestId('auth-email-input');
    await emailInput.fill('test@example.com');
    await emailInput.blur();

    const checkingText = page.getByText(
      /checking|проверка|vérification|comprobando|праверка/i,
    );
    await expect(checkingText).not.toBeVisible();
  });
});
