import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('OAuth Redirect Resolution', () => {
  test('should use dynamic redirect URI based on current origin', async ({
    page,
    baseURL,
  }) => {
    await navigateTo(page, '/auth');

    const oauthBtn = page
      .getByRole('button', { name: /google|continue with google/i })
      .first();
    // Wait for the request to happen with a promise
    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('accounts.google.com/o/oauth2/v2/auth'),
      {
        timeout: 10000,
      },
    );

    await oauthBtn.click();

    try {
      const request = await requestPromise;
      const url = new URL(request.url());
      const redirectUri = url.searchParams.get('redirect_uri');

      // baseURL usually doesn't have a trailing slash, but let's be safe
      const expectedRedirectBase = baseURL?.replace(/\/$/, '') ?? '';
      expect(redirectUri).toBe(expectedRedirectBase + '/auth/callback');
    } catch (e) {
      console.error('OAuth request timeout or failure', e);
      throw e;
    }
  });
});
