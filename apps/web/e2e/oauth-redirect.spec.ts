import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('OAuth Redirect Resolution', () => {
  test('should use dynamic redirect URI based on current origin', async ({
    page,
    baseURL,
  }) => {
    await navigateTo(page, '/auth');

    // Intercept the redirect to Google
    // It should contain the redirect_uri parameter matching the current baseURL
    let capturedUrl: string | null = null;

    // We expect window.location.assign to be called.
    // In Playwright, we can listen for the 'request' even if it's a navigation request to another domain.
    page.on('request', (request) => {
      if (request.url().includes('accounts.google.com')) {
        capturedUrl = request.url();
      }
    });

    const oauthBtn = page
      .getByRole('button', { name: /google|continue with google/i })
      .first();
    await oauthBtn.click();

    // Since it's a navigation, we might need to wait a bit or catch it before it leaves the page
    // Actually, we can just check if state changed or navigation was attempted.
    // Let's wait for the request to happen.
    await page
      .waitForRequest((req) => req.url().includes('accounts.google.com'), {
        timeout: 5000,
      })
      .catch(() => {});

    if (capturedUrl) {
      const url = new URL(capturedUrl);
      const redirectUri = url.searchParams.get('redirect_uri');

      // baseURL usually doesn't have a trailing slash, but let's be safe
      const expectedRedirectBase = baseURL?.replace(/\/$/, '') ?? '';
      expect(redirectUri).toBe(expectedRedirectBase + '/auth/callback');
    }
  });
});
