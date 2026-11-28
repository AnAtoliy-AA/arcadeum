/**
 * Admin access after the access cookie expired (staging "bare 404" bug).
 *
 * `proxy.ts` answers anonymous admin requests with a 404 before rendering.
 * A signed-in admin whose 15 minute access cookie is gone must not hit that
 * gate: the proxy exchanges the refresh cookie server-side and the admin
 * layout renders. Non-admins and anonymous visitors still get not-found.
 *
 * Runs against the real e2e backend; the admin role is granted directly in
 * the in-memory Mongo that global-setup started (no admin signup exists).
 */
import { MongoClient, ObjectId } from 'mongodb';
import { test, expect, navigateTo } from './fixtures/test-utils';
import { createRealUser } from './fixtures/arcade-pet-real';

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

async function grantAdmin(userId: string): Promise<void> {
  const uri = process.env.MONGODB_OCI_URI;
  if (!uri) throw new Error('MONGODB_OCI_URI is not set (global-setup)');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const res = await client
      .db()
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: { role: 'admin' } });
    if (res.matchedCount !== 1) throw new Error(`user ${userId} not found`);
  } finally {
    await client.close();
  }
}

test.describe('admin access after access-cookie expiry', () => {
  // The backend sets Secure cookies; only Chromium stores them on 127.0.0.1.
  test.skip(({ browserName }) => browserName !== 'chromium');

  test('admin reaches the dashboard via the refresh cookie', async ({
    page,
  }) => {
    const context = page.context();
    const user = await createRealUser(context.request, 'admrefresh');
    await grantAdmin(user.id);

    // Simulate the 15 minute expiry: only the refresh cookie is left.
    await context.clearCookies({ name: ACCESS });
    const names = async () => (await context.cookies()).map((c) => c.name);
    expect(await names()).toEqual(expect.arrayContaining([REFRESH]));
    expect(await names()).not.toContain(ACCESS);

    await navigateTo(page, '/admin');
    await expect(page.getByText(user.username).first()).toBeVisible();
    await expect(page.getByTestId('admin-not-found')).toHaveCount(0);
    // The proxy persisted the refreshed access cookie for later requests.
    expect(await names()).toContain(ACCESS);

    // A hard reload after another expiry still lands on the dashboard.
    await context.clearCookies({ name: ACCESS });
    await page.reload();
    await expect(page.getByText(user.username).first()).toBeVisible();
  });

  test('non-admin with only a refresh cookie sees not-found', async ({
    page,
  }) => {
    const context = page.context();
    const user = await createRealUser(context.request, 'nonadmref');
    await context.clearCookies({ name: ACCESS });

    await navigateTo(page, '/admin');
    // `notFound()` from the admin layout renders the locale not-found page,
    // identical to what anonymous visitors get.
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    await expect(page.getByText(user.username)).toHaveCount(0);
  });

  test('anonymous request gets a styled 404, not an empty body', async ({
    request,
  }) => {
    const res = await request.get('/en/admin');
    expect(res.status()).toBe(404);
    expect(res.headers()['x-robots-tag']).toContain('noindex');
    expect(await res.text()).toContain('Page not found');
  });
});
