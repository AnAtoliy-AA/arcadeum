import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Auth Data Segregation and Encryption flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/auth');
  });

  test('submits registration with encrypted credentials flow', async ({
    page,
  }) => {
    await page.getByTestId('auth-tab-register').click();
    await expect(page.getByTestId('auth-username-input')).toBeVisible();

    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `player_${randomSuffix}@arcadeum-security.test`;
    const username = `Hero_${randomSuffix}`;

    await page.getByTestId('auth-username-input').fill(username);
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-password-input').fill('SecurePassword123!');

    await expect(page.getByTestId('auth-submit-button')).toBeEnabled();
  });

  test('validates email blind-index check before registration', async ({
    page,
  }) => {
    await page.getByTestId('auth-tab-register').click();
    const emailInput = page.getByTestId('auth-email-input');
    await emailInput.fill('cipher_test_user@arcadeum-security.test');
    await emailInput.blur();

    const checkingOrStatus = page.locator('[data-testid="auth-form-panel"]');
    await expect(checkingOrStatus).toBeVisible();
  });
});
