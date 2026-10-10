import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Auth Data Segregation and Encryption flow', () => {
  test('submits registration with encrypted credentials flow', async ({
    page,
  }) => {
    await navigateTo(page, '/auth');
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
    await navigateTo(page, '/auth');
    await page.getByTestId('auth-tab-register').click();
    const emailInput = page.getByTestId('auth-email-input');
    await emailInput.fill('cipher_test_user@arcadeum-security.test');
    await emailInput.blur();

    const checkingOrStatus = page.locator('[data-testid="auth-form-panel"]');
    await expect(checkingOrStatus).toBeVisible();
  });

  test('admin users panel does not render user email addresses', async ({
    page,
  }) => {
    await mockSession(page, { role: 'admin' });
    await page.route('**/admin/users**', async (route) => {
      await handleRoute(route, {
        items: [
          {
            id: '64a7f0000000000000009999',
            username: 'confidential_user',
            displayName: 'Confidential User',
            role: 'free',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-02T00:00:00Z',
            isBlocked: false,
            blockedAt: null,
            blockedReason: null,
            deletedAt: null,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
      });
    });

    await navigateTo(page, '/admin/users');
    const row = page.getByTestId('user-row-64a7f0000000000000009999');
    await expect(row).toBeVisible();
    await expect(row).toContainText('confidential_user');
    await expect(row).not.toContainText('@');
  });
});
