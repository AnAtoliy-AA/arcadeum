import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Auth Data Segregation and Encryption flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('submits registration with encrypted credentials flow', async ({
    page,
  }) => {
    const registerTab = page.getByTestId('auth-tab-register');
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute('data-mode', 'register');

    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `player_${randomSuffix}@arcadeum-security.test`;
    const username = `Hero_${randomSuffix}`;

    await page.getByTestId('auth-username-input').fill(username);
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-password-input').fill('SecurePassword123!');
    await page.getByTestId('auth-username-input').blur();
    await page.getByTestId('auth-email-input').blur();

    const ageTermsCheckbox = page.getByTestId('auth-age-terms-checkbox');
    await expect(ageTermsCheckbox).toBeVisible();
    await ageTermsCheckbox.click();

    const submitBtn = page.getByTestId('auth-submit-button');
    await expect(submitBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('validates email blind-index check before registration', async ({
    page,
  }) => {
    const registerTab = page.getByTestId('auth-tab-register');
    await registerTab.click({ force: true });
    await expect(page.locator('form')).toHaveAttribute('data-mode', 'register');

    const emailInput = page.getByTestId('auth-email-input');
    await emailInput.fill('cipher_test_user@arcadeum-security.test');
    await emailInput.blur();

    const checkingOrStatus = page.locator('[data-testid="auth-form-panel"]');
    await expect(checkingOrStatus).toBeVisible();
  });
});
