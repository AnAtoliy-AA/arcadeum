/**
 * Server-side auth refresh (auth audit).
 *
 * The httpOnly access cookie lives 15 minutes and used to be renewed only by
 * the browser, so Server Components and Server Actions (which run in Node and
 * only see cookies) failed with 401 once it expired. `proxy.ts` and
 * `serverAuthFetch` now exchange the refresh cookie server-side.
 *
 * This spec signs in against the real e2e backend (needs the in-memory Mongo
 * from global-setup), deletes ONLY the access cookie, deliberately seeds no
 * client session token (so nothing but the refresh cookie can authenticate),
 * and then drives a Server Component fetch and a Server Action.
 */
import { test, expect, navigateTo } from './fixtures/test-utils';
import { createRealUser } from './fixtures/arcade-pet-real';

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

test.describe('server-side session refresh', () => {
  // The backend sets Secure cookies; only Chromium stores them on 127.0.0.1.
  test.skip(({ browserName }) => browserName !== 'chromium');

  test('claims the daily reward after the access cookie expired', async ({
    page,
  }) => {
    const context = page.context();
    // The context's request shares its cookie jar, so the Set-Cookie headers
    // from /auth/login land in the browser like a real sign-in.
    await createRealUser(context.request, 'authrefresh');

    const names = async () => (await context.cookies()).map((c) => c.name);
    expect(await names()).toContain(ACCESS);
    expect(await names()).toContain(REFRESH);
    const refreshBefore = (await context.cookies()).find(
      (c) => c.name === REFRESH,
    )?.value;

    // Simulate the 15 minute expiry: the browser drops the access cookie.
    await context.clearCookies({ name: ACCESS });
    expect(await names()).not.toContain(ACCESS);

    // Server Component path: SSR must refresh instead of rendering signed out.
    await navigateTo(page, '/wallet');
    const claim = page.getByTestId('daily-reward-claim-btn');
    await expect(claim).toBeVisible();
    expect(await names()).toContain(ACCESS);

    // Server Action path: expire again, then claim.
    await context.clearCookies({ name: ACCESS });
    await claim.click();
    await expect(page.getByTestId('daily-reward-success')).toBeVisible();
    await expect(page.getByTestId('daily-reward-error')).toHaveCount(0);

    // The rotated refresh token was persisted back to the browser.
    const refreshAfter = (await context.cookies()).find(
      (c) => c.name === REFRESH,
    )?.value;
    expect(refreshAfter).toBeTruthy();
    expect(refreshAfter).not.toBe(refreshBefore);
  });
});
